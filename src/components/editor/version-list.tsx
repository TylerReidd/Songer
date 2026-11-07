"use client";

import { Eye, History, LifeBuoy, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime } from "@/lib/format";
import { SECTION_TYPE_LABELS, sectionLabel, type SongVersion } from "@/lib/domain/types";

interface VersionListProps {
  versions: SongVersion[];
}

export function VersionList({ versions }: VersionListProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<SongVersion | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<SongVersion | null>(null);

  const notPersisted = (message: string) =>
    toast(message, { description: "Versions are not saved while Songbook runs on sample data." });

  return (
    <div className="flex flex-col gap-4">
      <Button size="sm" className="w-full" onClick={() => setSaveOpen(true)}>
        <Plus data-icon="inline-start" />
        Save current version
      </Button>

      {versions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No versions yet"
          description="Save a named snapshot before a big rewrite so you can always come back."
          className="py-10"
        />
      ) : (
        <ol className="flex flex-col gap-2">
          {versions.map((version) => (
            <li key={version.id} className="rounded-lg border bg-surface-editor p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{version.name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    <RelativeTime date={version.createdAt} />
                    {version.kind === "RECOVERY" && (
                      <span className="ml-2 inline-flex items-center gap-1 text-warning">
                        <LifeBuoy className="size-3" aria-hidden="true" />
                        Recovery
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex gap-1.5">
                <Button variant="outline" size="xs" onClick={() => setPreview(version)}>
                  <Eye data-icon="inline-start" />
                  Preview
                </Button>
                <Button variant="outline" size="xs" onClick={() => setRestoreTarget(version)}>
                  <RotateCcw data-icon="inline-start" />
                  Restore
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save a version</DialogTitle>
            <DialogDescription>
              A snapshot of the title, details, notes, and every section as they are right now.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSaveOpen(false);
              notPersisted(`Saved version “${name.trim() || "Untitled version"}”`);
              setName("");
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="version-name">Name</Label>
              <Input
                id="version-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Before rewriting the bridge"
                maxLength={80}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setSaveOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save version</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>{preview.name}</DialogTitle>
                <DialogDescription>
                  {preview.snapshot.title} · {formatDateTime(preview.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 font-mono text-[11px] text-text-muted">
                {preview.snapshot.key && <span>{preview.snapshot.key}</span>}
                {preview.snapshot.bpm && <span>{preview.snapshot.bpm} bpm</span>}
                {preview.snapshot.timeSignature && <span>{preview.snapshot.timeSignature}</span>}
              </div>
              {preview.snapshot.sections.length === 0 ? (
                <p className="text-sm text-text-secondary">This version has no sections.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {preview.snapshot.sections.map((section) => (
                    <div key={section.position}>
                      <p className="mb-1 font-mono text-[11px] font-semibold tracking-wider text-brand uppercase">
                        {sectionLabel(section) || SECTION_TYPE_LABELS[section.type]}
                      </p>
                      <p className="lyric-text text-[16px] leading-relaxed whitespace-pre-wrap">
                        {section.content || <span className="text-text-muted">(empty)</span>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPreview(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setPreview(null);
                    setRestoreTarget(preview);
                  }}
                >
                  <RotateCcw data-icon="inline-start" />
                  Restore this version
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={restoreTarget !== null} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore “{restoreTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The song will be replaced with this snapshot. Your current state is saved first as a
              recovery version, so nothing is lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => notPersisted(`Restored “${restoreTarget?.name}”`)}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
