import "server-only";
import { db } from "@/lib/db";
import type { Idea } from "@/lib/domain/types";

export async function listIdeas(userId: string, query = ""): Promise<Idea[]> {
  const needle = query.trim();
  return db.idea.findMany({
    where: {
      ownerId: userId,
      ...(needle
        ? {
            OR: [
              { content: { contains: needle, mode: "insensitive" } },
              { title: { contains: needle, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}
