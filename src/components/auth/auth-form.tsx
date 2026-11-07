"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";
import { startDemo } from "@/lib/demo/actions";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

/** Only allow same-origin relative paths as a post-login destination. */
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

/**
 * Client Component: talks to Better Auth through its browser client, which
 * posts to /api/auth and receives the session cookie. On success the router
 * navigates and refreshes so Server Components re-render with the session.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const isSignUp = mode === "sign-up";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoPending, startDemoTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    const result = isSignUp
      ? await signUp.email({ email, password, name: name || email.split("@")[0] })
      : await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-surface-elevated p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isSignUp ? "Create your Songbook" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        {isSignUp ? "Free while in development. No card required." : "Sign in to pick up where you left off."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate={false}>
        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="What should we call you?" maxLength={80} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={8}
            required
          />
          {isSignUp && <p className="text-xs text-text-muted">At least 8 characters.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="mt-2 h-9" disabled={pending}>
          {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        variant="outline"
        className="h-9 w-full"
        disabled={demoPending}
        onClick={() => startDemoTransition(async () => { await startDemo(); })}
      >
        {demoPending && <Loader2 className="animate-spin" data-icon="inline-start" />}
        Try the demo
      </Button>
      <p className="mt-2 text-center text-xs text-text-muted">
        Creates a private throwaway workspace with sample songs. Deleted after 24 hours.
      </p>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {isSignUp ? "Already have an account? " : "New to Songbook? "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-medium text-brand hover:text-brand-hover">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
