import { Suspense, type ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { SidebarNav, SidebarNavFallback } from "./sidebar-nav";

/**
 * Server Component frame for the sidebar. `SidebarNav` reads the URL on the
 * client and `userSlot` reads the session on the server; both sit behind
 * Suspense so the frame itself is part of the static shell.
 */
export function Sidebar({ userSlot }: { userSlot: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-14 items-center px-4">
        <Logo href="/dashboard" />
      </div>
      <div className="flex-1 px-3 py-2">
        <Suspense fallback={<SidebarNavFallback />}>
          <SidebarNav />
        </Suspense>
      </div>
      <div className="border-t border-sidebar-border p-3">{userSlot}</div>
    </div>
  );
}
