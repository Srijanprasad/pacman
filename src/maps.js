// =========================================================
// PAC-MAN DELUXE - MAZE CONFIGURATIONS & TILE SYSTEM
// =========================================================

export const TILE_TYPES = {
  WALL: 'X',
  EMPTY: ' ',
  DOT: '.',
  POWER_PELLET: '*',
  TUNNEL: 'O',
  GHOST_HOUSE_DOOR: '-',
  PACMAN_START: 'P',
  GHOST_RED: 'r',
  GHOST_PINK: 'p',
  GHOST_CYAN: 'b',
  GHOST_ORANGE: 'o',
  FRUIT_SPAWN: 'F'
};

// 1. Enhanced Original Map (from Java tutorial, upgraded with tunnels & power pellets)
export const MAP_ORIGINAL = {
  id: 'original',
  name: 'ENHANCED ORIGINAL (21x19)',
  rowCount: 21,
  colCount: 19,
  tileSize: 26,
  fruitPos: { row: 11, col: 9 },
  layout: [
    "XXXXXXXXXXXXXXXXXXX",
    "X........X........X",
    "X*XX.XXX.X.XXX.XX*X",
    "X.................X",
    "X.XX.X.XXXXX.X.XX.X",
    "X....X... ...X....X",
    "XXXX.XXXX.XXXX.XXXX",
    "OOOX.X       X.XOOO",
    "XXXX.X.XXrXX.X.XXXX",
    "O       bpo       O",
    "XXXX.X.XXXXX.X.XXXX",
    "OOOX.X   F   X.XOOO",
    "XXXX.X.XXXXX.X.XXXX",
    "X........X........X",
    "X.XX.XXX.X.XXX.XX.X",
    "X* X.....P.....X *X",
    "XX.X.X.XXXXX.X.X.XX",
    "X....X...X...X....X",
    "X.XXXXXX.X.XXXXXX.X",
    "X.................X",
    "XXXXXXXXXXXXXXXXXXX"
  ]
};

// 2. Classic Arcade Map (Authentic 1980 Namco Layout)
export const MAP_ARCADE = {
  id: 'arcade',
  name: 'CLASSIC ARCADE (28x31)',
  rowCount: 31,
  colCount: 28,
  tileSize: 18,
  fruitPos: { row: 17, col: 13 },
  layout: [
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X............XX............X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "X*XXXX.XXXXX.XX.XXXXX.XXXX*X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "X..........................X",
    "X.XXXX.XX.XXXXXXXX.XX.XXXX.X",
    "X.XXXX.XX.XXXXXXXX.XX.XXXX.X",
    "X......XX....XX....XX......X",
    "XXXXXX.XXXXX XX XXXXX.XXXXXX",
    "OOOOOX.XXXXX XX XXXXX.XOOOOO",
    "OOOOOX.XX          XX.XOOOOO",
    "OOOOOX.XX XXX--XXX XX.XOOOOO",
    "XXXXXX.XX X  r   X XX.XXXXXX",
    "O      .. X bpo  X ..      O",
    "XXXXXX.XX X      X XX.XXXXXX",
    "OOOOOX.XX XXXXXXXX XX.XOOOOO",
    "OOOOOX.XX    F     XX.XOOOOO",
    "OOOOOX.XX XXXXXXXX XX.XOOOOO",
    "XXXXXX.XX XXXXXXXX XX.XXXXXX",
    "X............XX............X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X",
    "X*..XX.......P........XX..*X",
    "XXX.XX.XX.XXXXXXXX.XX.XX.XXX",
    "XXX.XX.XX.XXXXXXXX.XX.XX.XXX",
    "X......XX....XX....XX......X",
    "X.XXXXXXXXXX.XX.XXXXXXXXXX.X",
    "X.XXXXXXXXXX.XX.XXXXXXXXXX.X",
    "X..........................X",
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  ]
};

