import type { SectionType, Song, SongSection, SongWithSections } from "@/lib/domain/types";
import { insertAfter, moveItem, normalizePositions, removeAt } from "@/lib/songs/ordering";

/**
 * Editor state machine. Pure and side-effect free so it can be unit tested
 * without React. The autosave hook observes `dirtyVersion` and the save
 * actions move `saveStatus` through its lifecycle.
 */

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";
export type PanelTab = "details" | "notes" | "versions";

export type SongPatch = Partial<
  Pick<Song, "title" | "status" | "key" | "bpm" | "timeSignature" | "capo" | "tuning" | "notes" | "isFavorite">
>;
export type SectionPatch = Partial<Pick<SongSection, "type" | "customLabel" | "content" | "chords">>;

export interface EditorState {
  song: Song;
  sections: SongSection[];
  saveStatus: SaveStatus;
  /** Incremented on every local edit. The autosave hook keys off it. */
  dirtyVersion: number;
  /** The dirtyVersion that was current when the in-flight save started. */
  savingVersion: number | null;
  lastSavedAt: Date | null;
  panelOpen: boolean;
  panelTab: PanelTab;
  /** Section that should receive focus after the next render, if any. */
  focusSectionId: string | null;
}

export type EditorAction =
  | { type: "song/update"; patch: SongPatch }
  | { type: "section/add"; id: string; sectionType: SectionType; afterId?: string }
  | { type: "section/update"; id: string; patch: SectionPatch }
  | { type: "section/move"; from: number; to: number }
  | { type: "section/moveBy"; id: string; delta: -1 | 1 }
  | { type: "section/duplicate"; id: string; newId: string }
  | { type: "section/remove"; id: string }
  | { type: "save/start" }
  | { type: "save/success"; at: Date; revision: number }
  | { type: "save/failure"; reason: "error" | "conflict" }
  | { type: "document/replace"; song: Song; sections: SongSection[] }
  | { type: "panel/toggle"; open?: boolean }
  | { type: "panel/tab"; tab: PanelTab }
  | { type: "focus/clear" };

export function createInitialState(song: SongWithSections): EditorState {
  const { sections, ...rest } = song;
  return {
    song: rest,
    sections: normalizePositions(sections),
    saveStatus: "idle",
    dirtyVersion: 0,
    savingVersion: null,
    lastSavedAt: null,
    panelOpen: true,
    panelTab: "details",
    focusSectionId: null,
  };
}

function markDirty(state: EditorState): EditorState {
  return { ...state, saveStatus: "dirty", dirtyVersion: state.dirtyVersion + 1 };
}

function newSection(state: EditorState, id: string, type: SectionType): SongSection {
  const now = new Date();
  return {
    id,
    songId: state.song.id,
    type,
    customLabel: null,
    content: "",
    chords: [],
    position: state.sections.length,
    createdAt: now,
    updatedAt: now,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "song/update":
      return markDirty({ ...state, song: { ...state.song, ...action.patch } });

    case "section/add": {
      const section = newSection(state, action.id, action.sectionType);
      const afterIndex = action.afterId
        ? state.sections.findIndex((entry) => entry.id === action.afterId)
        : state.sections.length - 1;
      return markDirty({
        ...state,
        sections: insertAfter(state.sections, afterIndex, section),
        focusSectionId: section.id,
      });
    }

    case "section/update":
      return markDirty({
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.id ? { ...section, ...action.patch, updatedAt: new Date() } : section,
        ),
      });

    case "section/move":
      if (action.from === action.to) return state;
      return markDirty({ ...state, sections: moveItem(state.sections, action.from, action.to) });

    case "section/moveBy": {
      const from = state.sections.findIndex((section) => section.id === action.id);
      const to = from + action.delta;
      if (from < 0 || to < 0 || to >= state.sections.length) return state;
      return markDirty({ ...state, sections: moveItem(state.sections, from, to) });
    }

    case "section/duplicate": {
      const index = state.sections.findIndex((section) => section.id === action.id);
      if (index < 0) return state;
      const source = state.sections[index];
      const copy: SongSection = {
        ...source,
        id: action.newId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return markDirty({
        ...state,
        sections: insertAfter(state.sections, index, copy),
        focusSectionId: copy.id,
      });
    }

    case "section/remove": {
      const index = state.sections.findIndex((section) => section.id === action.id);
      if (index < 0) return state;
      return markDirty({ ...state, sections: removeAt(state.sections, index) });
    }

    case "save/start":
      return { ...state, saveStatus: "saving", savingVersion: state.dirtyVersion };

    case "save/success": {
      // Edits made while the save was in flight keep the editor dirty.
      const stillDirty = state.savingVersion !== state.dirtyVersion;
      return {
        ...state,
        song: { ...state.song, revision: action.revision, updatedAt: action.at },
        saveStatus: stillDirty ? "dirty" : "saved",
        savingVersion: null,
        lastSavedAt: action.at,
      };
    }

    case "save/failure":
      return { ...state, saveStatus: action.reason, savingVersion: null };

    case "document/replace":
      // Server-authoritative reset (e.g. after restoring a version): nothing is dirty.
      return {
        ...state,
        song: action.song,
        sections: normalizePositions(action.sections),
        saveStatus: "idle",
        dirtyVersion: 0,
        savingVersion: null,
        focusSectionId: null,
      };

    case "panel/toggle":
      return { ...state, panelOpen: action.open ?? !state.panelOpen };

    case "panel/tab":
      return { ...state, panelTab: action.tab, panelOpen: true };

    case "focus/clear":
      return state.focusSectionId === null ? state : { ...state, focusSectionId: null };
  }
}

/** Generates ids for sections created on the client before they are persisted. */
export function newClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}
