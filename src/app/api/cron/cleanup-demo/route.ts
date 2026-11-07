import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEMO_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes demo accounts older than 24 hours. Scheduled by Vercel Cron in
 * production; protected by CRON_SECRET so it cannot be triggered by anyone
 * who guesses the URL. Cascading foreign keys remove sessions, songs,
 * sections, versions, and ideas with the user.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization");
  if (!secret || provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - DEMO_TTL_MS);
  const result = await db.user.deleteMany({ where: { isDemo: true, createdAt: { lt: cutoff } } });
  return NextResponse.json({ deleted: result.count });
}
