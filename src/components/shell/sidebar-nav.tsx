"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";

function isActive(item: NavItem, pathname: string, favorite: boolean): boolean {
  const { match } = item;
  const pathMatches = pathname === match.pathname || pathname.startsWith(`${match.pathname}/`);
  if (!pathMatches) return false;
  if (match.favorite === undefined) return true;
  // "My Songs" and "Favorites" share /songs; the query string decides.
  return match.favorite === favorite && pathname === match.pathname;
}

interface SidebarNavProps {
  onNavigate?: () => void;
}

/**
 * Client Component: needs the current URL to highlight the active item.
 * Everything around it (the sidebar frame) stays on the server.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const favorite = searchParams.get("favorite") === "1";

  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item, pathname, favorite);
        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-text-secondary hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-colors",
                active ? "text-brand" : "text-text-muted group-hover:text-text-secondary",
              )}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarNavFallback() {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] font-medium text-text-secondary"
        >
          <item.icon className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
