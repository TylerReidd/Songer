import { describe, expect, it } from "vitest";
import { beatsPerBar, chordToMidi, diatonicChords, formatChord, midiToFrequency, normalizeNote, parseKey } from "./chords";

describe("formatChord", () => {
  it("uses conventional suffixes", () => {
    expect(formatChord({ root: "G", quality: "maj" })).toBe("G");
    expect(formatChord({ root: "E", quality: "min" })).toBe("Em");
    expect(formatChord({ root: "D", quality: "7" })).toBe("D7");
    expect(formatChord({ root: "C", quality: "maj7" })).toBe("Cmaj7");
    expect(formatChord({ root: "A", quality: "min7" })).toBe("Am7");
    expect(formatChord({ root: "F#", quality: "dim" })).toBe("F#dim");
  });
});

describe("chordToMidi", () => {
  it("voices a C major triad around middle C with a bass root", () => {
    expect(chordToMidi({ root: "C", quality: "maj" })).toEqual([48, 60, 64, 67]);
  });
  it("keeps high roots in a similar register by dropping an octave", () => {
    const g = chordToMidi({ root: "G", quality: "maj" });
    expect(g).toEqual([43, 55, 59, 62]);
    expect(Math.max(...g)).toBeLessThan(72);
  });
  it("builds four-note chords for sevenths", () => {
    expect(chordToMidi({ root: "A", quality: "min7" })).toEqual([45, 57, 60, 64, 67]);
  });
});

describe("midiToFrequency", () => {
  it("tunes A4 to 440 Hz and octaves double", () => {
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(81)).toBeCloseTo(880);
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 1);
  });
});

describe("parseKey and normalizeNote", () => {
  it("parses the key strings the app stores", () => {
    expect(parseKey("G major")).toEqual({ tonic: "G", mode: "major" });
    expect(parseKey("e minor")).toEqual({ tonic: "E", mode: "minor" });
    expect(parseKey("Db major")).toEqual({ tonic: "C#", mode: "major" });
    expect(parseKey(null)).toBeNull();
    expect(parseKey("Dorian")).toBeNull();
  });
  it("maps enharmonic spellings onto the twelve stored names", () => {
    expect(normalizeNote("A#")).toBe("Bb");
    expect(normalizeNote("Gb")).toBe("F#");
    expect(normalizeNote("H")).toBeNull();
  });
});

describe("diatonicChords", () => {
  it("lists the chords of G major in scale order", () => {
    expect(diatonicChords("G major").map(formatChord)).toEqual(["G", "Am", "Bm", "C", "D", "Em", "F#dim"]);
  });
  it("lists the chords of A minor (relative to C major)", () => {
    expect(diatonicChords("A minor").map(formatChord)).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
  });
  it("returns nothing when the key is unknown", () => {
    expect(diatonicChords(null)).toEqual([]);
  });
});

describe("beatsPerBar", () => {
  it("reads simple and compound meters", () => {
    expect(beatsPerBar("4/4")).toBe(4);
    expect(beatsPerBar("3/4")).toBe(3);
    expect(beatsPerBar("6/8")).toBe(2);
    expect(beatsPerBar("12/8")).toBe(4);
    expect(beatsPerBar("7/8")).toBe(7);
    expect(beatsPerBar(null)).toBe(4);
  });
});
