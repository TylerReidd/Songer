"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, List, Search, Star, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  LIBRARY_SORT_LABELS,
  LIBRARY_SORTS,
  STATUS_FILTER_OPTIONS,
  libraryFiltersToSearchParams,
  type LibraryFilters,
  type LibrarySort,
  type StatusFilter,
} from "@/lib/songs/filters";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 250;

/**
 * Client Component: owns the controls, but the *state* lives in the URL.
 * Every change navigates with router.replace, the Server Component page
 * re-reads searchParams and re-queries. useTransition keeps the old results
 * visible (with a pending indicator) instead of flashing a loading state.
 */
export function LibraryToolbar({ filters }: { filters: LibraryFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.query);
  // The query we last wrote to the URL. If the URL's query differs from it,
  // the change came from elsewhere (back/forward, a sidebar link) and the
  // input should follow. Adjusting state during render is React's sanctioned
  // way to derive state from a prop change without an extra effect pass.
  const [committedQuery, setCommittedQuery] = useState(filters.query);
  if (filters.query !== committedQuery) {
    setCommittedQuery(filters.query);
    setQuery(filters.query);
  }
  const debounceRef = useRef<number | null>(null);

  function navigate(next: LibraryFilters) {
    setCommittedQuery(next.query);
    const params = libraryFiltersToSearchParams(next).toString();
    startTransition(() => {
      router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
    });
  }

  function update(patch: Partial<LibraryFilters>) {
    navigate({ ...filters, ...patch, page: 1 });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => update({ query: value }), SEARCH_DEBOUNCE_MS);
  }

  useEffect(() => () => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
  }, []);

  return (
    <div
      className="flex flex-col gap-3 md:flex-row md:items-center"
      data-pending={isPending ? "" : undefined}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Search by title"
          aria-label="Search songs by title"
          className="h-9 pl-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => handleQueryChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-text-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.status} onValueChange={(value) => update({ status: value as StatusFilter })}>
          <SelectTrigger className="h-9 w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sort} onValueChange={(value) => update({ sort: value as LibrarySort })}>
          <SelectTrigger className="h-9 w-36" aria-label="Sort songs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_SORTS.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {LIBRARY_SORT_LABELS[sort]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn("size-9", filters.favoritesOnly && "border-brand/50 bg-brand-subtle text-brand")}
              aria-pressed={filters.favoritesOnly}
              aria-label="Show favorites only"
              onClick={() => update({ favoritesOnly: !filters.favoritesOnly })}
            >
              <Star className={cn(filters.favoritesOnly && "fill-current")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Favorites only</TooltipContent>
        </Tooltip>

        <div role="group" aria-label="View" className="flex rounded-lg border">
          {(
            [
              { view: "grid", icon: LayoutGrid, label: "Grid view" },
              { view: "list", icon: List, label: "List view" },
            ] as const
          ).map((option) => (
            <Tooltip key={option.view}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={option.label}
                  aria-pressed={filters.view === option.view}
                  onClick={() => update({ view: option.view })}
                  className={cn(
                    "flex size-9 items-center justify-center transition-colors outline-none first:rounded-l-lg last:rounded-r-lg focus-visible:ring-3 focus-visible:ring-ring/50",
                    filters.view === option.view
                      ? "bg-accent text-foreground"
                      : "text-text-muted hover:text-foreground",
                  )}
                >
                  <option.icon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{option.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
