// Web Audio API Sound Generator for Pip's Midnight Nursery
// Zero external audio files required — reliable, instant, and high quality!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.activeMelodyTimeout = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.activeMelodyTimeout) {
      clearTimeout(this.activeMelodyTimeout);
      this.activeMelodyTimeout = null;
    }
  }

  // Soft UI click pop
  playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Cute magic chime for Easter egg & button reveals
  playChime(pitch = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    baseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const startTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq * pitch, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  // Celestial music box glockenspiel note (soothing bell timbre)
  playMusicBoxNote(freq, duration = 1.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Fundamental oscillator (sine with tiny harmonics)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Overtone for music-box chime metallic warmth
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now); // celestial harmonic

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.05, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    gainNode.gain.setValueAtTime(0.22, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(gainNode);
    osc2.connect(gain2);
    gain2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Play a full generative bedtime melody
  playLullabyMelody(onNoteChange = null) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Pentatonic scale (C major pentatonic / celestial night)
    const pentatonic = [
      { note: 'C5', freq: 523.25 },
      { note: 'D5', freq: 587.33 },
      { note: 'E5', freq: 659.25 },
      { note: 'G5', freq: 783.99 },
      { note: 'A5', freq: 880.00 },
      { note: 'C6', freq: 1046.50 },
      { note: 'D6', freq: 1174.66 },
      { note: 'E6', freq: 1318.51 },
    ];

    // Cozy classic lullaby pattern (Twinkle / Brahms hybrid)
    const melody = [0, 2, 3, 2, 4, 3, 2, 0, 1, 2, 3, 2, 1, 0, 2, 0];
    let step = 0;

    const playNext = () => {
      if (this.isMuted) return;
      if (step >= melody.length) {
        step = 0; // loop gently
      }

      const noteObj = pentatonic[melody[step] % pentatonic.length];
      this.playMusicBoxNote(noteObj.freq, 1.4);
      if (onNoteChange) onNoteChange(noteObj.note);

      step++;
      this.activeMelodyTimeout = setTimeout(playNext, 650);
    };

    playNext();
  }

  stopMelody() {
    if (this.activeMelodyTimeout) {
      clearTimeout(this.activeMelodyTimeout);
      this.activeMelodyTimeout = null;
    }
  }

  // Cute baby rattle shake sound
  playRattle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const startTime = now + i * 0.045;
      osc.type = 'square';
      osc.frequency.setValueAtTime(800 + Math.random() * 600, startTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 800, startTime);
      filter.Q.setValueAtTime(3, startTime);

      gain.gain.setValueAtTime(0.06, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.04);
    }
  }
}

export const sound = new SoundEngine();
