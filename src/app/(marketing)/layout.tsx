import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
];

/** Public site frame. Statically prerendered; no session or data access. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav aria-label="Site" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              A quiet workspace for songwriters. Lyrics, structure, and musical notes, kept together
              and ready when you are.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h2 className="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase">Product</h2>
              <ul className="space-y-2 text-text-secondary">
                <li><Link className="hover:text-foreground" href="/#features">Features</Link></li>
                <li><Link className="hover:text-foreground" href="/#about">About</Link></li>
                <li><Link className="hover:text-foreground" href="/sign-up">Get started</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase">Account</h2>
              <ul className="space-y-2 text-text-secondary">
                <li><Link className="hover:text-foreground" href="/sign-in">Sign in</Link></li>
                <li><Link className="hover:text-foreground" href="/dashboard">Open workspace</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-semibold tracking-wider text-text-muted uppercase">Project</h2>
              <ul className="space-y-2 text-text-secondary">
                <li>
                  <a className="hover:text-foreground" href="https://github.com" rel="noreferrer" target="_blank">
                    Source code
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground" href="https://nextjs.org" rel="noreferrer" target="_blank">
                    Built with Next.js
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60">
          <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-text-muted sm:px-6">
            © Songbook. An independent portfolio project.
          </p>
        </div>
      </footer>
    </div>
  );
}
