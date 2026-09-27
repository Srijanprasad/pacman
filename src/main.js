// =========================================================
// PAC-MAN DELUXE - MAIN UI CONTROLLER & ENTRY POINT
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

const overlayScreen = document.getElementById('overlay-screen');
const overlayTitle = document.getElementById('overlay-title');
const overlaySubtitle = document.getElementById('overlay-subtitle');
const overlayBadge = document.getElementById('overlay-badge');
const btnStart = document.getElementById('btn-start');
const announcerToast = document.getElementById('announcer-toast');
const gameStatusText = document.getElementById('game-status-text');

const btnTheme = document.getElementById('btn-theme');
const btnCrt = document.getElementById('btn-crt');
const btnSound = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const btnLeaderboard = document.getElementById('btn-leaderboard');
const btnHelp = document.getElementById('btn-help');
const btnPause = document.getElementById('btn-pause');
const btnRestart = document.getElementById('btn-restart');

// Modals
const modalScores = document.getElementById('modal-scores');
const modalInitials = document.getElementById('modal-initials');
const modalHelp = document.getElementById('modal-help');
const leaderboardRows = document.getElementById('leaderboard-rows');
const btnClearScores = document.getElementById('btn-clear-scores');
const btnSaveInitials = document.getElementById('btn-save-initials');
const playerInitialsInput = document.getElementById('player-initials');
const entryScoreVal = document.getElementById('entry-score-val');

// Selection buttons
const diffButtons = document.querySelectorAll('.diff-btn');
const mapButtons = document.querySelectorAll('.map-btn');
const dpadButtons = document.querySelectorAll('.dpad-btn');

// Initialize Game Engine
const game = new GameEngine(canvas);

let currentDifficulty = 'arcade';
let currentMap = 'original';
let currentPendingScore = 0;
let currentPendingLevel = 1;

// Format numbers with leading zeros (e.g., 00480)
function padScore(num, size = 5) {
  let s = num.toString();
  while (s.length < size) s = '0' + s;
  return s;
}

// ---------------------------------------------------------
// HIGH SCORES LEADERBOARD STORAGE
// ---------------------------------------------------------
const STORAGE_KEY_SCORES = 'pacman_arcade_leaderboard_v1';

function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    { name: 'PAC', score: 15400, level: 5 },
    { name: 'NEO', score: 12100, level: 4 },
    { name: 'VRC', score: 8500, level: 3 },
    { name: 'RET', score: 6200, level: 2 },
    { name: 'BOT', score: 3400, level: 1 }
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
  board.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'score-row';
    const medals = ['🥇', '🥈', '🥉', '4TH', '5TH'];
    row.innerHTML = `
      <span>${medals[index] || index + 1}</span>
      <span>${item.name}</span>
      <span>LV${item.level}</span>
      <span class="neon-yellow">${padScore(item.score)}</span>
    `;
    leaderboardRows.appendChild(row);
  });
}

// ---------------------------------------------------------
// HUD & STATE SYNCHRONIZATION
// ---------------------------------------------------------
game.onScoreUpdate = (score, highScore) => {
  scoreEl.textContent = padScore(score);
  highScoreEl.textContent = padScore(highScore);
};

game.onLivesUpdate = (lives) => {
  livesDisplay.innerHTML = '';
  for (let i = 0; i < Math.max(0, lives); i++) {
    const icon = document.createElement('span');
    icon.className = 'life-icon';
    livesDisplay.appendChild(icon);
  }
};

game.onLevelUpdate = (lvl) => {
  stageEl.textContent = (lvl < 10 ? '0' : '') + lvl;
};

game.onFruitUpdate = (fruits) => {
  fruitCollectedEl.innerHTML = '';
  fruits.slice(-5).forEach(f => {
    const span = document.createElement('span');
    span.className = 'fruit-item';
    span.textContent = f;
    fruitCollectedEl.appendChild(span);
  });
};

game.onStateChange = (state) => {
  if (state === GAME_STATES.READY) {
    overlayScreen.classList.add('active');
    overlayBadge.textContent = 'SYSTEM READY';
    overlayTitle.textContent = 'READY!';
    overlaySubtitle.textContent = 'PRESS START OR MOVE TO PLAY';
    btnStart.textContent = 'START GAME';
    btnStart.style.display = 'inline-block';
    gameStatusText.textContent = 'ARCADE READY';
    showToast('READY!');
  } else if (state === GAME_STATES.PLAYING) {
    overlayScreen.classList.remove('active');
    gameStatusText.textContent = 'MISSION IN PROGRESS';
    hideToast();
  } else if (state === GAME_STATES.PAUSED) {
    overlayScreen.classList.add('active');
    overlayBadge.textContent = 'PAUSED';
    overlayTitle.textContent = 'GAME PAUSED';
    overlaySubtitle.textContent = 'PRESS SPACE TO RESUME';
    btnStart.textContent = 'RESUME';
    btnStart.style.display = 'inline-block';
    gameStatusText.textContent = 'SYSTEM PAUSED';
  } else if (state === GAME_STATES.GAME_OVER) {
    overlayScreen.classList.add('active');
    overlayBadge.textContent = 'GAME OVER';
    overlayTitle.textContent = 'GAME OVER';
    overlaySubtitle.textContent = `FINAL SCORE: ${padScore(game.score)}`;
    btnStart.textContent = 'PLAY AGAIN';
    btnStart.style.display = 'inline-block';
    gameStatusText.textContent = 'ARCADE SESSION OVER';
    showToast('GAME OVER');
  } else if (state === GAME_STATES.LEVEL_CLEAR) {
    showToast('STAGE CLEAR!');
    gameStatusText.textContent = 'WARPING TO NEXT STAGE';
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
    }, 800);
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
// CONTROLS & EVENT LISTENERS
// ---------------------------------------------------------
function handleDirectionInput(dir) {
  if (game.state === GAME_STATES.READY) {
    game.start();
  } else if (game.state === GAME_STATES.PAUSED) {
    game.start();
  }
  if (game.pacman) {
    game.pacman.requestDirection(dir);
  }
}

// Keyboard Controls
window.addEventListener('keydown', (e) => {
  // Prevent default scroll on game keys
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

// Touch Swipe on Canvas
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

    if (Math.max(absX, absY) > 24) {
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

// Theme Cycling (Neon -> Classic -> Sunset)
const themes = ['theme-neon', 'theme-classic', 'theme-sunset'];
let currentThemeIndex = 0;

btnTheme.addEventListener('click', () => {
  document.body.classList.remove(themes[currentThemeIndex]);
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  document.body.classList.add(themes[currentThemeIndex]);
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

// Preload Sprite images in the background (if user wants sprite mode or falls back to glowing canvas)
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
// INITIAL BOOTSTRAP
// ---------------------------------------------------------
preloadSprites();
renderLeaderboard();
game.init(currentMap, currentDifficulty);
game.run();

console.log('🕹️ PAC-MAN DELUXE ARCADE 2.0 INITIALIZED - READY FOR VERCEL');
