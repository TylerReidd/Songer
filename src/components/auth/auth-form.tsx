"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
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

/** Notices that arrive via the URL: the verification link redirects here, and so does a finished password reset. */
function noticeFromParams(params: URLSearchParams): string | null {
  if (params.get("reset") === "1") return "Your password has been updated. Sign in with the new one.";
  if (params.get("error")) return "That confirmation link is invalid or has expired. Sign in and we'll send you a new one.";
  return null;
}

/**
 * Client Component: talks to Better Auth through its browser client, which
 * posts to /api/auth and receives the session cookie. On success the router
 * navigates and refreshes so Server Components re-render with the session.
 *
 * Sign-up does not sign in: the account stays locked until the verification
 * link is opened, so the form switches to a "check your email" panel.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const notice = noticeFromParams(searchParams);
  const isSignUp = mode === "sign-up";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
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
      ? await signUp.email({ email, password, name: name || email.split("@")[0], callbackURL: "/sign-in" })
      : await signIn.email({ email, password, callbackURL: "/sign-in" });

    if (result.error) {
      setError(
        result.error.code === "EMAIL_NOT_VERIFIED"
          ? "Your email isn't confirmed yet. We just sent you a new confirmation link."
          : (result.error.message ?? "Something went wrong. Please try again."),
      );
      setPending(false);
      return;
    }

    // No session token means verification is required before the first sign-in.
    if (!result.data.token) {
      setSentTo(email);
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (sentTo) {
    return (
      <div className="rounded-xl border bg-surface-elevated p-6 sm:p-8" role="status">
        <MailCheck className="size-8 text-brand" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-text-secondary">
          We sent a confirmation link to <span className="font-medium text-text-primary">{sentTo}</span>. Open it to
          finish creating your account. The link works for 24 hours.
        </p>
        <p className="mt-6 text-xs text-text-muted">
          Nothing there? Check your spam folder, or sign in with the same password to get a new link.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-surface-elevated p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isSignUp ? "Create your Songbook" : "Welcome back"}
      </h1>
      <p className="mt-1.5 text-sm text-text-secondary">
        {isSignUp ? "Free while in development. No card required." : "Sign in to pick up where you left off."}
      </p>

      {notice && (
        <p role="status" className="mt-4 rounded-md bg-brand/10 px-3 py-2 text-sm text-text-primary">
          {notice}
        </p>
      )}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
              <Link href="/forgot-password" className="text-xs text-text-secondary hover:text-text-primary">
                Forgot password?
              </Link>
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
        {isSignUp && (
          <p className="text-center text-xs text-text-muted">
            By creating an account you agree to the{" "}
            <Link href="/terms" className="underline hover:text-text-secondary">terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-text-secondary">privacy policy</Link>.
          </p>
        )}
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
