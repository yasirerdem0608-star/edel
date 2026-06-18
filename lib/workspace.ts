import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function ensureDefaultWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, slug)")
    .limit(1);

  if (memberships && memberships.length > 0) {
    return memberships[0];
  }

  // Bootstrap: ilk workspace ve owner üyeliği.
  const name = (user.user_metadata?.workspace_name as string) || `${user.email?.split("@")[0]} workspace`;
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40) || "workspace";
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .insert({ name, slug, created_by: user.id })
    .select("id, name, slug")
    .single();
  if (wsErr || !ws) throw wsErr;

  const { error: mErr } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: ws.id, user_id: user.id, role: "owner" });
  if (mErr) throw mErr;

  return { workspace_id: ws.id, workspaces: ws };
}
