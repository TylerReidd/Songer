import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/session";
import { LyricFontSync } from "./lyric-font-sync";
import { UserMenu } from "./user-menu";

/**
 * Async Server Component that reads the session. Rendered inside Suspense so
 * the rest of the shell prerenders statically while this streams in.
 */
export async function SidebarUser() {
  const user = await requireUser();
  return (
    <>
      <LyricFontSync font={user.lyricFont} />
      <UserMenu user={user} />
    </>
  );
}

export function SidebarUserFallback() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5" aria-hidden="true">
      <Skeleton className="size-7 rounded-md" />
      <div className="flex-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="mt-1.5 h-3 w-32" />
      </div>
    </div>
  );
}
