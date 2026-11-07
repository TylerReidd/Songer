import { SONG_STATUS_LABELS, type SongStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<SongStatus, string> = {
  IDEA: "bg-secondary text-text-secondary",
  IN_PROGRESS: "bg-brand-subtle text-brand",
  COMPLETE: "bg-foreground/8 text-foreground",
  ARCHIVED: "bg-transparent text-text-muted ring-1 ring-inset ring-border",
};

const DOT_STYLES: Record<SongStatus, string> = {
  IDEA: "bg-text-muted",
  IN_PROGRESS: "bg-brand",
  COMPLETE: "bg-foreground",
  ARCHIVED: "bg-text-muted",
};

export function StatusBadge({ status, className }: { status: SongStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium whitespace-nowrap",
        STATUS_STYLES[status],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", DOT_STYLES[status])} />
      {SONG_STATUS_LABELS[status]}
    </span>
  );
}
