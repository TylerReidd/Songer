import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic redirect for anonymous visitors. It only checks whether a session
 * cookie is present (no database call), which keeps it fast. It is NOT the
 * security boundary: every protected page and Server Action still calls
 * `requireUser()`, which validates the session against the database.
 */
const SESSION_COOKIE = "better-auth.session_token";
const PROTECTED_PREFIXES = ["/dashboard", "/songs", "/ideas", "/settings"];
const AUTH_PAGES = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has(SESSION_COOKIE) || request.cookies.has(`__Secure-${SESSION_COOKIE}`);

  if (!hasSession && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/songs/:path*", "/ideas/:path*", "/settings/:path*", "/sign-in", "/sign-up"],
};
