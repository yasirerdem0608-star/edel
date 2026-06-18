import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaultWorkspace } from "@/lib/workspace";
import { DriveBrowser } from "@/components/drive-browser";

export default async function DriveRootPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const membership = await ensureDefaultWorkspace();
  if (!membership) redirect("/login");
  // @ts-expect-error - ilişkisel obje
  const workspaceId = membership.workspace_id as string;

  const sp = await searchParams;
  const folderId = sp.folder ?? null;

  const foldersQuery = supabase
    .from("folders")
    .select("id, name, created_at")
    .eq("workspace_id", workspaceId)
    .order("name");
  const filesQuery = supabase
    .from("files")
    .select("id, name, mime_type, size_bytes, storage_path, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const [{ data: folders }, { data: files }, breadcrumbs] = await Promise.all([
    folderId
      ? foldersQuery.eq("parent_id", folderId)
      : foldersQuery.is("parent_id", null),
    folderId
      ? filesQuery.eq("folder_id", folderId)
      : filesQuery.is("folder_id", null),
    buildBreadcrumbs(workspaceId, folderId),
  ]);

  return (
    <DriveBrowser
      workspaceId={workspaceId}
      folderId={folderId}
      folders={folders ?? []}
      files={files ?? []}
      breadcrumbs={breadcrumbs}
    />
  );
}

async function buildBreadcrumbs(workspaceId: string, folderId: string | null) {
  if (!folderId) return [] as { id: string; name: string }[];
  const supabase = await createClient();
  const chain: { id: string; name: string }[] = [];
  let cur: string | null = folderId;
  while (cur) {
    const { data, error } = await supabase
      .from("folders")
      .select("id, name, parent_id")
      .eq("id", cur)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error || !data) break;
    chain.unshift({ id: data.id, name: data.name });
    cur = data.parent_id;
  }
  return chain;
}
