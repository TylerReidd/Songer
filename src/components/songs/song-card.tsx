import Link from "next/link";
import { Star } from "lucide-react";
import { RelativeTime } from "@/components/shared/relative-time";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Song } from "@/lib/domain/types";
import { SongActionsMenu } from "./song-actions-menu";

function Metadata({ song }: { song: Song }) {
  const parts = [song.key, song.bpm ? `${song.bpm} bpm` : null, song.timeSignature].filter(Boolean);
  return (
    <span className="font-mono text-[11px] whitespace-nowrap text-text-muted">
      {parts.length ? parts.join(" · ") : "No metadata yet"}
    </span>
  );
}

export function SongCard({ song }: { song: Song }) {
  return (
    <article className="group relative flex flex-col rounded-xl border bg-surface-elevated p-4 transition-colors has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50 hover:border-text-muted/60">
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 text-[15px] font-medium">
          <Link href={`/songs/${song.id}`} className="outline-none after:absolute after:inset-0 after:rounded-xl">
            <span className="line-clamp-2">{song.title}</span>
          </Link>
        </h3>
        <div className="relative z-10 flex items-center gap-1">
          {song.isFavorite && (
            <Star className="size-3.5 fill-brand text-brand" aria-label="Favorite" />
          )}
          <SongActionsMenu song={song} />
        </div>
      </div>
      <div className="mt-1">
        <Metadata song={song} />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <StatusBadge status={song.status} />
        <RelativeTime date={song.updatedAt} className="text-xs text-text-muted" />
      </div>
    </article>
  );
}

export function SongRow({ song }: { song: Song }) {
  return (
    <li className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50 has-[a:focus-visible]:bg-accent/50 sm:grid-cols-[minmax(0,1fr)_110px_200px_110px_auto]">
      <div className="min-w-0">
        <Link
          href={`/songs/${song.id}`}
          className="flex items-center gap-2 outline-none after:absolute after:inset-0"
        >
          <span className="truncate text-[14px] font-medium">{song.title}</span>
          {song.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-brand text-brand" aria-label="Favorite" />
          )}
        </Link>
        <div className="mt-0.5 sm:hidden">
          <Metadata song={song} />
        </div>
      </div>
      <div className="hidden sm:block">
        <StatusBadge status={song.status} />
      </div>
      <div className="hidden sm:block">
        <Metadata song={song} />
      </div>
      <RelativeTime date={song.updatedAt} className="hidden text-xs text-text-muted sm:block" />
      <div className="relative z-10 flex items-center justify-end gap-2">
        <div className="sm:hidden">
          <StatusBadge status={song.status} />
        </div>
        <SongActionsMenu song={song} />
      </div>
    </li>
  );
}
