// =========================================================
// PAC-MAN DELUXE ARCADE 2.0 - MAIN UI & TELEMETRY CONTROLLER
// =========================================================

import { sound } from './audio.js';
import { GameEngine, GAME_STATES } from './game.js';
import { DIRECTIONS } from './pacman.js';

// DOM Element References
const canvas = document.getElementById('game-canvas');
const scoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const stageEl = document.getElementById('stage-number');
const livesDisplay = document.getElementById('lives-display');
const fruitCollectedEl = document.getElementById('fruit-collected');

// Progress & Energizer Bar Elements
const energizerGauge = document.getElementById('energizer-gauge');
const energizerFill = document.getElementById('energizer-fill');
const energizerTimerText = document.getElementById('energizer-timer-text');
const stageDotFill = document.getElementById('stage-dot-fill');
const dotCountLabel = document.getElementById('dot-count-label');

// Overlays & Announcers
const overlayScreen = document.getElementById('overlay-screen');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const overlayBadge = document.getElementById('overlay-badge');
const btnStart = document.getElementById('btn-start');
const announcerToast = document.getElementById('announcer-toast');
const gameStatusText = document.getElementById('game-status-text');

// Header Action Buttons
const btnTheme = document.getElementById('btn-theme');
const btnCrt = document.getElementById('btn-crt');
const btnSound = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const btnSpeed = document.getElementById('btn-speed');
const speedLabel = document.getElementById('speed-label');
const btnFullscreen = document.getElementById('btn-fullscreen');
const btnLeaderboard = document.getElementById('btn-leaderboard');
const btnAchievements = document.getElementById('btn-achievements');
const btnHelp = document.getElementById('btn-help');
const btnPause = document.getElementById('btn-pause');
const btnRestart = document.getElementById('btn-restart');

// Modals
const modalScores = document.getElementById('modal-scores');
const modalInitials = document.getElementById('modal-initials');
const modalAchievements = document.getElementById('modal-achievements');
const modalHelp = document.getElementById('modal-help');
const leaderboardRows = document.getElementById('leaderboard-rows');
const badgeGrid = document.getElementById('badge-grid');
const btnClearScores = document.getElementById('btn-clear-scores');
const btnSaveInitials = document.getElementById('btn-save-initials');
const playerInitialsInput = document.getElementById('player-initials');
const entryScoreVal = document.getElementById('entry-score-val');

// Selection buttons
const diffButtons = document.querySelectorAll('.diff-btn');
const mapButtons = document.querySelectorAll('.map-btn');
const dpadButtons = document.querySelectorAll('.dpad-key');

// VU Meter bars
const leftVuBars = document.querySelectorAll('#vu-left .vu-bar');
const rightVuBars = document.querySelectorAll('#vu-right .vu-bar');

// Instantiate Game Engine
const game = new GameEngine(canvas);

let currentDifficulty = 'arcade';
let currentMap = 'original';
let currentPendingScore = 0;
let currentPendingLevel = 1;
let displayScore = 0;
let scoreAnimFrame = null;

// Game speed toggle: 1.0x -> 1.3x -> 1.6x
const speedModes = [
  { label: '1.0x', mult: 1.0 },
  { label: '1.3x', mult: 1.3 },
  { label: '1.6x', mult: 1.6 }
];
let currentSpeedIndex = 0;

// Format numbers with leading zeros (e.g., 00480)
function padScore(num, size = 5) {
  let s = Math.floor(num).toString();
  while (s.length < size) s = '0' + s;
  return s;
}

// Smooth animated roll-up for the HUD score
function animateScoreTo(target) {
  if (scoreAnimFrame) cancelAnimationFrame(scoreAnimFrame);
  const step = () => {
    if (displayScore < target) {
      const diff = target - displayScore;
      displayScore += Math.max(1, Math.ceil(diff * 0.15));
      scoreEl.textContent = padScore(displayScore);
      scoreAnimFrame = requestAnimationFrame(step);
    } else {
      displayScore = target;
      scoreEl.textContent = padScore(displayScore);
    }
  };
  step();
}

// ---------------------------------------------------------
// ACHIEVEMENTS SYSTEM
// ---------------------------------------------------------
const STORAGE_KEY_ACHIEVEMENTS = 'pacman_arcade_achievements_v1';

