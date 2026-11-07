import "server-only";
import { db } from "@/lib/db";
import type { Song, SongVersion, SongWithSections } from "@/lib/domain/types";
import { LIBRARY_PAGE_SIZE, type LibraryFilters } from "@/lib/songs/filters";
import { parseSnapshot } from "@/lib/validation/snapshot";
import { parseChords } from "@/lib/validation/song";
import type { Prisma, SongVersion as DbSongVersion } from "@/generated/prisma/client";

/**
 * Read-side data access for songs. Every function takes the acting user's id
 * and bakes it into the query, so there is no path that reads a song without
 * an ownership filter. Server Actions in actions.ts own the write side.
 */

function libraryWhere(userId: string, filters: LibraryFilters): Prisma.SongWhereInput {
  return {
    ownerId: userId,
    ...(filters.status === "ACTIVE" ? { status: { not: "ARCHIVED" } } : { status: filters.status }),
    ...(filters.favoritesOnly ? { isFavorite: true } : {}),
    ...(filters.query ? { title: { contains: filters.query, mode: "insensitive" } } : {}),
  };
}

function libraryOrderBy(filters: LibraryFilters): Prisma.SongOrderByWithRelationInput[] {
  switch (filters.sort) {
    case "title":
      return [{ title: "asc" }, { updatedAt: "desc" }];
    case "created":
      return [{ createdAt: "desc" }];
    case "updated":
      return [{ updatedAt: "desc" }];
  }
}

export interface SongPage {
  songs: Song[];
  page: number;
  pageCount: number;
  total: number;
}

export async function listSongs(userId: string, filters: LibraryFilters): Promise<SongPage> {
  const where = libraryWhere(userId, filters);
  const [total, songs] = await Promise.all([
    db.song.count({ where }),
    db.song.findMany({
      where,
      orderBy: libraryOrderBy(filters),
      skip: (filters.page - 1) * LIBRARY_PAGE_SIZE,
      take: LIBRARY_PAGE_SIZE,
    }),
  ]);
  return { songs, page: filters.page, pageCount: Math.max(1, Math.ceil(total / LIBRARY_PAGE_SIZE)), total };
}

/** Lightweight list for pickers (attach idea to song). */
export async function listSongTitles(userId: string): Promise<Array<{ id: string; title: string }>> {
  return db.song.findMany({
    where: { ownerId: userId, status: { not: "ARCHIVED" } },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
}

export async function getSongWithSections(
  userId: string,
  songId: string,
): Promise<SongWithSections | null> {
  const song = await db.song.findFirst({
    where: { id: songId, ownerId: userId },
    include: { sections: { orderBy: { position: "asc" } } },
  });
  if (!song) return null;
  return { ...song, sections: song.sections.map((section) => ({ ...section, chords: parseChords(section.chords) })) };
}

function toVersion(row: DbSongVersion): SongVersion | null {
  const snapshot = parseSnapshot(row.snapshot);
  if (!snapshot) return null;
  return { id: row.id, songId: row.songId, name: row.name, kind: row.kind, snapshot, createdAt: row.createdAt };
}

export async function listSongVersions(userId: string, songId: string): Promise<SongVersion[]> {
  const rows = await db.songVersion.findMany({
    where: { songId, song: { ownerId: userId } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map(toVersion).filter((version): version is SongVersion => version !== null);
}
