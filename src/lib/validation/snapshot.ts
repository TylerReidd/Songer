import { z } from "zod";
import type { SongSnapshot, SongSnapshotV1, SongWithSections } from "@/lib/domain/types";
import { chordsSchema, sectionTypeSchema, songStatusSchema } from "./song";

/**
 * Version snapshots are stored as JSON. The schema is versioned so a future
 * change to the song shape can migrate older snapshots on read instead of
 * invalidating them.
 */
export const songSnapshotV1Schema = z.object({
  schemaVersion: z.literal(1),
  title: z.string(),
  status: songStatusSchema,
  key: z.string().nullable(),
  bpm: z.number().int().nullable(),
  timeSignature: z.string().nullable(),
  capo: z.number().int().nullable(),
  tuning: z.string().nullable(),
  notes: z.string(),
  sections: z.array(
    z.object({
      type: sectionTypeSchema,
      customLabel: z.string().nullable(),
      content: z.string(),
      position: z.number().int(),
      // Added after the first snapshots were written; older ones simply have no chords.
      chords: chordsSchema.default([]),
    }),
  ),
});

export const songSnapshotSchema = songSnapshotV1Schema;

export function serializeSnapshot(song: SongWithSections): SongSnapshotV1 {
  return {
    schemaVersion: 1,
    title: song.title,
    status: song.status,
    key: song.key,
    bpm: song.bpm,
    timeSignature: song.timeSignature,
    capo: song.capo,
    tuning: song.tuning,
    notes: song.notes,
    sections: [...song.sections]
      .sort((a, b) => a.position - b.position)
      .map((section, position) => ({
        type: section.type,
        customLabel: section.customLabel,
        content: section.content,
        position,
        chords: section.chords,
      })),
  };
}

/** Parses unknown JSON from the database into a typed snapshot, or null if corrupt. */
export function parseSnapshot(value: unknown): SongSnapshot | null {
  const result = songSnapshotSchema.safeParse(value);
  return result.success ? result.data : null;
}

export const versionNameSchema = z
  .string()
  .trim()
  .max(80)
  .transform((value) => value || "Untitled version");
