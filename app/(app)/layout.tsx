import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaultWorkspace } from "@/lib/workspace";
import { SignOutButton } from "@/components/sign-out-button";
import { EdelLogo } from "@/components/edel-logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const membership = await ensureDefaultWorkspace();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-[rgba(253,246,236,0.85)] backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-8">
          <EdelLogo href="/drive" />
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {/* @ts-expect-error – ilişkisel obje */}
              <span className="font-semibold text-fg">{membership?.workspaces?.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
