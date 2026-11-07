import type { ReactNode } from "react";
import type { UserProfile } from "@/lib/domain/types";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

/**
 * Application frame: fixed sidebar on desktop, drawer on smaller screens.
 * The main column scrolls independently so the sidebar stays put.
 */
export function AppShell({ user, children }: { user: UserProfile; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="hidden border-r lg:sticky lg:top-0 lg:block lg:h-dvh">
        <Sidebar user={user} />
      </aside>
      <MobileNav user={user} />
      <main id="main" className="flex min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
