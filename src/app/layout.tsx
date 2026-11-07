import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Fonts are loaded once at the root and exposed as CSS variables so the
// design tokens in globals.css can reference them. next/font self-hosts the
// files and removes any external network request at runtime.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const lyricSerif = Source_Serif_4({
  variable: "--font-lyric-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Songbook",
    template: "%s · Songbook",
  },
  description:
    "A home for your lyrics, melodies, fragments, and unfinished ideas. Write freely. Organize naturally. Keep creating.",
  applicationName: "Songbook",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Dark is the default experience. A light option lands after the MVP;
      // the tokens for it are already defined in globals.css.
      className={`dark ${geistSans.variable} ${geistMono.variable} ${lyricSerif.variable} h-full`}
      data-lyric-font="serif"
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
