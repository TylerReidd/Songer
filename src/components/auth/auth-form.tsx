"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

/**
 * Phase 1: the form is fully built but not wired to a backend. Submitting
 * explains this and opens the sample workspace. Phase 2 swaps the submit
 * handler for Better Auth's client calls; the markup stays the same.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "sign-up";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    toast("Accounts arrive in Phase 2. Opening the sample workspace instead.");
    router.push("/dashboard");
  }

  return (
    <div className="rounded-xl border bg-surface-elevated p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isSignUp ? "Create your Songbook" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        {isSignUp ? "Free while in development. No card required." : "Sign in to pick up where you left off."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="What should we call you?" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
              <span className="text-xs text-text-muted" aria-disabled="true">
                Forgot password?
              </span>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="mt-2 h-9" disabled={pending}>
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="h-9 w-full" asChild>
        <Link href="/dashboard">Explore the sample workspace</Link>
      </Button>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {isSignUp ? "Already have an account? " : "New to Songbook? "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-medium text-brand hover:text-brand-hover">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
