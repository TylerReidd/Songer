"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "./dnd-modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Layers } from "lucide-react";
import type { Dispatch } from "react";
import { SECTION_TYPE_LABELS, type SectionType, type SongSection } from "@/lib/domain/types";
import { AddSectionMenu } from "./add-section-menu";
import { newClientId, type EditorAction } from "./editor-reducer";
import { SectionCard, type SongContext } from "./section-card";

interface SectionListProps {
  sections: SongSection[];
  focusSectionId: string | null;
  songContext: SongContext;
  dispatch: Dispatch<EditorAction>;
}

const QUICK_ADD: SectionType[] = ["VERSE", "CHORUS", "BRIDGE"];

export function SectionList({ sections, focusSectionId, songContext, dispatch }: SectionListProps) {
  const sensors = useSensors(
    // A small distance threshold keeps clicks on the handle from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((section) => section.id === active.id);
    const to = sections.findIndex((section) => section.id === over.id);
    if (from >= 0 && to >= 0) dispatch({ type: "section/move", from, to });
  }

  const addSection = (type: SectionType) =>
    dispatch({ type: "section/add", id: newClientId(), sectionType: type });

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
        <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-brand-subtle text-brand">
          <Layers className="size-5" aria-hidden="true" />
        </div>
        <h2 className="text-[15px] font-medium">Start with a section</h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">
          Songs are built from parts. Add a verse or a chorus and start writing. You can rearrange
          everything later.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {QUICK_ADD.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addSection(type)}
              className="h-8 rounded-lg border bg-surface-elevated px-3 text-sm transition-colors hover:border-text-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {SECTION_TYPE_LABELS[type]}
            </button>
          ))}
          <AddSectionMenu onAdd={addSection} label="Other" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections.map((section) => section.id)} strategy={verticalListSortingStrategy}>
          <ol className="flex flex-col gap-3" aria-label="Song sections">
            {sections.map((section, index) => (
              <li key={section.id}>
                <SectionCard
                  section={section}
                  index={index}
                  count={sections.length}
                  autoFocus={focusSectionId === section.id}
                  songContext={songContext}
                  onChange={(patch) => dispatch({ type: "section/update", id: section.id, patch })}
                  onMove={(delta) => dispatch({ type: "section/moveBy", id: section.id, delta })}
                  onDuplicate={() =>
                    dispatch({ type: "section/duplicate", id: section.id, newId: newClientId() })
                  }
                  onRemove={() => dispatch({ type: "section/remove", id: section.id })}
                />
              </li>
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <div className="flex justify-center pt-2">
        <AddSectionMenu onAdd={addSection} variant="ghost" />
      </div>
    </div>
  );
}
