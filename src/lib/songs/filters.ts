import { SONG_STATUSES, type Song, type SongStatus } from "@/lib/domain/types";

/**
 * Library filter model. Filters live in the URL so views are shareable and
 * survive a refresh. These helpers translate between the URL and typed
 * values, and apply the filters in memory. In Phase 2 the same `LibraryFilters`
 * object drives a Prisma `where` clause, and the in-memory `applyLibraryFilters`
 * remains as a reference implementation for unit tests.
 */

export const LIBRARY_SORTS = ["updated", "created", "title"] as const;
export type LibrarySort = (typeof LIBRARY_SORTS)[number];

export const LIBRARY_SORT_LABELS: Record<LibrarySort, string> = {
  updated: "Last edited",
  created: "Date created",
  title: "Title",
};

export const LIBRARY_VIEWS = ["grid", "list"] as const;
export type LibraryView = (typeof LIBRARY_VIEWS)[number];

/** "ACTIVE" means every status except ARCHIVED. */
export type StatusFilter = SongStatus | "ACTIVE";

export const STATUS_FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "ACTIVE", label: "All active" },
  { value: "IDEA", label: "Ideas" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETE", label: "Complete" },
  { value: "ARCHIVED", label: "Archived" },
];

export interface LibraryFilters {
  query: string;
  status: StatusFilter;
  favoritesOnly: boolean;
  sort: LibrarySort;
  view: LibraryView;
  /** 1-based page number. Offset paging is plenty at a personal library's scale. */
  page: number;
}

export const LIBRARY_PAGE_SIZE = 30;

export const DEFAULT_LIBRARY_FILTERS: LibraryFilters = {
  query: "",
  status: "ACTIVE",
  favoritesOnly: false,
  sort: "updated",
  view: "grid",
  page: 1,
};

type SearchParamsLike = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isSongStatus(value: string): value is SongStatus {
  return (SONG_STATUSES as readonly string[]).includes(value);
}

export function parseLibraryFilters(params: SearchParamsLike): LibraryFilters {
  const status = first(params.status) ?? "";
  const sort = first(params.sort) ?? "";
  const view = first(params.view) ?? "";
  const page = Number.parseInt(first(params.page) ?? "1", 10);
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    query: (first(params.q) ?? "").trim().slice(0, 100),
    status: isSongStatus(status) ? status : "ACTIVE",
    favoritesOnly: first(params.favorite) === "1",
    sort: (LIBRARY_SORTS as readonly string[]).includes(sort)
      ? (sort as LibrarySort)
      : DEFAULT_LIBRARY_FILTERS.sort,
    view: (LIBRARY_VIEWS as readonly string[]).includes(view)
      ? (view as LibraryView)
      : DEFAULT_LIBRARY_FILTERS.view,
  };
}

/** Serialize filters back to a query string, omitting defaults to keep URLs clean. */
export function libraryFiltersToSearchParams(filters: LibraryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.status !== DEFAULT_LIBRARY_FILTERS.status) params.set("status", filters.status);
  if (filters.favoritesOnly) params.set("favorite", "1");
  if (filters.sort !== DEFAULT_LIBRARY_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.view !== DEFAULT_LIBRARY_FILTERS.view) params.set("view", filters.view);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function matchesStatusFilter(song: Pick<Song, "status">, status: StatusFilter): boolean {
  return status === "ACTIVE" ? song.status !== "ARCHIVED" : song.status === status;
}

export function compareSongs(a: Song, b: Song, sort: LibrarySort): number {
  switch (sort) {
    case "updated":
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    case "created":
      return b.createdAt.getTime() - a.createdAt.getTime();
    case "title":
      return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
  }
}

export function applyLibraryFilters(songs: readonly Song[], filters: LibraryFilters): Song[] {
  const query = filters.query.toLowerCase();
  return songs
    .filter((song) => matchesStatusFilter(song, filters.status))
    .filter((song) => !filters.favoritesOnly || song.isFavorite)
    .filter((song) => !query || song.title.toLowerCase().includes(query))
    .sort((a, b) => compareSongs(a, b, filters.sort));
}
