"use client";

import { useRouter } from "next/navigation";
import { Archive, MoreHorizontal, PenLine, Star, Trash2 } from "lucide-react";
import { useState } from "react";
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
import type { Song } from "@/lib/domain/types";

/**
 * Per-song actions. The menu, rename dialog, and delete confirmation are
 * complete; in Phase 2 each handler calls a Server Action instead of a toast.
 */
export function SongActionsMenu({ song }: { song: Song }) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(song.title);

  const notPersisted = (message: string) =>
    toast(message, { description: "Changes are not saved while Songbook runs on sample data." });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${song.title}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => router.push(`/songs/${song.id}`)}>
            <PenLine aria-hidden="true" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <PenLine aria-hidden="true" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => notPersisted(song.isFavorite ? "Removed from favorites" : "Added to favorites")}
          >
            <Star aria-hidden="true" />
            {song.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => notPersisted(song.status === "ARCHIVED" ? "Song restored" : "Song archived")}
          >
            <Archive aria-hidden="true" />
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
              notPersisted(`Renamed to “${title.trim() || "Untitled"}”`);
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
              onClick={() => notPersisted(`Deleted “${song.title}”`)}
            >
              Delete song
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
