/** Public facts about this deployment, shared by the legal pages and footer. */
export const SITE = {
  name: "Songbook",
  /** Where people can reach the operator about their data. Set NEXT_PUBLIC_CONTACT_EMAIL in production. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  legalUpdated: "November 16, 2026",
  sourceUrl: "https://github.com",
};
