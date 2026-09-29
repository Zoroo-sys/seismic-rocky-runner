export class AudioDirector {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.noiseBuffer = null;
    this.ambientNoiseBuffer = null;

    this.musicRunning = false;
    this.dangerMode = false;
    this.musicStep = 0;
    this.musicTimer = null;
    this.heartbeatTimer = null;

    this.ambientGain = null;
    this.ambientSource = null;
    this.ambientFilter = null;
    this.ambientLfo = null;
  }

  unlock() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this._gain(0.85, this.ctx.destination);
    this.musicBus = this._gain(0.35, this.master);
    this.sfxBus = this._gain(0.9, this.master);
    this.noiseBuffer = this._makeNoise(1.0);
    this.ambientNoiseBuffer = this._makeNoise(4.0);
  }

  startMusic() {
    this.unlock();
    if (this.musicRunning) return;
    this.musicRunning = true;
    this.musicStep = 0;
    this._scheduleMusicStep();
  }

  stopMusic() {
    this.musicRunning = false;
    clearTimeout(this.musicTimer);
  }

  setDanger(active) {
    this.dangerMode = !!active;
    active ? this._startHeartbeat() : this._stopHeartbeat();
    this._duckAmbient(active);
  }

  startAmbient() {
    this.unlock();
    if (this.ambientSource) return;

    this.ambientGain = this._gain(0.0001, this.master);
    this.ambientFilter = this.ctx.createBiquadFilter();
    this.ambientFilter.type = 'bandpass';
    this.ambientFilter.frequency.value = 1100;
    this.ambientFilter.Q.value = 0.6;

    this.ambientSource = this.ctx.createBufferSource();
    this.ambientSource.buffer = this.ambientNoiseBuffer;
    this.ambientSource.loop = true;
    this.ambientSource.connect(this.ambientFilter);
    this.ambientFilter.connect(this.ambientGain);
    this.ambientSource.start();

    this.ambientLfo = this.ctx.createOscillator();
    this.ambientLfo.type = 'sine';
    this.ambientLfo.frequency.value = 0.13;
    const lfoGain = this._gain(450);
    this.ambientLfo.connect(lfoGain);
    lfoGain.connect(this.ambientFilter.frequency);
    this.ambientLfo.start();

    if (!this.dangerMode) {
      this._rampTo(this.ambientGain.gain, 0.05, 1.4);
    }
  }

  stopAmbient() {
    if (!this.ambientSource) return;
    this._rampTo(this.ambientGain.gain, 0.0001, 0.3);
    const source = this.ambientSource;
    const lfo = this.ambientLfo;
    setTimeout(() => {
      try { source.stop(); } catch (e) {}
      try { lfo.stop(); } catch (e) {}
    }, 400);
    this.ambientSource = null;
    this.ambientLfo = null;
  }

  playShieldPickup() {
    for (let i = 0; i < 3; i++) {
      const f = 520 + i * 140;
      this._tone(f, 'sine', 0.24, 0.006, 0.16, 0.3, f, f * 2.1, 0.16, i * 0.05);
    }
  }

  playBoost() {
    this._tone(120, 'saw', 0.6, 0.02, 0.25, 0.4, 120, 900, 0.5);
  }

  playCoin() {
    this._tone(880, 'square', 0.12, 0.002, 0.08, 0.18);
  }

  playImpact() {
    this._tone(140, 'sine', 0.35, 0.002, 0.3, 0.8, 140, 35, 0.28);
    this._noise(0.25, 0.001, 0.2, 0.5);
  }

  playFatal() {
    this.playImpact();
    this._tone(220, 'saw', 1.0, 0.01, 0.9, 0.5, 220, 20, 0.9, 0.05);
  }

  playVictory() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this._tone(f, 'sine', 0.6, 0.01, 0.35, 0.35, null, null, 0, i * 0.16);
    });
  }

  playCheckpoint() {
    [392, 523.25, 659.25].forEach((f, i) => {
      this._tone(f, 'sine', 0.35, 0.006, 0.22, 0.28, null, null, 0, i * 0.09);
    });
  }

  playRecovery() {
    [440, 587.33, 698.46, 880].forEach((f, i) => {
      this._tone(f, 'sine', 0.4, 0.005, 0.26, 0.3, null, null, 0, i * 0.1);
    });
  }

  playDodge() {
    this._tone(500, 'sine', 0.12, 0.001, 0.08, 0.12, 500, 220, 0.1);
  }

  // ---- internals ----

  _gain(value, destination) {
    const g = this.ctx.createGain();
    g.gain.value = value;
    if (destination) g.connect(destination);
    return g;
  }

  _makeNoise(seconds) {
    const length = Math.floor(this.ctx.sampleRate * seconds);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  _envelope(gainNode, t0, attack, hold, release, peak) {
    gainNode.gain.cancelScheduledValues(t0);
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gainNode.gain.setValueAtTime(peak, t0 + attack + hold);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release);
  }

  _tone(freq, type, duration, attack, hold, release, peak, glideStart, glideEnd, delay = 0) {
    this.unlock();
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(this.sfxBus);
    this._envelope(gain, t, attack, hold, release, peak ?? 0.3);
    if (glideStart != null && glideEnd != null) {
      osc.frequency.setValueAtTime(glideStart, t);
      osc.frequency.exponentialRampToValueAtTime(glideEnd, t + attack + hold);
    }
    osc.start(t);
    osc.stop(t + attack + hold + release + 0.1);
  }

  _noise(duration, attack, hold, peak) {
    this.unlock();
    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    const gain = this.ctx.createGain();
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxBus);
    this._envelope(gain, t, attack, hold, 0.2, peak);
    source.start(t);
    source.stop(t + duration);
  }

  _scheduleMusicStep() {
    if (!this.musicRunning) return;
    const t = this.ctx.currentTime;
    const bpm = this.dangerMode ? 172 : 128;
    const stepDuration = 60 / bpm / 2;

    if (this.musicStep % 2 === 0) {
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sawtooth';
      bass.frequency.value = this.dangerMode ? 55 : 48;
      bass.connect(bassGain);
      bassGain.connect(this.musicBus);
      this._envelope(bassGain, t, 0.005, 0.03, this.dangerMode ? 0.09 : 0.16, this.dangerMode ? 0.55 : 0.4);
      bass.start(t);
      bass.stop(t + 0.3);
    }

    const hat = this.ctx.createBufferSource();
    hat.buffer = this.noiseBuffer;
    const hatFilter = this.ctx.createBiquadFilter();
    hatFilter.type = 'highpass';
    hatFilter.frequency.value = 6000;
    const hatGain = this.ctx.createGain();
    hat.connect(hatFilter);
    hatFilter.connect(hatGain);
    hatGain.connect(this.musicBus);
    this._envelope(hatGain, t, 0.001, 0.002, 0.03, this.musicStep % 2 === 0 ? 0.12 : 0.2);
    hat.start(t);
    hat.stop(t + 0.05);

    const scale = this.dangerMode ? [220, 262, 294, 330, 392] : [196, 220, 262, 294];
    if (this.musicStep % (this.dangerMode ? 1 : 2) === 0) {
      const note = scale[Math.floor(Math.random() * scale.length)];
      const arp = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();
      arp.type = 'square';
      arp.frequency.value = note;
      const arpFilter = this.ctx.createBiquadFilter();
      arpFilter.type = 'lowpass';
      arpFilter.frequency.value = this.dangerMode ? 2200 : 1400;
      arp.connect(arpFilter);
      arpFilter.connect(arpGain);
      arpGain.connect(this.musicBus);
      this._envelope(arpGain, t, 0.004, 0.02, 0.09, 0.12);
      arp.start(t);
      arp.stop(t + 0.2);
    }

    this.musicStep++;
    this.musicTimer = setTimeout(() => this._scheduleMusicStep(), stepDuration * 1000);
  }

  _heartbeatOnce() {
    const t = this.ctx.currentTime;
    [0, 0.14].forEach((delay, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 0 ? 70 : 56, t + delay);
      osc.frequency.exponentialRampToValueAtTime(30, t + delay + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      this._envelope(gain, t + delay, 0.005, 0.02, 0.15, i === 0 ? 0.5 : 0.35);
      osc.start(t + delay);
      osc.stop(t + delay + 0.25);
    });
  }

  _startHeartbeat() {
    this.unlock();
    if (this.heartbeatTimer) return;
    this._heartbeatOnce();
    this.heartbeatTimer = setInterval(() => this._heartbeatOnce(), 620);
  }

  _stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  _rampTo(param, value, duration) {
    param.cancelScheduledValues(this.ctx.currentTime);
    param.linearRampToValueAtTime(value, this.ctx.currentTime + duration);
  }

  _duckAmbient(active) {
    if (!this.ambientGain) return;
    const t = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(t);
    this.ambientGain.gain.linearRampToValueAtTime(active ? 0.0001 : 0.05, t + (active ? 0.12 : 0.9));
  }
}
