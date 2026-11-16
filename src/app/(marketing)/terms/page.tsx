import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="These are the plain-language terms for using Songbook. By creating an account you agree to them."
    >
      <section>
        <h2>What Songbook is</h2>
        <p>Songbook is a free, independent portfolio project for writing and organizing songs. It is provided as a personal project, not as a commercial service, and may change or go offline without notice.</p>
      </section>

      <section>
        <h2>Your content is yours</h2>
        <p>You keep every right to the lyrics, chords, notes, and recordings you put into Songbook. We claim no ownership and no licence beyond what is needed to store your work and show it back to you. We will not publish, share, or train anything on your content.</p>
        <p>You are responsible for what you upload: only record and store material you have the right to use.</p>
      </section>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>You must be at least 13 years old.</li>
          <li>Use a real email address you control; it is needed to confirm the account and to reset your password.</li>
          <li>Keep your password private. Activity under your account is treated as yours.</li>
          <li>You can delete your account at any time from Settings. Deletion is immediate and permanent.</li>
        </ul>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>Do not use Songbook to store unlawful material, to attempt to access other people&apos;s accounts or data, to probe or overload the service, or to send abuse through its email features. Accounts used this way may be removed.</p>
      </section>

      <section>
        <h2>Back up what matters</h2>
        <p>Songbook saves your work automatically and keeps the versions you save, but it is one developer&apos;s project without a guarantee of availability or backups. Keep your own copy of anything you cannot afford to lose.</p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind. To the fullest extent permitted by law, the developer is not liable for lost data, lost work, or any indirect damages arising from using, or being unable to use, Songbook.</p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>If the terms change materially, the date at the top will be updated. Continuing to use Songbook after a change means you accept the new terms. Our <Link href="/privacy">privacy policy</Link> explains how data is handled.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <ContactLine />
      </section>
    </LegalPage>
  );
}