const ACHIEVEMENTS_LIST = [
  { id: 'first_dot', icon: '🟡', title: 'First Nibble', desc: 'Eat your first food pellet.' },
  { id: 'energizer', icon: '⚡', title: 'Energized!', desc: 'Chomp an Energizer Power Pellet.' },
  { id: 'ghost_hunter', icon: '👻', title: 'Ghost Buster', desc: 'Eat a vulnerable blue ghost.' },
  { id: 'fruit_eater', icon: '🍒', title: 'Fruit Feast', desc: 'Collect any bonus fruit.' },
  { id: 'stage_clear', icon: '🌀', title: 'Warp Master', desc: 'Clear Stage 1 and advance.' },
  { id: 'high_roller', icon: '👑', title: 'Arcade Legend', desc: 'Score 5,000 points or more.' },
  { id: 'combo_quad', icon: '🔥', title: 'Ghost Combo x4', desc: 'Eat all 4 ghosts on a single energizer.' },
  { id: 'immortal', icon: '🛡️', title: 'Untouchable', desc: 'Complete a level without losing a single life.' }
];

function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function unlockAchievement(id) {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(unlocked));
    const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
    if (ach) {
      showToast(`🏆 UNLOCKED: ${ach.title}!`);
    }
    renderAchievements();
  }
}

function renderAchievements() {
  const unlocked = getUnlockedAchievements();
  badgeGrid.innerHTML = '';
  ACHIEVEMENTS_LIST.forEach(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    const div = document.createElement('div');
    div.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
    div.innerHTML = `
      <div class="badge-card-icon">${ach.icon}</div>
      <div class="badge-card-info">
        <h5>${ach.title}</h5>
        <p>${ach.desc}</p>
      </div>
    `;
    badgeGrid.appendChild(div);
  });
}

// ---------------------------------------------------------
// HIGH SCORES LEADERBOARD STORAGE
// ---------------------------------------------------------
const STORAGE_KEY_SCORES = 'pacman_arcade_leaderboard_v2';

function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    { name: 'PAC', score: 18400, level: 6 },
    { name: 'NEO', score: 14200, level: 5 },
    { name: 'VRC', score: 9800, level: 3 },
    { name: 'RET', score: 6500, level: 2 },
    { name: 'BOT', score: 3200, level: 1 }
  ];
}

function saveLeaderboard(board) {
  localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(board));
}

function checkQualifiesForHighScore(score) {
  if (score <= 0) return false;
  const board = getLeaderboard();
  if (board.length < 5) return true;
  return score > board[board.length - 1].score;
}

function addScoreToLeaderboard(name, score, level) {
  let board = getLeaderboard();
  board.push({ name: name.toUpperCase().slice(0, 3) || 'AAA', score, level });
  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 5);
  saveLeaderboard(board);
  renderLeaderboard();
}

function renderLeaderboard() {
  const board = getLeaderboard();
  leaderboardRows.innerHTML = '';
  const medals = ['🥇', '🥈', '🥉', '4TH', '5TH'];
  board.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    row.innerHTML = `
      <span>${medals[index] || index + 1}</span>
      <span>${item.name}</span>
      <span>LV${item.level}</span>
      <span class="neon-yellow text-right">${padScore(item.score)}</span>
    `;
    leaderboardRows.appendChild(row);
  });
}

// ---------------------------------------------------------
// HUD & STATE SYNCHRONIZATION
// ---------------------------------------------------------
game.onScoreUpdate = (score, highScore) => {
  animateScoreTo(score);
  highScoreEl.textContent = padScore(highScore);
  unlockAchievement('first_dot');
  if (score >= 5000) unlockAchievement('high_roller');
};

game.onLivesUpdate = (lives) => {
  livesDisplay.innerHTML = '';
  for (let i = 0; i < Math.max(0, lives); i++) {
    const icon = document.createElement('span');
    icon.className = 'life-silhouette';
    livesDisplay.appendChild(icon);
  }
};

game.onLevelUpdate = (lvl) => {
  stageEl.textContent = (lvl < 10 ? '0' : '') + lvl;
  if (lvl > 1) {
    unlockAchievement('stage_clear');
  }
};

game.onFruitUpdate = (fruits) => {
  fruitCollectedEl.innerHTML = '';
  fruits.slice(-5).forEach(f => {
    const span = document.createElement('span');
    span.className = 'fruit-icon';
    span.textContent = f;
    fruitCollectedEl.appendChild(span);
  });
  if (fruits.length > 0) {
    unlockAchievement('fruit_eater');
  }
};

// Power Energizer Real-Time Gauge
game.onEnergizerUpdate = (timeLeft, totalTime) => {
  if (timeLeft > 0) {
    energizerGauge.classList.remove('hidden');
    const pct = Math.max(0, (timeLeft / totalTime) * 100);
    energizerFill.style.width = `${pct}%`;
    energizerTimerText.textContent = `${timeLeft.toFixed(1)}s`;
    unlockAchievement('energizer');
  } else {
    energizerGauge.classList.add('hidden');
  }
};

