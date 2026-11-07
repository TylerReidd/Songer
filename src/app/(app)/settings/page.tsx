import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LyricFontPreference } from "@/components/settings/lyric-font-preference";
import { ProfileForm } from "@/components/settings/profile-form";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { PageHeader } from "@/components/shell/page-header";
import { formatShortDate } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

function SettingsSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t py-8 first:border-t-0 first:pt-0 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

/**
 * Only settings backed by working behavior appear here. Theme selection is
 * intentionally absent until the light theme ships.
 */
export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <PageHeader title="Settings" description="Your profile and how the editor feels." />
      <div className="mt-8">
        <SettingsSection title="Profile" description="How you appear in Songbook.">
          <ProfileForm user={user} />
        </SettingsSection>
        <SettingsSection title="Editor typography" description="The typeface used for lyrics and ideas.">
          <LyricFontPreference initial={user.lyricFont} />
        </SettingsSection>
        <SettingsSection title="Account" description="Membership and sessions.">
          <dl className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border bg-surface-elevated px-4 py-3">
              <dt className="text-text-secondary">Member since</dt>
              <dd className="font-mono text-xs">{formatShortDate(user.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-surface-elevated px-4 py-3">
              <dt className="text-text-secondary">Sign out of this device</dt>
              <dd>
                <SignOutButton />
              </dd>
            </div>
          </dl>
        </SettingsSection>
      </div>
    </div>
  );
}
