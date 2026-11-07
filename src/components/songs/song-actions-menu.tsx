"use client";

import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Copy, MoreHorizontal, PenLine, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/domain/action-result";
import type { Song } from "@/lib/domain/types";
import { deleteSong, duplicateSong, renameSong, updateSong } from "@/lib/songs/actions";

/**
 * Per-song actions. Each handler calls a Server Action inside a transition;
 * the page re-renders from revalidated data when the action completes.
 */
export function SongActionsMenu({ song }: { song: Song }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(song.title);

  function run(work: () => Promise<ActionResult<unknown>>, success: string) {
    startTransition(async () => {
      const result = await work();
      if (result.ok) toast.success(success);
      else toast.error(result.message);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${song.title}`} disabled={pending}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => router.push(`/songs/${song.id}`)}>
            <PenLine aria-hidden="true" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { setTitle(song.title); setRenameOpen(true); }}>
            <PenLine aria-hidden="true" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              run(
                () => updateSong(song.id, { isFavorite: !song.isFavorite }),
                song.isFavorite ? "Removed from favorites" : "Added to favorites",
              )
            }
          >
            <Star aria-hidden="true" />
            {song.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              startTransition(async () => {
                const result = await duplicateSong(song.id);
                if (result.ok) {
                  toast.success("Song duplicated");
                  router.push(`/songs/${result.data.id}`);
                } else toast.error(result.message);
              })
            }
          >
            <Copy aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              run(
                () => updateSong(song.id, { status: song.status === "ARCHIVED" ? "IN_PROGRESS" : "ARCHIVED" }),
                song.status === "ARCHIVED" ? "Song restored" : "Song archived",
              )
            }
          >
            {song.status === "ARCHIVED" ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
            {song.status === "ARCHIVED" ? "Restore" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename song</DialogTitle>
            <DialogDescription>Give this song a new working title.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setRenameOpen(false);
              run(() => renameSong(song.id, title), "Song renamed");
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`rename-${song.id}`}>Title</Label>
              <Input
                id={`rename-${song.id}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoFocus
                maxLength={120}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setRenameOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{song.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the song, its sections, and every saved version. There is no
              undo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep song</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => run(() => deleteSong(song.id), `Deleted “${song.title}”`)}
            >
              Delete song
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
