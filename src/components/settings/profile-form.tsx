"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/lib/domain/types";
import { updateProfile } from "@/lib/settings/actions";

export function ProfileForm({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name ?? "");
  const [pending, startTransition] = useTransition();
  const dirty = name.trim() !== (user.name ?? "");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await updateProfile({ name });
          if (result.ok) toast.success("Profile updated");
          else toast.error(result.message);
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} readOnly aria-readonly className="text-text-secondary" />
          <p className="text-xs text-text-muted">Email changes arrive with account management.</p>
        </div>
      </div>
      <div>
        <Button type="submit" size="sm" disabled={!dirty || pending}>
          {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
