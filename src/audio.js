// =========================================================
// PAC-MAN DELUXE - OPTIMIZED PROCEDURAL 8-BIT AUDIO SYNTH
// =========================================================

class RetroSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.volume = 0.25;
    this.wakaAlt = false;
    this.lastWakaTime = 0;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenActive = false;
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
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.isMuted) {
      this.stopSiren();
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // Waka Waka dot eating chirp - strictly throttled to prevent audio stack congestion
  playWaka() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastWakaTime < 0.12) return; // Smooth 120ms rate limit
    this.lastWakaTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startFreq = this.wakaAlt ? 460 : 340;
      const endFreq = this.wakaAlt ? 300 : 500;
      this.wakaAlt = !this.wakaAlt;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.07);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch (e) {}
  }

  playPowerPellet() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(540, now + 0.12);
      osc.frequency.linearRampToValueAtTime(240, now + 0.24);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playEatGhost() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.05);
      osc.frequency.setValueAtTime(880, now + 0.10);
      osc.frequency.setValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playEatFruit() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = now + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, st);

        gain.gain.setValueAtTime(0.25, st);
        gain.gain.exponentialRampToValueAtTime(0.01, st + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(st);
        osc.stop(st + 0.11);
      });
    } catch (e) {}
  }

  playDeath() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const freqs = [750, 680, 620, 560, 500, 440, 380, 320, 260, 200, 140];
      freqs.forEach((f, i) => {
        osc.frequency.setValueAtTime(f, now + i * 0.06);
      });

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.82);
    } catch (e) {}
  }

  playGameStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 493.88, d: 0.1 },
        { f: 987.77, d: 0.1 },
        { f: 739.99, d: 0.1 },
        { f: 622.25, d: 0.1 },
        { f: 987.77, d: 0.08 },
        { f: 739.99, d: 0.14 },
        { f: 622.25, d: 0.18 },
      ];

      let t = this.ctx.currentTime + 0.02;
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + n.d);
        t += n.d;
      });
    } catch (e) {}
  }

  playLevelClear() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      let t = this.ctx.currentTime;
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = t + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, st);

        gain.gain.setValueAtTime(0.25, st);
        gain.gain.exponentialRampToValueAtTime(0.01, st + 0.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(st);
        osc.stop(st + 0.22);
      });
    } catch (e) {}
  }

  // Lightweight continuous siren without interval timer overhead
  startSiren() {
    if (this.isMuted || this.sirenActive) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sine';
      this.sirenOsc.frequency.setValueAtTime(380, now);

      // Simple low frequency modulation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(3, now); // 3 Hz modulation
      lfoGain.gain.setValueAtTime(60, now); // +/- 60 Hz pitch sweep
      lfo.connect(this.sirenOsc.frequency);
      lfo.start(now);
      this.sirenLfo = lfo;

      this.sirenGain.gain.setValueAtTime(0.04, now);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.masterGain);

      this.sirenOsc.start(now);
      this.sirenActive = true;
    } catch (e) {}
  }

  stopSiren() {
    if (!this.sirenActive) return;
    try {
      if (this.sirenOsc) {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
        this.sirenOsc = null;
      }
      if (this.sirenLfo) {
        this.sirenLfo.stop();
        this.sirenLfo.disconnect();
        this.sirenLfo = null;
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
        this.sirenGain = null;
      }
    } catch (e) {}
    this.sirenActive = false;
  }
}

export const sound = new RetroSoundEngine();
