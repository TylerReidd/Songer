/** Small, dependency-free formatting helpers shared by server and client code. */

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const relativeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 minutes ago", "yesterday", "in 2 hours". `now` is injectable for tests. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  let duration = (date.getTime() - now.getTime()) / 1000;
  if (Math.abs(duration) < 45) return "just now";
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return relativeFormatter.format(Math.round(duration), "year");
}

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const shortDateWithYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const longDateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * "Nov 4" when `now` is supplied and shares the year, otherwise "Nov 4, 2025".
 * `now` is never read implicitly: reading the clock during a server render
 * would make an otherwise static page unprerenderable under Cache Components.
 */
export function formatShortDate(date: Date, now?: Date): string {
  return now && date.getFullYear() === now.getFullYear()
    ? shortDate.format(date)
    : shortDateWithYear.format(date);
}

export function formatDateTime(date: Date): string {
  return longDateTime.format(date);
}

/** Time-of-day greeting. The hour is passed in so the client can use local time. */
export function greetingForHour(hour: number): string {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Burning the midnight oil";
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Word count that treats any whitespace run as a separator. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** First non-empty line of a block of text, for previews. */
export function firstLine(text: string): string {
  return text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
}
