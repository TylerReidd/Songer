"use client";

import { AlertTriangle, Check, CloudOff, Loader2, RefreshCw } from "lucide-react";
import { RelativeTime } from "@/components/shared/relative-time";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "./editor-reducer";

interface SaveStatusProps {
  status: SaveStatus;
  lastSavedAt: Date | null;
  onRetry: () => void;
}

/**
 * Never says "Saved" until the save has actually resolved. Announced through
 * aria-live so screen reader users hear the transition too.
 */
export function SaveStatusIndicator({ status, lastSavedAt, onRetry }: SaveStatusProps) {
  const base = "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs";

  let content: React.ReactNode;
  switch (status) {
    case "idle":
      content = lastSavedAt ? (
        <span className={cn(base, "text-text-muted")}>
          <Check className="size-3.5" aria-hidden="true" />
          <RelativeTime date={lastSavedAt} prefix="Saved" />
        </span>
      ) : (
        <span className={cn(base, "text-text-muted")}>All changes saved</span>
      );
      break;
    case "dirty":
      content = (
        <span className={cn(base, "text-text-secondary")}>
          <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
          Unsaved changes
        </span>
      );
      break;
    case "saving":
      content = (
        <span className={cn(base, "text-text-secondary")}>
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Saving…
        </span>
      );
      break;
    case "saved":
      content = (
        <span className={cn(base, "text-text-muted")}>
          <Check className="size-3.5 text-brand" aria-hidden="true" />
          Saved
        </span>
      );
      break;
    case "error":
      content = (
        <button
          type="button"
          onClick={onRetry}
          className={cn(base, "bg-destructive/10 text-destructive hover:bg-destructive/20")}
        >
          <CloudOff className="size-3.5" aria-hidden="true" />
          Couldn&apos;t save
          <RefreshCw className="size-3" aria-hidden="true" />
          Retry
        </button>
      );
      break;
    case "conflict":
      content = (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={cn(base, "bg-warning/10 text-warning hover:bg-warning/20")}
        >
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          Changed elsewhere · Reload
        </button>
      );
      break;
  }

  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {content}
    </div>
  );
}
