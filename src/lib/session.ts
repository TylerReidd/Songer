import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import type { LyricFont, UserProfile } from "@/lib/domain/types";

/**
 * Data Access Layer entry point for the current user.
 *
 * Reading the session touches request headers, which makes the calling
 * component dynamic. Under Cache Components that read must happen inside a
 * Suspense boundary (a page with loading.tsx, or an explicit <Suspense>), so
 * call these from page bodies and leaf components, never from the top level
 * of a layout.
 *
 * `cache()` dedupes the lookup within a single request so a page and its
 * children can all call `requireUser()` and hit the database once.
 */
export const getSessionUser = cache(async (): Promise<UserProfile | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    lyricFont: normalizeLyricFont(user.lyricFont),
    createdAt: user.createdAt,
  };
});

/** Redirects anonymous visitors to sign-in. Every protected page and action calls this. */
export async function requireUser(): Promise<UserProfile> {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
}

export function normalizeLyricFont(value: unknown): LyricFont {
  return value === "sans" ? "sans" : "serif";
}
