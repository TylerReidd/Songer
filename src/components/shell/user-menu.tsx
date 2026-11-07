"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import type { UserProfile } from "@/lib/domain/types";

function initials(name: string | null, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ user }: { user: UserProfile }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors outline-none hover:bg-sidebar-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-sidebar-accent"
        aria-label="Account menu"
      >
        <Avatar className="size-7 rounded-md">
          <AvatarFallback className="rounded-md bg-brand-subtle text-[11px] font-semibold text-brand">
            {initials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-foreground">
            {user.name ?? "Songwriter"}
          </span>
          <span className="block truncate text-[11.5px] text-text-muted">{user.email}</span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-[13px] font-medium">{user.name ?? "Songwriter"}</span>
          <span className="block text-xs text-text-secondary">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
