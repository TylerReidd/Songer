"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export function SignOutButton({ variant = "outline" }: { variant?: "outline" | "ghost" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={variant}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut();
          router.push("/");
          router.refresh();
        })
      }
    >
      Sign out
    </Button>
  );
}
