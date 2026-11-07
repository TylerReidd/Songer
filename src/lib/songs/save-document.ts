import "server-only";
import { db } from "@/lib/db";
import { fail, ok, type ActionResult } from "@/lib/domain/action-result";
import { saveSongDocumentSchema } from "@/lib/validation/song";
import { Prisma } from "@/generated/prisma/client";

export interface SaveSongDocumentResult {
  revision: number;
  updatedAt: Date;
}

/**
 * Persists the editor's whole document in one transaction. Shared by the
 * Server Action (normal autosave) and the flush Route Handler (tab close),
 * which only differ in how they obtain the user.
 *
 * Concurrency: the update is conditional on the revision the client last saw.
 * If another tab saved in between, zero rows match and the caller gets a
 * `conflict` instead of silently overwriting newer work.
 *
 * Sections: ids that already belong to this song are updated; new ids are
 * created; ids no longer present are deleted. An id that exists under a
 * different song is never touched, because updates are restricted to the id
 * set fetched for this song, and a create with a colliding id fails.
 */
export async function saveSongDocumentForUser(
  userId: string,
  input: unknown,
): Promise<ActionResult<SaveSongDocumentResult>> {
  const parsed = saveSongDocumentSchema.safeParse(input);
  if (!parsed.success) return fail("validation", "The song could not be saved: invalid data.");
  const { songId, revision, song, sections } = parsed.data;

  try {
    const result = await db.$transaction(async (tx) => {
      const updated = await tx.song.updateMany({
        where: { id: songId, ownerId: userId, revision },
        data: { ...song, revision: { increment: 1 } },
      });
      if (updated.count === 0) {
        const exists = await tx.song.findFirst({ where: { id: songId, ownerId: userId }, select: { id: true } });
        return exists ? ("conflict" as const) : ("not_found" as const);
      }

      const existing = await tx.songSection.findMany({ where: { songId }, select: { id: true } });
      const existingIds = new Set(existing.map((section) => section.id));
      const incomingIds = new Set(sections.map((section) => section.id));

      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length) await tx.songSection.deleteMany({ where: { songId, id: { in: toDelete } } });

      for (const [position, section] of sections.entries()) {
        const data = {
          type: section.type,
          customLabel: section.customLabel,
          content: section.content,
          chords: section.chords,
          position,
        };
        if (existingIds.has(section.id)) {
          await tx.songSection.update({ where: { id: section.id }, data });
        } else {
          await tx.songSection.create({ data: { id: section.id, songId, ...data } });
        }
      }

      return tx.song.findUniqueOrThrow({ where: { id: songId }, select: { revision: true, updatedAt: true } });
    });

    if (result === "conflict") {
      return fail("conflict", "This song was changed somewhere else. Reload to see the latest version.");
    }
    if (result === "not_found") return fail("not_found", "That song no longer exists.");
    return ok(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("validation", "A section id collided with an existing one. Reload and try again.");
    }
    throw error;
  }
}
