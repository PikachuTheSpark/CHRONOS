import { SoundscapeType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentSoundscape: SoundscapeType = 'off';
  private masterGain: GainNode | null = null;
  private soundscapeGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.soundscapeGain = this.ctx.createGain();
      this.soundscapeGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.soundscapeGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (!this.ctx || !this.soundscapeGain) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.soundscapeGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
  }

  public stopSoundscape() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // ignore cleanup error
      }
    });
    this.activeNodes = [];
    this.currentSoundscape = 'off';
  }

  public playSoundscape(type: SoundscapeType) {
    this.initContext();
    if (!this.ctx || !this.soundscapeGain) return;

    if (this.currentSoundscape === type) return;
    this.stopSoundscape();

    if (type === 'off') {
      return;
    }

    this.currentSoundscape = type;

    if (type === 'whitenoise') {
      this.startWhiteNoise();
    } else if (type === 'rain') {
      this.startRainSound();
    } else if (type === 'drone') {
      this.startCyberDrone();
    } else if (type === 'binaural') {
      this.startBinauralBeats();
    }
  }

  // Generates smooth pinkish white noise
  private startWhiteNoise() {
    if (!this.ctx || !this.soundscapeGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to warm down the harsh highs
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.soundscapeGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  // Generates synthetic organic rain pattern
  private startRainSound() {
    if (!this.ctx || !this.soundscapeGain) return;
    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = (Math.random() * 2 - 1) * 0.12;
      right[i] = (Math.random() * 2 - 1) * 0.12;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(850, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(3200, this.ctx.currentTime);

    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(this.soundscapeGain);
    noise.start();

    this.activeNodes.push(noise, bandpass, lowpass);
  }

  // Deep resonant analog-style cyber drone
  private startCyberDrone() {
    if (!this.ctx || !this.soundscapeGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(55.35, this.ctx.currentTime); // slight detune for lush warmth
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(27.5, this.ctx.currentTime); // A0 deep sub

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    subOsc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.soundscapeGain);

    osc1.start();
    osc2.start();
    subOsc.start();

    this.activeNodes.push(osc1, osc2, subOsc, filter, oscGain);
  }

  // Stereo Binaural Beats for Flow / Focus (Alpha 10Hz diff)
  private startBinauralBeats() {
    if (!this.ctx || !this.soundscapeGain) return;

    const baseFreq = 180;
    const diff = 10; // 10Hz Alpha flow state

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(baseFreq + diff, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    oscL.connect(merger, 0, 0); // left channel
    oscR.connect(merger, 0, 1); // right channel

    merger.connect(oscGain);
    oscGain.connect(this.soundscapeGain);

    oscL.start();
    oscR.start();

    this.activeNodes.push(oscL, oscR, merger, oscGain);
  }

  // Chime when starting a focus session
  public playStartChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.55);
  }

  // Chime when completing session
  public playCompleteChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + index * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 1.0);
    });
  }

  // Subtle tactile tick when ticking subtasks
  public playTick() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }
}

export const audioEngine = new AudioEngine();
