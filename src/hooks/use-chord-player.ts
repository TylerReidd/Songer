"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { chordToMidi, type Chord } from "@/lib/music/chords";
import { getAudio, playChordNotes } from "@/lib/music/piano";

interface ChordPlayerOptions {
  chords: Chord[];
  bpm: number;
  loop: boolean;
}

const LOOKAHEAD_SECONDS = 0.12;
const TICK_MS = 30;

/** Only one section plays at a time; starting another stops the current one. */
let active: { owner: object; stop: () => void } | null = null;

/**
 * Schedules a chord progression on the audio clock.
 *
 * JavaScript timers drift, so the player does not fire notes from
 * setInterval. Instead a short interval looks ahead on the AudioContext's
 * precise clock and schedules any chord starting within the next 120 ms.
 * The highlighted chord index is updated separately, on the UI's timing.
 */
export function useChordPlayer({ chords, bpm, loop }: ChordPlayerOptions) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Mutable scheduler state lives in a ref so the interval callback sees the
  // latest chords/tempo without restarting playback on every render.
  const state = useRef({ nextIndex: 0, nextTime: 0, timer: 0 as number, chords, bpm, loop });
  useEffect(() => {
    state.current.chords = chords;
    state.current.bpm = bpm;
    state.current.loop = loop;
  }, [chords, bpm, loop]);

  const stop = useCallback(() => {
    window.clearInterval(state.current.timer);
    if (active?.owner === state.current) active = null;
    setPlaying(false);
    setCurrentIndex(null);
  }, []);

  const play = useCallback(() => {
    const s = state.current;
    if (s.chords.length === 0) return;
    const { context } = getAudio();
    if (active && active.owner !== s) active.stop();
    active = { owner: s, stop };
    window.clearInterval(s.timer);
    s.nextIndex = 0;
    s.nextTime = context.currentTime + 0.05;
    setPlaying(true);

    s.timer = window.setInterval(() => {
      const secondsPerBeat = 60 / s.bpm;
      while (s.nextTime < context.currentTime + LOOKAHEAD_SECONDS) {
        if (s.nextIndex >= s.chords.length) {
          if (!s.loop) {
            // Let the last chord ring, then stop.
            window.setTimeout(stop, (s.nextTime - context.currentTime) * 1000);
            window.clearInterval(s.timer);
            return;
          }
          s.nextIndex = 0;
        }
        const chord = s.chords[s.nextIndex];
        const duration = chord.beats * secondsPerBeat;
        playChordNotes(chordToMidi(chord), s.nextTime, duration * 0.95);

        const index = s.nextIndex;
        window.setTimeout(() => setCurrentIndex(index), Math.max(0, (s.nextTime - context.currentTime) * 1000));

        s.nextTime += duration;
        s.nextIndex += 1;
      }
    }, TICK_MS);
  }, [stop]);

  // Stop when the component unmounts (navigating away).
  useEffect(() => stop, [stop]);

  return { playing, currentIndex, play, stop };
}
