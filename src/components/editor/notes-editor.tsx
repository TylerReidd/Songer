"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesEditor({ value, onChange }: NotesEditorProps) {
  return (
    <div className="flex h-full flex-col gap-1.5">
      <Label htmlFor="song-notes" className="text-xs text-text-secondary">
        Arrangement, production, and anything else worth remembering
      </Label>
      <Textarea
        id="song-notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Keep the verses sparse. Harmony enters on the second chorus."
        className="min-h-56 flex-1 resize-none text-[13.5px] leading-relaxed"
      />
    </div>
  );
}
