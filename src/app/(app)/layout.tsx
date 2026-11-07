import { AppShell } from "@/components/shell/app-shell";
import { getCurrentUser } from "@/lib/data";

/**
 * Layout for every authenticated route. In Phase 2 this is where the session
 * is read and anonymous visitors are redirected; today it loads the sample
 * user so the shell can render.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return <AppShell user={user}>{children}</AppShell>;
}
