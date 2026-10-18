// Web Audio API Sound Generator for Pip's Midnight Nursery
// Zero external audio files required — reliable, instant, and high quality!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.activeMelodyTimeout = null;
    this.hasInteracted = false;

    if (typeof window !== 'undefined') {
      const handleUserGesture = () => {
        this.hasInteracted = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('pointerdown', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('keydown', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('touchstart', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('click', handleUserGesture, { capture: true, passive: true });
    }
  }

  init() {
    if (!this.hasInteracted) {
      return false;
    }
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx;
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

  // =====================================================================
  // BABY VOICE SOUNDS — Cute kid/baby voice synthesis using Web Audio API
  // =====================================================================

  // "Hiii! Click meeee!" baby giggle + rising squeal sound
  // Plays automatically on first page load at the IntroGate
  playBabyWelcome() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Baby "ooh!" rising squeal — high-pitched sine with vibrato
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();

    // Vibrato LFO (baby's wobbly pitch)
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(5.5, now);
    vibratoGain.gain.setValueAtTime(18, now);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    // Main "Hiiii" rising squeal pitch
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.18);  // "hiiii" rising
    osc.frequency.setValueAtTime(680, now + 0.22);            // settle
    osc.frequency.linearRampToValueAtTime(960, now + 0.44);  // "eee!" squeal

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.setValueAtTime(0.22, now + 0.38);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    vibrato.start(now);
    osc.stop(now + 0.7);
    vibrato.stop(now + 0.7);

    // Add a cute trailing giggle bubble sequence
    const giggleNotes = [880, 780, 920, 860, 760];
    giggleNotes.forEach((freq, i) => {
      const g = this.ctx.createOscillator();
      const gGain = this.ctx.createGain();
      g.type = 'sine';
      const t = now + 0.55 + i * 0.07;
      g.frequency.setValueAtTime(freq, t);
      gGain.gain.setValueAtTime(0.1, t);
      gGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      g.connect(gGain);
      gGain.connect(this.ctx.destination);
      g.start(t);
      g.stop(t + 0.07);
    });
  }

  // "Wanna know more? Click me!" — baby excited bouncy voice
  playBabyClickMe() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Excited staccato "clicks" in baby pitch pattern
    // Mimics: "Click! Me! Hee hee!"
    const pattern = [
      { freq: 720, t: 0,    dur: 0.08 },  // "Click"
      { freq: 840, t: 0.10, dur: 0.06 },  // "Me"
      { freq: 620, t: 0.18, dur: 0.04 },  // pause breath
      { freq: 920, t: 0.24, dur: 0.07 },  // "Hee"
      { freq: 860, t: 0.33, dur: 0.07 },  // "Hee!"
      { freq: 980, t: 0.43, dur: 0.09 },  // rising squeal
    ];

    pattern.forEach(({ freq, t, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const vibLFO = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();

      vibLFO.type = 'sine';
      vibLFO.frequency.setValueAtTime(7, now + t);
      vibGain.gain.setValueAtTime(14, now + t);
      vibLFO.connect(vibGain);
      vibGain.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + t);

      gain.gain.setValueAtTime(0.0, now + t);
      gain.gain.linearRampToValueAtTime(0.18, now + t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + t);
      vibLFO.start(now + t);
      osc.stop(now + t + dur + 0.02);
      vibLFO.stop(now + t + dur + 0.02);
    });
  }

  // Baby giggle burst — played when Pip is clicked
  playBabyGiggle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Fast staccato rising burst: "hehehe!"
    const giggle = [800, 860, 820, 900, 860, 940, 1000, 960];
    giggle.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const t = now + i * 0.065;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.08, t + 0.055);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    });

    // Tail squeal
    const tail = this.ctx.createOscillator();
    const tailGain = this.ctx.createGain();
    tail.type = 'sine';
    const ts = now + 0.56;
    tail.frequency.setValueAtTime(900, ts);
    tail.frequency.exponentialRampToValueAtTime(1200, ts + 0.25);
    tailGain.gain.setValueAtTime(0.12, ts);
    tailGain.gain.exponentialRampToValueAtTime(0.001, ts + 0.28);
    tail.connect(tailGain);
    tailGain.connect(this.ctx.destination);
    tail.start(ts);
    tail.stop(ts + 0.3);
  }

  // Baby "Ooh!" surprised sound — for easter egg reveal
  playBabySurprise() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // "Ooooh!" with wide vibrato
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vib = this.ctx.createOscillator();
    const vibG = this.ctx.createGain();

    vib.type = 'sine';
    vib.frequency.setValueAtTime(6, now);
    vibG.gain.setValueAtTime(22, now);
    vib.connect(vibG);
    vibG.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.linearRampToValueAtTime(640, now + 0.2);
    osc.frequency.setValueAtTime(580, now + 0.3);
    osc.frequency.linearRampToValueAtTime(760, now + 0.55);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.06);
    gain.gain.setValueAtTime(0.2, now + 0.48);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    vib.start(now);
    osc.stop(now + 0.75);
    vib.stop(now + 0.75);

    // Rising stardust tail
    this.playChime(1.6);
  }

  // Cute magic chime for Easter egg & button reveals
  playChime(pitch = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5];

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

  // Celestial music box glockenspiel note
  playMusicBoxNote(freq, duration = 1.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

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

    const melody = [0, 2, 3, 2, 4, 3, 2, 0, 1, 2, 3, 2, 1, 0, 2, 0];
    let step = 0;

    const playNext = () => {
      if (this.isMuted) return;
      if (step >= melody.length) step = 0;

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

  // Cute baby rattle shake
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
