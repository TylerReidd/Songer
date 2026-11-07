"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, Copy, GripVertical, MoreHorizontal, Trash2 } from "lucide-react";
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
import { countWords } from "@/lib/format";
import {
  SECTION_TYPE_LABELS,
  SECTION_TYPES,
  type SectionType,
  type SongSection,
} from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { ChordStrip } from "./chord-strip";
import type { SectionPatch } from "./editor-reducer";
import { LyricTextarea } from "./lyric-textarea";

export interface SongContext {
  key: string | null;
  bpm: number | null;
  timeSignature: string | null;
}

interface SectionCardProps {
  section: SongSection;
  index: number;
  count: number;
  autoFocus: boolean;
  songContext: SongContext;
  onChange: (patch: SectionPatch) => void;
  onMove: (delta: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

/**
 * One song section. The drag handle is a real button so the keyboard sensor
 * can pick it up (space, arrows, space), and the menu offers Move up/down as
 * a second keyboard path that needs no drag at all.
 */
export function SectionCard({
  section,
  index,
  count,
  autoFocus,
  songContext,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: SectionCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const words = countWords(section.content);
  const labelId = `section-${section.id}-label`;

  return (
    <section
      ref={setNodeRef}
      style={style}
      aria-labelledby={labelId}
      className={cn(
        "group/section relative rounded-xl border bg-surface-elevated/60 transition-shadow",
        isDragging && "z-10 border-brand/50 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)]",
      )}
    >
      <header className="flex items-center gap-1.5 px-2 pt-2 pb-1">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Drag to reorder ${SECTION_TYPE_LABELS[section.type]} ${index + 1}`}
          className="flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-text-muted outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>

        <Select
          value={section.type}
          onValueChange={(value) => onChange({ type: value as SectionType })}
        >
          <SelectTrigger
            size="sm"
            aria-label="Section type"
            className="h-7 w-auto gap-1 border-transparent bg-transparent px-1.5 font-mono text-[11px] font-semibold tracking-wider text-brand uppercase shadow-none hover:bg-accent dark:bg-transparent"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {SECTION_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          id={labelId}
          value={section.customLabel ?? ""}
          onChange={(event) => onChange({ customLabel: event.target.value || null })}
          placeholder={section.type === "CUSTOM" ? "Name this section" : "Label (optional)"}
          aria-label="Section label"
          className="h-7 min-w-0 flex-1 rounded-md bg-transparent px-1.5 text-[13px] text-text-secondary outline-none placeholder:text-text-muted/60 focus-visible:bg-accent focus-visible:text-foreground"
        />

        <span className="hidden font-mono text-[11px] text-text-muted sm:inline" aria-label={`${words} words`}>
          {words > 0 ? `${words}w` : ""}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Section actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem disabled={index === 0} onSelect={() => onMove(-1)}>
              <ArrowUp aria-hidden="true" />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem disabled={index === count - 1} onSelect={() => onMove(1)}>
              <ArrowDown aria-hidden="true" />
              Move down
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>
              <Copy aria-hidden="true" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onRemove}>
              <Trash2 aria-hidden="true" />
              Delete section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ChordStrip
        chords={section.chords}
        songKey={songContext.key}
        bpm={songContext.bpm}
        timeSignature={songContext.timeSignature}
        onChange={(chords) => onChange({ chords })}
      />

      <div className="px-4 pt-1 pb-4 sm:px-5">
        <LyricTextarea
          value={section.content}
          onChange={(content) => onChange({ content })}
          placeholder="Write your lyrics…"
          aria-label={`${SECTION_TYPE_LABELS[section.type]} lyrics`}
          autoFocusOnMount={autoFocus}
        />
      </div>
    </section>
  );
}
