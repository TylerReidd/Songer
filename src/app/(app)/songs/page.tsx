import type { Metadata } from "next";
import { Music2, SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { LibraryToolbar } from "@/components/songs/library-toolbar";
import { NewSongButton } from "@/components/songs/new-song-button";
import { SongCard, SongRow } from "@/components/songs/song-card";
import { getCurrentUser, listSongs } from "@/lib/data";
import { pluralize } from "@/lib/format";
import { DEFAULT_LIBRARY_FILTERS, parseLibraryFilters } from "@/lib/songs/filters";

export const metadata: Metadata = { title: "My Songs" };

/**
 * Server Component. `searchParams` is a Promise in Next 16 and reading it
 * makes this page dynamic, so the sibling loading.tsx supplies the Suspense
 * boundary that streams the shell first and the results after.
 */
export default async function SongsPage({ searchParams }: PageProps<"/songs">) {
  const filters = parseLibraryFilters(await searchParams);
  const user = await getCurrentUser();
  const songs = await listSongs(user.id, filters);

  const isFiltered =
    filters.query !== DEFAULT_LIBRARY_FILTERS.query ||
    filters.status !== DEFAULT_LIBRARY_FILTERS.status ||
    filters.favoritesOnly;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader
        title={filters.favoritesOnly ? "Favorites" : "My Songs"}
        description={
          songs.length ? `${pluralize(songs.length, "song")}${isFiltered ? " match" : ""}` : undefined
        }
        actions={<NewSongButton />}
      />
      <div className="mt-6">
        <LibraryToolbar filters={filters} />
      </div>

      <div className="mt-6">
        {songs.length === 0 ? (
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No songs match"
              description="Try a different search, or clear the status and favorite filters."
            />
          ) : (
            <EmptyState
              icon={Music2}
              title="Your library is empty"
              description="Every song starts somewhere. Create your first one and start writing."
              action={<NewSongButton />}
            />
          )
        ) : filters.view === "grid" ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {songs.map((song) => (
              <li key={song.id}>
                <SongCard song={song} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y rounded-xl border bg-surface-elevated">
            {songs.map((song) => (
              <SongRow key={song.id} song={song} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
