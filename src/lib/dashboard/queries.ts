import "server-only";
import { db } from "@/lib/db";
import type { Idea, Song } from "@/lib/domain/types";

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

const ACTIVITY_LIMIT = 8;

/**
 * One round trip of parallel queries. The activity feed is derived from
 * `updatedAt` timestamps instead of a dedicated activity table.
 */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const activeWhere = { ownerId: userId, status: { not: "ARCHIVED" as const } };

  const [recentSongs, total, inProgress, complete, ideaCount, recentIdeas, recentVersions] =
    await Promise.all([
      db.song.findMany({ where: activeWhere, orderBy: { updatedAt: "desc" }, take: 4 }),
      db.song.count({ where: activeWhere }),
      db.song.count({ where: { ownerId: userId, status: "IN_PROGRESS" } }),
      db.song.count({ where: { ownerId: userId, status: "COMPLETE" } }),
      db.idea.count({ where: { ownerId: userId } }),
      db.idea.findMany({ where: { ownerId: userId }, orderBy: { updatedAt: "desc" }, take: ACTIVITY_LIMIT }),
      db.songVersion.findMany({
        where: { song: activeWhere },
        orderBy: { createdAt: "desc" },
        take: ACTIVITY_LIMIT,
        select: { id: true, songId: true, name: true, createdAt: true, song: { select: { title: true } } },
      }),
    ]);

  const activitySongs = await db.song.findMany({
    where: activeWhere,
    orderBy: { updatedAt: "desc" },
    take: ACTIVITY_LIMIT,
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  const activity: ActivityEntry[] = [
    ...activitySongs.map<ActivityEntry>((song) => ({
      kind: "song",
      id: song.id,
      title: song.title,
      status: song.status,
      at: song.updatedAt,
    })),
    ...recentIdeas.map<ActivityEntry>((idea) => ({
      kind: "idea",
      id: idea.id,
      preview: idea.title ?? idea.content,
      at: idea.updatedAt,
    })),
    ...recentVersions.map<ActivityEntry>((version) => ({
      kind: "version",
      id: version.id,
      songId: version.songId,
      songTitle: version.song.title,
      name: version.name,
      at: version.createdAt,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, ACTIVITY_LIMIT);

  return {
    recentSongs,
    counts: { total, inProgress, complete, ideas: ideaCount },
    recentIdeas: recentIdeas.slice(0, 4),
    activity,
  };
}
