import { LayoutDashboard, Lightbulb, Music2, Settings, Star, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Matches when the pathname starts with this prefix. */
  match: { pathname: string; favorite?: boolean };
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, match: { pathname: "/dashboard" } },
  { label: "My Songs", href: "/songs", icon: Music2, match: { pathname: "/songs", favorite: false } },
  { label: "Ideas", href: "/ideas", icon: Lightbulb, match: { pathname: "/ideas" } },
  { label: "Favorites", href: "/songs?favorite=1", icon: Star, match: { pathname: "/songs", favorite: true } },
  { label: "Settings", href: "/settings", icon: Settings, match: { pathname: "/settings" } },
];
