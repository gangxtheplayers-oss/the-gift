// Pure Web Audio API Synthesizer - 100% sustainable, no external MP3 dependencies

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentMode: 'musicbox' | 'lofi' | 'rain' | 'off' = 'off';
  private timer: number | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.5;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getMode(): 'musicbox' | 'lofi' | 'rain' | 'off' {
    return this.currentMode;
  }

  // Play a single sweet music-box note
  public playTine(freq: number, timeOffset = 0, duration = 2.2) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime + timeOffset;

    // Dual oscillator for rich music box harmonics
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.002, t); // Slight detune for shimmer

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Romantic music box melody generator
  private startMusicBoxLoop() {
    // Beautiful romantic melody in E Major / C# minor (frequencies in Hz)
    const melody = [
      { f: 659.25, d: 0.6 }, // E5
      { f: 739.99, d: 0.6 }, // F#5
      { f: 830.61, d: 1.2 }, // G#5
      { f: 659.25, d: 0.6 }, // E5
      { f: 987.77, d: 1.2 }, // B5
      { f: 830.61, d: 1.2 }, // G#5
      { f: 739.99, d: 0.6 }, // F#5
      { f: 659.25, d: 1.2 }, // E5
      { f: 554.37, d: 0.6 }, // C#5
      { f: 659.25, d: 1.2 }, // E5
      { f: 493.88, d: 1.2 }, // B4
      { f: 554.37, d: 0.6 }, // C#5
      { f: 659.25, d: 1.8 }, // E5
    ];

    let step = 0;
    const playNext = () => {
      if (!this.isPlaying || this.currentMode !== 'musicbox') return;

      const note = melody[step % melody.length];
      this.playTine(note.f, 0, 2.5);

      // Add gentle bass accompaniment every 2 notes
      if (step % 2 === 0) {
        const bassFreq = note.f / 2;
        this.playTine(bassFreq, 0.05, 3.0);
      }

      step++;
      const nextDelay = note.d * 800; // Tempo
      this.timer = window.setTimeout(playNext, nextDelay);
    };

    playNext();
  }

  // Soft romantic lofi chords
  private startLofiLoop() {
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!this.isPlaying || this.currentMode !== 'lofi') return;
      this.init();
      if (this.ctx && this.masterGain) {
        const notes = chords[chordIdx % chords.length];
        notes.forEach((freq, i) => {
          this.playTine(freq * 1.5, i * 0.08, 4.0);
        });
      }
      chordIdx++;
      this.timer = window.setTimeout(playChord, 3800);
    };

    playChord();
  }

  // Ambient rain & warmth
  private rainNode: AudioNode | null = null;
  private startRain() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  public setMode(mode: 'musicbox' | 'lofi' | 'rain' | 'off') {
    this.stop();
    this.currentMode = 'off';
    this.isPlaying = false;
  }

  public stop() {
    this.isPlaying = false;
    this.currentMode = 'off';
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.rainNode) {
      try {
        (this.rainNode as AudioBufferSourceNode).stop();
      } catch {
        // Safe catch
      }
      this.rainNode = null;
    }
  }

  // Sound effects
  public playChime() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [1046.5, 1318.51, 1567.98, 2093.0].forEach((freq, idx) => {
      this.playTine(freq, idx * 0.07, 1.8);
    });
  }

  public playUnwrapCelebration() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    // Harp-like rising arpeggio
    const harpNotes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98];
    harpNotes.forEach((f, i) => {
      this.playTine(f, i * 0.08, 2.2);
    });
  }

  public playHeartbeat() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playHeart() {
    this.playHeartbeat();
  }

  // Fortnite Chug Jug Slurp & Shield Recharge Sound
  public playShieldChug() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Ascending bubbly slurp tones
    [220, 277.18, 329.63, 440, 554.37, 659.25, 880].forEach((freq, idx) => {
      this.playTine(freq, idx * 0.09, 1.4);
    });
  }

  // Comical "HE IS ONE!" alarm alert
  public playAlarmOneShot() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [880, 1174.66, 880, 1174.66, 1760].forEach((freq, idx) => {
      this.playTine(freq, idx * 0.08, 0.4);
    });
  }

  // Romantic wax seal stamp thud & shimmer
  public playWaxStamp() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.playHeartbeat();
    setTimeout(() => {
      this.playTine(1318.51, 0, 2.0);
      this.playTine(1567.98, 0.08, 2.0);
    }, 80);
  }
}

export const soundEngine = new SoundEngine();
