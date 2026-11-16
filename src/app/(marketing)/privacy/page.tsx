import type { Metadata } from "next";
import Link from "next/link";
import { ContactLine, LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="Songbook is an independent portfolio project run by one developer. It stores only what it needs to keep your songs, and nothing is sold, shared, or used for advertising. This page explains what that means in practice."
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account details:</strong> your email address, the name you enter, and a hashed form of your password. We never store the password itself.</li>
          <li><strong>Your writing:</strong> songs, sections, lyrics, chords, notes, saved versions, and ideas.</li>
          <li><strong>Voice takes:</strong> audio you choose to record in the editor, up to one minute each. Recording only happens when you press the record button and your browser has granted microphone access.</li>
          <li><strong>Session data:</strong> a sign-in cookie and the time your session was created and last used.</li>
        </ul>
        <p>We do not collect location, contacts, payment details, or analytics about how you use the app, and there are no third-party trackers or advertising scripts.</p>
      </section>

      <section>
        <h2>Why we collect it</h2>
        <p>Your email identifies your account, is used to confirm it when you sign up, and lets you reset a forgotten password. Everything else exists so that your work is there when you come back. We send no newsletters or marketing email.</p>
      </section>

      <section>
        <h2>Where it is stored</h2>
        <p>All data, including audio, lives in a PostgreSQL database at our hosting provider, and is transferred over encrypted connections. The developer can access the database for maintenance and does not read your content for any other purpose.</p>
      </section>

      <section>
        <h2>Who can see it</h2>
        <p>Only you. Songs, takes, and ideas are private to the account that created them. There is no sharing or public profile feature, and nothing you write is used to train models or shown to other users.</p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>Songbook sets one cookie, which keeps you signed in. It is essential to the service and is removed when you sign out. There are no advertising or analytics cookies.</p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>Until you delete it. Deleting a song removes its versions and takes immediately. Deleting your account from Settings removes the account and everything in it; there is no retention afterwards. Demo workspaces created with &ldquo;Try the demo&rdquo; are deleted automatically 24 hours after creation.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>You can view and edit everything you have stored from within the app, and delete it all yourself at any time from Settings. If you are in a region with data-protection rights such as the GDPR and want a copy of your data or a correction we cannot make through the app, contact us and we will handle it within 30 days.</p>
      </section>

      <section>
        <h2>Children</h2>
        <p>Songbook is not directed at children under 13 and we do not knowingly keep accounts for them. If you believe a child has created an account, contact us and it will be removed.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If this policy changes in a way that matters, the date at the top will change and the sign-in page will mention it. See also the <Link href="/terms">terms of use</Link>.</p>
      </section>

      <section>
        <h2>Contact</h2>
        <ContactLine />
      </section>
    </LegalPage>
  );
}
