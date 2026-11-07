import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="px-4 py-6 text-center text-xs text-text-muted">
        <Link href="/" className="hover:text-text-secondary">
          Back to songbook.app
        </Link>
      </footer>
    </div>
  );
}
