"use client";

import { useSyncExternalStore } from "react";
import { formatDateTime, formatRelativeTime, formatShortDate } from "@/lib/format";

interface RelativeTimeProps {
  date: Date;
  className?: string;
  /** Text placed before the time, e.g. "Edited". */
  prefix?: string;
}

/**
 * Renders a stable absolute date on the server, then a relative phrase
 * ("2 hours ago") on the client. Rendering relative text on the server would
 * differ from the client's clock and trigger hydration warnings.
 */
export function RelativeTime({ date, className, prefix }: RelativeTimeProps) {
  // Server render: an absolute date that needs no clock. Client, after
  // hydration: a relative phrase refreshed every minute. The subscribe
  // callback owns the interval, so no setState happens directly in an effect.
  const label = useSyncExternalStore(
    (onStoreChange) => {
      const interval = window.setInterval(onStoreChange, 60_000);
      return () => window.clearInterval(interval);
    },
    () => formatRelativeTime(date),
    () => formatShortDate(date),
  );

  return (
    <time dateTime={date.toISOString()} title={formatDateTime(date)} className={className}>
      {prefix ? `${prefix} ${label}` : label}
    </time>
  );
}
