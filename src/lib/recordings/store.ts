import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok, type ActionResult } from "@/lib/domain/action-result";
import type { SongRecording } from "@/lib/domain/types";
import {
  RECORDING_MAX_BYTES,
  RECORDING_MAX_SECONDS,
  RECORDING_MIME_TYPES,
  RECORDINGS_PER_SONG,
  baseMimeType,
} from "./limits";
import { putRecordingBytes } from "./storage";

export const recordingMetaSchema = z.object({
  name: z.string().trim().max(80).transform((value) => value || "Untitled take"),
  mimeType: z.string().transform(baseMimeType).pipe(z.enum(RECORDING_MIME_TYPES)),
  durationMs: z.number().int().min(500).max(RECORDING_MAX_SECONDS * 1000 + 1500),
});

export interface StoreRecordingInput {
  name: string;
  mimeType: string;
  durationMs: number;
  bytes: Uint8Array;
}

/**
 * Validates and saves a take for a song the user owns. Pure of HTTP so the
 * upload route stays thin and this can be tested against the database.
 */
export async function storeRecording(
  userId: string,
  songId: string,
  input: StoreRecordingInput,
): Promise<ActionResult<SongRecording>> {
  const meta = recordingMetaSchema.safeParse(input);
  if (!meta.success) return fail("validation", "That recording isn't a supported audio format or length.");
  if (input.bytes.byteLength === 0) return fail("validation", "The recording is empty.");
  if (input.bytes.byteLength > RECORDING_MAX_BYTES) return fail("validation", "The recording is too large.");

  const song = await db.song.findFirst({
    where: { id: songId, ownerId: userId },
    select: { id: true, _count: { select: { recordings: true } } },
  });
  if (!song) return fail("not_found", "That song no longer exists.");
  if (song._count.recordings >= RECORDINGS_PER_SONG) {
    return fail("validation", `Each song keeps up to ${RECORDINGS_PER_SONG} recordings. Delete one to add another.`);
  }

  const created = await db.songRecording.create({
    data: {
      songId,
      name: meta.data.name,
      mimeType: meta.data.mimeType,
      durationMs: meta.data.durationMs,
      sizeBytes: input.bytes.byteLength,
      data: new Uint8Array(0),
    },
    select: { id: true, songId: true, name: true, mimeType: true, durationMs: true, sizeBytes: true, createdAt: true },
  });
  await putRecordingBytes(created.id, input.bytes);
  return ok(created);
}
