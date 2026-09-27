// =========================================================
// PAC-MAN DELUXE - CORE GAME ENGINE
// =========================================================

import { sound } from './audio.js';
import { MAPS, parseMap } from './maps.js';
import { Pacman, DIRECTIONS } from './pacman.js';
import { Ghost, GHOST_MODES } from './ghost.js';
import { ParticleSystem } from './particles.js';

export const GAME_STATES = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GHOST_PAUSE: 'GHOST_PAUSE',
  DYING: 'DYING',
  LEVEL_CLEAR: 'LEVEL_CLEAR',
  GAME_OVER: 'GAME_OVER'
};

export const FRUITS = [
  { name: 'Cherry', symbol: '🍒', points: 100, color: '#ff2244' },
  { name: 'Strawberry', symbol: '🍓', points: 300, color: '#ff3366' },
  { name: 'Orange', symbol: '🍊', points: 500, color: '#ff8800' },
  { name: 'Apple', symbol: '🍎', points: 700, color: '#ff1122' },
  { name: 'Melon', symbol: '🍈', points: 1000, color: '#88ff44' },
  { name: 'Bell', symbol: '🔔', points: 3000, color: '#ffee00' },
  { name: 'Key', symbol: '🗝️', points: 5000, color: '#00ffff' }
];

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.mapId = 'original';
    this.mapConfig = MAPS.original;
    this.mapData = null;

    this.state = GAME_STATES.READY;
    this.difficulty = 'arcade'; // casual, arcade, nightmare

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pacman_high_score') || '10000', 10);
    this.level = 1;
    this.lives = 3;
    this.collectedFruits = [];

    this.tileSize = 26;
    this.boardWidth = 0;
    this.boardHeight = 0;

    this.pacman = null;
    this.ghosts = [];
    this.blinky = null;
    this.particles = new ParticleSystem();

    // Mode cycle timer (Scatter 7s -> Chase 20s)
    this.modeTimer = 0;
    this.currentMode = GHOST_MODES.SCATTER;

    // Ghost eat combo multiplier
    this.ghostCombo = 0;
    this.ghostPauseTimer = 0;

    // Fruit spawn timer
    this.activeFruit = null;
    this.fruitTimer = 0;
    this.dotsEatenThisLevel = 0;

    // Level Clear flash animation
    this.levelClearTimer = 0;
    this.mazeFlash = false;

    // Speed and visual shake effects
    this.gameSpeedMult = 1.0;
    this.shakeMagnitude = 0;
    this.energizedTimeLeft = 0;
    this.energizedTotalTime = 8.0;

    // Callbacks for UI updates
    this.onScoreUpdate = null;
    this.onLivesUpdate = null;
    this.onLevelUpdate = null;
    this.onFruitUpdate = null;
    this.onGameOver = null;
    this.onStateChange = null;
    this.onEnergizerUpdate = null;
    this.onProgressUpdate = null;
    this.onAchievementUnlock = null;

    this.lastTime = 0;
    this.animId = null;

    this.powerPelletPulse = 0;
  }

  setSpeed(mult) {
    this.gameSpeedMult = Math.max(0.5, Math.min(2.5, mult));
  }

  init(mapId = 'original', difficulty = 'arcade') {
    this.mapId = mapId;
    this.mapConfig = MAPS[mapId] || MAPS.original;
    this.difficulty = difficulty;

    this.tileSize = this.mapConfig.tileSize;
    this.boardWidth = this.mapConfig.colCount * this.tileSize;
    this.boardHeight = this.mapConfig.rowCount * this.tileSize;

    this.canvas.width = this.boardWidth;
    this.canvas.height = this.boardHeight;

    this.score = 0;
    this.level = 1;
    this.lives = this.difficulty === 'casual' ? 5 : 3;
    this.collectedFruits = [];

    this.loadLevel(this.level);
    this.state = GAME_STATES.READY;
    this.notifyState();
  }

  loadLevel(levelNum) {
    this.level = levelNum;
    this.dotsEatenThisLevel = 0;
    this.activeFruit = null;
    this.fruitTimer = 0;
    this.ghostCombo = 0;

    this.mapData = parseMap(this.mapConfig);
    this.cacheMazeWalls();

    // Initialize Pacman
    this.pacman = new Pacman(this.tileSize);
    this.pacman.setStartPosition(this.mapData.pacmanStart.x, this.mapData.pacmanStart.y);

    // Speed scaling per difficulty and level
    let baseGhostSpeed = 2.0 + Math.min(1.2, (this.level - 1) * 0.15);
    let pacmanSpeed = 2.4 + Math.min(0.8, (this.level - 1) * 0.1);

    if (this.difficulty === 'casual') {
      baseGhostSpeed *= 0.85;
      pacmanSpeed *= 1.05;
    } else if (this.difficulty === 'nightmare') {
      baseGhostSpeed *= 1.25;
      pacmanSpeed *= 1.15;
    }

    this.pacman.baseSpeed = pacmanSpeed;
    this.pacman.speed = pacmanSpeed;

    // Corner scatter targets
    const corners = {
      blinky: { x: this.boardWidth, y: 0 },
      pinky: { x: 0, y: 0 },
      inky: { x: this.boardWidth, y: this.boardHeight },
      clyde: { x: 0, y: this.boardHeight }
    };

    // Initialize Ghosts with staggered exit sequencing
    const gRed = new Ghost('blinky', '#ff3344', this.tileSize, corners.blinky, 0); // Exits immediately!
    const gPink = new Ghost('pinky', '#ff88dd', this.tileSize, corners.pinky, 1.2); // Exits after 1.2s!
    const gCyan = new Ghost('inky', '#00ddff', this.tileSize, corners.inky, 3.5); // Exits after 3.5s!
    const gOrange = new Ghost('clyde', '#ffaa33', this.tileSize, corners.clyde, 6.0); // Exits after 6.0s!

    const start = this.mapData.ghostsStart;
    if (start.red) gRed.setStartPosition(start.red.x, start.red.y);
    if (start.pink) gPink.setStartPosition(start.pink.x, start.pink.y);
    if (start.cyan) gCyan.setStartPosition(start.cyan.x, start.cyan.y);
    if (start.orange) gOrange.setStartPosition(start.orange.x, start.orange.y);

    [gRed, gPink, gCyan, gOrange].forEach(g => {
      g.baseSpeed = baseGhostSpeed;
      g.speed = baseGhostSpeed;
    });

    this.blinky = gRed;
    this.ghosts = [gRed, gPink, gCyan, gOrange];

    this.modeTimer = 0;
    this.currentMode = GHOST_MODES.SCATTER;

    this.particles.clear();
    this.notifyUI();
  }

  start() {
    if (this.state === GAME_STATES.READY) {
      sound.init();
      sound.playGameStart();
      this.state = GAME_STATES.PLAYING;
      this.notifyState();
      sound.startSiren(1);
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      this.notifyState();
      sound.startSiren(1);
    }
  }

  pause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      sound.stopSiren();
      this.notifyState();
    }
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.pause();
    } else if (this.state === GAME_STATES.PAUSED || this.state === GAME_STATES.READY) {
      this.start();
    }
  }

  restart() {
    sound.stopSiren();
    this.init(this.mapId, this.difficulty);
    this.start();
  }

  resetPositions() {
    this.pacman.reset();
    this.ghosts.forEach(g => g.reset());
    this.modeTimer = 0;
    this.currentMode = GHOST_MODES.SCATTER;
    this.ghostCombo = 0;
  }

  update(dt) {
    this.powerPelletPulse = (this.powerPelletPulse + dt * 5) % (Math.PI * 2);

    // Energizer countdown tracking
    if (this.energizedTimeLeft > 0) {
      this.energizedTimeLeft = Math.max(0, this.energizedTimeLeft - dt);
      if (this.onEnergizerUpdate) {
        this.onEnergizerUpdate(this.energizedTimeLeft, this.energizedTotalTime);
      }
    }

    if (this.state === GAME_STATES.DYING) {
      this.pacman.update(dt, this.mapData.mazeGrid, this.boardWidth, this.boardHeight);
      this.particles.update(dt);
      if (this.pacman.isDead) {
        this.handlePacmanDeathComplete();
      }
      return;
    }

    if (this.state === GAME_STATES.LEVEL_CLEAR) {
      this.levelClearTimer -= dt;
      this.mazeFlash = Math.floor(this.levelClearTimer * 6) % 2 === 0;
      this.particles.update(dt);
      if (this.levelClearTimer <= 0) {
        this.loadLevel(this.level + 1);
        this.state = GAME_STATES.READY;
        this.notifyState();
        setTimeout(() => this.start(), 1200);
      }
      return;
    }

    if (this.state !== GAME_STATES.PLAYING) {
      this.particles.update(dt);
      return;
    }

    // 1. Ghost Mode Switching (Scatter 7s <-> Chase 20s)
    this.modeTimer += dt;
    if (this.currentMode === GHOST_MODES.SCATTER && this.modeTimer > 7) {
      this.currentMode = GHOST_MODES.CHASE;
      this.modeTimer = 0;
      this.ghosts.forEach(g => {
        if (g.mode !== GHOST_MODES.FRIGHTENED && g.mode !== GHOST_MODES.EATEN) {
          g.mode = GHOST_MODES.CHASE;
        }
      });
    } else if (this.currentMode === GHOST_MODES.CHASE && this.modeTimer > 20) {
      this.currentMode = GHOST_MODES.SCATTER;
      this.modeTimer = 0;
      this.ghosts.forEach(g => {
        if (g.mode !== GHOST_MODES.FRIGHTENED && g.mode !== GHOST_MODES.EATEN) {
          g.mode = GHOST_MODES.SCATTER;
        }
      });
    }

    // 2. Update Pacman
    this.pacman.update(dt, this.mapData.mazeGrid, this.boardWidth, this.boardHeight);

    // 3. Update Ghosts
    this.ghosts.forEach(g => {
      g.update(dt, this.mapData.mazeGrid, this.boardWidth, this.boardHeight, this.pacman, this.blinky, this.mapData.doorTileCoord);
    });

    // 4. Check Food & Power Pellets Collision
    this.checkFoodCollision();

    // 5. Check Bonus Fruit Spawn & Collection
    this.updateFruit(dt);

    // 6. Check Ghost Collisions
    this.checkGhostCollisions();

    // 7. Update Particles & Popups
    this.particles.update(dt);

    // 8. Check Level Completion
    if (this.mapData.dots.length === 0 && this.mapData.powerPellets.length === 0) {
      this.triggerLevelClear();
    }
  }

  checkFoodCollision() {
    const px = this.pacman.x;
    const py = this.pacman.y;
    const pCol = Math.floor(px / this.tileSize);
    const pRow = Math.floor(py / this.tileSize);

    // Normal Dots - check dots within adjacent tiles only
    for (let i = this.mapData.dots.length - 1; i >= 0; i--) {
      const dot = this.mapData.dots[i];
      if (Math.abs(dot.col - pCol) <= 1 && Math.abs(dot.row - pRow) <= 1) {
        if (Math.hypot(px - dot.x, py - dot.y) < this.pacman.radius + dot.radius + 4) {
          this.mapData.dots.splice(i, 1);
          this.score += 10;
          this.dotsEatenThisLevel++;
          this.checkFruitSpawnTrigger();
          sound.playWaka();
          this.particles.addPelletSparkles(dot.x, dot.y, '#ffe600', 2);
          this.checkHighScore();
          this.notifyUI();
          if (this.onProgressUpdate) {
            this.onProgressUpdate(this.dotsEatenThisLevel, this.mapData.totalDots);
          }
          break;
        }
      }
    }

    // Power Pellets - check pellets within adjacent tiles only
    for (let i = this.mapData.powerPellets.length - 1; i >= 0; i--) {
      const p = this.mapData.powerPellets[i];
      if (Math.abs(p.col - pCol) <= 1 && Math.abs(p.row - pRow) <= 1) {
        if (Math.hypot(px - p.x, py - p.y) < this.pacman.radius + p.radius + 4) {
          this.mapData.powerPellets.splice(i, 1);
          this.score += 50;
          this.dotsEatenThisLevel++;
          this.ghostCombo = 0;
          sound.playPowerPellet();
          this.particles.addGhostExplosion(p.x, p.y, '#00ffff', 12);
          this.particles.addScorePopup(p.x, p.y, '+50', '#00ffff');

          let scaredSecs = Math.max(3.5, 9.0 - (this.level - 1) * 0.8);
          if (this.difficulty === 'casual') scaredSecs += 2.5;
          if (this.difficulty === 'nightmare') scaredSecs *= 0.65;

          this.energizedTimeLeft = scaredSecs;
          this.energizedTotalTime = scaredSecs;
          if (this.onEnergizerUpdate) {
            this.onEnergizerUpdate(this.energizedTimeLeft, this.energizedTotalTime);
          }

          this.ghosts.forEach(g => g.setFrightened(scaredSecs));
          this.checkHighScore();
          this.notifyUI();
          if (this.onProgressUpdate) {
            this.onProgressUpdate(this.dotsEatenThisLevel, this.mapData.totalDots);
          }
          break;
        }
      }
    }
  }

  checkFruitSpawnTrigger() {
    // Spawns fruit at 60 and 150 dots
    if (this.dotsEatenThisLevel === 60 || this.dotsEatenThisLevel === 150) {
      const fruitIndex = Math.min(this.level - 1, FRUITS.length - 1);
      this.activeFruit = FRUITS[fruitIndex];
      this.fruitTimer = 11.0;
    }
  }

  updateFruit(dt) {
    if (!this.activeFruit) return;

    this.fruitTimer -= dt;
    if (this.fruitTimer <= 0) {
      this.activeFruit = null;
      return;
    }

    const fc = this.mapData.fruitCoord;
    const dist = Math.hypot(this.pacman.x - fc.x, this.pacman.y - fc.y);
    if (dist < this.pacman.radius + this.tileSize * 0.4) {
      const pts = this.activeFruit.points;
      this.score += pts;
      this.collectedFruits.push(this.activeFruit.symbol);
      sound.playEatFruit();
      this.particles.addGhostExplosion(fc.x, fc.y, this.activeFruit.color, 20);
      this.particles.addScorePopup(fc.x, fc.y, `+${pts}`, this.activeFruit.color);
      this.activeFruit = null;
      this.checkHighScore();
      this.notifyUI();
    }
  }

  checkGhostCollisions() {
    const px = this.pacman.x;
    const py = this.pacman.y;
    const threshold = this.pacman.radius + this.tileSize * 0.35;

    for (let i = 0; i < this.ghosts.length; i++) {
      const g = this.ghosts[i];
      if (g.inPen) continue; // Ghosts inside the pen cannot harm Pac-Man
      const dist = Math.hypot(px - g.x, py - g.y);

      if (dist < threshold) {
        if (g.mode === GHOST_MODES.FRIGHTENED) {
          // Eat Ghost with tactile screen shake!
          g.mode = GHOST_MODES.EATEN;
          this.ghostCombo++;
          const pts = Math.min(1600, 200 * Math.pow(2, this.ghostCombo - 1));
          this.score += pts;
          this.shakeMagnitude = 3.5;

          sound.playEatGhost();
          this.particles.addGhostExplosion(g.x, g.y, g.color, 25);
          this.particles.addScorePopup(g.x, g.y, `+${pts}`, '#00ffff');

          this.checkHighScore();
          this.notifyUI();
          break;
        } else if (g.mode === GHOST_MODES.CHASE || g.mode === GHOST_MODES.SCATTER) {
          // Pacman gets caught!
          this.handlePacmanHit();
          break;
        }
      }
    }
  }

  handlePacmanHit() {
    sound.stopSiren();
    sound.playDeath();
    this.shakeMagnitude = 8.0;
    this.state = GAME_STATES.DYING;
    this.pacman.startDeath();
    this.particles.addDeathBurst(this.pacman.x, this.pacman.y);
  }

  handlePacmanDeathComplete() {
    this.lives--;
    this.notifyUI();

    if (this.lives <= 0) {
      this.state = GAME_STATES.GAME_OVER;
      this.notifyState();
      if (this.onGameOver) {
        this.onGameOver(this.score, this.level);
      }
    } else {
      this.resetPositions();
      this.state = GAME_STATES.READY;
      this.notifyState();
      setTimeout(() => this.start(), 1200);
    }
  }

  triggerLevelClear() {
    sound.stopSiren();
    sound.playLevelClear();
    this.state = GAME_STATES.LEVEL_CLEAR;
    this.levelClearTimer = 2.4;
    this.particles.addFireworks(this.boardWidth, this.boardHeight, 5);
    this.notifyState();
  }

  checkHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pacman_high_score', this.highScore.toString());
    }
  }

  notifyUI() {
    if (this.onScoreUpdate) this.onScoreUpdate(this.score, this.highScore);
    if (this.onLivesUpdate) this.onLivesUpdate(this.lives);
    if (this.onLevelUpdate) this.onLevelUpdate(this.level);
    if (this.onFruitUpdate) this.onFruitUpdate(this.collectedFruits);
  }

  notifyState() {
    if (this.onStateChange) this.onStateChange(this.state);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.boardWidth, this.boardHeight);

    ctx.save();
    if (this.shakeMagnitude > 0.1) {
      const sx = (Math.random() - 0.5) * this.shakeMagnitude;
      const sy = (Math.random() - 0.5) * this.shakeMagnitude;
      ctx.translate(sx, sy);
      this.shakeMagnitude *= 0.86;
    }

    // 1. Draw Maze Walls
    this.drawMazeWalls(ctx);

    // 2. Draw Food Pellets & Energizers
    this.drawDots(ctx);

    // 3. Draw Active Bonus Fruit
    this.drawFruit(ctx);

    // 4. Draw Pac-Man
    if (this.pacman) {
      this.pacman.draw(ctx);
    }

    // 5. Draw Ghosts
    if (this.state !== GAME_STATES.DYING) {
      this.ghosts.forEach(g => g.draw(ctx));
    }

    // 6. Draw Particle System & Score Popups
    this.particles.draw(ctx);

    ctx.restore();
  }

  cacheMazeWalls() {
    if (!this.mapData) return;
    if (!this.wallCanvas) {
      this.wallCanvas = document.createElement('canvas');
    }
    this.wallCanvas.width = this.boardWidth;
    this.wallCanvas.height = this.boardHeight;
    const wCtx = this.wallCanvas.getContext('2d');

    // Background
    wCtx.fillStyle = '#02040b';
    wCtx.fillRect(0, 0, this.boardWidth, this.boardHeight);

    const wallColor = this.mapId === 'cyber' ? '#ff007b' : '#0077ff';
    const glowColor = this.mapId === 'cyber' ? 'rgba(255, 0, 123, 0.4)' : 'rgba(0, 119, 255, 0.35)';

    wCtx.shadowColor = glowColor;
    wCtx.shadowBlur = 6;
    wCtx.fillStyle = '#060a1e';
    wCtx.strokeStyle = wallColor;
    wCtx.lineWidth = 2.5;

    for (let i = 0; i < this.mapData.walls.length; i++) {
      const w = this.mapData.walls[i];
      wCtx.fillRect(w.x + 1, w.y + 1, w.width - 2, w.height - 2);
      wCtx.strokeRect(w.x + 2, w.y + 2, w.width - 4, w.height - 4);
    }

    // Ghost House Gate Door
    if (this.mapData.ghostDoor) {
      const d = this.mapData.ghostDoor;
      wCtx.fillStyle = '#ff88aa';
      wCtx.shadowColor = '#ff88aa';
      wCtx.shadowBlur = 8;
      wCtx.fillRect(d.x, d.y + d.height, d.width, 3);
    }
  }

  drawMazeWalls(ctx) {
    if (this.wallCanvas) {
      ctx.drawImage(this.wallCanvas, 0, 0);
    }
    // Level clear flashing effect
    if (this.state === GAME_STATES.LEVEL_CLEAR && this.mazeFlash) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(0, 0, this.boardWidth, this.boardHeight);
    }
  }

  drawDots(ctx) {
    ctx.save();

    // Normal Dots - single batch path for 60-120 FPS performance
    ctx.fillStyle = '#ffdd99';
    ctx.beginPath();
    for (let i = 0; i < this.mapData.dots.length; i++) {
      const dot = this.mapData.dots[i];
      ctx.moveTo(dot.x + dot.radius, dot.y);
      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    }
    ctx.fill();

    // Power Energizers (Pulsating)
    const pulseFactor = 0.85 + Math.sin(this.powerPelletPulse) * 0.25;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 8;
    for (let i = 0; i < this.mapData.powerPellets.length; i++) {
      const p = this.mapData.powerPellets[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulseFactor, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawFruit(ctx) {
    if (!this.activeFruit) return;

    const fc = this.mapData.fruitCoord;
    const bounce = Math.sin(Date.now() / 150) * 3;

    ctx.save();
    ctx.font = `${Math.floor(this.tileSize * 0.9)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = this.activeFruit.color;
    ctx.shadowBlur = 12;
    ctx.fillText(this.activeFruit.symbol, fc.x, fc.y + bounce);
    ctx.restore();
  }

  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = Math.min(0.08, (currentTime - this.lastTime) / 1000) * this.gameSpeedMult;
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    this.animId = requestAnimationFrame(t => this.loop(t));
  }

  run() {
    if (!this.animId) {
      this.lastTime = 0;
      this.animId = requestAnimationFrame(t => this.loop(t));
    }
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    sound.stopSiren();
  }
}
