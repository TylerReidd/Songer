"use client";

import Link from "next/link";
import { Link2, MoreHorizontal, Music2, PenLine, Trash2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RelativeTime } from "@/components/shared/relative-time";
import type { Idea } from "@/lib/domain/types";

export interface SongOption {
  id: string;
  title: string;
}

interface IdeaCardProps {
  idea: Idea;
  songs: SongOption[];
}

export function IdeaCard({ idea, songs }: IdeaCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [draft, setDraft] = useState(idea.content);
  const [targetSong, setTargetSong] = useState(idea.songId ?? "");

  const attachedSong = songs.find((song) => song.id === idea.songId);
  const notPersisted = (message: string) =>
    toast(message, { description: "Ideas are not saved while Songbook runs on sample data." });

  return (
    <article className="group flex flex-col rounded-xl border bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {idea.title && <h3 className="text-xs font-medium text-text-secondary">{idea.title}</h3>}
          <p className="lyric-text mt-0.5 text-[16px] leading-relaxed whitespace-pre-wrap text-foreground">
            {idea.content}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Idea actions" className="-mt-1 -mr-1">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <PenLine aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => notPersisted("Converted to a new song")}>
              <Music2 aria-hidden="true" />
              Convert to song
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setAttachOpen(true)}>
              <Link2 aria-hidden="true" />
              {attachedSong ? "Change song" : "Attach to song"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
              <Trash2 aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-muted">
        <RelativeTime date={idea.updatedAt} />
        {attachedSong && (
          <Link
            href={`/songs/${attachedSong.id}`}
            className="inline-flex max-w-[60%] items-center gap-1 truncate rounded-md text-text-secondary outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Music2 className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{attachedSong.title}</span>
          </Link>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit idea</DialogTitle>
            <DialogDescription className="sr-only">Update the text of this idea.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setEditOpen(false);
              notPersisted("Idea updated");
            }}
            className="flex flex-col gap-4"
          >
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={5}
              className="lyric-text"
              aria-label="Idea text"
              autoFocus
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!draft.trim()}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Attach to a song</DialogTitle>
            <DialogDescription>Keep this idea alongside the song it belongs to.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAttachOpen(false);
              const chosen = songs.find((song) => song.id === targetSong);
              notPersisted(chosen ? `Attached to “${chosen.title}”` : "Detached from song");
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`attach-${idea.id}`}>Song</Label>
              <Select value={targetSong || "none"} onValueChange={(value) => setTargetSong(value === "none" ? "" : value)}>
                <SelectTrigger id={`attach-${idea.id}`} className="w-full">
                  <SelectValue placeholder="Choose a song" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No song</SelectItem>
                  {songs.map((song) => (
                    <SelectItem key={song.id} value={song.id}>
                      {song.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAttachOpen(false)}>
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
            <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => notPersisted("Idea deleted")}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
