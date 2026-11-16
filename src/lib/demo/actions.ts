"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createCredentialUser } from "@/lib/auth-users";
import { db } from "@/lib/db";
import { seedDemoContent } from "@/lib/demo/seed";

/**
 * "Try the demo": creates a throwaway account with sample content and signs
 * the visitor in. Each visitor gets their own workspace, so nobody can
 * vandalize a shared demo. Accounts flagged `isDemo` are deleted after 24
 * hours by /api/cron/cleanup-demo (cascades remove their songs and ideas).
 *
 * The account is created directly (already verified) rather than through
 * sign-up, so no verification email goes to the fake address. The
 * nextCookies plugin on the auth instance is what lets this Server Action
 * set the session cookie.
 */
export async function startDemo(): Promise<never> {
  const suffix = crypto.randomUUID().slice(0, 8);
  const email = `demo-${suffix}@demo.songbook.local`;
  const password = crypto.randomUUID();

  const userId = await createCredentialUser(db, { email, password, name: "Demo Songwriter", isDemo: true });
  await seedDemoContent(db, userId);
  await auth.api.signInEmail({ headers: await headers(), body: { email, password } });

  redirect("/dashboard");
}
