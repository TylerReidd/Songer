import "server-only";
import { db } from "@/lib/db";
import type { SongRecording } from "@/lib/domain/types";

/** Metadata only: the audio bytes are never loaded with the song. */
export async function listRecordings(userId: string, songId: string): Promise<SongRecording[]> {
  return db.songRecording.findMany({
    where: { songId, song: { ownerId: userId } },
    orderBy: { createdAt: "desc" },
    select: { id: true, songId: true, name: true, mimeType: true, durationMs: true, sizeBytes: true, createdAt: true },
  });
}
