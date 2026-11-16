"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset, resetPassword } from "@/lib/auth-client";

/**
 * Step 1 of password reset: ask for an email. The response is the same whether
 * or not the address exists, so the page cannot be used to probe for accounts.
 */
export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    const result = await requestPasswordReset({ email, redirectTo: "/reset-password" });
    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please try again.");
      setPending(false);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card title="Check your email" icon>
        <p className="mt-2 text-sm text-text-secondary">
          If an account exists for that address, we sent a link to choose a new password. It works for one hour.
        </p>
        <BackToSignIn />
      </Card>
    );
  }

  return (
    <Card title="Reset your password" subtitle="Enter your email and we'll send you a link.">
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <ErrorMessage error={error} />
        <Button type="submit" className="mt-2 h-9" disabled={pending}>
          {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          Send reset link
        </Button>
      </form>
      <BackToSignIn />
    </Card>
  );
}

/**
 * Step 2: Better Auth validates the emailed token and redirects here with
 * `?token=` (or `?error=INVALID_TOKEN`). The new password is posted with
 * the token; all existing sessions are revoked on success.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <Card title="Link expired" subtitle="This password reset link is invalid or has already been used.">
        <Button asChild className="mt-6 h-9 w-full">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </Card>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const newPassword = String(new FormData(event.currentTarget).get("password") ?? "");

    const result = await resetPassword({ newPassword, token: token! });
    if (result.error) {
      setError(result.error.message ?? "Something went wrong. Please request a new link.");
      setPending(false);
      return;
    }
    router.push("/sign-in?reset=1");
  }

  return (
    <Card title="Choose a new password">
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <p className="text-xs text-text-muted">At least 8 characters. Other devices will be signed out.</p>
        </div>
        <ErrorMessage error={error} />
        <Button type="submit" className="mt-2 h-9" disabled={pending}>
          {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
          Update password
        </Button>
      </form>
    </Card>
  );
}

function Card({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-surface-elevated p-6 sm:p-8">
      {icon && <MailCheck className="mb-4 size-8 text-brand" aria-hidden />}
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-text-secondary">{subtitle}</p>}
      {children}
    </div>
  );
}

function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {error}
    </p>
  );
}

function BackToSignIn() {
  return (
    <p className="mt-6 text-center text-sm text-text-secondary">
      <Link href="/sign-in" className="font-medium text-brand hover:text-brand-hover">
        Back to sign in
      </Link>
    </p>
  );
}
