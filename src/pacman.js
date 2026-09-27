// =========================================================
// PAC-MAN DELUXE - PLAYER CHARACTER CONTROLLER
// =========================================================

export const DIRECTIONS = {
  UP: 'U',
  DOWN: 'D',
  LEFT: 'L',
  RIGHT: 'R',
  NONE: 'N'
};

export class Pacman {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.radius = tileSize * 0.44;
    this.x = 0;
    this.y = 0;
    this.startX = 0;
    this.startY = 0;

    this.direction = DIRECTIONS.NONE;
    this.nextDirection = DIRECTIONS.NONE;
    this.speed = 2.4; // Pixels per frame at 60fps
    this.baseSpeed = 2.4;

    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.08;
    this.mouthOpening = true;

    this.isDying = false;
    this.deathProgress = 0;
    this.isDead = false;

    this.sprites = { U: null, D: null, L: null, R: null };
  }

  setSprites(sprites) {
    this.sprites = sprites;
  }

  setStartPosition(x, y) {
    this.startX = x;
    this.startY = y;
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.direction = DIRECTIONS.NONE;
    this.nextDirection = DIRECTIONS.NONE;
    this.mouthAngle = 0.2;
    this.isDying = false;
    this.deathProgress = 0;
    this.isDead = false;
  }

  requestDirection(dir) {
    this.nextDirection = dir;
  }

  isOpposite(d1, d2) {
    return (
      (d1 === DIRECTIONS.UP && d2 === DIRECTIONS.DOWN) ||
      (d1 === DIRECTIONS.DOWN && d2 === DIRECTIONS.UP) ||
      (d1 === DIRECTIONS.LEFT && d2 === DIRECTIONS.RIGHT) ||
      (d1 === DIRECTIONS.RIGHT && d2 === DIRECTIONS.LEFT)
    );
  }

  getAdjacentTile(r, c, dir) {
    if (dir === DIRECTIONS.UP) return { row: r - 1, col: c };
    if (dir === DIRECTIONS.DOWN) return { row: r + 1, col: c };
    if (dir === DIRECTIONS.LEFT) return { row: r, col: c - 1 };
    if (dir === DIRECTIONS.RIGHT) return { row: r, col: c + 1 };
    return { row: r, col: c };
  }

  update(dt, mazeGrid, boardWidth, boardHeight) {
    if (this.isDying) {
      this.deathProgress += 0.025 * dt * 60;
      if (this.deathProgress >= 1.0) {
        this.isDead = true;
      }
      return;
    }

    const tileSize = this.tileSize;
    const speed = this.speed * dt * 60;

    // Identify current tile and tile center
    let col = Math.floor(this.x / tileSize);
    let row = Math.floor(this.y / tileSize);

    // Keep col/row inside grid bounds for center calculations
    col = Math.max(0, Math.min(mazeGrid.colCount - 1, col));
    row = Math.max(0, Math.min(mazeGrid.rowCount - 1, row));

    const center = mazeGrid.getTileCenter(row, col);

    // 1. Immediate 180-degree reverse (can reverse at any point in any corridor)
    if (this.isOpposite(this.nextDirection, this.direction)) {
      this.direction = this.nextDirection;
    }

    // 2. Cornering & buffered turns:
    if (this.nextDirection !== this.direction && this.nextDirection !== DIRECTIONS.NONE) {
      const nextTile = this.getAdjacentTile(row, col, this.nextDirection);
      if (mazeGrid.isWalkable(nextTile.row, nextTile.col, false, false)) {
        const turnThreshold = Math.max(speed * 1.5, 7);

        if (this.nextDirection === DIRECTIONS.UP || this.nextDirection === DIRECTIONS.DOWN) {
          if (Math.abs(this.x - center.x) <= turnThreshold) {
            this.x = center.x;
            this.direction = this.nextDirection;
          }
        } else if (this.nextDirection === DIRECTIONS.LEFT || this.nextDirection === DIRECTIONS.RIGHT) {
          if (Math.abs(this.y - center.y) <= turnThreshold) {
            this.y = center.y;
            this.direction = this.nextDirection;
          }
        }
      }
    }

    // 3. Movement in current direction
    if (this.direction !== DIRECTIONS.NONE) {
      const aheadTile = this.getAdjacentTile(row, col, this.direction);
      const isAheadWall = !mazeGrid.isWalkable(aheadTile.row, aheadTile.col, false, false);

      let canAdvance = true;

      // If heading into a wall, cannot move beyond the tile center!
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
      }

      if (canAdvance) {
        if (this.direction === DIRECTIONS.RIGHT) {
          this.x += speed;
          this.y = center.y; // Keep locked to center lane
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

        // Animate mouth
        if (this.mouthOpening) {
          this.mouthAngle += this.mouthSpeed * dt * 60;
          if (this.mouthAngle >= 0.45) this.mouthOpening = false;
        } else {
          this.mouthAngle -= this.mouthSpeed * dt * 60;
          if (this.mouthAngle <= 0.05) this.mouthOpening = true;
        }
      } else {
        this.mouthAngle = 0.2;
      }
    }

    // 4. Wrap around tunnels
    if (this.x < -tileSize / 2) {
      this.x = boardWidth + tileSize / 2 - 2;
    } else if (this.x > boardWidth + tileSize / 2) {
      this.x = -tileSize / 2 + 2;
    }
  }

  startDeath() {
    this.isDying = true;
    this.deathProgress = 0;
  }

  draw(ctx, useSprites = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isDying) {
      const angle = this.deathProgress * Math.PI;
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, this.radius * (1 - this.deathProgress * 0.3)), -Math.PI / 2 + angle, -Math.PI / 2 + Math.PI * 2 - angle);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.restore();
      return;
    }

    let rot = 0;
    if (this.direction === DIRECTIONS.UP) rot = -Math.PI / 2;
    else if (this.direction === DIRECTIONS.DOWN) rot = Math.PI / 2;
    else if (this.direction === DIRECTIONS.LEFT) rot = Math.PI;
    else if (this.direction === DIRECTIONS.RIGHT) rot = 0;

    ctx.rotate(rot);

    ctx.fillStyle = '#ffe600';
    ctx.shadowColor = 'rgba(255, 230, 0, 0.7)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Eye sparkle
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(this.radius * 0.2, -this.radius * 0.45, this.radius * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