// Stage Dot Progress Tracker
game.onProgressUpdate = (dotsEaten, totalDots) => {
  const pct = Math.min(100, Math.floor((dotsEaten / totalDots) * 100));
  stageDotFill.style.width = `${pct}%`;
  dotCountLabel.textContent = `${dotsEaten} / ${totalDots} DOTS (${pct}%)`;
};

game.onStateChange = (state) => {
  if (state === GAME_STATES.READY) {
    overlayScreen.classList.add('active');
    overlayBadge.textContent = 'ARCADE CREDITS: FREE PLAY';
    overlayTitle.textContent = 'READY!';
    overlaySubtitle.textContent = 'PRESS START OR ARROW KEYS TO COMMENCE';
    btnStart.querySelector('.btn-text').textContent = 'START MISSION';
    btnStart.style.display = 'inline-block';
    gameStatusText.textContent = 'ARCADE ENGINE 60 FPS • ZERO LAG';
    showToast('READY!');
  } else if (state === GAME_STATES.PLAYING) {
    overlayScreen.classList.remove('active');
    gameStatusText.textContent = 'MISSION IN PROGRESS • 60 FPS';
    hideToast();
  } else if (state === GAME_STATES.PAUSED) {
    overlayScreen.classList.add('active');
    overlayBadge.textContent = 'SYSTEM PAUSED';
    overlayTitle.textContent = 'GAME PAUSED';
    overlaySubtitle.textContent = 'PRESS SPACE TO RESUME ARCADE';
    btnStart.querySelector('.btn-text').textContent = 'RESUME PLAY';
    btnStart.style.display = 'inline-block';
    gameStatusText.textContent = 'MISSION PAUSED';
  } else if (state === GAME_STATES.GAME_OVER) {
    overlayScreen.classList.add('active');
    overlayBadge.textContent = 'SESSION TERMINATED';
    overlayTitle.textContent = 'GAME OVER';
    overlaySubtitle.textContent = `FINAL SCORE: ${padScore(game.score)}`;
    btnStart.querySelector('.btn-text').textContent = 'PLAY AGAIN';
    btnStart.style.display = 'inline-block';
    gameStatusText.textContent = 'ARCADE OVER • READY FOR NEW COIN';
    showToast('GAME OVER');
  } else if (state === GAME_STATES.LEVEL_CLEAR) {
    showToast('STAGE CLEAR!');
    gameStatusText.textContent = 'WARPING TO NEXT ARENA';
  }
};

game.onGameOver = (finalScore, finalLevel) => {
  currentPendingScore = finalScore;
  currentPendingLevel = finalLevel;
  if (checkQualifiesForHighScore(finalScore)) {
    setTimeout(() => {
      entryScoreVal.textContent = padScore(finalScore);
      modalInitials.classList.remove('hidden');
      playerInitialsInput.value = 'AAA';
      playerInitialsInput.focus();
    }, 700);
  }
};

function showToast(text) {
  announcerToast.textContent = text;
  announcerToast.classList.remove('hidden');
}

function hideToast() {
  announcerToast.classList.add('hidden');
}

// ---------------------------------------------------------
// AUDIO-REACTIVE VU METER VISUALIZER
// ---------------------------------------------------------
setInterval(() => {
  if (game.state === GAME_STATES.PLAYING && !sound.isMuted) {
    const level = Math.random();
    leftVuBars.forEach((bar, idx) => {
      bar.style.opacity = idx / 7 < level ? '1' : '0.25';
    });
    rightVuBars.forEach((bar, idx) => {
      bar.style.opacity = idx / 7 < level ? '1' : '0.25';
    });
  } else {
    leftVuBars.forEach(b => b.style.opacity = '0.25');
    rightVuBars.forEach(b => b.style.opacity = '0.25');
  }
}, 100);

// ---------------------------------------------------------
// CONTROLS & EVENT LISTENERS
// ---------------------------------------------------------
function handleDirectionInput(dir) {
  if (game.state === GAME_STATES.READY || game.state === GAME_STATES.PAUSED) {
    game.start();
  }
  if (game.pacman) {
    game.pacman.requestDirection(dir);
  }
}

// Keyboard Controls
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      handleDirectionInput(DIRECTIONS.UP);
      break;

    case 'ArrowDown':
    case 's':
    case 'S':
      handleDirectionInput(DIRECTIONS.DOWN);
      break;

    case 'ArrowLeft':
    case 'a':
    case 'A':
      handleDirectionInput(DIRECTIONS.LEFT);
      break;

    case 'ArrowRight':
    case 'd':
    case 'D':
      handleDirectionInput(DIRECTIONS.RIGHT);
      break;

    case ' ':
      if (game.state === GAME_STATES.GAME_OVER) {
        game.restart();
      } else {
        game.togglePause();
      }
      break;

    case 'p':
    case 'P':
      game.togglePause();
      break;

    case 'm':
    case 'M':
      toggleMuteAudio();
      break;

    case 'r':
    case 'R':
      game.restart();
      break;

    case 'Escape':
      closeAllModals();
      break;
  }
});

