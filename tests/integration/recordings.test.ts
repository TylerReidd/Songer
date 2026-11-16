import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/** Recording storage rules against the real database: ownership, limits, cascade. */

const currentUser = { id: "", email: "", name: "Test", lyricFont: "serif" as const, isDemo: false, createdAt: new Date() };
vi.mock("@/lib/session", () => ({ requireUser: async () => currentUser, getSessionUser: async () => currentUser, normalizeLyricFont: () => "serif" }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const { db, createTestUser, deleteTestUsers } = await import("../support/db");
const { storeRecording } = await import("@/lib/recordings/store");
const { deleteRecording, renameRecording } = await import("@/lib/recordings/actions");
const { listRecordings } = await import("@/lib/recordings/queries");
const { readRecordingBytes } = await import("@/lib/recordings/storage");
const { RECORDINGS_PER_SONG, RECORDING_MAX_BYTES } = await import("@/lib/recordings/limits");

let owner = "";
let stranger = "";
let songId = "";

const bytes = (size: number) => new Uint8Array(size).fill(7);
const take = (name = "Take") => ({ name, mimeType: "audio/webm;codecs=opus", durationMs: 4_000, bytes: bytes(1_000) });

beforeAll(async () => {
  owner = await createTestUser("rec_owner");
  stranger = await createTestUser("rec_stranger");
  songId = (await db.song.create({ data: { ownerId: owner, title: "Memo song" } })).id;
});
afterAll(async () => {
  await deleteTestUsers([owner, stranger]);
  await db.$disconnect();
});

describe("storeRecording", () => {
  it("saves bytes and metadata for the owner, normalizing the mime type", async () => {
    const result = await storeRecording(owner, songId, take("First idea"));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.mimeType).toBe("audio/webm");
    expect(result.data.sizeBytes).toBe(1_000);
    expect((await readRecordingBytes(result.data.id))?.byteLength).toBe(1_000);
    expect((await listRecordings(owner, songId)).map((r) => r.name)).toEqual(["First idea"]);
  });

  it("refuses a stranger, bad formats, and oversized files", async () => {
    expect(await storeRecording(stranger, songId, take())).toMatchObject({ ok: false, code: "not_found" });
    expect(await storeRecording(owner, songId, { ...take(), mimeType: "video/mp4" })).toMatchObject({ ok: false, code: "validation" });
    expect(await storeRecording(owner, songId, { ...take(), bytes: bytes(RECORDING_MAX_BYTES + 1) })).toMatchObject({ ok: false, code: "validation" });
    expect(await storeRecording(owner, songId, { ...take(), durationMs: 120_000 })).toMatchObject({ ok: false, code: "validation" });
    expect(await listRecordings(stranger, songId)).toEqual([]);
  });

  it("caps takes per song", async () => {
    const existing = (await listRecordings(owner, songId)).length;
    for (let i = existing; i < RECORDINGS_PER_SONG; i++) {
      expect((await storeRecording(owner, songId, take(`Take ${i}`))).ok).toBe(true);
    }
    expect(await storeRecording(owner, songId, take("One too many"))).toMatchObject({ ok: false, code: "validation" });
  });
});

describe("rename and delete", () => {
  it("only the owner can rename or delete", async () => {
    const [first] = await listRecordings(owner, songId);
    currentUser.id = stranger;
    expect(await renameRecording(first.id, "Stolen")).toMatchObject({ ok: false, code: "not_found" });
    expect(await deleteRecording(first.id)).toMatchObject({ ok: false, code: "not_found" });

    currentUser.id = owner;
    expect((await renameRecording(first.id, "Renamed")).ok).toBe(true);
    expect((await deleteRecording(first.id)).ok).toBe(true);
    expect(await readRecordingBytes(first.id)).toBeNull();
  });

  it("deleting the song removes its recordings", async () => {
    const song = await db.song.create({ data: { ownerId: owner, title: "Temp" } });
    const saved = await storeRecording(owner, song.id, take());
    if (!saved.ok) throw new Error("setup failed");
    await db.song.delete({ where: { id: song.id } });
    expect(await db.songRecording.count({ where: { songId: song.id } })).toBe(0);
  });
});
