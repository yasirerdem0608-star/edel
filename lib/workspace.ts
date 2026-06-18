import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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

  // Bootstrap'ı service client ile yapıyoruz (RLS bypass). Sebep: RLS politikaları
  // tavuk-yumurta sorunu yaratıyor — kullanıcı, üyeliği daha yazılmadan ne yeni
  // workspace'ini geri okuyabilir (workspaces SELECT = is_workspace_member) ne de
  // üyelik insert'inin "creator" dalındaki exists(workspaces) alt sorgusunu geçebilir.
  // Bu sunucu tarafı kod; sadece kimliği doğrulanmış kullanıcının kendi ilk
  // workspace'ini + owner üyeliğini oluşturur, dolayısıyla güvenli bir admin işlemi.
  const admin = await createServiceClient();
  const id = crypto.randomUUID();

  const { error: wsErr } = await admin
    .from("workspaces")
    .insert({ id, name, slug, created_by: user.id });
  if (wsErr) throw wsErr;

  const { error: mErr } = await admin
    .from("workspace_members")
    .insert({ workspace_id: id, user_id: user.id, role: "owner" });
  if (mErr) throw mErr;

  return { workspace_id: id, workspaces: { id, name, slug } };
}
