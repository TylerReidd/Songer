import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Route Handler that mounts every Better Auth endpoint (sign-in, sign-up,
 * session, sign-out, ...) under /api/auth. This is one of the few places a
 * Route Handler is the right tool: the auth client speaks HTTP, not Server
 * Actions.
 */
export const { GET, POST } = toNextJsHandler(auth);
