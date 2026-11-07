import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveSongDocumentForUser } from "@/lib/songs/save-document";

/**
 * Receives the editor's last unsaved document when the tab is closing.
 * `navigator.sendBeacon` cannot call Server Actions, so this is one of the
 * few plain HTTP endpoints in the app. Same validation and ownership rules
 * as the action; it only resolves the user from the request's cookies.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/songs/[id]/flush">) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || (body as { songId?: string }).songId !== id) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const result = await saveSongDocumentForUser(session.user.id, body);
  return NextResponse.json(result, { status: result.ok ? 200 : 409 });
}
