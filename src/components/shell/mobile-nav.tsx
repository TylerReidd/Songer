"use client";

import { Menu } from "lucide-react";
import { Suspense, useState, type ReactNode } from "react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav, SidebarNavFallback } from "./sidebar-nav";

/** Top bar with a slide-in navigation drawer, shown below the lg breakpoint. */
export function MobileNav({ userSlot }: { userSlot: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex h-14 items-center justify-between border-b bg-sidebar px-4 lg:hidden">
      <Logo href="/dashboard" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open navigation">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center px-4">
              <Logo href="/dashboard" />
            </div>
            <div className="flex-1 px-3 py-2">
              <Suspense fallback={<SidebarNavFallback />}>
                <SidebarNav onNavigate={() => setOpen(false)} />
              </Suspense>
            </div>
            <div className="border-t border-sidebar-border p-3">{userSlot}</div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
