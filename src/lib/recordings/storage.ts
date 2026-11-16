import "server-only";
import { db } from "@/lib/db";

/**
 * Where recording bytes live. Today that is a `Bytes` column on the
 * recording row, which is free and needs no extra service at this scale
 * (a 60-second take is roughly half a megabyte). Moving to object storage
 * later means changing these three functions and nothing else.
 */
export async function putRecordingBytes(recordingId: string, bytes: Uint8Array): Promise<void> {
  await db.songRecording.update({ where: { id: recordingId }, data: { data: new Uint8Array(bytes) } });
}

export async function readRecordingBytes(recordingId: string): Promise<Uint8Array | null> {
  const row = await db.songRecording.findUnique({ where: { id: recordingId }, select: { data: true } });
  return row?.data ?? null;
}

/** Bytes are deleted with the row (same table), so nothing extra to do. */
export async function deleteRecordingBytes(_recordingId: string): Promise<void> {}
