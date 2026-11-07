"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** Quick-capture form. Phase 2 wires the submit to a createIdea Server Action. */
export function IdeaComposer() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const canSubmit = content.trim().length > 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        toast("Idea captured", {
          description: "Ideas are not saved while Songbook runs on sample data.",
        });
        setTitle("");
        setContent("");
      }}
      className="rounded-xl border bg-surface-elevated p-4"
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title (optional)"
        aria-label="Idea title"
        maxLength={120}
        className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="A line, a title, a chord progression, a feeling…"
        aria-label="Idea"
        rows={3}
        className="lyric-text mt-1 min-h-20 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-text-muted">
          <kbd className="font-mono">⌘</kbd> + <kbd className="font-mono">Enter</kbd> to capture
        </p>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          <Sparkles data-icon="inline-start" />
          Capture
        </Button>
      </div>
    </form>
  );
}
