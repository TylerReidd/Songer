"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CHORD_QUALITIES,
  NOTE_NAMES,
  QUALITY_LABELS,
  diatonicChords,
  formatChord,
  type Chord,
  type ChordQuality,
  type NoteName,
} from "@/lib/music/chords";
import { cn } from "@/lib/utils";

interface ChordPickerProps {
  songKey: string | null;
  defaultBeats: number;
  onPick: (chord: Chord) => void;
  /** Editing an existing chord: the picker opens preset to it. */
  value?: Chord;
  trigger?: React.ReactNode;
}

/**
 * Root + quality + beats. When the song has a key, its seven diatonic chords
 * are offered first as one-click suggestions; everything else is a tap away.
 */
export function ChordPicker({ songKey, defaultBeats, onPick, value, trigger }: ChordPickerProps) {
  const [open, setOpen] = useState(false);
  const [root, setRoot] = useState<NoteName>(value?.root ?? "C");
  const [quality, setQuality] = useState<ChordQuality>(value?.quality ?? "maj");
  const [beats, setBeats] = useState(value?.beats ?? defaultBeats);
  const suggestions = diatonicChords(songKey);

  function commit(chord: Chord) {
    onPick(chord);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="xs" aria-label="Add chord" className="text-text-muted hover:text-foreground">
            <Plus data-icon="inline-start" />
            Chord
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        {suggestions.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-[11px] font-medium text-text-muted">In {songKey}</p>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((chord) => (
                <button
                  key={chord.numeral}
                  type="button"
                  onClick={() => commit({ root: chord.root, quality: chord.quality, beats })}
                  className="flex h-7 items-center gap-1 rounded-md border bg-surface-elevated px-2 font-mono text-xs transition-colors hover:border-brand/60 hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {formatChord(chord)}
                  <span className="text-[10px] text-text-muted">{chord.numeral}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mb-1.5 text-[11px] font-medium text-text-muted">Root</p>
        <div className="grid grid-cols-6 gap-1" role="radiogroup" aria-label="Root note">
          {NOTE_NAMES.map((note) => (
            <button
              key={note}
              type="button"
              role="radio"
              aria-checked={root === note}
              onClick={() => setRoot(note)}
              className={cn(
                "h-7 rounded-md border font-mono text-xs transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                root === note ? "border-brand/60 bg-brand-subtle text-brand" : "hover:bg-accent",
              )}
            >
              {note}
            </button>
          ))}
        </div>

        <p className="mt-3 mb-1.5 text-[11px] font-medium text-text-muted">Quality</p>
        <div className="grid grid-cols-4 gap-1" role="radiogroup" aria-label="Chord quality">
          {CHORD_QUALITIES.map((entry) => (
            <button
              key={entry}
              type="button"
              role="radio"
              aria-checked={quality === entry}
              title={QUALITY_LABELS[entry]}
              onClick={() => setQuality(entry)}
              className={cn(
                "h-7 rounded-md border font-mono text-xs transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                quality === entry ? "border-brand/60 bg-brand-subtle text-brand" : "hover:bg-accent",
              )}
            >
              {formatChord({ root, quality: entry })}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-text-secondary">
            Beats
            <input
              type="number"
              min={1}
              max={32}
              value={beats}
              onChange={(event) => setBeats(Math.min(32, Math.max(1, Number(event.target.value) || 1)))}
              className="h-7 w-14 rounded-md border bg-transparent px-2 font-mono text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
          <Button size="sm" onClick={() => commit({ root, quality, beats })}>
            {value ? "Update" : "Add"} {formatChord({ root, quality })}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
