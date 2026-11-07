"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { seedDemoContent } from "@/lib/demo/seed";

/**
 * "Try the demo": creates a throwaway account with sample content and signs
 * the visitor in. Each visitor gets their own workspace, so nobody can
 * vandalize a shared demo. Accounts flagged `isDemo` are deleted after 24
 * hours by /api/cron/cleanup-demo (cascades remove their songs and ideas).
 *
 * The nextCookies plugin on the auth instance is what lets this Server
 * Action set the session cookie.
 */
export async function startDemo(): Promise<never> {
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `demo-${suffix}@demo.songbook.local`;
  const password = crypto.randomUUID();

  const result = await auth.api.signUpEmail({
    headers: await headers(),
    body: { email, password, name: "Demo Songwriter" },
  });

  const userId = result.user.id;
  await db.user.update({ where: { id: userId }, data: { isDemo: true } });
  await seedDemoContent(db, userId);

  redirect("/dashboard");
}
