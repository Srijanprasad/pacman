// =========================================================
// PAC-MAN DELUXE - GHOST AI & CHARACTER CONTROLLER
// =========================================================

import { DIRECTIONS } from './pacman.js';

export const GHOST_MODES = {
  CHASE: 'CHASE',
  SCATTER: 'SCATTER',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN'
};

export class Ghost {
  constructor(name, color, tileSize, homeCorner) {
    this.name = name; // 'blinky', 'pinky', 'inky', 'clyde'
    this.color = color;
    this.tileSize = tileSize;
    this.radius = tileSize * 0.44;
    this.homeCorner = homeCorner; // { x, y }

    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;

    this.direction = DIRECTIONS.UP;
    this.mode = GHOST_MODES.SCATTER;
    this.baseSpeed = 2.2;
    this.speed = 2.2;

    this.frightenedTimer = 0;
    this.frightenedDuration = 8.0;

    this.skirtFrame = 0;
    this.skirtTimer = 0;

    this.sprite = null;
    this.scaredSprite = null;
  }

  setSprites(normalSprite, scaredSprite) {
    this.sprite = normalSprite;
    this.scaredSprite = scaredSprite;
  }

  setStartPosition(x, y) {
    this.startX = x;
    this.startY = y;
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.direction = DIRECTIONS.UP;
    this.mode = GHOST_MODES.SCATTER;
    this.speed = this.baseSpeed;
    this.frightenedTimer = 0;
  }

  setFrightened(duration) {
    if (this.mode === GHOST_MODES.EATEN) return;
    this.mode = GHOST_MODES.FRIGHTENED;
    this.frightenedDuration = duration;
    this.frightenedTimer = duration;
    this.speed = this.baseSpeed * 0.65;
    // Reverse direction on frightened trigger
    this.direction = this.getOppositeDirection(this.direction);
  }

