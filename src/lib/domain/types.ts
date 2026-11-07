import type { Chord } from "@/lib/music/chords";

export type { Chord };

/**
 * Shared domain types for Songbook.
 *
 * These describe the shapes that flow between the database layer, Server
 * Components, and Client Components. In Phase 2 the Prisma schema mirrors
 * these exactly; keeping them here means UI code never imports Prisma types
 * directly, which keeps the client bundle free of ORM code.
 */

export const SONG_STATUSES = ["IDEA", "IN_PROGRESS", "COMPLETE", "ARCHIVED"] as const;
export type SongStatus = (typeof SONG_STATUSES)[number];

export const SONG_STATUS_LABELS: Record<SongStatus, string> = {
  IDEA: "Idea",
  IN_PROGRESS: "In progress",
  COMPLETE: "Complete",
  ARCHIVED: "Archived",
};

export const SECTION_TYPES = [
  "INTRO",
  "VERSE",
  "PRE_CHORUS",
  "CHORUS",
  "BRIDGE",
  "INSTRUMENTAL",
  "OUTRO",
  "CUSTOM",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  INTRO: "Intro",
  VERSE: "Verse",
  PRE_CHORUS: "Pre-Chorus",
  CHORUS: "Chorus",
  BRIDGE: "Bridge",
  INSTRUMENTAL: "Instrumental",
  OUTRO: "Outro",
  CUSTOM: "Custom",
};

const KEY_ROOTS = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as const;
export const MUSICAL_KEYS: readonly string[] = KEY_ROOTS.flatMap((root) => [
  `${root} major`,
  `${root} minor`,
]);

export const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "2/4", "12/8", "5/4", "7/8"] as const;

export const BPM_MIN = 20;
export const BPM_MAX = 400;
export const CAPO_MAX = 12;

export interface Song {
  id: string;
  ownerId: string;
  title: string;
  status: SongStatus;
  key: string | null;
  bpm: number | null;
  timeSignature: string | null;
  capo: number | null;
  tuning: string | null;
  notes: string;
  isFavorite: boolean;
  /** Optimistic-concurrency token. Incremented on every persisted change. */
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SongSection {
  id: string;
  songId: string;
  type: SectionType;
  customLabel: string | null;
  content: string;
  position: number;
  /** Chord sketch for this section; empty when none. */
  chords: Chord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SongWithSections extends Song {
  sections: SongSection[];
}

/**
 * The persisted shape of a version snapshot. It is versioned so a later
 * change to the song model can migrate old snapshots on read.
 */
export type SongSnapshotV1 = {
  schemaVersion: 1;
  title: string;
  status: SongStatus;
  key: string | null;
  bpm: number | null;
  timeSignature: string | null;
  capo: number | null;
  tuning: string | null;
  notes: string;
  sections: Array<{
    type: SectionType;
    customLabel: string | null;
    content: string;
    position: number;
    chords: Chord[];
  }>;
};
export type SongSnapshot = SongSnapshotV1;

export type VersionKind = "MANUAL" | "RECOVERY";

export interface SongVersion {
  id: string;
  songId: string;
  name: string;
  kind: VersionKind;
  snapshot: SongSnapshot;
  createdAt: Date;
}

export interface Idea {
  id: string;
  ownerId: string;
  title: string | null;
  content: string;
  songId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type LyricFont = "serif" | "sans";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  lyricFont: LyricFont;
  createdAt: Date;
}

/** Display label for a section: the custom label if set, otherwise the type. */
export function sectionLabel(section: Pick<SongSection, "type" | "customLabel">): string {
  const custom = section.customLabel?.trim();
  return custom ? custom : SECTION_TYPE_LABELS[section.type];
}
