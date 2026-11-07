import { describe, expect, it } from "vitest";
import type { SongWithSections } from "@/lib/domain/types";
import { createInitialState, editorReducer, type EditorState } from "./editor-reducer";

const now = new Date("2026-01-01");
const song: SongWithSections = {
  id: "s1",
  ownerId: "u",
  title: "Test",
  status: "IDEA",
  key: null,
  bpm: null,
  timeSignature: null,
  capo: null,
  tuning: null,
  notes: "",
  isFavorite: false,
  revision: 1,
  createdAt: now,
  updatedAt: now,
  sections: [
    { id: "a", songId: "s1", type: "VERSE", customLabel: null, content: "a", position: 0, chords: [], createdAt: now, updatedAt: now },
    { id: "b", songId: "s1", type: "CHORUS", customLabel: null, content: "b", position: 1, chords: [], createdAt: now, updatedAt: now },
  ],
};

const ids = (state: EditorState) => state.sections.map((s) => s.id);

describe("editorReducer", () => {
  it("starts clean and marks edits dirty with a rising version", () => {
    const initial = createInitialState(song);
    expect(initial.saveStatus).toBe("idle");
    const edited = editorReducer(initial, { type: "song/update", patch: { title: "New" } });
    expect(edited.saveStatus).toBe("dirty");
    expect(edited.dirtyVersion).toBe(1);
    expect(edited.song.title).toBe("New");
  });

  it("adds, duplicates, moves, and removes sections keeping positions contiguous", () => {
    let state = createInitialState(song);
    state = editorReducer(state, { type: "section/add", id: "c", sectionType: "BRIDGE" });
    expect(ids(state)).toEqual(["a", "b", "c"]);
    expect(state.focusSectionId).toBe("c");

    state = editorReducer(state, { type: "section/duplicate", id: "a", newId: "a2" });
    expect(ids(state)).toEqual(["a", "a2", "b", "c"]);
    expect(state.sections[1].content).toBe("a");

    state = editorReducer(state, { type: "section/moveBy", id: "c", delta: -1 });
    expect(ids(state)).toEqual(["a", "a2", "c", "b"]);

    state = editorReducer(state, { type: "section/remove", id: "a2" });
    expect(ids(state)).toEqual(["a", "c", "b"]);
    expect(state.sections.map((s) => s.position)).toEqual([0, 1, 2]);
  });

  it("does not move past the ends", () => {
    const state = createInitialState(song);
    expect(editorReducer(state, { type: "section/moveBy", id: "a", delta: -1 })).toBe(state);
    expect(editorReducer(state, { type: "section/moveBy", id: "b", delta: 1 })).toBe(state);
  });

  it("reports saved only when nothing changed during the save", () => {
    let state = editorReducer(createInitialState(song), { type: "song/update", patch: { notes: "x" } });
    state = editorReducer(state, { type: "save/start" });
    expect(state.saveStatus).toBe("saving");
    const clean = editorReducer(state, { type: "save/success", at: now, revision: 2 });
    expect(clean.saveStatus).toBe("saved");
    expect(clean.song.revision).toBe(2);

    // An edit that lands mid-flight keeps the editor dirty after the response.
    const editedMidFlight = editorReducer(state, { type: "song/update", patch: { notes: "y" } });
    const stillDirty = editorReducer(editedMidFlight, { type: "save/success", at: now, revision: 2 });
    expect(stillDirty.saveStatus).toBe("dirty");
  });

  it("surfaces failures and conflicts distinctly", () => {
    const saving = editorReducer(editorReducer(createInitialState(song), { type: "song/update", patch: {} }), { type: "save/start" });
    expect(editorReducer(saving, { type: "save/failure", reason: "error" }).saveStatus).toBe("error");
    expect(editorReducer(saving, { type: "save/failure", reason: "conflict" }).saveStatus).toBe("conflict");
  });

  it("document/replace resets to a clean server state", () => {
    const dirty = editorReducer(createInitialState(song), { type: "song/update", patch: { title: "Dirty" } });
    const replaced = editorReducer(dirty, { type: "document/replace", song: { ...song, title: "Restored", revision: 5 }, sections: [] });
    expect(replaced.song.title).toBe("Restored");
    expect(replaced.saveStatus).toBe("idle");
    expect(replaced.dirtyVersion).toBe(0);
    expect(replaced.sections).toEqual([]);
  });
});
