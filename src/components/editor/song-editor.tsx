"use client";

import { Info } from "lucide-react";
import { useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAutosave, useUnsavedChangesWarning } from "@/hooks/use-autosave";
import type { SongVersion, SongWithSections } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { ContextPanel } from "./context-panel";
import { EditorHeader } from "./editor-header";
import { createInitialState, editorReducer, type EditorState } from "./editor-reducer";
import { MetadataStrip } from "./metadata-strip";
import { SectionList } from "./section-list";
import { TitleInput } from "./title-input";

interface SongEditorProps {
  song: SongWithSections;
  versions: SongVersion[];
}

interface SavePayload {
  songId: string;
  revision: number;
  song: EditorState["song"];
  sections: EditorState["sections"];
}

/**
 * PHASE 1 persistence stand-in. Resolves after a short delay so the save
 * lifecycle (dirty → saving → saved) can be exercised end to end. Phase 3
 * replaces this with a Server Action that performs the revision check.
 */
async function mockSave(_payload: SavePayload): Promise<{ revision: number }> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return { revision: _payload.revision + 1 };
}

/**
 * Client root of the editor. The server page loads the song once and hands
 * it over; from then on this component owns the document and persists it
 * through the autosave hook. Nothing below this line re-fetches.
 */
export function SongEditor({ song, versions }: SongEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, song, createInitialState);

  const buildPayload = (): SavePayload => ({
    songId: state.song.id,
    revision: state.song.revision,
    song: state.song,
    sections: state.sections,
  });

  async function save(payload: SavePayload) {
    try {
      const result = await mockSave(payload);
      dispatch({ type: "save/success", at: new Date(), revision: result.revision });
    } catch {
      dispatch({ type: "save/failure", reason: "error" });
    }
  }

  useAutosave({
    dirtyVersion: state.dirtyVersion,
    getPayload: buildPayload,
    save,
    onStart: () => dispatch({ type: "save/start" }),
  });

  useUnsavedChangesWarning(state.saveStatus === "dirty" || state.saveStatus === "saving");

  // Clear the pending-focus marker once the section has had a chance to mount.
  useEffect(() => {
    if (state.focusSectionId) dispatch({ type: "focus/clear" });
  }, [state.focusSectionId]);

  const panel = (
    <ContextPanel
      song={state.song}
      versions={versions}
      tab={state.panelTab}
      onTabChange={(tab) => dispatch({ type: "panel/tab", tab })}
      onPatch={(patch) => dispatch({ type: "song/update", patch })}
    />
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <EditorHeader
        song={state.song}
        saveStatus={state.saveStatus}
        lastSavedAt={state.lastSavedAt}
        panelOpen={state.panelOpen}
        onPatch={(patch) => dispatch({ type: "song/update", patch })}
        onRetrySave={() => {
          dispatch({ type: "save/start" });
          void save(buildPayload());
        }}
        onTogglePanel={() => dispatch({ type: "panel/toggle" })}
        onShowVersions={() => dispatch({ type: "panel/tab", tab: "versions" })}
      />

      <div className="flex flex-1">
        <div className="min-w-0 flex-1 bg-surface-editor">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
            <TitleInput value={state.song.title} onChange={(title) => dispatch({ type: "song/update", patch: { title } })} />
            <div className="mt-2 flex items-center gap-2">
              <MetadataStrip song={state.song} onEdit={() => dispatch({ type: "panel/tab", tab: "details" })} />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="xs" className="lg:hidden" aria-label="Song details">
                    <Info data-icon="inline-start" />
                    Details
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
                  <SheetTitle className="sr-only">Song details</SheetTitle>
                  {panel}
                </SheetContent>
              </Sheet>
            </div>
            <div className="mt-8">
              <SectionList sections={state.sections} focusSectionId={state.focusSectionId} dispatch={dispatch} />
            </div>
          </div>
        </div>

        <aside
          className={cn(
            "sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[320px] shrink-0 border-l bg-sidebar/50 lg:block",
            !state.panelOpen && "lg:hidden",
          )}
          aria-label="Song details"
        >
          {panel}
        </aside>
      </div>
    </div>
  );
}
