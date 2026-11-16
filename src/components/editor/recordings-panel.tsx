"use client";

import { useRouter } from "next/navigation";
import { Check, Mic, Pencil, Square, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
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
import { Input } from "@/components/ui/input";
import { useRecorder, type Take } from "@/hooks/use-recorder";
import type { SongRecording } from "@/lib/domain/types";
import { deleteRecording, renameRecording } from "@/lib/recordings/actions";
import { RECORDING_MAX_SECONDS, RECORDINGS_PER_SONG } from "@/lib/recordings/limits";
import { cn } from "@/lib/utils";

interface RecordingsPanelProps {
  songId: string;
  recordings: SongRecording[];
}

function formatClock(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function RecordingsPanel({ songId, recordings }: RecordingsPanelProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const atLimit = recordings.length >= RECORDINGS_PER_SONG;

  async function upload(take: Take) {
    setUploading(true);
    const form = new FormData();
    form.set("file", take.blob, "take");
    form.set("mimeType", take.mimeType);
    form.set("durationMs", String(take.durationMs));
    form.set("name", `Take ${recordings.length + 1}`);
    try {
      const response = await fetch(`/api/songs/${songId}/recordings`, { method: "POST", body: form });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error ?? "The recording could not be saved.");
        return;
      }
      toast.success("Recording saved");
      router.refresh();
    } catch {
      toast.error("The recording could not be saved. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  const recorder = useRecorder(upload);
  const isRecording = recorder.status === "recording";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-surface-editor p-3">
        <div className="flex items-center gap-3">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="icon-lg"
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            disabled={uploading || atLimit || recorder.status === "requesting"}
            onClick={isRecording ? recorder.stop : recorder.start}
            className="shrink-0 rounded-full"
          >
            {isRecording ? <Square className="fill-current" /> : <Mic />}
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className={cn(isRecording ? "text-destructive" : "text-text-secondary")}>
                {isRecording ? "Recording" : uploading ? "Saving…" : "Ready"}
              </span>
              <span className="text-text-muted">
                {formatClock(recorder.elapsedMs)} / {formatClock(RECORDING_MAX_SECONDS * 1000)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-75"
                style={{ width: `${Math.round(Math.min(1, recorder.level * 1.6) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          {recorder.status === "unsupported" && "This browser can't record audio."}
          {recorder.status === "denied" && "Microphone access was blocked. Allow it in the browser's site settings."}
          {recorder.status === "idle" && !atLimit && `Up to ${RECORDING_MAX_SECONDS} seconds. Stops automatically.`}
          {recorder.status === "idle" && atLimit && `This song has ${RECORDINGS_PER_SONG} takes. Delete one to record another.`}
          {recorder.status === "requesting" && "Waiting for microphone permission…"}
          {isRecording && "Press stop when you have what you need."}
        </p>
      </div>

      {recordings.length === 0 ? (
        <EmptyState
          icon={Mic}
          title="No takes yet"
          description="Hum the melody, try a line, or capture the chords. Takes stay with the song."
          className="py-10"
        />
      ) : (
        <ol className="flex flex-col gap-2">
          {recordings.map((recording) => (
            <RecordingItem key={recording.id} recording={recording} />
          ))}
        </ol>
      )}
    </div>
  );
}

function RecordingItem({ recording }: { recording: SongRecording }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(recording.name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function commitRename() {
    setEditing(false);
    if (name.trim() === recording.name) return;
    startTransition(async () => {
      const result = await renameRecording(recording.id, name);
      if (result.ok) router.refresh();
      else {
        toast.error(result.message);
        setName(recording.name);
      }
    });
  }

  return (
    <li className="rounded-lg border bg-surface-editor p-3">
      <div className="flex items-center justify-between gap-2">
        {editing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              commitRename();
            }}
            className="flex flex-1 items-center gap-1"
          >
            <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} autoFocus className="h-7 text-[13px]" aria-label="Take name" />
            <Button type="submit" variant="ghost" size="icon-xs" aria-label="Save name"><Check /></Button>
            <Button type="button" variant="ghost" size="icon-xs" aria-label="Cancel" onClick={() => { setEditing(false); setName(recording.name); }}><X /></Button>
          </form>
        ) : (
          <>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{recording.name}</p>
              <p className="text-xs text-text-muted">
                {formatClock(recording.durationMs)} · <RelativeTime date={recording.createdAt} />
              </p>
            </div>
            <div className="flex shrink-0 items-center">
              <Button variant="ghost" size="icon-xs" aria-label="Rename take" disabled={pending} onClick={() => setEditing(true)}><Pencil /></Button>
              <Button variant="ghost" size="icon-xs" aria-label="Delete take" disabled={pending} onClick={() => setDeleteOpen(true)}><Trash2 /></Button>
            </div>
          </>
        )}
      </div>
      {/* The native element handles seeking, Safari's range requests, and keyboard control for free. */}
      <audio controls preload="metadata" src={`/api/recordings/${recording.id}`} className="mt-2 h-9 w-full" aria-label={`Play ${recording.name}`} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{recording.name}”?</AlertDialogTitle>
            <AlertDialogDescription>The audio is removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteRecording(recording.id);
                  if (result.ok) {
                    toast.success("Recording deleted");
                    router.refresh();
                  } else toast.error(result.message);
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
