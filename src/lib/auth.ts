import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Better Auth server instance.
 *
 * - Sessions and accounts live in PostgreSQL via the Prisma adapter.
 * - Email/password with mandatory email verification: a new account cannot
 *   sign in until the link in the verification email is opened. Unverified
 *   sign-in attempts resend the link. Password reset uses the same mailer.
 * - `nextCookies` lets Server Actions that sign in/out set cookies, which plain
 *   Route Handlers do automatically but actions do not.
 *
 * AUTH_TEST_MODE=on (set only by the Playwright web server) turns off
 * verification and rate limiting so tests can create accounts and sign in
 * repeatedly without a mailbox.
 */
const testMode = process.env.AUTH_TEST_MODE === "on";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    requireEmailVerification: !testMode,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }) =>
      sendEmail({
        to: user.email,
        subject: "Reset your Songbook password",
        intro: `Hi ${user.name}, someone asked to reset the password for this account.`,
        action: { label: "Choose a new password", url },
        footer: "The link works for one hour. If you didn't ask for this, you can ignore it; your password stays the same.",
      }),
  },
  emailVerification: {
    sendOnSignUp: !testMode,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // 24 hours
    sendVerificationEmail: ({ user, url }) =>
      sendEmail({
        to: user.email,
        subject: "Confirm your Songbook email",
        intro: `Hi ${user.name}, confirm your email address to finish setting up your Songbook.`,
        action: { label: "Confirm email", url },
        footer: "The link works for 24 hours. If you didn't create a Songbook account, you can ignore this email.",
      }),
  },
  rateLimit: { enabled: !testMode },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    // Users delete their own account from Settings; the password is re-checked
    // and PostgreSQL cascades remove songs, versions, takes, and ideas.
    deleteUser: { enabled: true },
    additionalFields: {
      lyricFont: { type: "string", required: false, defaultValue: "serif", input: false },
      isDemo: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
