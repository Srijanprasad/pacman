// =========================================================
// PAC-MAN DELUXE - MAZE CONFIGURATIONS & GRID SYSTEM
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

// 1. Enhanced Original Map (from Java tutorial, upgraded with tunnels, power pellets & ghost door)
export const MAP_ORIGINAL = {
  id: 'original',
  name: 'ENHANCED ORIGINAL (21x19)',
  rowCount: 21,
  colCount: 19,
  tileSize: 26,
  fruitPos: { row: 11, col: 9 },
  doorPos: { row: 8, col: 9 },
  layout: [
    "XXXXXXXXXXXXXXXXXXX", // 0
    "X........X........X", // 1
    "X*XX.XXX.X.XXX.XX*X", // 2
    "X.................X", // 3
    "X.XX.X.XXXXX.X.XX.X", // 4
    "X....X... ...X....X", // 5
    "XXXX.XXXX.XXXX.XXXX", // 6
    "OOOX.X   r   X.XOOO", // 7 (Blinky starts outside)
    "XXXX.X.XX-XX.X.XXXX", // 8 (Door '-' at col 9)
    "O       bpo       O", // 9 (Inky, Pinky, Clyde inside house)
    "XXXX.X.XXXXX.X.XXXX", // 10
    "OOOX.X   F   X.XOOO", // 11
    "XXXX.X.XXXXX.X.XXXX", // 12
    "X........X........X", // 13
    "X.XX.XXX.X.XXX.XX.X", // 14
    "X*.X.....P.....X.*X", // 15 (Pacman 'P' at col 9, clear corridor to energizers)
    "XX.X.X.XXXXX.X.X.XX", // 16
    "X....X...X...X....X", // 17
    "X.XXXXXX.X.XXXXXX.X", // 18
    "X.................X", // 19
    "XXXXXXXXXXXXXXXXXXX"  // 20
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
  doorPos: { row: 12, col: 13 },
  layout: [
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXX", // 0
    "X............XX............X", // 1
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X", // 2
    "X*XXXX.XXXXX.XX.XXXXX.XXXX*X", // 3
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X", // 4
    "X..........................X", // 5
    "X.XXXX.XX.XXXXXXXX.XX.XXXX.X", // 6
    "X.XXXX.XX.XXXXXXXX.XX.XXXX.X", // 7
    "X......XX....XX....XX......X", // 8
    "XXXXXX.XXXXX XX XXXXX.XXXXXX", // 9
    "OOOOOX.XXXXX XX XXXXX.XOOOOO", // 10
    "OOOOOX.XX    r     XX.XOOOOO", // 11 (Blinky starts outside)
    "OOOOOX.XX XXX--XXX XX.XOOOOO", // 12 (Door '--' at cols 13-14)
    "XXXXXX.XX X      X XX.XXXXXX", // 13
    "O      .. X bpo  X ..      O", // 14 (House interior)
    "XXXXXX.XX X      X XX.XXXXXX", // 15
    "OOOOOX.XX XXXXXXXX XX.XOOOOO", // 16
    "OOOOOX.XX    F     XX.XOOOOO", // 17
    "OOOOOX.XX XXXXXXXX XX.XOOOOO", // 18
    "XXXXXX.XX XXXXXXXX XX.XXXXXX", // 19
    "X............XX............X", // 20
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X", // 21
    "X.XXXX.XXXXX.XX.XXXXX.XXXX.X", // 22
    "X*..XX.......P........XX..*X", // 23
    "XXX.XX.XX.XXXXXXXX.XX.XX.XXX", // 24
    "XXX.XX.XX.XXXXXXXX.XX.XX.XXX", // 25
    "X......XX....XX....XX......X", // 26
    "X.XXXXXXXXXX.XX.XXXXXXXXXX.X", // 27
    "X.XXXXXXXXXX.XX.XXXXXXXXXX.X", // 28
    "X..........................X", // 29
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXX"  // 30
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
  doorPos: { row: 8, col: 10 },
  layout: [
    "XXXXXXXXXXXXXXXXXXXXX",
    "X*........X........*X",
    "X.XXX.XXX.X.XXX.XXX.X",
    "X.X.....X...X.....X.X",
    "X.X.XXX.XXXXX.XXX.X.X",
    "X...................X",
    "XXX.XX.XXXXXXX.XX.XXX",
    "OOX.XX... r ...XX.XOO",
    "XXX.XXXXX---XXXXX.XXX",
    "O       Xbpo X      O",
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

// 2D Matrix Grid System for 100% glitch-free tile navigation
export class MazeGrid {
  constructor(layout, rowCount, colCount, tileSize) {
    this.layout = layout;
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.tileSize = tileSize;
    this.grid = [];

    for (let r = 0; r < rowCount; r++) {
      this.grid[r] = [];
      const rowStr = layout[r];
      for (let c = 0; c < colCount; c++) {
        const ch = rowStr.charAt(c);
        if (ch === 'X') {
          this.grid[r][c] = 1; // Wall
        } else if (ch === '-') {
          this.grid[r][c] = 2; // Ghost door (ghosts can pass, pacman cannot)
        } else {
          this.grid[r][c] = 0; // Walkable
        }
      }
    }
  }

  isWalkable(row, col, isGhost = false, canPassDoor = false) {
    // Warp tunnel wrapping: outer columns are always open
    if (col < 0 || col >= this.colCount) return true;
    if (row < 0 || row >= this.rowCount) return false;

    const cell = this.grid[row][col];
    if (cell === 0) return true;
    if (cell === 2) return isGhost && canPassDoor;
    return false; // Wall
  }

  getTileCenter(row, col) {
    return {
      x: col * this.tileSize + this.tileSize / 2,
      y: row * this.tileSize + this.tileSize / 2
    };
  }
}

export function parseMap(mapConfig) {
  const { rowCount, colCount, tileSize, layout } = mapConfig;
  const walls = [];
  const dots = [];
  const powerPellets = [];
  let ghostDoor = null;
  let pacmanStart = { x: 0, y: 0 };
  const ghostsStart = {
    red: null,
    pink: null,
    cyan: null,
    orange: null
  };

  const mazeGrid = new MazeGrid(layout, rowCount, colCount, tileSize);

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
        if (!ghostDoor) {
          ghostDoor = { x, y, width: tileSize, height: tileSize / 4, row: r, col: c };
        } else {
          ghostDoor.width += tileSize; // Expand multi-tile doors
        }
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

  // Door tile center coordinate
  const doorTileCoord = mapConfig.doorPos ? {
    row: mapConfig.doorPos.row,
    col: mapConfig.doorPos.col,
    x: mapConfig.doorPos.col * tileSize + tileSize / 2,
    y: mapConfig.doorPos.row * tileSize + tileSize / 2
  } : { row: 8, col: 9, x: 9 * tileSize + tileSize / 2, y: 8 * tileSize + tileSize / 2 };

  return {
    mazeGrid,
    walls,
    dots,
    powerPellets,
    ghostDoor,
    doorTileCoord,
    pacmanStart,
    ghostsStart,
    fruitCoord,
    totalDots: dots.length + powerPellets.length
  };
}
