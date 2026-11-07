import { Suspense, type ReactNode } from "react";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { SidebarUser, SidebarUserFallback } from "./sidebar-user";

/**
 * Application frame: fixed sidebar on desktop, drawer on smaller screens.
 * The user menu is the only part that depends on the request, so it is
 * rendered once inside Suspense and handed to both navs as a slot.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const userSlot = (
    <Suspense fallback={<SidebarUserFallback />}>
      <SidebarUser />
    </Suspense>
  );

  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="hidden border-r lg:sticky lg:top-0 lg:block lg:h-dvh">
        <Sidebar userSlot={userSlot} />
      </aside>
      <MobileNav userSlot={userSlot} />
      <main id="main" className="flex min-w-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