  getOppositeDirection(dir) {
    if (dir === DIRECTIONS.UP) return DIRECTIONS.DOWN;
    if (dir === DIRECTIONS.DOWN) return DIRECTIONS.UP;
    if (dir === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
    if (dir === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
    return DIRECTIONS.NONE;
  }

  canMove(dir, walls) {
    if (dir === DIRECTIONS.NONE) return false;

    let testX = this.x;
    let testY = this.y;
    const offset = this.speed + 1;

    if (dir === DIRECTIONS.UP) testY -= offset;
    else if (dir === DIRECTIONS.DOWN) testY += offset;
    else if (dir === DIRECTIONS.LEFT) testX -= offset;
    else if (dir === DIRECTIONS.RIGHT) testX += offset;

    const r = this.radius * 0.85;
    const box = {
      x: testX - r,
      y: testY - r,
      width: r * 2,
      height: r * 2
    };

    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      if (
        box.x < w.x + w.width &&
        box.x + box.width > w.x &&
        box.y < w.y + w.height &&
        box.y + box.height > w.y
      ) {
        return false;
      }
    }
    return true;
  }

  // Calculate target tile according to ghost AI personality
  getTargetTile(pacman, blinky) {
    if (this.mode === GHOST_MODES.SCATTER) {
      return this.homeCorner;
    }

    if (this.mode === GHOST_MODES.EATEN) {
      // Pathfind back to ghost house starting point
      return { x: this.startX, y: this.startY };
    }

    if (this.mode === GHOST_MODES.FRIGHTENED) {
      // Wanders randomly
      return null;
    }

    // CHASE MODE PERSONALITIES
    switch (this.name) {
      case 'blinky': // The Aggressive Chaser
        return { x: pacman.x, y: pacman.y };

      case 'pinky': { // The Ambusher: 4 tiles ahead of Pacman
        let tx = pacman.x;
        let ty = pacman.y;
        const d = this.tileSize * 4;
        if (pacman.direction === DIRECTIONS.UP) { ty -= d; tx -= d; } // Classic overflow quirk
        else if (pacman.direction === DIRECTIONS.DOWN) ty += d;
        else if (pacman.direction === DIRECTIONS.LEFT) tx -= d;
        else if (pacman.direction === DIRECTIONS.RIGHT) tx += d;
        return { x: tx, y: ty };
      }

      case 'inky': { // The Flanker: vector from Blinky to 2 tiles ahead of Pac-Man doubled
        let px = pacman.x;
        let py = pacman.y;
        const d = this.tileSize * 2;
        if (pacman.direction === DIRECTIONS.UP) py -= d;
        else if (pacman.direction === DIRECTIONS.DOWN) py += d;
        else if (pacman.direction === DIRECTIONS.LEFT) px -= d;
        else if (pacman.direction === DIRECTIONS.RIGHT) px += d;

        const bx = blinky ? blinky.x : px;
        const by = blinky ? blinky.y : py;
        return {
          x: px + (px - bx),
          y: py + (py - by)
        };
      }

      case 'clyde': { // The Coward: Chases when far (> 8 tiles), retreats when close (<= 8 tiles)
        const dist = Math.hypot(this.x - pacman.x, this.y - pacman.y);
        if (dist > this.tileSize * 8) {
          return { x: pacman.x, y: pacman.y };
        } else {
          return this.homeCorner;
        }
      }

      default:
        return { x: pacman.x, y: pacman.y };
    }
  }

  update(dt, walls, boardWidth, boardHeight, pacman, blinky) {
    // Skirt wave animation
    this.skirtTimer += dt * 60;
    if (this.skirtTimer > 8) {
      this.skirtFrame = (this.skirtFrame + 1) % 2;
      this.skirtTimer = 0;
    }

    // Frightened mode timer countdown
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      this.frightenedTimer -= dt;
      if (this.frightenedTimer <= 0) {
        this.mode = GHOST_MODES.CHASE;
        this.speed = this.baseSpeed;
      }
    } else if (this.mode === GHOST_MODES.EATEN) {
      this.speed = this.baseSpeed * 2.0; // Eyes move super fast back to house
      const distToHome = Math.hypot(this.x - this.startX, this.y - this.startY);
      if (distToHome < this.tileSize * 0.8) {
        this.mode = GHOST_MODES.CHASE;
        this.speed = this.baseSpeed;
        this.direction = DIRECTIONS.UP;
      }
    }

    // Decision at tile center: Pick best next direction
    const tileCenterX = Math.floor(this.x / this.tileSize) * this.tileSize + this.tileSize / 2;
    const tileCenterY = Math.floor(this.y / this.tileSize) * this.tileSize + this.tileSize / 2;
    const distToCenter = Math.hypot(this.x - tileCenterX, this.y - tileCenterY);

    if (distToCenter < this.speed * dt * 60 + 1) {
      this.chooseNextDirection(walls, pacman, blinky);
    }

    // Move in current direction
    if (this.canMove(this.direction, walls)) {
      const step = this.speed * dt * 60;
      if (this.direction === DIRECTIONS.UP) this.y -= step;
      else if (this.direction === DIRECTIONS.DOWN) this.y += step;
      else if (this.direction === DIRECTIONS.LEFT) this.x -= step;
      else if (this.direction === DIRECTIONS.RIGHT) this.x += step;
    } else {
      // If blocked, immediately recalculate
      this.chooseNextDirection(walls, pacman, blinky);
    }

    // Screen tunnel wrap
    if (this.x < -this.tileSize / 2) {
      this.x = boardWidth + this.tileSize / 2 - 2;
    } else if (this.x > boardWidth + this.tileSize / 2) {
      this.x = -this.tileSize / 2 + 2;
    }
  }

  chooseNextDirection(walls, pacman, blinky) {
    const opp = this.getOppositeDirection(this.direction);
    const validDirs = [];
    const allDirs = [DIRECTIONS.UP, DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT];

    for (const d of allDirs) {
      if (d !== opp && this.canMove(d, walls)) {
        validDirs.push(d);
      }
    }

    if (validDirs.length === 0) {
      if (this.canMove(opp, walls)) {
        this.direction = opp;
      }
      return;
    }

    // In frightened mode, pick a random valid direction
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      this.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
      return;
    }

    // In chase, scatter, or eaten mode, pick direction with closest Euclidean distance to target
    const target = this.getTargetTile(pacman, blinky);
    if (!target) {
      this.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
      return;
    }

