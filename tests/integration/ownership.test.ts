import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Ownership enforcement, exercised against the real PostgreSQL database.
 *
 * The session is mocked so each test can choose who is "signed in"; everything
 * below the session (Zod validation, Prisma queries, cascade rules) is real.
 */

const currentUser = { id: "", email: "", name: "Test", lyricFont: "serif" as const, createdAt: new Date() };

vi.mock("@/lib/session", () => ({
  requireUser: async () => currentUser,
  getSessionUser: async () => currentUser,
  normalizeLyricFont: (value: unknown) => (value === "sans" ? "sans" : "serif"),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

const { db, createTestUser, deleteTestUsers } = await import("../support/db");
const { deleteSong, renameSong, saveSongDocument, updateSong } = await import("@/lib/songs/actions");
const { getSongWithSections, listSongs } = await import("@/lib/songs/queries");
const { attachIdea, deleteIdea } = await import("@/lib/ideas/actions");
const { DEFAULT_LIBRARY_FILTERS } = await import("@/lib/songs/filters");

let alice = "";
let bob = "";
let aliceSongId = "";
let aliceIdeaId = "";

function actAs(userId: string) {
  currentUser.id = userId;
  currentUser.email = `${userId}@test.local`;
}

beforeAll(async () => {
  alice = await createTestUser("alice");
  bob = await createTestUser("bob");
});

afterAll(async () => {
  await deleteTestUsers([alice, bob]);
  await db.$disconnect();
});

beforeEach(async () => {
  await db.song.deleteMany({ where: { ownerId: { in: [alice, bob] } } });
  await db.idea.deleteMany({ where: { ownerId: { in: [alice, bob] } } });
  const song = await db.song.create({
    data: {
      ownerId: alice,
      title: "Alice's song",
      sections: { create: [{ type: "VERSE", content: "private lyrics", position: 0 }] },
    },
  });
  aliceSongId = song.id;
  const idea = await db.idea.create({ data: { ownerId: alice, content: "Alice's idea" } });
  aliceIdeaId = idea.id;
});

describe("read side", () => {
  it("lists only the acting user's songs", async () => {
    await db.song.create({ data: { ownerId: bob, title: "Bob's song" } });
    const forAlice = await listSongs(alice, DEFAULT_LIBRARY_FILTERS);
    const forBob = await listSongs(bob, DEFAULT_LIBRARY_FILTERS);
    expect(forAlice.songs.map((song) => song.title)).toEqual(["Alice's song"]);
    expect(forBob.songs.map((song) => song.title)).toEqual(["Bob's song"]);
  });

  it("returns null for another user's song even with the exact id", async () => {
    expect(await getSongWithSections(bob, aliceSongId)).toBeNull();
    expect(await getSongWithSections(alice, aliceSongId)).not.toBeNull();
  });
});

describe("song mutations", () => {
  it("rejects rename, update, and delete of a song the user does not own", async () => {
    actAs(bob);
    expect(await renameSong(aliceSongId, "Hijacked")).toMatchObject({ ok: false, code: "not_found" });
    expect(await updateSong(aliceSongId, { isFavorite: true })).toMatchObject({ ok: false, code: "not_found" });
    expect(await deleteSong(aliceSongId)).toMatchObject({ ok: false, code: "not_found" });

    const untouched = await db.song.findUnique({ where: { id: aliceSongId } });
    expect(untouched?.title).toBe("Alice's song");
    expect(untouched?.isFavorite).toBe(false);
  });

  it("lets the owner rename, and bumps the revision", async () => {
    actAs(alice);
    expect(await renameSong(aliceSongId, "Renamed")).toEqual({ ok: true, data: undefined });
    const song = await db.song.findUnique({ where: { id: aliceSongId } });
    expect(song?.title).toBe("Renamed");
    expect(song?.revision).toBe(2);
  });

  it("saveSongDocument refuses another user's song", async () => {
    actAs(bob);
    const result = await saveSongDocument({
      songId: aliceSongId,
      revision: 1,
      song: { title: "Stolen" },
      sections: [],
    });
    expect(result).toMatchObject({ ok: false, code: "not_found" });
    const sections = await db.songSection.count({ where: { songId: aliceSongId } });
    expect(sections).toBe(1);
  });

  it("saveSongDocument detects a stale revision instead of overwriting", async () => {
    actAs(alice);
    const first = await saveSongDocument({ songId: aliceSongId, revision: 1, song: { notes: "first" }, sections: [] });
    expect(first.ok).toBe(true);

    const stale = await saveSongDocument({ songId: aliceSongId, revision: 1, song: { notes: "stale" }, sections: [] });
    expect(stale).toMatchObject({ ok: false, code: "conflict" });

    const song = await db.song.findUnique({ where: { id: aliceSongId } });
    expect(song?.notes).toBe("first");
  });

  it("saveSongDocument cannot reassign a section that belongs to another song", async () => {
    const bobSong = await db.song.create({
      data: {
        ownerId: bob,
        title: "Bob's song",
        sections: { create: [{ id: "sec_bob_1", type: "CHORUS", content: "bob's chorus", position: 0 }] },
      },
    });
    actAs(alice);
    const result = await saveSongDocument({
      songId: aliceSongId,
      revision: 1,
      song: {},
      sections: [{ id: "sec_bob_1", type: "VERSE", customLabel: null, content: "overwritten?", position: 0, chords: [] }],
    });
    // The id already exists under Bob's song, so the create collides and the whole transaction rolls back.
    expect(result.ok).toBe(false);
    const bobSection = await db.songSection.findUnique({ where: { id: "sec_bob_1" } });
    expect(bobSection?.songId).toBe(bobSong.id);
    expect(bobSection?.content).toBe("bob's chorus");
  });
});

describe("idea mutations", () => {
  it("rejects deleting another user's idea", async () => {
    actAs(bob);
    expect(await deleteIdea(aliceIdeaId)).toMatchObject({ ok: false, code: "not_found" });
    expect(await db.idea.findUnique({ where: { id: aliceIdeaId } })).not.toBeNull();
  });

  it("refuses to attach an idea to a song the user does not own", async () => {
    const bobIdea = await db.idea.create({ data: { ownerId: bob, content: "Bob's idea" } });
    actAs(bob);
    expect(await attachIdea(bobIdea.id, aliceSongId)).toMatchObject({ ok: false, code: "not_found" });
    const idea = await db.idea.findUnique({ where: { id: bobIdea.id } });
    expect(idea?.songId).toBeNull();
  });
});

describe("cascades", () => {
  it("deleting a user removes their songs, sections, and ideas", async () => {
    const temp = await createTestUser("temp");
    const song = await db.song.create({
      data: { ownerId: temp, title: "Temp", sections: { create: [{ type: "VERSE", content: "x", position: 0 }] } },
    });
    await db.idea.create({ data: { ownerId: temp, content: "y", songId: song.id } });
    await deleteTestUsers([temp]);
    expect(await db.song.count({ where: { ownerId: temp } })).toBe(0);
    expect(await db.songSection.count({ where: { songId: song.id } })).toBe(0);
    expect(await db.idea.count({ where: { ownerId: temp } })).toBe(0);
  });
});
