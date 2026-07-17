import { useAudioStore } from '../stores/audio-store';

class AudioService {
  private ctx: AudioContext | null = null;
  private currentAmbience: OscillatorNode | null = null;
  private ambienceGain: GainNode | null = null;

  private initCtx() {
    if (this.ctx) return this.ctx;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    this.ctx = new AudioContextClass();
    return this.ctx;
  }

  private getEffectiveVolume(type: 'ui' | 'writing' | 'ambience'): number {
    const store = useAudioStore.getState();
    if (store.masterMute) return 0;
    if (type === 'ui') return store.uiVolume;
    if (type === 'writing') return store.writingVolume;
    if (type === 'ambience') return store.ambienceVolume;
    return 1;
  }

  // Safe wrapper to resume AudioContext on interaction
  private async getActiveCtx(): Promise<AudioContext | null> {
    const context = this.initCtx();
    if (!context) return null;
    if (context.state === 'suspended') {
      try {
        await context.resume();
      } catch (e) {
        return null;
      }
    }
    return context;
  }

  /**
   * Play a low leather-and-paper thud + friction sweep for Book Open
   */
  async playBookOpen() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // 1. Friction sweep (noise)
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(150, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(320, now + 0.35);
    noiseFilter.Q.setValueAtTime(1.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04 * volume, now);
    noiseGain.gain.linearRampToValueAtTime(0.001, now + 0.38);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);

