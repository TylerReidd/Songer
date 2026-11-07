import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ContinueWriting } from "@/components/dashboard/continue-writing";
import { Greeting } from "@/components/dashboard/greeting";
import { LibrarySummary } from "@/components/dashboard/library-summary";
import { RecentIdeas } from "@/components/dashboard/recent-ideas";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getDashboardSummary } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Server Component: loads everything the dashboard needs in one place and
 * passes plain data to presentational children. Nothing here ships to the
 * browser except the small Greeting and RelativeTime islands.
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const summary = await getDashboardSummary(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title={<Greeting name={user.name} />}
        description="Pick up where you left off."
        actions={
          <Button asChild>
            <Link href="/songs/song_untitled">
              <Plus data-icon="inline-start" />
              New song
            </Link>
          </Button>
        }
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-10">
          <ContinueWriting songs={summary.recentSongs} />
          <LibrarySummary counts={summary.counts} />
          <RecentIdeas ideas={summary.recentIdeas} />
        </div>
        <ActivityFeed entries={summary.activity} />
      </div>
    </div>
  );
}
