import Link from "next/link";
import { Music2, Star } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { Song } from "@/lib/domain/types";

export function ContinueWriting({ songs }: { songs: Song[] }) {
  return (
    <section aria-labelledby="continue-writing">
      <SectionHeading title="Continue writing" href="/songs" hrefLabel="All songs" />
      {songs.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No songs yet"
          description="Create your first song and it will show up here, ready to pick back up."
          action={
            <Button asChild>
              <Link href="/songs/song_untitled">New song</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {songs.map((song) => (
            <li key={song.id}>
              <Link
                href={`/songs/${song.id}`}
                className="group flex h-full flex-col rounded-xl border bg-surface-elevated p-4 transition-colors outline-none hover:border-text-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate text-[15px] font-medium text-foreground">{song.title}</h3>
                  {song.isFavorite && (
                    <Star className="size-3.5 shrink-0 fill-brand text-brand" aria-label="Favorite" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-text-muted">
                  {song.key && <span>{song.key}</span>}
                  {song.bpm && <span>{song.bpm} bpm</span>}
                  {!song.key && !song.bpm && <span>No metadata yet</span>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <StatusBadge status={song.status} />
                  <RelativeTime date={song.updatedAt} prefix="Edited" className="text-xs text-text-muted" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
