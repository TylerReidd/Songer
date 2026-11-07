import Link from "next/link";
import { History, Lightbulb, Music2 } from "lucide-react";
import { RelativeTime } from "@/components/shared/relative-time";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ActivityEntry } from "@/lib/dashboard/queries";
import { SONG_STATUS_LABELS } from "@/lib/domain/types";

function describe(entry: ActivityEntry) {
  switch (entry.kind) {
    case "song":
      return {
        icon: Music2,
        href: `/songs/${entry.id}`,
        primary: entry.title,
        secondary: `Edited · ${SONG_STATUS_LABELS[entry.status]}`,
      };
    case "idea":
      return { icon: Lightbulb, href: "/ideas", primary: entry.preview, secondary: "Idea captured" };
    case "version":
      return {
        icon: History,
        href: `/songs/${entry.songId}`,
        primary: entry.songTitle,
        secondary: `Version saved · ${entry.name}`,
      };
  }
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <section aria-labelledby="creative-activity">
      <SectionHeading title="Creative activity" />
      <ol className="relative ml-2 border-l border-border pl-5">
        {entries.map((entry) => {
          const item = describe(entry);
          return (
            <li key={`${entry.kind}-${entry.id}`} className="relative pb-5 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-1 -left-[25px] flex size-4 items-center justify-center rounded-full border bg-background"
              >
                <item.icon className="size-2.5 text-text-muted" />
              </span>
              <Link
                href={item.href}
                className="block rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <p className="truncate text-sm text-foreground">{item.primary}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {item.secondary} · <RelativeTime date={entry.at} />
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
