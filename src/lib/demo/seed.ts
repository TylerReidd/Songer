import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { DEMO_IDEAS, DEMO_SONGS, type DemoSong } from "./content";

const HOUR = 60 * 60 * 1000;

/**
 * Populates a user's workspace with the sample songs and ideas. Used by the
 * local seed script and by "Try the demo", which creates a throwaway account.
 * Timestamps are set explicitly so the dashboard's "edited 2 hours ago"
 * reads naturally for a fresh demo.
 */
export async function seedDemoContent(db: PrismaClient, userId: string): Promise<void> {
  const now = Date.now();
  const songIdsByTitle = new Map<string, string>();

  for (const song of DEMO_SONGS) {
    const editedAt = new Date(now - song.editedHoursAgo * HOUR);
    const created = await db.song.create({
      data: {
        ownerId: userId,
        title: song.title,
        status: song.status,
        key: song.key,
        bpm: song.bpm,
        timeSignature: song.timeSignature,
        capo: song.capo,
        tuning: song.tuning,
        notes: song.notes,
        isFavorite: song.isFavorite,
        createdAt: new Date(editedAt.getTime() - 14 * 24 * HOUR),
        updatedAt: editedAt,
        sections: {
          create: song.sections.map((section, position) => ({
            type: section.type,
            customLabel: section.customLabel ?? null,
            content: section.content,
            position,
          })),
        },
        versions: {
          create: (song.versions ?? []).map((version) => ({
            name: version.name,
            kind: "MANUAL",
            createdAt: new Date(now - version.daysAgo * 24 * HOUR),
            snapshot: snapshotFor(song, version.title ?? song.title, version.sections),
          })),
        },
      },
      select: { id: true },
    });
    songIdsByTitle.set(song.title, created.id);
  }

  for (const idea of DEMO_IDEAS) {
    const at = new Date(now - idea.hoursAgo * HOUR);
    await db.idea.create({
      data: {
        ownerId: userId,
        title: idea.title,
        content: idea.content,
        songId: idea.song ? (songIdsByTitle.get(idea.song) ?? null) : null,
        createdAt: at,
        updatedAt: at,
      },
    });
  }
}

function snapshotFor(song: DemoSong, title: string, sections: DemoSong["sections"]) {
  return {
    schemaVersion: 1,
    title,
    status: song.status,
    key: song.key,
    bpm: song.bpm,
    timeSignature: song.timeSignature,
    capo: song.capo,
    tuning: song.tuning,
    notes: song.notes,
    sections: sections.map((section, position) => ({
      type: section.type,
      customLabel: section.customLabel ?? null,
      content: section.content,
      position,
    })),
  };
}
