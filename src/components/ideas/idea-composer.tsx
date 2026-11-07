"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createIdea } from "@/lib/ideas/actions";

/** Quick-capture form. Submits to the createIdea Server Action; Cmd/Ctrl+Enter also captures. */
export function IdeaComposer() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const canSubmit = content.trim().length > 0 && !pending;

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      const result = await createIdea({ title: title || null, content });
      if (result.ok) {
        toast.success("Idea captured");
        setTitle("");
        setContent("");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
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
        onKeyDown={handleKeyDown}
        placeholder="A line, a title, a chord progression, a feeling…"
        aria-label="Idea"
        rows={3}
        maxLength={5000}
        className="lyric-text mt-1 min-h-20 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-text-muted">
          <kbd className="font-mono">⌘</kbd> + <kbd className="font-mono">Enter</kbd> to capture
        </p>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
          Capture
        </Button>
      </div>
    </form>
  );
}
