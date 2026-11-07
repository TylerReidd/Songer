import { Suspense } from "react";
import { Logo } from "@/components/shared/logo";
import { SampleDataBadge } from "@/components/shared/sample-data-badge";
import { IS_SAMPLE_DATA } from "@/lib/data";
import type { UserProfile } from "@/lib/domain/types";
import { SidebarNav, SidebarNavFallback } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

interface SidebarProps {
  user: UserProfile;
  onNavigate?: () => void;
}

/**
 * Server Component frame for the sidebar. Only the two interactive pieces
 * (active-link highlighting and the account menu) are Client Components.
 * `SidebarNav` reads the URL, so it sits inside a Suspense boundary; that is
 * what lets the rest of the shell prerender statically.
 */
export function Sidebar({ user }: SidebarProps) {
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
      <div className="flex flex-col gap-2 border-t border-sidebar-border p-3">
        {IS_SAMPLE_DATA && (
          <div className="px-2">
            <SampleDataBadge />
          </div>
        )}
        <UserMenu user={user} />
      </div>
    </div>
  );
}
