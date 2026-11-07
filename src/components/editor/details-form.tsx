"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BPM_MAX,
  BPM_MIN,
  CAPO_MAX,
  MUSICAL_KEYS,
  SONG_STATUS_LABELS,
  SONG_STATUSES,
  TIME_SIGNATURES,
  type Song,
  type SongStatus,
} from "@/lib/domain/types";
import type { SongPatch } from "./editor-reducer";

interface DetailsFormProps {
  song: Song;
  onPatch: (patch: SongPatch) => void;
}

const NONE = "__none__";

function parseIntOrNull(value: string, min: number, max: number): number | null | undefined {
  if (value === "") return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  return Math.min(max, Math.max(min, parsed));
}

/** Musical metadata. Every control is labeled and keyboard operable. */
export function DetailsForm({ song, onPatch }: DetailsFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Status" htmlFor="song-status">
        <Select value={song.status} onValueChange={(value) => onPatch({ status: value as SongStatus })}>
          <SelectTrigger id="song-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SONG_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {SONG_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Key" htmlFor="song-key">
        <Select value={song.key ?? NONE} onValueChange={(value) => onPatch({ key: value === NONE ? null : value })}>
          <SelectTrigger id="song-key" className="w-full">
            <SelectValue placeholder="Choose a key" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value={NONE}>Not set</SelectItem>
            {MUSICAL_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tempo (BPM)" htmlFor="song-bpm">
          <Input
            id="song-bpm"
            type="number"
            inputMode="numeric"
            min={BPM_MIN}
            max={BPM_MAX}
            value={song.bpm ?? ""}
            placeholder="—"
            onChange={(event) => {
              const next = parseIntOrNull(event.target.value, BPM_MIN, BPM_MAX);
              if (next !== undefined) onPatch({ bpm: next });
            }}
            className="font-mono"
          />
        </Field>
        <Field label="Time signature" htmlFor="song-time">
          <Select
            value={song.timeSignature ?? NONE}
            onValueChange={(value) => onPatch({ timeSignature: value === NONE ? null : value })}
          >
            <SelectTrigger id="song-time" className="w-full font-mono">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Not set</SelectItem>
              {TIME_SIGNATURES.map((signature) => (
                <SelectItem key={signature} value={signature} className="font-mono">
                  {signature}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Capo" htmlFor="song-capo">
          <Input
            id="song-capo"
            type="number"
            inputMode="numeric"
            min={0}
            max={CAPO_MAX}
            value={song.capo ?? ""}
            placeholder="—"
            onChange={(event) => {
              const next = parseIntOrNull(event.target.value, 0, CAPO_MAX);
              if (next !== undefined) onPatch({ capo: next });
            }}
            className="font-mono"
          />
        </Field>
        <Field label="Tuning" htmlFor="song-tuning">
          <Input
            id="song-tuning"
            value={song.tuning ?? ""}
            placeholder="Standard"
            maxLength={40}
            onChange={(event) => onPatch({ tuning: event.target.value || null })}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-text-secondary">
        {label}
      </Label>
      {children}
    </div>
  );
}
