// =========================================================
// PAC-MAN DELUXE - PROCEDURAL 8-BIT WEB AUDIO SYNTHESIZER
// =========================================================

class RetroSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.3;
    this.wakaAlt = false;
    this.lastWakaTime = 0;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenInterval = null;
    this.sirenPitch = 400;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Waka Waka dot eating sound
  playWaka() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastWakaTime < 0.1) return; // Prevent audio congestion
    this.lastWakaTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = this.wakaAlt ? 440 : 330;
    const endFreq = this.wakaAlt ? 300 : 490;
    this.wakaAlt = !this.wakaAlt;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Eating a Power Energizer Pellet
  playPowerPellet() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.31);
  }

  // Eating a Ghost
  playEatGhost() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Arpeggiated victory chirp
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(600, now + 0.06);
    osc.frequency.setValueAtTime(800, now + 0.12);
    osc.frequency.setValueAtTime(1200, now + 0.18);
    osc.frequency.setValueAtTime(1600, now + 0.24);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Eating a Bonus Fruit
  playEatFruit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
    });
  }

  // Pac-Man Death Sound: Iconic dropping wobble
  playDeath() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const freqs = [
      800, 750, 700, 650, 600, 550, 500, 450, 400, 350, 300, 250, 200, 150, 100
    ];

    freqs.forEach((f, i) => {
      osc.frequency.setValueAtTime(f, now + i * 0.07);
    });

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  // Game Start Jingle
  playGameStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Classic arcade intro melody sequence
    const notes = [
      { f: 493.88, d: 0.12 }, // B4
      { f: 987.77, d: 0.12 }, // B5
      { f: 739.99, d: 0.12 }, // F#5
      { f: 622.25, d: 0.12 }, // D#5
      { f: 987.77, d: 0.08 }, // B5
      { f: 739.99, d: 0.16 }, // F#5
      { f: 622.25, d: 0.22 }, // D#5
      { f: 523.25, d: 0.12 }, // C5
      { f: 1046.5, d: 0.12 }, // C6
      { f: 783.99, d: 0.12 }, // G5
      { f: 659.25, d: 0.12 }, // E5
      { f: 1046.5, d: 0.08 }, // C6
      { f: 783.99, d: 0.16 }, // G5
      { f: 659.25, d: 0.22 }, // E5
    ];

    let t = this.ctx.currentTime + 0.05;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }

  // Level Clear Fanfare
  playLevelClear() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    let t = this.ctx.currentTime;
    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(st);
      osc.stop(st + 0.26);
    });
  }

  // Siren background sound while playing
  startSiren(speedMultiplier = 1) {
    if (this.isMuted || this.sirenInterval) return;
    this.init();
    if (!this.ctx) return;

    const intervalTime = Math.max(160, 320 / speedMultiplier);
    let step = 0;

    this.sirenInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const base = 420;
      const freq = step % 2 === 0 ? base : base + 60;
      step++;

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq - 40, now + (intervalTime / 1000) * 0.9);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.005, now + (intervalTime / 1000) * 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (intervalTime / 1000));
    }, intervalTime);
  }

  stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
  }
}

export const sound = new RetroSoundEngine();
