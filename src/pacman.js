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
    this.deathProgress = 0; // 0 to 1
    this.isDead = false;

    // Sprite image references
    this.sprites = {
      U: null,
      D: null,
      L: null,
      R: null
    };
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

  canMove(dir, walls, boardWidth, boardHeight) {
    if (dir === DIRECTIONS.NONE) return false;

    let testX = this.x;
    let testY = this.y;
    const offset = this.speed + 1;

    if (dir === DIRECTIONS.UP) testY -= offset;
    else if (dir === DIRECTIONS.DOWN) testY += offset;
    else if (dir === DIRECTIONS.LEFT) testX -= offset;
    else if (dir === DIRECTIONS.RIGHT) testX += offset;

    const r = this.radius * 0.9;
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

  // Snap to tile center along the perpendicular axis to make turns effortless
  alignToGrid(dir) {
    if (dir === DIRECTIONS.UP || dir === DIRECTIONS.DOWN) {
      // align x
      const col = Math.floor(this.x / this.tileSize);
      const targetX = col * this.tileSize + this.tileSize / 2;
      if (Math.abs(this.x - targetX) < this.tileSize * 0.45) {
        this.x = targetX;
      }
    } else if (dir === DIRECTIONS.LEFT || dir === DIRECTIONS.RIGHT) {
      // align y
      const row = Math.floor(this.y / this.tileSize);
      const targetY = row * this.tileSize + this.tileSize / 2;
      if (Math.abs(this.y - targetY) < this.tileSize * 0.45) {
        this.y = targetY;
      }
    }
  }

  update(dt, walls, boardWidth, boardHeight) {
    if (this.isDying) {
      this.deathProgress += 0.025 * dt * 60;
      if (this.deathProgress >= 1.0) {
        this.isDead = true;
      }
      return;
    }

    // Try applying buffered turn if valid
    if (this.nextDirection !== this.direction) {
      this.alignToGrid(this.nextDirection);
      if (this.canMove(this.nextDirection, walls, boardWidth, boardHeight)) {
        this.direction = this.nextDirection;
      }
    }

    // Check if can continue current direction
    if (this.canMove(this.direction, walls, boardWidth, boardHeight)) {
      const moveDist = this.speed * dt * 60;
      if (this.direction === DIRECTIONS.UP) this.y -= moveDist;
      else if (this.direction === DIRECTIONS.DOWN) this.y += moveDist;
      else if (this.direction === DIRECTIONS.LEFT) this.x -= moveDist;
      else if (this.direction === DIRECTIONS.RIGHT) this.x += moveDist;

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

    // Wrap around screen tunnels seamlessly
    if (this.x < -this.tileSize / 2) {
      this.x = boardWidth + this.tileSize / 2 - 2;
    } else if (this.x > boardWidth + this.tileSize / 2) {
      this.x = -this.tileSize / 2 + 2;
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
      // Classic Pacman dissolution animation
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

    // Render using sprites or high-res vector canvas
    const currentSprite = this.sprites[this.direction] || this.sprites.R;
    if (useSprites && currentSprite && currentSprite.complete) {
      const s = this.tileSize * 1.1;
      ctx.drawImage(currentSprite, -s / 2, -s / 2, s, s);
    } else {
      // High-tech Glowing Vector Canvas Pac-Man
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

      // Subtle eye sparkle
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(this.radius * 0.2, -this.radius * 0.45, this.radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
