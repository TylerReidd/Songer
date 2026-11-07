import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import type { DashboardSummary } from "@/lib/data";

interface Tile {
  label: string;
  value: number;
  href: string;
}

/**
 * Plain stat tiles. These are counts, not a chart: there is no trend to
 * show, so a number with a label is the honest form.
 */
export function LibrarySummary({ counts }: { counts: DashboardSummary["counts"] }) {
  const tiles: Tile[] = [
    { label: "Songs", value: counts.total, href: "/songs" },
    { label: "In progress", value: counts.inProgress, href: "/songs?status=IN_PROGRESS" },
    { label: "Complete", value: counts.complete, href: "/songs?status=COMPLETE" },
    { label: "Ideas", value: counts.ideas, href: "/ideas" },
  ];

  return (
    <section aria-labelledby="your-library">
      <SectionHeading title="Your library" />
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group bg-surface-elevated p-4 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
          >
            <dt className="text-xs font-medium text-text-secondary">{tile.label}</dt>
            <dd className="mt-1 font-mono text-2xl font-medium tracking-tight tabular-nums text-foreground">
              {tile.value}
            </dd>
          </Link>
        ))}
      </dl>
    </section>
  );
}
