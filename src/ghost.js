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
  constructor(name, color, tileSize, homeCorner, exitDelay = 0) {
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

    // Ghost house exit state
    this.exitDelay = exitDelay;
    this.exitTimer = exitDelay;
    this.inPen = exitDelay > 0;
    this.penBobTimer = 0;

    this.skirtFrame = 0;
    this.skirtTimer = 0;

    this.lastTileKey = '';

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
    this.exitTimer = this.exitDelay;
    this.inPen = this.exitDelay > 0;
    this.penBobTimer = Math.random() * Math.PI;
    this.lastTileKey = '';
  }

  setFrightened(duration) {
    if (this.mode === GHOST_MODES.EATEN || this.inPen) return;
    this.mode = GHOST_MODES.FRIGHTENED;
    this.frightenedDuration = duration;
    this.frightenedTimer = duration;
    this.speed = this.baseSpeed * 0.65;
    this.direction = this.getOppositeDirection(this.direction);
  }

  getOppositeDirection(dir) {
    if (dir === DIRECTIONS.UP) return DIRECTIONS.DOWN;
    if (dir === DIRECTIONS.DOWN) return DIRECTIONS.UP;
    if (dir === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
    if (dir === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
    return DIRECTIONS.NONE;
  }

  getAdjacentTile(r, c, dir) {
    if (dir === DIRECTIONS.UP) return { row: r - 1, col: c };
    if (dir === DIRECTIONS.DOWN) return { row: r + 1, col: c };
    if (dir === DIRECTIONS.LEFT) return { row: r, col: c - 1 };
    if (dir === DIRECTIONS.RIGHT) return { row: r, col: c + 1 };
    return { row: r, col: c };
  }

  // Calculate target tile according to ghost AI personality
  getTargetTile(pacman, blinky, doorCoord) {
    if (this.mode === GHOST_MODES.EATEN) {
      return doorCoord ? { x: doorCoord.x, y: doorCoord.y } : this.homeCorner;
    }

    if (this.mode === GHOST_MODES.SCATTER) {
      return this.homeCorner;
    }

    if (this.mode === GHOST_MODES.FRIGHTENED) {
      return null;
    }

    // CHASE PERSONALITIES
    switch (this.name) {
      case 'blinky':
        return { x: pacman.x, y: pacman.y };

      case 'pinky': {
        let tx = pacman.x;
        let ty = pacman.y;
        const d = this.tileSize * 4;
        if (pacman.direction === DIRECTIONS.UP) { ty -= d; tx -= d; }
        else if (pacman.direction === DIRECTIONS.DOWN) ty += d;
        else if (pacman.direction === DIRECTIONS.LEFT) tx -= d;
        else if (pacman.direction === DIRECTIONS.RIGHT) tx += d;
        return { x: tx, y: ty };
      }

      case 'inky': {
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

      case 'clyde': {
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

  update(dt, mazeGrid, boardWidth, boardHeight, pacman, blinky, doorCoord) {
    // Skirt wave animation
    this.skirtTimer += dt * 60;
    if (this.skirtTimer > 8) {
      this.skirtFrame = (this.skirtFrame + 1) % 2;
      this.skirtTimer = 0;
    }

    const tileSize = this.tileSize;

    // 1. Ghost House / Pen Exit sequence
    if (this.inPen) {
      this.exitTimer -= dt;
      if (this.exitTimer > 0) {
        // Bob gently inside pen
        this.penBobTimer += dt * 4;
        this.y = this.startY + Math.sin(this.penBobTimer) * 4;
        return;
      }

      // Exit pen: guide towards doorCoord
      const speed = this.speed * dt * 60;
      if (Math.abs(this.x - doorCoord.x) > 2) {
        this.x += (doorCoord.x > this.x ? 1 : -1) * speed;
        this.direction = doorCoord.x > this.x ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
        return;
      }

      this.x = doorCoord.x;
      if (this.y > doorCoord.y - tileSize * 0.8) {
        this.y -= speed;
        this.direction = DIRECTIONS.UP;
        return;
      }

      // Successfully exited pen!
      this.inPen = false;
      this.direction = DIRECTIONS.LEFT;
      return;
    }

    // 2. Frightened timer countdown
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      this.frightenedTimer -= dt;
      if (this.frightenedTimer <= 0) {
        this.mode = GHOST_MODES.CHASE;
        this.speed = this.baseSpeed;
      }
    } else if (this.mode === GHOST_MODES.EATEN) {
      this.speed = this.baseSpeed * 1.8;
      // If eyes reached door, revive!
      const distToDoor = Math.hypot(this.x - doorCoord.x, this.y - doorCoord.y);
      if (distToDoor < tileSize * 0.7) {
        this.mode = GHOST_MODES.CHASE;
        this.speed = this.baseSpeed;
        this.direction = DIRECTIONS.UP;
      }
    }

    // 3. Tile navigation on MazeGrid
    const speed = this.speed * dt * 60;
    let col = Math.floor(this.x / tileSize);
    let row = Math.floor(this.y / tileSize);

    col = Math.max(0, Math.min(mazeGrid.colCount - 1, col));
    row = Math.max(0, Math.min(mazeGrid.rowCount - 1, row));

    const center = mazeGrid.getTileCenter(row, col);
    const tileKey = `${row},${col}`;

    // Check if close enough to tile center to choose next direction (only once per tile)
    const distToCenter = Math.hypot(this.x - center.x, this.y - center.y);
    if (distToCenter <= Math.max(speed * 1.2, 5) && this.lastTileKey !== tileKey) {
      this.lastTileKey = tileKey;
      this.chooseNextDirection(mazeGrid, row, col, pacman, blinky, doorCoord);
    }

    // Advance in current direction
    const aheadTile = this.getAdjacentTile(row, col, this.direction);
    const isAheadWall = !mazeGrid.isWalkable(aheadTile.row, aheadTile.col, true, this.mode === GHOST_MODES.EATEN);

    let canAdvance = true;
    if (isAheadWall) {
      if (this.direction === DIRECTIONS.RIGHT && this.x + speed >= center.x) {
        this.x = center.x;
        canAdvance = false;
      } else if (this.direction === DIRECTIONS.LEFT && this.x - speed <= center.x) {
        this.x = center.x;
        canAdvance = false;
      } else if (this.direction === DIRECTIONS.DOWN && this.y + speed >= center.y) {
        this.y = center.y;
        canAdvance = false;
      } else if (this.direction === DIRECTIONS.UP && this.y - speed <= center.y) {
        this.y = center.y;
        canAdvance = false;
      }
      if (!canAdvance) {
        this.lastTileKey = '';
        this.chooseNextDirection(mazeGrid, row, col, pacman, blinky, doorCoord);
      }
    }

    if (canAdvance) {
      if (this.direction === DIRECTIONS.RIGHT) {
        this.x += speed;
        this.y = center.y;
      } else if (this.direction === DIRECTIONS.LEFT) {
        this.x -= speed;
        this.y = center.y;
      } else if (this.direction === DIRECTIONS.DOWN) {
        this.y += speed;
        this.x = center.x;
      } else if (this.direction === DIRECTIONS.UP) {
        this.y -= speed;
        this.x = center.x;
      }
    }

    // Tunnel wrap
    if (this.x < -tileSize / 2) {
      this.x = boardWidth + tileSize / 2 - 2;
    } else if (this.x > boardWidth + tileSize / 2) {
      this.x = -tileSize / 2 + 2;
    }
  }

  chooseNextDirection(mazeGrid, row, col, pacman, blinky, doorCoord) {
    const opp = this.getOppositeDirection(this.direction);
    const allDirs = [DIRECTIONS.UP, DIRECTIONS.LEFT, DIRECTIONS.DOWN, DIRECTIONS.RIGHT];
    const validDirs = [];

    const canPassDoor = this.mode === GHOST_MODES.EATEN;

    for (const d of allDirs) {
      if (d !== opp) {
        const next = this.getAdjacentTile(row, col, d);
        if (mazeGrid.isWalkable(next.row, next.col, true, canPassDoor)) {
          validDirs.push(d);
        }
      }
    }

    // If completely boxed in, allow reversing
    if (validDirs.length === 0) {
      const revNext = this.getAdjacentTile(row, col, opp);
      if (mazeGrid.isWalkable(revNext.row, revNext.col, true, canPassDoor)) {
        this.direction = opp;
      }
      return;
    }

    // In frightened mode, choose random valid turn
    if (this.mode === GHOST_MODES.FRIGHTENED) {
      this.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
      return;
    }

    // In chase / scatter / eaten mode, pick tile that minimizes Euclidean distance to target
    const target = this.getTargetTile(pacman, blinky, doorCoord);
    if (!target) {
      this.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
      return;
    }

    let bestDir = validDirs[0];
    let minDistance = Infinity;

    for (const d of validDirs) {
      const nextTile = this.getAdjacentTile(row, col, d);
      const center = mazeGrid.getTileCenter(nextTile.row, nextTile.col);
      const distSq = (center.x - target.x) ** 2 + (center.y - target.y) ** 2;

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

    // 1. EATEN MODE: Floating eyes
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

      // Scared eyes
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
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;

    this.drawGhostBody(ctx, r);
    this.drawEyes(ctx, r);

    ctx.restore();
  }

  drawGhostBody(ctx, r) {
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r, Math.PI, 0, false);
    ctx.lineTo(r, r * 0.85);

    const feetCount = 3;
    const footWidth = (r * 2) / feetCount;
    const waveOffset = this.skirtFrame === 0 ? r * 0.2 : 0;

    for (let i = 0; i < feetCount; i++) {
      const startX = r - i * footWidth;
      const endX = startX - footWidth;
      const peakY = r * 0.65 + (i % 2 === 0 ? waveOffset : -waveOffset);
      ctx.quadraticCurveTo(startX - footWidth / 2, peakY, endX, r * 0.85);
    }

    ctx.lineTo(-r, -r * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  drawEyes(ctx, r) {
    let lookX = 0;
    let lookY = 0;
    const lookDist = r * 0.25;

    if (this.direction === DIRECTIONS.UP) lookY = -lookDist;
    else if (this.direction === DIRECTIONS.DOWN) lookY = lookDist;
    else if (this.direction === DIRECTIONS.LEFT) lookX = -lookDist;
    else if (this.direction === DIRECTIONS.RIGHT) lookX = lookDist;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.15, r * 0.32, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.15, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1133bb';
    ctx.beginPath();
    ctx.arc(-r * 0.35 + lookX, -r * 0.15 + lookY, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.35 + lookX, -r * 0.15 + lookY, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}
