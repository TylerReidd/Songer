import { describe, expect, it } from "vitest";
import type { Song } from "@/lib/domain/types";
import { DEFAULT_LIBRARY_FILTERS, applyLibraryFilters, libraryFiltersToSearchParams, parseLibraryFilters } from "./filters";

function song(overrides: Partial<Song>): Song {
  return {
    id: overrides.title ?? "x",
    ownerId: "u",
    title: "Untitled",
    status: "IDEA",
    key: null,
    bpm: null,
    timeSignature: null,
    capo: null,
    tuning: null,
    notes: "",
    isFavorite: false,
    revision: 1,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("parseLibraryFilters", () => {
  it("falls back to defaults for missing or invalid values", () => {
    expect(parseLibraryFilters({})).toEqual(DEFAULT_LIBRARY_FILTERS);
    expect(parseLibraryFilters({ status: "BOGUS", sort: "nope", view: "x", page: "-3" })).toEqual(DEFAULT_LIBRARY_FILTERS);
  });

  it("reads valid values and trims the query", () => {
    expect(parseLibraryFilters({ q: "  porch ", status: "COMPLETE", favorite: "1", sort: "title", view: "list", page: "2" })).toEqual({
      query: "porch",
      status: "COMPLETE",
      favoritesOnly: true,
      sort: "title",
      view: "list",
      page: 2,
    });
  });

  it("round-trips through the URL and omits defaults", () => {
    expect(libraryFiltersToSearchParams(DEFAULT_LIBRARY_FILTERS).toString()).toBe("");
    const filters = parseLibraryFilters({ q: "a", status: "IDEA", page: "3" });
    expect(parseLibraryFilters(Object.fromEntries(libraryFiltersToSearchParams(filters)))).toEqual(filters);
  });
});

describe("applyLibraryFilters", () => {
  const songs = [
    song({ title: "Porchlight", status: "IN_PROGRESS", isFavorite: true, updatedAt: new Date("2026-03-01") }),
    song({ title: "Winter Coat", status: "ARCHIVED", updatedAt: new Date("2026-04-01") }),
    song({ title: "Overpass", status: "IN_PROGRESS", updatedAt: new Date("2026-02-01"), createdAt: new Date("2026-02-15") }),
  ];

  it("hides archived songs unless asked for", () => {
    expect(applyLibraryFilters(songs, DEFAULT_LIBRARY_FILTERS).map((s) => s.title)).toEqual(["Porchlight", "Overpass"]);
    expect(applyLibraryFilters(songs, { ...DEFAULT_LIBRARY_FILTERS, status: "ARCHIVED" }).map((s) => s.title)).toEqual(["Winter Coat"]);
  });

  it("searches titles case-insensitively and filters favorites", () => {
    expect(applyLibraryFilters(songs, { ...DEFAULT_LIBRARY_FILTERS, query: "PORCH" }).map((s) => s.title)).toEqual(["Porchlight"]);
    expect(applyLibraryFilters(songs, { ...DEFAULT_LIBRARY_FILTERS, favoritesOnly: true }).map((s) => s.title)).toEqual(["Porchlight"]);
  });

  it("sorts by title and by created date", () => {
    expect(applyLibraryFilters(songs, { ...DEFAULT_LIBRARY_FILTERS, sort: "title" }).map((s) => s.title)).toEqual(["Overpass", "Porchlight"]);
    expect(applyLibraryFilters(songs, { ...DEFAULT_LIBRARY_FILTERS, sort: "created" }).map((s) => s.title)).toEqual(["Overpass", "Porchlight"]);
  });
});
