import { AppShell } from "@/components/shell/app-shell";

/**
 * Layout for every authenticated route.
 *
 * Deliberately does NOT read the session here. Under Cache Components a
 * top-level session read in a layout would hold every child page behind the
 * request. Instead the shell is static, the account menu streams in behind
 * its own Suspense boundary (see Sidebar), and each page calls requireUser()
 * behind its loading.tsx boundary.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
