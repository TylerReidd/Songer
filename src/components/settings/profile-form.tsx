"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/lib/domain/types";

export function ProfileForm({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name ?? "");
  const dirty = name !== (user.name ?? "");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        toast("Profile updated", {
          description: "Profile changes are not saved while Songbook runs on sample data.",
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
        <Button type="submit" size="sm" disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
