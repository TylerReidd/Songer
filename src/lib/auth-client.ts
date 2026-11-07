import { createAuthClient } from "better-auth/react";

/**
 * Browser-side auth client. Talks to /api/auth/* and exposes hooks such as
 * `useSession`. No secrets here; the server instance in auth.ts holds those.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