// Touch D-Pad
dpadButtons.forEach(btn => {
  const dir = btn.dataset.dir;
  const trigger = (e) => {
    e.preventDefault();
    handleDirectionInput(dir);
  };
  btn.addEventListener('touchstart', trigger, { passive: false });
  btn.addEventListener('mousedown', trigger);
});

// Canvas Touch Swipe Gestures
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (e.changedTouches.length > 0) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 20) {
      if (absX > absY) {
        handleDirectionInput(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
      } else {
        handleDirectionInput(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
      }
    }
  }
}, { passive: true });

// Start / Action Button
btnStart.addEventListener('click', () => {
  if (game.state === GAME_STATES.READY || game.state === GAME_STATES.PAUSED) {
    game.start();
  } else if (game.state === GAME_STATES.GAME_OVER) {
    game.restart();
  }
});

btnPause.addEventListener('click', () => {
  game.togglePause();
});

btnRestart.addEventListener('click', () => {
  game.restart();
});

// Audio Mute Button
function toggleMuteAudio() {
  const muted = sound.toggleMute();
  soundIcon.textContent = muted ? '🔇' : '🔊';
  btnSound.classList.toggle('active', !muted);
}
btnSound.addEventListener('click', toggleMuteAudio);

// CRT Toggle Button
btnCrt.addEventListener('click', () => {
  document.body.classList.toggle('crt-active');
  btnCrt.classList.toggle('active');
});

// Speed Toggle Button
btnSpeed.addEventListener('click', () => {
  currentSpeedIndex = (currentSpeedIndex + 1) % speedModes.length;
  const mode = speedModes[currentSpeedIndex];
  speedLabel.textContent = mode.label;
  game.setSpeed(mode.mult);
  showToast(`SPEED: ${mode.label}`);
  setTimeout(hideToast, 1000);
});

// Fullscreen Button
btnFullscreen.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});

// Theme Cycling (Cyber Neon -> Arcade 1980 -> Synthwave Sunset -> Matrix Green)
const themes = ['theme-neon', 'theme-arcade', 'theme-sunset', 'theme-matrix'];
let currentThemeIndex = 0;

btnTheme.addEventListener('click', () => {
  document.body.classList.remove(themes[currentThemeIndex]);
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  document.body.classList.add(themes[currentThemeIndex]);
  game.cacheMazeWalls();
});

// Difficulty Selection
diffButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    diffButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDifficulty = btn.dataset.mode;
    game.init(currentMap, currentDifficulty);
  });
});

// Map Selection
mapButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    mapButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMap = btn.dataset.map;
    game.init(currentMap, currentDifficulty);
  });
});

// Modals Handling
btnLeaderboard.addEventListener('click', () => {
  renderLeaderboard();
  modalScores.classList.remove('hidden');
});

btnAchievements.addEventListener('click', () => {
  renderAchievements();
  modalAchievements.classList.remove('hidden');
});

btnHelp.addEventListener('click', () => {
  modalHelp.classList.remove('hidden');
});

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.close;
    if (target) {
      document.getElementById(target).classList.add('hidden');
    }
  });
});

function closeAllModals() {
  modalScores.classList.add('hidden');
  modalHelp.classList.add('hidden');
  modalInitials.classList.add('hidden');
  modalAchievements.classList.add('hidden');
}

btnClearScores.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY_SCORES);
  renderLeaderboard();
});

btnSaveInitials.addEventListener('click', () => {
  const name = (playerInitialsInput.value || 'AAA').trim().toUpperCase().slice(0, 3);
  addScoreToLeaderboard(name, currentPendingScore, currentPendingLevel);
  modalInitials.classList.add('hidden');
  renderLeaderboard();
  modalScores.classList.remove('hidden');
});

// Preload Sprite images in the background
function preloadSprites() {
  const spriteList = [
    'pacmanUp.png', 'pacmanDown.png', 'pacmanLeft.png', 'pacmanRight.png',
    'redGhost.png', 'pinkGhost.png', 'blueGhost.png', 'orangeGhost.png',
    'scaredGhost.png', 'wall.png', 'cherry.png'
  ];
  spriteList.forEach(name => {
    const img = new Image();
    img.src = `/assets/${name}`;
  });
}

// ---------------------------------------------------------
// BOOTSTRAP SYSTEM
// ---------------------------------------------------------
preloadSprites();
renderLeaderboard();
renderAchievements();
game.init(currentMap, currentDifficulty);
game.run();

console.log('🕹️ PAC-MAN DELUXE ARCADE 2.0 - PROFESSIONAL CYBER EDITION ACTIVATED');