// 3. Cyber Matrix Map (Fast neon layout with 4 warp zones)
export const MAP_CYBER = {
  id: 'cyber',
  name: 'CYBER MATRIX (21x21)',
  rowCount: 21,
  colCount: 21,
  tileSize: 24,
  fruitPos: { row: 12, col: 10 },
  layout: [
    "XXXXXXXXXXXXXXXXXXXXX",
    "X*........X........*X",
    "X.XXX.XXX.X.XXX.XXX.X",
    "X.X.....X...X.....X.X",
    "X.X.XXX.XXXXX.XXX.X.X",
    "X...................X",
    "XXX.XX.XXXXXXX.XX.XXX",
    "OOX.XX....X....XX.XOO",
    "XXX.XXXXX-X-XXXXX.XXX",
    "O       XrbpoX      O",
    "XXX.XXXXX-X-XXXXX.XXX",
    "OOX.XX....F....XX.XOO",
    "XXX.XX.XXXXXXX.XX.XXX",
    "X.........P.........X",
    "X.XXX.XXX.X.XXX.XXX.X",
    "X...X...X.X.X...X...X",
    "XXX.X.X.XXXXX.X.X.XXX",
    "X.....X.......X.....X",
    "X.XXXXX.XXXXX.XXXXX.X",
    "X*.................*X",
    "XXXXXXXXXXXXXXXXXXXXX"
  ]
};

export const MAPS = {
  original: MAP_ORIGINAL,
  arcade: MAP_ARCADE,
  cyber: MAP_CYBER
};

export function parseMap(mapConfig) {
  const { rowCount, colCount, tileSize, layout } = mapConfig;
  const walls = [];
  const dots = [];
  const powerPellets = [];
  const ghostHome = [];
  let ghostDoor = null;
  let pacmanStart = { x: 0, y: 0 };
  const ghostsStart = {
    red: null,
    pink: null,
    cyan: null,
    orange: null
  };

  for (let r = 0; r < rowCount; r++) {
    const rowStr = layout[r];
    for (let c = 0; c < colCount; c++) {
      const ch = rowStr.charAt(c);
      const x = c * tileSize;
      const y = r * tileSize;

      if (ch === 'X') {
        walls.push({ x, y, width: tileSize, height: tileSize, row: r, col: c });
      } else if (ch === '.') {
        dots.push({ x: x + tileSize / 2, y: y + tileSize / 2, radius: Math.max(2, tileSize * 0.09), row: r, col: c });
      } else if (ch === '*') {
        powerPellets.push({ x: x + tileSize / 2, y: y + tileSize / 2, radius: tileSize * 0.28, row: r, col: c });
      } else if (ch === '-') {
        ghostDoor = { x, y, width: tileSize, height: tileSize / 4, row: r, col: c };
      } else if (ch === 'P') {
        pacmanStart = { x: x + tileSize / 2, y: y + tileSize / 2, row: r, col: c };
      } else if (ch === 'r') {
        ghostsStart.red = { x: x + tileSize / 2, y: y + tileSize / 2, row: r, col: c };
      } else if (ch === 'p') {
        ghostsStart.pink = { x: x + tileSize / 2, y: y + tileSize / 2, row: r, col: c };
      } else if (ch === 'b') {
        ghostsStart.cyan = { x: x + tileSize / 2, y: y + tileSize / 2, row: r, col: c };
      } else if (ch === 'o') {
        ghostsStart.orange = { x: x + tileSize / 2, y: y + tileSize / 2, row: r, col: c };
      }
    }
  }

  // Fruit spawn pixel coordinate
  const fruitCoord = {
    x: mapConfig.fruitPos.col * tileSize + tileSize / 2,
    y: mapConfig.fruitPos.row * tileSize + tileSize / 2
  };

  return {
    walls,
    dots,
    powerPellets,
    ghostDoor,
    pacmanStart,
    ghostsStart,
    fruitCoord,
    totalDots: dots.length + powerPellets.length
  };
}
