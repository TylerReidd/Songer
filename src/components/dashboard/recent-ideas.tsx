import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Idea } from "@/lib/domain/types";

export function RecentIdeas({ ideas }: { ideas: Idea[] }) {
  return (
    <section aria-labelledby="recent-ideas">
      <SectionHeading title="Recent ideas" href="/ideas" hrefLabel="All ideas" />
      {ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Nothing captured yet"
          description="Jot down a line, a title, or a chord progression before it slips away."
        />
      ) : (
        <ul className="divide-y rounded-xl border bg-surface-elevated">
          {ideas.map((idea) => (
            <li key={idea.id}>
              <Link
                href="/ideas"
                className="flex items-start gap-3 px-4 py-3 transition-colors outline-none hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  {idea.title && (
                    <p className="text-xs font-medium text-text-secondary">{idea.title}</p>
                  )}
                  <p className="lyric-text line-clamp-2 text-[15px] leading-snug text-foreground">
                    {idea.content}
                  </p>
                </div>
                <RelativeTime date={idea.updatedAt} className="shrink-0 text-xs text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
