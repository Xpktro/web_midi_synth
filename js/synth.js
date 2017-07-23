class Synth {
  start() {
    log('starting synth...');
    this.context = getAudioContext();
    this.createOscillator();
    this.createAR();
    this.createFilter();
    this.createDelay();
    this.connectNodes();
  }

  createOscillator() {
    this.oscillator                 = this.context.createOscillator();
    this.oscillator.frequency.value = 440;

    let oscillatorElement      = document.getElementById('oscillator');
    this.oscillator.type       = oscillatorElement.value;
    oscillatorElement.onchange = () => {
      this.oscillator.type = oscillatorElement.value;
    }

    this.oscillator.start();
  }

  createAR() {
    this.cca            = this.context.createGain();
    this.cca.gain.value = 0;
    this.attack         = 0;
    this.release        = 0;
  }

  createFilter() {
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 12000;
    this.filter.Q.value = 0;
  }

  createDelay() {
    this.delay = this.context.createDelay(5);
    this.delay.delayTime.value = 0;

    this.feedbackGain = this.context.createGain();
    this.feedbackGain.gain.value = 0;

    this.delayGain = this.context.createGain();
    this.delayGain.gain.value = 0;
  }

  connectNodes() {
    this.oscillator.connect(this.cca);
    this.cca.connect(this.filter);
    this.filter.connect(this.context.destination);

    this.filter.connect(this.delay);
    this.delay.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.context.destination);
  }

  noteOn(midiNote) {
    let now = this.context.currentTime;

    this.cca.gain.cancelScheduledValues(0);
    this.cca.gain.linearRampToValueAtTime(1, now + this.attack);

    // https://en.wikipedia.org/wiki/MIDI_tuning_standard#Frequency_values
    let frequency = Math.pow(2, (midiNote - 69) / 12) * 440;
    this.oscillator.frequency.setValueAtTime(frequency, now);
  }

  noteOff() {
    let now = this.context.currentTime;
    this.cca.gain.cancelScheduledValues(0);
    this.cca.gain.setValueAtTime(this.cca.gain.value, now);
    this.cca.gain.linearRampToValueAtTime(0, now + this.release);
  }

  setAttack(value) {
    this.attack = (value / 127) * 2;
  }

  setRelease(value) {
    this.release = (value / 127) * 2;
  }

  setFilterFrequency(value) {
    this.filter.frequency.value = (value / 127) * 12000;
  }

  setFilterQ(value) {
    this.filter.Q.value = (value / 127) * 5;
  }

  setDelayAmount(value) {
    this.delayGain.gain.value = value / 127;
  }

  setDelayRate(value) {
    this.delay.delayTime.value = (value / 127) * 1.5;
  }

  setDelayFeedback(value) {
    this.feedbackGain.gain.value = (value / 127) * 0.8;
  }

  stop() {
    this.context.close();
  }
}
