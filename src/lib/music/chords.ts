/**
 * Just enough music theory for the chord sketch: naming chords, turning them
 * into MIDI notes for playback, and suggesting the diatonic chords of a key.
 * Pure functions, no audio, fully unit tested.
 */

export const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as const;
export type NoteName = (typeof NOTE_NAMES)[number];

/** Alternate spellings users may type or that keys use ("Db major"). */
const ENHARMONIC: Record<string, NoteName> = {
  Db: "C#", "D#": "Eb", Gb: "F#", "G#": "Ab", "A#": "Bb", Cb: "B", "B#": "C", Fb: "E", "E#": "F",
};

export const CHORD_QUALITIES = ["maj", "min", "7", "maj7", "min7", "sus2", "sus4", "dim"] as const;
export type ChordQuality = (typeof CHORD_QUALITIES)[number];

export type Chord = {
  root: NoteName;
  quality: ChordQuality;
  /** Duration in beats at the song's tempo. */
  beats: number;
};

/** Semitone intervals above the root. */
const INTERVALS: Record<ChordQuality, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dim: [0, 3, 6],
};

const SUFFIX: Record<ChordQuality, string> = {
  maj: "",
  min: "m",
  "7": "7",
  maj7: "maj7",
  min7: "m7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
};

export const QUALITY_LABELS: Record<ChordQuality, string> = {
  maj: "Major",
  min: "Minor",
  "7": "Dominant 7",
  maj7: "Major 7",
  min7: "Minor 7",
  sus2: "Sus 2",
  sus4: "Sus 4",
  dim: "Diminished",
};

export function normalizeNote(name: string): NoteName | null {
  const trimmed = name.trim();
  if ((NOTE_NAMES as readonly string[]).includes(trimmed)) return trimmed as NoteName;
  return ENHARMONIC[trimmed] ?? null;
}

/** "G" + "min7" -> "Gm7" */
export function formatChord(chord: Pick<Chord, "root" | "quality">): string {
  return `${chord.root}${SUFFIX[chord.quality]}`;
}

/**
 * MIDI note numbers for a chord in a comfortable piano register. Chords are
 * voiced around middle C (60): root in octave 3 or 4 so that every chord
 * sits in roughly the same range instead of jumping with the root name.
 */
export function chordToMidi(chord: Pick<Chord, "root" | "quality">): number[] {
  const rootIndex = NOTE_NAMES.indexOf(chord.root);
  // Roots from C to F sit in octave 4 (60-65); F# to B drop to octave 3 (54-59).
  const rootMidi = rootIndex <= 5 ? 60 + rootIndex : 48 + rootIndex;
  const notes = INTERVALS[chord.quality].map((interval) => rootMidi + interval);
  // Add the root an octave below for a fuller block-chord sound.
  return [rootMidi - 12, ...notes];
}

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Parses "G major" / "E minor" into a tonic and mode; null for anything else. */
export function parseKey(key: string | null): { tonic: NoteName; mode: "major" | "minor" } | null {
  if (!key) return null;
  const match = /^([A-G][b#]?)\s+(major|minor)$/i.exec(key.trim());
  if (!match) return null;
  const tonic = normalizeNote(match[1][0].toUpperCase() + match[1].slice(1));
  if (!tonic) return null;
  return { tonic, mode: match[2].toLowerCase() as "major" | "minor" };
}

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_QUALITIES: ChordQuality[] = ["maj", "min", "min", "maj", "maj", "min", "dim"];
const MAJOR_NUMERALS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
// Natural minor is the major scale starting from the sixth degree.
const MINOR_ROTATION = 5;

export interface DiatonicChord {
  root: NoteName;
  quality: ChordQuality;
  numeral: string;
}

/** The seven chords that belong to a key, in scale order, for the picker's suggestions. */
export function diatonicChords(key: string | null): DiatonicChord[] {
  const parsed = parseKey(key);
  if (!parsed) return [];
  const tonicIndex = NOTE_NAMES.indexOf(parsed.tonic);
  const rotate = parsed.mode === "minor" ? MINOR_ROTATION : 0;
  return MAJOR_SCALE.map((_, degree) => {
    const scaleDegree = (degree + rotate) % 7;
    const semitonesFromMajorTonic = MAJOR_SCALE[scaleDegree] - MAJOR_SCALE[rotate];
    const root = NOTE_NAMES[(tonicIndex + semitonesFromMajorTonic + 12) % 12];
    return { root, quality: MAJOR_QUALITIES[scaleDegree], numeral: MAJOR_NUMERALS[scaleDegree] };
  });
}

/** Default beats for a new chord: one bar of the song's time signature. */
export function beatsPerBar(timeSignature: string | null): number {
  const match = /^(\d{1,2})\/(\d{1,2})$/.exec(timeSignature ?? "");
  if (!match) return 4;
  const [, top, bottom] = match;
  // Compound meters (6/8, 12/8) feel like beats of a dotted quarter.
  return bottom === "8" && Number(top) % 3 === 0 ? Number(top) / 3 : Number(top);
}
