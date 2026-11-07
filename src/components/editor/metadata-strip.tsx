"use client";

import { Music4 } from "lucide-react";
import type { Song } from "@/lib/domain/types";

interface MetadataStripProps {
  song: Song;
  onEdit: () => void;
}

/** Read-only summary of the musical metadata; clicking opens the Details tab. */
export function MetadataStrip({ song, onEdit }: MetadataStripProps) {
  const parts = [
    song.key,
    song.bpm ? `${song.bpm} bpm` : null,
    song.timeSignature,
    song.capo != null && song.capo > 0 ? `capo ${song.capo}` : null,
    song.tuning && song.tuning.toLowerCase() !== "standard" ? song.tuning : null,
  ].filter((part): part is string => Boolean(part));

  return (
    <button
      type="button"
      onClick={onEdit}
      className="inline-flex h-7 items-center gap-2 rounded-md px-1 font-mono text-[12px] text-text-muted transition-colors outline-none hover:bg-accent hover:text-text-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label="Edit musical details"
    >
      <Music4 className="size-3.5" aria-hidden="true" />
      {parts.length ? parts.join("  ·  ") : "Add key, tempo, and time signature"}
    </button>
  );
}
