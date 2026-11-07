"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { fail, ok, type ActionResult } from "@/lib/domain/action-result";
import type { LyricFont } from "@/lib/domain/types";
import { requireUser } from "@/lib/session";

const nameSchema = z.string().trim().min(1, "Name can't be empty").max(80);
const lyricFontSchema = z.enum(["serif", "sans"]);

export async function updateProfile(input: { name: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = nameSchema.safeParse(input.name);
  if (!parsed.success) return fail("validation", parsed.error.issues[0]?.message ?? "Invalid name");

  await db.user.update({ where: { id: user.id }, data: { name: parsed.data } });
  revalidatePath("/", "layout");
  return ok(undefined);
}

export async function updateLyricFont(font: LyricFont): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = lyricFontSchema.safeParse(font);
  if (!parsed.success) return fail("validation", "Unknown font.");

  await db.user.update({ where: { id: user.id }, data: { lyricFont: parsed.data } });
  revalidatePath("/", "layout");
  return ok(undefined);
}
