// =========================================================
// PAC-MAN DELUXE - ARCADE PARTICLE & FLOATING SCORE SYSTEM
// =========================================================

export class Particle {
  constructor(x, y, vx, vy, color, size, life, decay, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.decay = decay;
    this.shape = shape;
  }

  update(dt) {
    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.life -= this.decay * dt * 60;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1, this.size * alpha), 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'square') {
      const s = Math.max(1, this.size * alpha);
      ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
    }
    ctx.restore();
  }
}

export class ScorePopup {
  constructor(x, y, text, color = '#ffe600') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 1.0;
    this.vy = -1.2;
  }

  update(dt) {
    this.y += this.vy * dt * 60;
    this.life -= 0.02 * dt * 60;
    return this.life > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.popups = [];
  }

  addPelletSparkles(x, y, color = '#ffe600', count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        2 + Math.random() * 2,
        1.0,
        0.05 + Math.random() * 0.04,
        'circle'
      ));
    }
  }

  addGhostExplosion(x, y, color = '#00ddff', count = 25) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.5;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        3 + Math.random() * 3,
        1.0,
        0.025 + Math.random() * 0.02,
        'square'
      ));
    }
  }

  addDeathBurst(x, y, count = 35) {
    const colors = ['#ffe600', '#ff9900', '#ff0055', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 4.0;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        2.5 + Math.random() * 3.5,
        1.0,
        0.02 + Math.random() * 0.02,
        'circle'
      ));
    }
  }

  addFireworks(width, height, count = 3) {
    const palette = ['#00f3ff', '#ff007b', '#ffe600', '#9d00ff', '#00ff88'];
    for (let k = 0; k < count; k++) {
      const rx = width * 0.2 + Math.random() * (width * 0.6);
      const ry = height * 0.2 + Math.random() * (height * 0.5);
      const color = palette[Math.floor(Math.random() * palette.length)];
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        this.particles.push(new Particle(
          rx, ry,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          3 + Math.random() * 2,
          1.0,
          0.015 + Math.random() * 0.02,
          'square'
        ));
      }
    }
  }

  addScorePopup(x, y, text, color = '#ffe600') {
    this.popups.push(new ScorePopup(x, y, text, color));
  }

  update(dt) {
    this.particles = this.particles.filter(p => p.update(dt));
    this.popups = this.popups.filter(p => p.update(dt));
  }

  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
    for (let i = 0; i < this.popups.length; i++) {
      this.popups[i].draw(ctx);
    }
  }

  clear() {
    this.particles = [];
    this.popups = [];
  }
}
