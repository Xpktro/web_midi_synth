class MIDIHandler {
  constructor() {
    navigator
      .requestMIDIAccess()
      .then((access) => this.accessGranted(access))
      .catch(log);
  }

  accessGranted(midiAccess) {
    this.access  = midiAccess;
    this.attack  = document.getElementById('attack').value;
    this.release = document.getElementById('release').value;

    let deviceSelector = document.getElementById('devices');
    this.access.inputs.forEach((entry) => {
      let option       = document.createElement('option');
      option.value     = entry.id;
      option.innerHTML = entry.name;
      deviceSelector.appendChild(option);
    });
  }

  useSynth(synth) {
    this.currentNote = 0;

    let selectedDevice = document.getElementById('devices').value;
    let midiDevice     = this.access.inputs.get(selectedDevice);
    midiDevice.onmidimessage = (midiEvent) => {
      let message = midiEvent.data[0]
      ,     data1 = midiEvent.data[1]
      ,     data2 = midiEvent.data[2];

      switch (message) {
        case 144:
          // data1 = MIDI note | data2 = velocity
          synth.noteOn(data1);
          this.currentNote = data1;
          log('received note ' + data1);
          break;
        case 128:
          // data1 = MIDI note | data2 = aftertouch
          if(this.currentNote === data1) {
            synth.noteOff();
            log('note off');
          }
          break;
        case 176:
          // data1 = CC number | data2 = value
          switch (data1) {
            case 74:
              synth.setAttack(data2);
              break;
            case 71:
              synth.setRelease(data2);
              break;
            case 73:
              synth.setFilterFrequency(data2);
              break;
            case 75:
              synth.setFilterQ(data2);
              break;
            case 72:
              synth.setDelayAmount(data2);
              break;
            case 91:
              synth.setDelayRate(data2);
              break;
            case 93:
              synth.setDelayFeedback(data2);
              break;
            case 10:
              if(data2 < 31) {
                synth.oscillator.type = 'sine';
              } else if(data2 < 62) {
                synth.oscillator.type = 'square';
              } else if(data2 < 93) {
                synth.oscillator.type = 'sawtooth';
              } else {
                synth.oscillator.type = 'triangle';
              }
              log('set oscillator ' + synth.oscillator.type);
          }
          break;
      }
    }
  }
}
