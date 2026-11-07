"use client";

import { Info } from "lucide-react";
import { useEffect, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useAutosave, useFlushOnHide, useUnsavedChangesWarning } from "@/hooks/use-autosave";
import type { SongVersion, SongWithSections } from "@/lib/domain/types";
import { createVersion, restoreVersion, saveSongDocument } from "@/lib/songs/actions";
import { cn } from "@/lib/utils";
import type { SaveSongDocumentInput } from "@/lib/validation/song";
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

/** Shapes editor state into the payload the saveSongDocument action validates. */
function toSavePayload(state: EditorState): SaveSongDocumentInput {
  const { song, sections } = state;
  return {
    songId: song.id,
    revision: song.revision,
    song: {
      title: song.title,
      status: song.status,
      key: song.key,
      bpm: song.bpm,
      timeSignature: song.timeSignature,
      capo: song.capo,
      tuning: song.tuning,
      notes: song.notes,
      isFavorite: song.isFavorite,
    },
    sections: sections.map((section, position) => ({
      id: section.id,
      type: section.type,
      customLabel: section.customLabel,
      content: section.content,
      chords: section.chords,
      position,
    })),
  };
}

/**
 * Client root of the editor. The server page loads the song once and hands
 * it over; from then on this component owns the document and persists it
 * through the autosave hook. Nothing below this line re-fetches.
 */
export function SongEditor({ song, versions }: SongEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, song, createInitialState);

  const buildPayload = () => toSavePayload(state);

  /**
   * Runs the Server Action and folds its result into the reducer. A stale
   * revision comes back as `conflict`; a thrown error (network, server) is a
   * retryable `error`. Neither ever reports "Saved".
   */
  async function save(payload: SaveSongDocumentInput) {
    try {
      const result = await saveSongDocument(payload);
      if (result.ok) {
        dispatch({ type: "save/success", at: result.data.updatedAt, revision: result.data.revision });
      } else if (result.code === "conflict") {
        dispatch({ type: "save/failure", reason: "conflict" });
      } else {
        dispatch({ type: "save/failure", reason: "error" });
        toast.error(result.message);
      }
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

  const hasPendingEdits = state.saveStatus === "dirty" || state.saveStatus === "saving";
  useUnsavedChangesWarning(hasPendingEdits);
  useFlushOnHide(hasPendingEdits, () => ({
    url: `/api/songs/${state.song.id}/flush`,
    body: buildPayload(),
  }));

  /** Versions snapshot what the server has, so pending edits are saved first. */
  async function handleCreateVersion(name: string) {
    if (hasPendingEdits) {
      dispatch({ type: "save/start" });
      await save(buildPayload());
    }
    const result = await createVersion(state.song.id, name);
    if (result.ok) toast.success(`Saved version “${name || "Untitled version"}”`);
    else toast.error(result.message);
  }

  async function handleRestoreVersion(versionId: string, versionName: string) {
    const result = await restoreVersion(state.song.id, versionId);
    if (result.ok) {
      dispatch({ type: "document/replace", song: result.data.song, sections: result.data.sections });
      toast.success(`Restored “${versionName}”`, { description: "A recovery version of the previous state was saved." });
    } else toast.error(result.message);
  }

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
      onCreateVersion={handleCreateVersion}
      onRestoreVersion={handleRestoreVersion}
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
              <SectionList
                sections={state.sections}
                focusSectionId={state.focusSectionId}
                songContext={{ key: state.song.key, bpm: state.song.bpm, timeSignature: state.song.timeSignature }}
                dispatch={dispatch}
              />
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