    let bestDir = validDirs[0];
    let minDistance = Infinity;

    for (const d of validDirs) {
      let nx = this.x;
      let ny = this.y;
      const step = this.tileSize;

      if (d === DIRECTIONS.UP) ny -= step;
      else if (d === DIRECTIONS.DOWN) ny += step;
      else if (d === DIRECTIONS.LEFT) nx -= step;
      else if (d === DIRECTIONS.RIGHT) nx += step;

      const distSq = (nx - target.x) ** 2 + (ny - target.y) ** 2;
      if (distSq < minDistance) {
        minDistance = distSq;
        bestDir = d;
      }
    }

    this.direction = bestDir;
  }

  draw(ctx, useSprites = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const r = this.radius;

    // 1. EATEN MODE: Just floating eyes
    if (this.mode === GHOST_MODES.EATEN) {
      this.drawEyes(ctx, r);
      ctx.restore();
      return;
    }

    // 2. FRIGHTENED MODE: Deep blue wavy ghost with flashing warning
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      let isFlashing = false;
      if (this.frightenedTimer < 2.5) {
        isFlashing = Math.floor(this.frightenedTimer * 8) % 2 === 0;
      }

      ctx.fillStyle = isFlashing ? '#ffffff' : '#2233ff';
      ctx.shadowColor = isFlashing ? 'rgba(255, 255, 255, 0.8)' : 'rgba(34, 51, 255, 0.8)';
      ctx.shadowBlur = 10;

      this.drawGhostBody(ctx, r);

      // Scared eyes (small orange/yellow dots)
      ctx.fillStyle = isFlashing ? '#ff0033' : '#ffaa00';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.15, r * 0.18, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.15, r * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Scared wavy mouth
      ctx.strokeStyle = isFlashing ? '#ff0033' : '#ffaa00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, r * 0.35);
      ctx.lineTo(-r * 0.25, r * 0.2);
      ctx.lineTo(0, r * 0.35);
      ctx.lineTo(r * 0.25, r * 0.2);
      ctx.lineTo(r * 0.5, r * 0.35);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // 3. NORMAL CHASE / SCATTER MODE
    if (useSprites && this.sprite && this.sprite.complete) {
      const s = this.tileSize * 1.1;
      ctx.drawImage(this.sprite, -s / 2, -s / 2, s, s);
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;

      this.drawGhostBody(ctx, r);
      this.drawEyes(ctx, r);
    }

    ctx.restore();
  }

  drawGhostBody(ctx, r) {
    ctx.beginPath();
    // Top dome
    ctx.arc(0, -r * 0.1, r, Math.PI, 0, false);
    // Right wall
    ctx.lineTo(r, r * 0.85);

    // Wavy skirt feet
    const feetCount = 3;
    const footWidth = (r * 2) / feetCount;
    const waveOffset = this.skirtFrame === 0 ? r * 0.2 : 0;

    for (let i = 0; i < feetCount; i++) {
      const startX = r - i * footWidth;
      const endX = startX - footWidth;
      const peakY = r * 0.65 + (i % 2 === 0 ? waveOffset : -waveOffset);
      ctx.quadraticCurveTo(startX - footWidth / 2, peakY, endX, r * 0.85);
    }

    // Left wall
    ctx.lineTo(-r, -r * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  drawEyes(ctx, r) {
    // Sclera offset according to direction
    let lookX = 0;
    let lookY = 0;
    const lookDist = r * 0.25;

    if (this.direction === DIRECTIONS.UP) lookY = -lookDist;
    else if (this.direction === DIRECTIONS.DOWN) lookY = lookDist;
    else if (this.direction === DIRECTIONS.LEFT) lookX = -lookDist;
    else if (this.direction === DIRECTIONS.RIGHT) lookX = lookDist;

    // White sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.15, r * 0.32, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.15, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Iris / pupil
    ctx.fillStyle = '#1133bb';
    ctx.beginPath();
    ctx.arc(-r * 0.35 + lookX, -r * 0.15 + lookY, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.35 + lookX, -r * 0.15 + lookY, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}
