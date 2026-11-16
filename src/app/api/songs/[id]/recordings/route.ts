import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storeRecording } from "@/lib/recordings/store";

/**
 * Upload endpoint for a new take. A Route Handler rather than a Server
 * Action because the body is a binary file: multipart handling and size
 * limits are what HTTP is for, and the action body-size default is too small.
 */
export async function POST(request: Request, { params }: RouteContext<"/api/songs/[id]/recordings">) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.isDemo) {
    return NextResponse.json({ error: "Recording is turned off in demo workspaces. Create an account to keep takes." }, { status: 403 });
  }

  const { id: songId } = await params;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!form || !(file instanceof File)) return NextResponse.json({ error: "No audio received." }, { status: 400 });

  const result = await storeRecording(session.user.id, songId, {
    name: String(form.get("name") ?? ""),
    mimeType: String(form.get("mimeType") ?? file.type),
    durationMs: Number(form.get("durationMs")),
    bytes: new Uint8Array(await file.arrayBuffer()),
  });

  if (!result.ok) {
    const status = result.code === "not_found" ? 404 : 400;
    return NextResponse.json({ error: result.message }, { status });
  }
  return NextResponse.json(result.data, { status: 201 });
}
