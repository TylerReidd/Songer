"use client";

import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  Copy,
  History,
  MoreHorizontal,
  PanelRight,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SONG_STATUS_LABELS, SONG_STATUSES, type Song, type SongStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import type { SaveStatus, SongPatch } from "./editor-reducer";
import { SaveStatusIndicator } from "./save-status";

interface EditorHeaderProps {
  song: Song;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  panelOpen: boolean;
  onPatch: (patch: SongPatch) => void;
  onRetrySave: () => void;
  onTogglePanel: () => void;
  onShowVersions: () => void;
}

export function EditorHeader({
  song,
  saveStatus,
  lastSavedAt,
  panelOpen,
  onPatch,
  onRetrySave,
  onTogglePanel,
  onShowVersions,
}: EditorHeaderProps) {
  const notPersisted = (message: string) =>
    toast(message, { description: "Not saved while Songbook runs on sample data." });

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild aria-label="Back to songs">
              <Link href="/songs">
                <ArrowLeft />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to songs</TooltipContent>
        </Tooltip>

        {/* Below md the status select is hidden, so show a read-only badge instead. */}
        <div className="hidden sm:block md:hidden">
          <StatusBadge status={song.status} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} onRetry={onRetrySave} />

          <Select value={song.status} onValueChange={(value) => onPatch({ status: value as SongStatus })}>
            <SelectTrigger size="sm" aria-label="Song status" className="hidden h-7 w-32 md:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SONG_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {SONG_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-pressed={song.isFavorite}
                aria-label={song.isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => onPatch({ isFavorite: !song.isFavorite })}
              >
                <Star className={cn(song.isFavorite && "fill-brand text-brand")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{song.isFavorite ? "Unfavorite" : "Favorite"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Version history" onClick={onShowVersions}>
                <History />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Version history</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => notPersisted("Song duplicated")}>
                <Copy aria-hidden="true" />
                Duplicate song
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onPatch({ status: song.status === "ARCHIVED" ? "IN_PROGRESS" : "ARCHIVED" })}
              >
                <Archive aria-hidden="true" />
                {song.status === "ARCHIVED" ? "Restore from archive" : "Archive song"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => notPersisted("Delete requires confirmation")}>
                <Trash2 aria-hidden="true" />
                Delete song
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-pressed={panelOpen}
                aria-label={panelOpen ? "Hide song details" : "Show song details"}
                onClick={onTogglePanel}
                className="hidden lg:inline-flex"
              >
                <PanelRight className={cn(panelOpen && "text-brand")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{panelOpen ? "Hide details" : "Show details"}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
