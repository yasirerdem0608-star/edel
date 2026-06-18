import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Ekip tek bir ortak workspace'i paylaşır. Yeni giren her kullanıcı (Supabase'den
// admin tarafından oluşturulur) bu ortak "Edel" deposuna üye yapılır; herkes aynı
// dosya ve klasörleri görür. Public kayıt kapalı olduğu için çoklu workspace yok.
const SHARED_SLUG = "edel";
const SHARED_NAME = "Edel";

export async function ensureDefaultWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Zaten üye mi?
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, slug)")
    .limit(1);
  if (memberships && memberships.length > 0) {
    return memberships[0];
  }

  // Ortak workspace'e katıl. RLS tavuk-yumurta sorunu nedeniyle service client
  // (secret key) kullanıyoruz: kullanıcı henüz üye olmadığından kendi göremez/yazamaz.
  const admin = await createServiceClient();

  // Ortak workspace'i bul, yoksa oluştur (ilk giren kullanıcı kurar).
  let { data: ws } = await admin
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", SHARED_SLUG)
    .maybeSingle();

  if (!ws) {
    const { data: created, error: wsErr } = await admin
      .from("workspaces")
      .insert({ name: SHARED_NAME, slug: SHARED_SLUG, created_by: user.id })
      .select("id, name, slug")
      .single();
    // Eşzamanlı ilk girişlerde slug çakışabilir; çakışmada tekrar oku.
    if (wsErr) {
      const { data: again } = await admin
        .from("workspaces")
        .select("id, name, slug")
        .eq("slug", SHARED_SLUG)
        .single();
      ws = again;
    } else {
      ws = created;
    }
  }
  if (!ws) throw new Error("Ortak workspace oluşturulamadı");

  // Üyeliği ekle (mükerrer girişlerde yok say).
  const { error: mErr } = await admin
    .from("workspace_members")
    .upsert(
      { workspace_id: ws.id, user_id: user.id, role: "member" },
      { onConflict: "workspace_id,user_id", ignoreDuplicates: true },
    );
  if (mErr) throw mErr;

  return { workspace_id: ws.id, workspaces: ws };
}
