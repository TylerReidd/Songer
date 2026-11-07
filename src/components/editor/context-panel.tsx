"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Song, SongVersion } from "@/lib/domain/types";
import { DetailsForm } from "./details-form";
import type { PanelTab, SongPatch } from "./editor-reducer";
import { NotesEditor } from "./notes-editor";
import { VersionList } from "./version-list";

interface ContextPanelProps {
  song: Song;
  versions: SongVersion[];
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onPatch: (patch: SongPatch) => void;
}

const TABS: Array<{ value: PanelTab; label: string }> = [
  { value: "details", label: "Details" },
  { value: "notes", label: "Notes" },
  { value: "versions", label: "Versions" },
];

/** Right-hand panel content. Rendered in a sidebar on desktop and a sheet on mobile. */
export function ContextPanel({ song, versions, tab, onTabChange, onPatch }: ContextPanelProps) {
  return (
    <Tabs value={tab} onValueChange={(value) => onTabChange(value as PanelTab)} className="flex h-full flex-col gap-0">
      <div className="border-b px-3 pt-3 pb-0">
        <TabsList variant="line" className="w-full">
          {TABS.map((entry) => (
            <TabsTrigger key={entry.value} value={entry.value}>
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        <TabsContent value="details" className="mt-0">
          <DetailsForm song={song} onPatch={onPatch} />
        </TabsContent>
        <TabsContent value="notes" className="mt-0 h-full">
          <NotesEditor value={song.notes} onChange={(notes) => onPatch({ notes })} />
        </TabsContent>
        <TabsContent value="versions" className="mt-0">
          <VersionList versions={versions} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
