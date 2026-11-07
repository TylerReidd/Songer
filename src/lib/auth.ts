import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

/**
 * Better Auth server instance.
 *
 * - Sessions and accounts live in PostgreSQL via the Prisma adapter.
 * - Email/password is the only method for now; OAuth providers slot in later.
 * - `nextCookies` lets Server Actions that sign in/out set cookies, which plain
 *   Route Handlers do automatically but actions do not.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      lyricFont: { type: "string", required: false, defaultValue: "serif", input: false },
      isDemo: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
