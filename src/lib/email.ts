import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

interface Email {
  to: string;
  subject: string;
  /** Short intro line shown above the button. */
  intro: string;
  action: { label: string; url: string };
  /** Shown under the button, e.g. expiry and "ignore this if it wasn't you". */
  footer: string;
}

/**
 * Transactional email over SMTP (Gmail with an app password works and is free;
 * any SMTP provider fits the same four variables). Better Auth calls this for
 * verification and password-reset links.
 *
 * Without SMTP credentials in development the message is printed to the
 * server console so the link can be clicked locally. In production missing
 * credentials are an error, so a misconfigured deploy fails loudly instead of
 * silently dropping sign-ups.
 */
const configured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
const dryRun = !configured && (process.env.NODE_ENV !== "production" || process.env.AUTH_TEST_MODE === "on");

let transport: Transporter | null = null;

function getTransport(): Transporter {
  if (!configured) throw new Error("Email is not configured: set SMTP_USER and SMTP_PASS.");
  const port = Number(process.env.SMTP_PORT ?? 465);
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transport;
}

export async function sendEmail(email: Email): Promise<void> {
  const text = `${email.intro}\n\n${email.action.label}: ${email.action.url}\n\n${email.footer}`;

  if (dryRun) {
    console.log(`\n[email] To: ${email.to}\n[email] Subject: ${email.subject}\n${text}\n`);
    return;
  }

  await getTransport().sendMail({
    from: process.env.EMAIL_FROM ?? `Songbook <${process.env.SMTP_USER}>`,
    to: email.to,
    subject: email.subject,
    text,
    html: renderHtml(email),
  });
}

function renderHtml({ intro, action, footer }: Email): string {
  return `<!doctype html>
<body style="margin:0;padding:32px 16px;background:#f6f5f2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1f1d1a">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <p style="margin:0 0 8px;font-size:18px;font-weight:600">Songbook</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.5">${escapeHtml(intro)}</p>
    <a href="${action.url}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#c2410c;color:#fff;font-weight:600;text-decoration:none">${escapeHtml(action.label)}</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#6b6762">${escapeHtml(footer)}</p>
    <p style="margin:16px 0 0;font-size:12px;color:#9a958e;word-break:break-all">Or paste this link: ${action.url}</p>
  </div>
</body>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
}
