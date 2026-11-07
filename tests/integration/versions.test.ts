import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

/** Version snapshots and restore, against the real database with a mocked session. */

const currentUser = { id: "", email: "", name: "Test", lyricFont: "serif" as const, createdAt: new Date() };
vi.mock("@/lib/session", () => ({
  requireUser: async () => currentUser,
  getSessionUser: async () => currentUser,
  normalizeLyricFont: () => "serif",
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({ redirect: () => { throw new Error("REDIRECT"); }, notFound: () => { throw new Error("NOT_FOUND"); } }));

const { db, createTestUser, deleteTestUsers } = await import("../support/db");
const { createVersion, restoreVersion, saveSongDocument } = await import("@/lib/songs/actions");
const { listSongVersions } = await import("@/lib/songs/queries");

let owner = "";
let stranger = "";

beforeAll(async () => {
  owner = await createTestUser("owner");
  stranger = await createTestUser("stranger");
});
afterAll(async () => {
  await deleteTestUsers([owner, stranger]);
  await db.$disconnect();
});

async function makeSong() {
  return db.song.create({
    data: {
      ownerId: owner,
      title: "Original",
      key: "G major",
      sections: {
        create: [
          { id: `v_${crypto.randomUUID().slice(0, 6)}`, type: "VERSE", content: "verse one", position: 0, chords: [{ root: "G", quality: "maj", beats: 4 }] },
        ],
      },
    },
  });
}

describe("versions", () => {
  it("snapshots the current song including chords, and a stranger cannot", async () => {
    const song = await makeSong();
    currentUser.id = stranger;
    expect(await createVersion(song.id, "Theirs")).toMatchObject({ ok: false, code: "not_found" });

    currentUser.id = owner;
    const created = await createVersion(song.id, "First draft");
    expect(created.ok).toBe(true);

    const versions = await listSongVersions(owner, song.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].snapshot.title).toBe("Original");
    expect(versions[0].snapshot.sections[0].chords).toEqual([{ root: "G", quality: "maj", beats: 4 }]);
    expect(await listSongVersions(stranger, song.id)).toEqual([]);
  });

  it("restores a version, writes a recovery point first, and bumps the revision", async () => {
    const song = await makeSong();
    currentUser.id = owner;
    const created = await createVersion(song.id, "Before rewrite");
    if (!created.ok) throw new Error("setup failed");

    // Rewrite the song after the snapshot.
    const saved = await saveSongDocument({
      songId: song.id,
      revision: 1,
      song: { title: "Rewritten" },
      sections: [{ id: "new_sec_1", type: "CHORUS", customLabel: null, content: "new chorus", position: 0, chords: [] }],
    });
    expect(saved.ok).toBe(true);

    const restored = await restoreVersion(song.id, created.data.id);
    expect(restored.ok).toBe(true);
    if (!restored.ok) return;
    expect(restored.data.song.title).toBe("Original");
    expect(restored.data.song.revision).toBe(3);
    expect(restored.data.sections.map((s) => s.content)).toEqual(["verse one"]);

    const versions = await listSongVersions(owner, song.id);
    expect(versions.map((v) => v.kind)).toEqual(["RECOVERY", "MANUAL"]);
    expect(versions[0].snapshot.title).toBe("Rewritten");
    expect(versions[0].snapshot.sections[0].content).toBe("new chorus");
  });

  it("refuses to restore a version from a different song", async () => {
    const a = await makeSong();
    const b = await makeSong();
    currentUser.id = owner;
    const created = await createVersion(a.id, "A's version");
    if (!created.ok) throw new Error("setup failed");
    expect(await restoreVersion(b.id, created.data.id)).toMatchObject({ ok: false, code: "not_found" });
  });
});
