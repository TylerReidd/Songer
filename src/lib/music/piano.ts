/**
 * A small piano-ish synthesizer on the Web Audio API. No samples, no
 * dependencies: each note is a few detuned oscillators through a low-pass
 * filter with a percussive envelope, mixed into a touch of synthetic reverb.
 * Runs only in the browser and only after a user gesture (browser rule).
 */

import { midiToFrequency } from "./chords";

let context: AudioContext | null = null;
let master: GainNode | null = null;

/** Lazily creates the audio graph. Call from a click handler the first time. */
export function getAudio(): { context: AudioContext; master: GainNode } {
  if (!context || !master) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0.5;

    // Dry path plus a short, soft reverb tail so chords don't sound sterile.
    const reverb = context.createConvolver();
    reverb.buffer = impulseResponse(context, 1.6);
    const wet = context.createGain();
    wet.gain.value = 0.22;
    master.connect(context.destination);
    master.connect(reverb);
    reverb.connect(wet);
    wet.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume();
  return { context, master };
}

/** Exponentially decaying noise: a cheap but convincing room. */
function impulseResponse(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    }
  }
  return buffer;
}

/**
 * Plays one note. `when` is in AudioContext time so callers can schedule
 * ahead precisely. Returns nothing; the nodes free themselves when done.
 */
export function playNote(midi: number, when: number, duration: number, velocity = 0.8): void {
  const { context, master } = getAudio();
  const frequency = midiToFrequency(midi);
  const release = 0.35;
  const end = when + duration;

  // Filter opens with the attack and closes as the note decays, like a hammer strike.
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(frequency * 6, 9000), when);
  filter.frequency.exponentialRampToValueAtTime(Math.max(frequency * 1.5, 300), when + 1.2);
  filter.Q.value = 0.7;

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0, when);
  envelope.gain.linearRampToValueAtTime(velocity, when + 0.012);
  envelope.gain.exponentialRampToValueAtTime(velocity * 0.45, when + 0.5);
  envelope.gain.setTargetAtTime(velocity * 0.25, when + 0.5, 1.2);
  envelope.gain.setTargetAtTime(0.0001, end, release / 4);

  filter.connect(envelope);
  envelope.connect(master);

  // Three layers: a fundamental, a slightly bright partial, and a soft detuned copy.
  const layers: Array<{ type: OscillatorType; detune: number; gain: number }> = [
    { type: "triangle", detune: 0, gain: 0.6 },
    { type: "sine", detune: 3, gain: 0.35 },
    { type: "sawtooth", detune: -4, gain: 0.08 },
  ];
  for (const layer of layers) {
    const osc = context.createOscillator();
    osc.type = layer.type;
    osc.frequency.value = frequency;
    osc.detune.value = layer.detune;
    const gain = context.createGain();
    gain.gain.value = layer.gain;
    osc.connect(gain);
    gain.connect(filter);
    osc.start(when);
    osc.stop(end + release);
  }
}

/** Block chord: all notes together with a few milliseconds of spread for a human feel. */
export function playChordNotes(midiNotes: number[], when: number, duration: number): void {
  midiNotes.forEach((midi, index) => {
    const isBass = index === 0;
    playNote(midi, when + index * 0.008, duration, isBass ? 0.55 : 0.7);
  });
}
