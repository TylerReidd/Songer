"use client";

import { ChevronLeft, ChevronRight, Pause, Play, Repeat, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChordPlayer } from "@/hooks/use-chord-player";
import { beatsPerBar, formatChord, type Chord } from "@/lib/music/chords";
import { moveItem } from "@/lib/songs/ordering";
import { cn } from "@/lib/utils";
import { ChordPicker } from "./chord-picker";

interface ChordStripProps {
  chords: Chord[];
  songKey: string | null;
  bpm: number | null;
  timeSignature: string | null;
  onChange: (chords: Chord[]) => void;
}

const DEFAULT_BPM = 100;

/**
 * The chord sketch for one section: a row of chord chips with a play/loop
 * transport. Chips can be edited in place, removed, or nudged left/right.
 */
export function ChordStrip({ chords, songKey, bpm, timeSignature, onChange }: ChordStripProps) {
  const [loop, setLoop] = useState(true);
  const tempo = bpm ?? DEFAULT_BPM;
  const { playing, currentIndex, play, stop } = useChordPlayer({ chords, bpm: tempo, loop });
  const defaultBeats = beatsPerBar(timeSignature);

  // Positions are implicit (array order), so reuse the ordering helper with a throwaway position.
  const move = (from: number, to: number) =>
    onChange(moveItem(chords.map((c, position) => ({ ...c, position })), from, to).map(({ position: _p, ...c }) => c));

  if (chords.length === 0) {
    return (
      <div className="flex items-center gap-1 px-3 pb-1">
        <ChordPicker songKey={songKey} defaultBeats={defaultBeats} onPick={(chord) => onChange([chord])} />
        <span className="text-[11px] text-text-muted">Sketch the chords and hear them under the lyrics.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={playing ? "default" : "outline"}
            size="icon-sm"
            aria-label={playing ? "Stop" : "Play chords"}
            aria-pressed={playing}
            onClick={playing ? stop : play}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{playing ? "Stop" : `Play at ${tempo} bpm`}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Loop"
            aria-pressed={loop}
            onClick={() => setLoop((value) => !value)}
            className={cn(loop && "text-brand")}
          >
            <Repeat />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{loop ? "Looping" : "Play once"}</TooltipContent>
      </Tooltip>

      <ol className="flex flex-wrap items-center gap-1" aria-label="Chords">
        {chords.map((chord, index) => (
          <li key={`${index}-${chord.root}-${chord.quality}`} className="group/chord flex items-center">
            <ChordPicker
              songKey={songKey}
              defaultBeats={defaultBeats}
              value={chord}
              onPick={(next) => onChange(chords.map((c, i) => (i === index ? next : c)))}
              trigger={
                <button
                  type="button"
                  aria-label={`Edit ${formatChord(chord)}, ${chord.beats} beats`}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-l-md border px-2 font-mono text-xs transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    currentIndex === index ? "border-brand bg-brand-subtle text-brand" : "bg-surface-elevated hover:bg-accent",
                  )}
                >
                  {formatChord(chord)}
                  <span className="text-[10px] text-text-muted">{chord.beats}</span>
                </button>
              }
            />
            <span className="flex h-7 items-center rounded-r-md border border-l-0 bg-surface-elevated">
              <button
                type="button"
                aria-label="Move chord left"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                className="px-0.5 text-text-muted hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="size-3" />
              </button>
              <button
                type="button"
                aria-label="Move chord right"
                disabled={index === chords.length - 1}
                onClick={() => move(index, index + 1)}
                className="px-0.5 text-text-muted hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="size-3" />
              </button>
              <button
                type="button"
                aria-label={`Remove ${formatChord(chord)}`}
                onClick={() => onChange(chords.filter((_, i) => i !== index))}
                className="px-1 text-text-muted hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </span>
          </li>
        ))}
      </ol>
      <ChordPicker songKey={songKey} defaultBeats={defaultBeats} onPick={(chord) => onChange([...chords, chord])} />
    </div>
  );
}
