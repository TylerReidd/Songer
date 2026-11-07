import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 talks to PostgreSQL through a driver adapter instead of the old
 * Rust engine, so the client is constructed with a `pg` pool. The pool is kept
 * small: on serverless each instance gets its own, and the database's pooler
 * (PgBouncer / Neon) multiplexes across instances.
 *
 * The singleton on `globalThis` survives Next.js dev-mode hot reloads, which
 * would otherwise open a new pool on every file change.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  const adapter = new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5_000 });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
