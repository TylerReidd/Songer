"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteUser } from "@/lib/auth-client";

/**
 * Permanent account deletion. Better Auth re-checks the password, deletes the
 * user row, and PostgreSQL cascades remove everything they own.
 */
export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await deleteUser({ password });
      if (result.error) {
        toast.error(result.error.code === "INVALID_PASSWORD" ? "That password is not correct." : (result.error.message ?? "Could not delete the account."));
        return;
      }
      setOpen(false);
      toast.success("Your account and everything in it have been deleted.");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/40 bg-surface-elevated px-4 py-3">
      <div>
        <p className="text-sm font-medium">Delete account</p>
        <p className="mt-0.5 text-xs text-text-secondary">Removes your songs, takes, ideas, and sign-in. This cannot be undone.</p>
      </div>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        Delete…
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Every song, version, take, and idea you have written will be erased immediately. There is no
              recovery. Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-password">Password</Label>
            <Input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my account</AlertDialogCancel>
            {/* A plain button, not AlertDialogAction, so a wrong password keeps the dialog open. */}
            <Button variant="destructive" disabled={pending || password.length === 0} onClick={confirm}>
              Delete everything
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