    // 2. Leather/wood low thump
    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(95, now);
    thump.frequency.linearRampToValueAtTime(55, now + 0.25);

    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.4 * volume, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    thump.connect(thumpGain);
    thumpGain.connect(dest);
    thump.start(now);
    thump.stop(now + 0.35);
  }

  /**
   * Play a deep solid thump/thud for Book Close
   */
  async playBookClose() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // A low solid thump (110Hz down to 40Hz)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.52 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    // Slight leather rub highpass crackle
    const frictionBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = frictionBuffer.getChannelData(0);
    for (let i = 0; i < frictionBuffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }
    const frictionSource = ctx.createBufferSource();
    frictionSource.buffer = frictionBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);

    const frictionGain = ctx.createGain();
    frictionGain.gain.setValueAtTime(0.12 * volume, now);
    frictionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gainNode);
    gainNode.connect(dest);

    frictionSource.connect(filter);
    filter.connect(frictionGain);
    frictionGain.connect(dest);

    osc.start(now);
    frictionSource.start(now);

    osc.stop(now + 0.25);
  }

  /**
   * Play a clean, single paper page-flip fwoosh sound
   */
  async playPageFlip() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    const duration = 0.42;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Noise modulated to emulate paper bending
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI); // humped shape
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter starts at 500Hz, sweeps to 1600Hz and down to 350Hz (bending paper fwoosh)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1450, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);
    filter.Q.setValueAtTime(2.2, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.09 * volume, now);
    gainNode.gain.linearRampToValueAtTime(0.14 * volume, now + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    noise.start(now);
  }

  /**
   * Play scratchy fiber friction sound for fountain pen
   */
  async playPenScratch(duration = 0.08, frequency = 1250) {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('writing');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, now);
    filter.Q.setValueAtTime(3.0, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.016 * volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    noiseNode.start(now);
  }

  /**
   * Play metal pen tip release + soft paper settle thump
   */
  async playPenFinish() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('writing');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // 1. Crisp metallic pen click/release
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2800, now);
    
    const metalGain = ctx.createGain();
    metalGain.gain.setValueAtTime(0.018 * volume, now);
    metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(metalGain);
    metalGain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.05);

    // 2. Soft paper settle rumble
    const settleBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.22, ctx.sampleRate);
    const settleData = settleBuffer.getChannelData(0);
    for (let i = 0; i < settleBuffer.length; i++) {
      settleData[i] = Math.random() * 2 - 1;
    }

    const settleNode = ctx.createBufferSource();
    settleNode.buffer = settleBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);

    const settleGain = ctx.createGain();
    settleGain.gain.setValueAtTime(0.08 * volume, now);
    settleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    settleNode.connect(filter);
    filter.connect(settleGain);
    settleGain.connect(dest);
    settleNode.start(now);
  }

  /**
   * Play sticky-note flutter (fall) + soft slap (land)
   */
  async playStickyFall() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // 1. Fluttering falling sound
    const flutterDuration = 0.5;
    const flutterBuffer = ctx.createBuffer(1, ctx.sampleRate * flutterDuration, ctx.sampleRate);
    const data = flutterBuffer.getChannelData(0);
    for (let i = 0; i < flutterBuffer.length; i++) {
      const t = i / flutterBuffer.length;
      // Synthesize periodic amplitude modulation for flutter effect
      const mod = Math.sin(t * Math.PI * 15) * 0.5 + 0.5;
      data[i] = (Math.random() * 2 - 1) * mod * (1 - t);
    }

    const flutterNode = ctx.createBufferSource();
    flutterNode.buffer = flutterBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + flutterDuration);

    const flutterGain = ctx.createGain();
    flutterGain.gain.setValueAtTime(0.06 * volume, now);
    flutterGain.gain.exponentialRampToValueAtTime(0.001, now + flutterDuration);

    flutterNode.connect(filter);
    filter.connect(flutterGain);
    flutterGain.connect(dest);
    flutterNode.start(now);

    // 2. Soft slap on contact (delayed by 0.45s)
    const landTime = now + 0.45;
    const slap = ctx.createOscillator();
    slap.type = 'sine';
    slap.frequency.setValueAtTime(180, landTime);
    slap.frequency.linearRampToValueAtTime(90, landTime + 0.08);

    const slapGain = ctx.createGain();
    slapGain.gain.setValueAtTime(0.24 * volume, landTime);
    slapGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.1);

    slap.connect(slapGain);
    slapGain.connect(dest);
    slap.start(landTime);
    slap.stop(landTime + 0.12);
  }

  /**
   * Play soft silk/satin slide for ribbon bookmark placement
   */
  async playRibbonSlide() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    const duration = 0.38;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start(now);
  }

  /**
   * Play heavy wax crackle + seal press stamp sound
   */
  async playWaxStamp() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // 1. Hot wax sizzle/crackle (random short impulses)
    const duration = 0.55;
    const crackleBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = crackleBuffer.getChannelData(0);
    for (let i = 0; i < crackleBuffer.length; i++) {
      // Periodic snap sparks
      if (Math.random() > 0.992) {
        data[i] = Math.random() * 2 - 1;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.02;
      }
    }
    const crackleNode = ctx.createBufferSource();
    crackleNode.buffer = crackleBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.08 * volume, now);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    crackleNode.connect(filter);
    filter.connect(crackleGain);
    crackleGain.connect(dest);
    crackleNode.start(now);

    // 2. Heavy press compression thud (0.1s delayed)
    const stampTime = now + 0.08;
    const stamp = ctx.createOscillator();
    stamp.type = 'sine';
    stamp.frequency.setValueAtTime(140, stampTime);
    stamp.frequency.linearRampToValueAtTime(60, stampTime + 0.18);

    const stampGain = ctx.createGain();
    stampGain.gain.setValueAtTime(0.35 * volume, stampTime);
    stampGain.gain.exponentialRampToValueAtTime(0.001, stampTime + 0.22);

    stamp.connect(stampGain);
    stampGain.connect(dest);
    stamp.start(stampTime);
    stamp.stop(stampTime + 0.24);
  }

  /**
   * Play multi-page rustle/shuffle sound for catalog/archive searches
   */
  async playPaperShuffle() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // Trigger 3 short overlapping page scrapes
    for (let i = 0; i < 3; i++) {
      const triggerTime = now + i * 0.12;
      const scrapeDuration = 0.18;
      
      const buffer = ctx.createBuffer(1, ctx.sampleRate * scrapeDuration, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < buffer.length; j++) {
        const envelope = Math.sin((j / buffer.length) * Math.PI);
        data[j] = (Math.random() * 2 - 1) * envelope * 0.5;
      }

      const node = ctx.createBufferSource();
      node.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500 + i * 150, triggerTime);
      filter.Q.setValueAtTime(2.0, triggerTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06 * volume, triggerTime);
      gain.gain.exponentialRampToValueAtTime(0.001, triggerTime + scrapeDuration);

      node.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      node.start(triggerTime);
    }
  }

  /**
   * Play heavy wooden chest / leather journal lock release sound for settings
   */
  async playJournalOpen() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ui');
    if (volume <= 0) return;

    const now = ctx.currentTime;
    const dest = ctx.destination;

    // 1. Squeaky wood creak
    const creakDuration = 0.5;
    const creakBuffer = ctx.createBuffer(1, ctx.sampleRate * creakDuration, ctx.sampleRate);
    const data = creakBuffer.getChannelData(0);
    for (let i = 0; i < creakBuffer.length; i++) {
      const t = i / creakBuffer.length;
      // Vibrato frequency to make a wood creak
      const vib = Math.sin(t * Math.PI * 45);
      data[i] = (Math.random() * 2 - 1) * 0.05 * (1 + vib);
    }
    const creakNode = ctx.createBufferSource();
    creakNode.buffer = creakBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, now);
    filter.frequency.linearRampToValueAtTime(450, now + creakDuration);

    const creakGain = ctx.createGain();
    creakGain.gain.setValueAtTime(0.04 * volume, now);
    creakGain.gain.exponentialRampToValueAtTime(0.001, now + creakDuration);

    creakNode.connect(filter);
    filter.connect(creakGain);
    creakGain.connect(dest);
    creakNode.start(now);

    // 2. Heavy latch mechanical pop
    const pop = ctx.createOscillator();
    pop.type = 'triangle';
    pop.frequency.setValueAtTime(250, now);
    pop.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    const popGain = ctx.createGain();
    popGain.gain.setValueAtTime(0.18 * volume, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    pop.connect(popGain);
    popGain.connect(dest);
    pop.start(now);
    pop.stop(now + 0.15);
  }

  /**
   * Set up/Start the low warm hum of the fireplace/archives background
   */
  async startAmbience() {
    const ctx = await this.getActiveCtx();
    if (!ctx) return;
    const volume = this.getEffectiveVolume('ambience');

    if (this.currentAmbience) {
      if (this.ambienceGain) {
        this.ambienceGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      }
      return;
    }

    const now = ctx.currentTime;
    
    // Low atmospheric resonant hum (55Hz and 110Hz warm drones)
    this.currentAmbience = ctx.createOscillator();
    this.currentAmbience.type = 'triangle';
    this.currentAmbience.frequency.setValueAtTime(55, now);

    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(0.001, now);
    this.ambienceGain.gain.linearRampToValueAtTime(volume * 0.15, now + 1.5); // Smooth fade in

    this.currentAmbience.connect(this.ambienceGain);
    this.ambienceGain.connect(ctx.destination);
    
    this.currentAmbience.start(now);
  }

  /**
   * Update current ambience volume immediately
   */
  updateAmbienceVolume() {
    if (!this.ctx || !this.ambienceGain) return;
    const volume = this.getEffectiveVolume('ambience');
    this.ambienceGain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
  }

  /**
   * Stop background ambient drone sound gracefully
   */
  stopAmbience() {
    if (!this.ctx || !this.currentAmbience || !this.ambienceGain) return;
    const now = this.ctx.currentTime;
    try {
      this.ambienceGain.gain.setValueAtTime(this.ambienceGain.gain.value, now);
      this.ambienceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      const osc = this.currentAmbience;
      setTimeout(() => {
        try {
          osc.stop();
        } catch(e){}
      }, 900);
    } catch(e) {}
    
    this.currentAmbience = null;
    this.ambienceGain = null;
  }
}

export const audioService = new AudioService();
export default audioService;
