"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { fail, ok, type ActionResult } from "@/lib/domain/action-result";
import { requireUser } from "@/lib/session";
import { attachIdeaSchema, ideaIdSchema, ideaInputSchema, type IdeaInput } from "@/lib/validation/idea";

function revalidateIdeas() {
  revalidatePath("/ideas");
  revalidatePath("/dashboard");
}

export async function createIdea(input: IdeaInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = ideaInputSchema.safeParse(input);
  if (!parsed.success) return fail("validation", parsed.error.issues[0]?.message ?? "Invalid idea");

  const idea = await db.idea.create({
    data: { ownerId: user.id, title: parsed.data.title, content: parsed.data.content },
    select: { id: true },
  });
  revalidateIdeas();
  return ok(idea);
}

export async function updateIdea(ideaId: string, input: IdeaInput): Promise<ActionResult> {
  const user = await requireUser();
  const id = ideaIdSchema.safeParse(ideaId);
  const parsed = ideaInputSchema.safeParse(input);
  if (!id.success || !parsed.success) return fail("validation", "That change isn't valid.");

  const result = await db.idea.updateMany({
    where: { id: id.data, ownerId: user.id },
    data: { title: parsed.data.title, content: parsed.data.content },
  });
  if (result.count === 0) return fail("not_found", "That idea no longer exists.");
  revalidateIdeas();
  return ok(undefined);
}

export async function deleteIdea(ideaId: string): Promise<ActionResult> {
  const user = await requireUser();
  const id = ideaIdSchema.safeParse(ideaId);
  if (!id.success) return fail("validation", "Invalid idea.");

  const result = await db.idea.deleteMany({ where: { id: id.data, ownerId: user.id } });
  if (result.count === 0) return fail("not_found", "That idea no longer exists.");
  revalidateIdeas();
  return ok(undefined);
}

/** Links an idea to one of the user's songs, or detaches it with `songId: null`. */
export async function attachIdea(ideaId: string, songId: string | null): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = attachIdeaSchema.safeParse({ ideaId, songId });
  if (!parsed.success) return fail("validation", "That change isn't valid.");

  if (parsed.data.songId) {
    // The target song must belong to the same user; never trust the id alone.
    const song = await db.song.findFirst({
      where: { id: parsed.data.songId, ownerId: user.id },
      select: { id: true },
    });
    if (!song) return fail("not_found", "That song no longer exists.");
  }

  const result = await db.idea.updateMany({
    where: { id: parsed.data.ideaId, ownerId: user.id },
    data: { songId: parsed.data.songId },
  });
  if (result.count === 0) return fail("not_found", "That idea no longer exists.");
  revalidateIdeas();
  if (parsed.data.songId) revalidatePath(`/songs/${parsed.data.songId}`);
  return ok(undefined);
}

/**
 * Turns an idea into a new song: the idea's title becomes the working title,
 * its content becomes the first verse, and the idea stays attached to the
 * song it spawned.
 */
export async function convertIdeaToSong(ideaId: string): Promise<never> {
  const user = await requireUser();
  const id = ideaIdSchema.safeParse(ideaId);
  if (!id.success) redirect("/ideas");

  const idea = await db.idea.findFirst({ where: { id: id.data, ownerId: user.id } });
  if (!idea) redirect("/ideas");

  const song = await db.song.create({
    data: {
      ownerId: user.id,
      title: idea.title?.trim() || "Untitled",
      sections: { create: [{ type: "VERSE", content: idea.content, position: 0 }] },
      ideas: { connect: { id: idea.id } },
    },
    select: { id: true },
  });

  revalidateIdeas();
  revalidatePath("/songs");
  redirect(`/songs/${song.id}`);
}
