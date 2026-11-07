"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok, type ActionResult } from "@/lib/domain/action-result";
import { requireUser } from "@/lib/session";
import type { Song, SongSection } from "@/lib/domain/types";
import { saveSongDocumentForUser, type SaveSongDocumentResult } from "@/lib/songs/save-document";
import { parseSnapshot, serializeSnapshot, versionNameSchema } from "@/lib/validation/snapshot";
import {
  createSongSchema,
  parseChords,
  songIdSchema,
  songPatchSchema,
  songTitleSchema,
  type SaveSongDocumentInput,
  type SongPatchInput,
} from "@/lib/validation/song";

/**
 * Write-side Server Actions for songs.
 *
 * Every action: (1) resolves the user from the session, never from input,
 * (2) validates its input with Zod, (3) scopes every query by ownerId,
 * (4) revalidates the paths that render the changed data.
 *
 * Returning `ActionResult` instead of throwing keeps expected failures
 * (validation, missing song, stale revision) renderable by the caller.
 */

function revalidateSong(songId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/songs");
  revalidatePath("/ideas");
  if (songId) revalidatePath(`/songs/${songId}`);
}

export async function createSong(input: z.input<typeof createSongSchema> = {}): Promise<never> {
  const user = await requireUser();
  const parsed = createSongSchema.safeParse(input);
  const title = parsed.success ? (parsed.data.title ?? "Untitled") : "Untitled";
  const initialContent = parsed.success ? parsed.data.initialContent : undefined;

  const song = await db.song.create({
    data: {
      ownerId: user.id,
      title,
      sections: initialContent
        ? { create: [{ type: "VERSE", content: initialContent, position: 0 }] }
        : undefined,
    },
    select: { id: true },
  });

  revalidateSong();
  redirect(`/songs/${song.id}`);
}

export async function updateSong(songId: string, patch: SongPatchInput): Promise<ActionResult> {
  const user = await requireUser();
  const id = songIdSchema.safeParse(songId);
  const parsed = songPatchSchema.safeParse(patch);
  if (!id.success || !parsed.success) return fail("validation", "That change isn't valid.");

  const result = await db.song.updateMany({
    where: { id: id.data, ownerId: user.id },
    data: { ...parsed.data, revision: { increment: 1 } },
  });
  if (result.count === 0) return fail("not_found", "That song no longer exists.");

  revalidateSong(id.data);
  return ok(undefined);
}

export async function renameSong(songId: string, title: string): Promise<ActionResult> {
  const parsed = songTitleSchema.safeParse(title);
  if (!parsed.success) return fail("validation", parsed.error.issues[0]?.message ?? "Invalid title");
  return updateSong(songId, { title: parsed.data });
}

export async function deleteSong(songId: string): Promise<ActionResult> {
  const user = await requireUser();
  const id = songIdSchema.safeParse(songId);
  if (!id.success) return fail("validation", "Invalid song.");

  // Sections, versions, and idea links are removed by the database cascade rules.
  const result = await db.song.deleteMany({ where: { id: id.data, ownerId: user.id } });
  if (result.count === 0) return fail("not_found", "That song no longer exists.");

  revalidateSong(id.data);
  return ok(undefined);
}

export async function duplicateSong(songId: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const id = songIdSchema.safeParse(songId);
  if (!id.success) return fail("validation", "Invalid song.");

  const source = await db.song.findFirst({
    where: { id: id.data, ownerId: user.id },
    include: { sections: { orderBy: { position: "asc" } } },
  });
  if (!source) return fail("not_found", "That song no longer exists.");

  const copy = await db.song.create({
    data: {
      ownerId: user.id,
      title: `${source.title} (copy)`,
      status: source.status === "ARCHIVED" ? "IDEA" : source.status,
      key: source.key,
      bpm: source.bpm,
      timeSignature: source.timeSignature,
      capo: source.capo,
      tuning: source.tuning,
      notes: source.notes,
      sections: {
        create: source.sections.map((section) => ({
          type: section.type,
          customLabel: section.customLabel,
          content: section.content,
          position: section.position,
          chords: parseChords(section.chords),
        })),
      },
    },
    select: { id: true },
  });

  revalidateSong();
  return ok({ id: copy.id });
}

/** Autosave entry point. See save-document.ts for the transaction itself. */
export async function saveSongDocument(
  input: SaveSongDocumentInput,
): Promise<ActionResult<SaveSongDocumentResult>> {
  const user = await requireUser();
  const result = await saveSongDocumentForUser(user.id, input);
  if (result.ok) revalidateSong(input.songId);
  return result;
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

/** Loads the song with ordered sections or null; shared by the version actions. */
async function loadOwnedSong(userId: string, songId: string) {
  const song = await db.song.findFirst({
    where: { id: songId, ownerId: userId },
    include: { sections: { orderBy: { position: "asc" } } },
  });
  return song ? { ...song, sections: song.sections.map((s) => ({ ...s, chords: parseChords(s.chords) })) } : null;
}

export async function createVersion(songId: string, name: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const id = songIdSchema.safeParse(songId);
  const parsedName = versionNameSchema.safeParse(name);
  if (!id.success || !parsedName.success) return fail("validation", "That version name isn't valid.");

  const song = await loadOwnedSong(user.id, id.data);
  if (!song) return fail("not_found", "That song no longer exists.");

  const version = await db.songVersion.create({
    data: { songId: song.id, name: parsedName.data, kind: "MANUAL", snapshot: serializeSnapshot(song) },
    select: { id: true },
  });
  revalidateSong(song.id);
  return ok(version);
}

export interface RestoredDocument {
  song: Song;
  sections: SongSection[];
}

/**
 * Replaces the song with a snapshot. The current state is written first as a
 * RECOVERY version inside the same transaction, so a restore can always be
 * undone by restoring the recovery point.
 */
export async function restoreVersion(songId: string, versionId: string): Promise<ActionResult<RestoredDocument>> {
  const user = await requireUser();
  const id = songIdSchema.safeParse(songId);
  if (!id.success) return fail("validation", "Invalid song.");

  const current = await loadOwnedSong(user.id, id.data);
  if (!current) return fail("not_found", "That song no longer exists.");

  const row = await db.songVersion.findFirst({ where: { id: versionId, songId: current.id } });
  const snapshot = row ? parseSnapshot(row.snapshot) : null;
  if (!row || !snapshot) return fail("not_found", "That version could not be read.");

  const restored = await db.$transaction(async (tx) => {
    await tx.songVersion.create({
      data: {
        songId: current.id,
        name: `Before restoring “${row.name}”`,
        kind: "RECOVERY",
        snapshot: serializeSnapshot(current),
      },
    });
    await tx.songSection.deleteMany({ where: { songId: current.id } });
    return tx.song.update({
      where: { id: current.id },
      data: {
        title: snapshot.title,
        status: snapshot.status,
        key: snapshot.key,
        bpm: snapshot.bpm,
        timeSignature: snapshot.timeSignature,
        capo: snapshot.capo,
        tuning: snapshot.tuning,
        notes: snapshot.notes,
        revision: { increment: 1 },
        sections: {
          create: snapshot.sections.map((section) => ({
            type: section.type,
            customLabel: section.customLabel,
            content: section.content,
            position: section.position,
            chords: section.chords,
          })),
        },
      },
      include: { sections: { orderBy: { position: "asc" } } },
    });
  });

  revalidateSong(current.id);
  const { sections, ...song } = restored;
  return ok({ song, sections: sections.map((s) => ({ ...s, chords: parseChords(s.chords) })) });
}
