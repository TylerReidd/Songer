import Link from "next/link";
import { Music2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function SongNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-24">
      <EmptyState
        icon={Music2}
        title="That song isn't here"
        description="It may have been deleted, or the link may belong to someone else's library."
        action={
          <Button asChild>
            <Link href="/songs">Back to my songs</Link>
          </Button>
        }
      />
    </div>
  );
}
