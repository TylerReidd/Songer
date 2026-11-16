import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readRecordingBytes } from "@/lib/recordings/storage";

/**
 * Streams a recording to its owner. Recordings never get a public URL: this
 * handler is the only way to fetch the bytes, and it checks the session and
 * the song's owner first.
 *
 * Supports a single byte range because Safari's audio element requires
 * 206 responses to seek and, for some containers, to play at all.
 */
export async function GET(request: Request, { params }: RouteContext<"/api/recordings/[id]">) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const meta = await db.songRecording.findFirst({
    where: { id, song: { ownerId: session.user.id } },
    select: { mimeType: true, sizeBytes: true },
  });
  const bytes = meta ? await readRecordingBytes(id) : null;
  if (!meta || !bytes) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": meta.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  });

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
    if (start > end || start >= bytes.byteLength) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.byteLength}` } });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${bytes.byteLength}`);
    headers.set("Content-Length", String(end - start + 1));
    return new Response(new Uint8Array(bytes.slice(start, end + 1)), { status: 206, headers });
  }

  headers.set("Content-Length", String(bytes.byteLength));
  return new Response(new Uint8Array(bytes), { headers });
}
