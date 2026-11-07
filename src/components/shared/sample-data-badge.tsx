import { FlaskConical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Shown while the app runs on Phase 1 sample data so nobody mistakes the
 * fictional content for real persisted songs.
 */
export function SampleDataBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex h-6 cursor-default items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2 text-[11px] font-medium text-warning">
          <FlaskConical className="size-3" aria-hidden="true" />
          Sample data
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-56">
        Songbook is showing fictional sample content while the database layer is being built.
        Edits are not saved yet.
      </TooltipContent>
    </Tooltip>
  );
}
