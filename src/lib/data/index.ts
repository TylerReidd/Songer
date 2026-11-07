/**
 * Data access layer.
 *
 * Server Components and Server Actions import from this module only. Every
 * function takes the acting user's id so that ownership is part of the query,
 * not a check bolted on afterwards.
 *
 * PHASE 1: backed by in-memory sample data (see ./mock-data.ts).
 * PHASE 2: the same function signatures, backed by Prisma.
 */

import type {
  Idea,
  Song,
  SongVersion,
  SongWithSections,
  UserProfile,
} from "@/lib/domain/types";
import { applyLibraryFilters, type LibraryFilters } from "@/lib/songs/filters";
import { MOCK_IDEAS, MOCK_SONGS, MOCK_USER, MOCK_VERSIONS } from "./mock-data";

/** True while the app runs on sample data. Drives the "Sample data" badge. */
export const IS_SAMPLE_DATA = true;

export async function getCurrentUser(): Promise<UserProfile> {
  return MOCK_USER;
}

function stripSections(song: SongWithSections): Song {
  const { sections, ...rest } = song;
  return rest;
}

export async function listSongs(userId: string, filters: LibraryFilters): Promise<Song[]> {
  const owned = MOCK_SONGS.filter((song) => song.ownerId === userId).map(stripSections);
  return applyLibraryFilters(owned, filters);
}

export async function getSongWithSections(
  userId: string,
  songId: string,
): Promise<SongWithSections | null> {
  const song = MOCK_SONGS.find((entry) => entry.id === songId && entry.ownerId === userId);
  return song ?? null;
}

export async function listSongVersions(userId: string, songId: string): Promise<SongVersion[]> {
  const song = await getSongWithSections(userId, songId);
  if (!song) return [];
  return MOCK_VERSIONS.filter((version) => version.songId === songId).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function listIdeas(userId: string, query = ""): Promise<Idea[]> {
  const needle = query.trim().toLowerCase();
  return MOCK_IDEAS.filter((idea) => idea.ownerId === userId)
    .filter(
      (idea) =>
        !needle ||
        idea.content.toLowerCase().includes(needle) ||
        (idea.title ?? "").toLowerCase().includes(needle),
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export interface DashboardSummary {
  recentSongs: Song[];
  counts: { total: number; inProgress: number; complete: number; ideas: number };
  recentIdeas: Idea[];
  activity: ActivityEntry[];
}

export type ActivityEntry =
  | { kind: "song"; id: string; title: string; status: Song["status"]; at: Date }
  | { kind: "idea"; id: string; preview: string; at: Date }
  | { kind: "version"; id: string; songId: string; songTitle: string; name: string; at: Date };

/**
 * The dashboard's activity feed is derived from `updatedAt` timestamps rather
 * than a dedicated activity table, which keeps the schema small.
 */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const songs = MOCK_SONGS.filter((song) => song.ownerId === userId).map(stripSections);
  const active = songs.filter((song) => song.status !== "ARCHIVED");
  const ideas = await listIdeas(userId);

  const recentSongs = [...active]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);

  const songTitles = new Map(songs.map((song) => [song.id, song.title]));

  const activity: ActivityEntry[] = [
    ...active.map<ActivityEntry>((song) => ({
      kind: "song",
      id: song.id,
      title: song.title,
      status: song.status,
      at: song.updatedAt,
    })),
    ...ideas.map<ActivityEntry>((idea) => ({
      kind: "idea",
      id: idea.id,
      preview: idea.title ?? idea.content,
      at: idea.updatedAt,
    })),
    ...MOCK_VERSIONS.filter((version) => songTitles.has(version.songId)).map<ActivityEntry>(
      (version) => ({
        kind: "version",
        id: version.id,
        songId: version.songId,
        songTitle: songTitles.get(version.songId) ?? "Untitled",
        name: version.name,
        at: version.createdAt,
      }),
    ),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  return {
    recentSongs,
    counts: {
      total: active.length,
      inProgress: active.filter((song) => song.status === "IN_PROGRESS").length,
      complete: active.filter((song) => song.status === "COMPLETE").length,
      ideas: ideas.length,
    },
    recentIdeas: ideas.slice(0, 4),
    activity,
  };
}
