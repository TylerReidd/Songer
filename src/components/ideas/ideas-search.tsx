"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

/** Debounced search that stores the query in the URL (?q=). */
export function IdeasSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  // See LibraryToolbar for why this is a render-time sync rather than an effect.
  const [committedQuery, setCommittedQuery] = useState(initialQuery);
  if (initialQuery !== committedQuery) {
    setCommittedQuery(initialQuery);
    setQuery(initialQuery);
  }
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  function change(value: string) {
    setQuery(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const trimmed = value.trim();
      setCommittedQuery(trimmed);
      startTransition(() => {
        router.replace(trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname, {
          scroll: false,
        });
      });
    }, 250);
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={query}
        onChange={(event) => change(event.target.value)}
        placeholder="Search ideas"
        aria-label="Search ideas"
        className="h-9 pl-9"
      />
      {query && (
        <button
          type="button"
          onClick={() => change("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-text-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
