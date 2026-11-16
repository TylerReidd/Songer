"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok, type ActionResult } from "@/lib/domain/action-result";
import { requireUser } from "@/lib/session";
import { deleteRecordingBytes } from "./storage";

const idSchema = z.string().min(1).max(64);
const nameSchema = z.string().trim().min(1, "Give the take a name").max(80);

export async function renameRecording(recordingId: string, name: string): Promise<ActionResult> {
  const user = await requireUser();
  const id = idSchema.safeParse(recordingId);
  const parsed = nameSchema.safeParse(name);
  if (!id.success || !parsed.success) return fail("validation", parsed.success ? "Invalid recording." : parsed.error.issues[0].message);

  const result = await db.songRecording.updateMany({
    where: { id: id.data, song: { ownerId: user.id } },
    data: { name: parsed.data },
  });
  if (result.count === 0) return fail("not_found", "That recording no longer exists.");
  return ok(undefined);
}

export async function deleteRecording(recordingId: string): Promise<ActionResult<{ songId: string }>> {
  const user = await requireUser();
  const id = idSchema.safeParse(recordingId);
  if (!id.success) return fail("validation", "Invalid recording.");

  const recording = await db.songRecording.findFirst({
    where: { id: id.data, song: { ownerId: user.id } },
    select: { id: true, songId: true },
  });
  if (!recording) return fail("not_found", "That recording no longer exists.");

  await db.songRecording.delete({ where: { id: recording.id } });
  await deleteRecordingBytes(recording.id);
  revalidatePath(`/songs/${recording.songId}`);
  return ok({ songId: recording.songId });
}
