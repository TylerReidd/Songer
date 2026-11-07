import { z } from "zod";
import {
  BPM_MAX,
  BPM_MIN,
  CAPO_MAX,
  SECTION_TYPES,
  SONG_STATUSES,
} from "@/lib/domain/types";
import { CHORD_QUALITIES, NOTE_NAMES, type Chord } from "@/lib/music/chords";

/**
 * Zod schemas for every trust boundary that touches a song. Server Actions
 * parse their input with these before doing anything else, so a malformed or
 * hostile payload never reaches Prisma.
 */

export const songIdSchema = z.string().min(1).max(64);

export const songTitleSchema = z
  .string()
  .trim()
  .max(120, "Title is too long")
  .transform((value) => value || "Untitled");

export const songStatusSchema = z.enum(SONG_STATUSES);
export const sectionTypeSchema = z.enum(SECTION_TYPES);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => (value ? value : null));

export const songMetadataSchema = z.object({
  key: optionalText(24),
  bpm: z.number().int().min(BPM_MIN).max(BPM_MAX).nullable(),
  timeSignature: z
    .string()
    .trim()
    .regex(/^\d{1,2}\/\d{1,2}$/, "Use the form 4/4")
    .nullable(),
  capo: z.number().int().min(0).max(CAPO_MAX).nullable(),
  tuning: optionalText(40),
});

export const songNotesSchema = z.string().max(20_000);

/** Partial update accepted by the song "patch" action. */
export const songPatchSchema = z
  .object({
    title: songTitleSchema,
    status: songStatusSchema,
    notes: songNotesSchema,
    isFavorite: z.boolean(),
  })
  .merge(songMetadataSchema)
  .partial();
export type SongPatchInput = z.infer<typeof songPatchSchema>;

export const createSongSchema = z.object({
  title: songTitleSchema.optional(),
  /** Optional seed content, used when converting an idea into a song. */
  initialContent: z.string().max(20_000).optional(),
});

export const chordSchema = z.object({
  root: z.enum(NOTE_NAMES),
  quality: z.enum(CHORD_QUALITIES),
  beats: z.number().int().min(1).max(32),
});
export const chordsSchema = z.array(chordSchema).max(64);

/** Reads the JSON column; anything malformed becomes an empty sketch rather than an error. */
export function parseChords(value: unknown): Chord[] {
  const result = chordsSchema.safeParse(value);
  return result.success ? result.data : [];
}

export const sectionInputSchema = z.object({
  id: z.string().min(1).max(64),
  type: sectionTypeSchema,
  customLabel: optionalText(60),
  content: z.string().max(50_000),
  position: z.number().int().min(0),
  chords: chordsSchema.default([]),
});
export type SectionInput = z.infer<typeof sectionInputSchema>;

/** Full document save sent by the editor's autosave (Phase 3 uses this). */
export const saveSongDocumentSchema = z.object({
  songId: songIdSchema,
  revision: z.number().int().positive(),
  song: songPatchSchema,
  sections: z.array(sectionInputSchema).max(200),
});
export type SaveSongDocumentInput = z.infer<typeof saveSongDocumentSchema>;
