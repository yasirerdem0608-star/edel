import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Download, FileIcon, FolderIcon } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServiceClient();

  const { data: share } = await supabase
    .from("share_links")
    .select("id, file_id, folder_id, workspace_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!share) notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return <Expired />;
  }

  if (share.file_id) {
    const { data: file } = await supabase
      .from("files")
      .select("id, name, mime_type, size_bytes, storage_path, created_at")
      .eq("id", share.file_id)
      .maybeSingle();
    if (!file) notFound();

    const { data: signed } = await supabase.storage
      .from("drive")
      .createSignedUrl(file.storage_path, 60 * 60, { download: file.name });

    const preview = await supabase.storage
      .from("drive")
      .createSignedUrl(file.storage_path, 60 * 60);

    return (
      <ShareLayout>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-4">
            <FileIcon className="h-10 w-10 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold">{file.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatBytes(file.size_bytes)}
                {file.mime_type ? ` · ${file.mime_type}` : ""} · {formatDate(file.created_at)}
              </p>
            </div>
            <Button asChild>
              <a href={signed?.signedUrl ?? "#"}>
                <Download className="h-4 w-4" />
                İndir
              </a>
            </Button>
          </div>

          {preview.data?.signedUrl && (
            <div className="mt-6 grid place-items-center rounded-lg bg-muted/30 p-4">
              {file.mime_type?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.data.signedUrl} alt={file.name} className="max-h-[70vh] rounded" />
              ) : file.mime_type?.startsWith("video/") ? (
                <video src={preview.data.signedUrl} controls className="max-h-[70vh] w-full rounded" />
              ) : file.mime_type === "application/pdf" ? (
                <iframe src={preview.data.signedUrl} className="h-[70vh] w-full rounded" />
              ) : (
                <p className="py-12 text-sm text-muted-foreground">
                  Önizleme yok. İndirmek için yukarıdaki butonu kullan.
                </p>
              )}
            </div>
          )}
        </div>
      </ShareLayout>
    );
  }

  if (share.folder_id) {
    const [{ data: folder }, { data: subfolders }, { data: files }] = await Promise.all([
      supabase.from("folders").select("id, name").eq("id", share.folder_id).maybeSingle(),
      supabase
        .from("folders")
        .select("id, name")
        .eq("parent_id", share.folder_id)
        .order("name"),
      supabase
        .from("files")
        .select("id, name, mime_type, size_bytes, storage_path, created_at")
        .eq("folder_id", share.folder_id)
        .order("created_at", { ascending: false }),
    ]);
    if (!folder) notFound();

    return (
      <ShareLayout>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FolderIcon className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-semibold">{folder.name}</h1>
          </div>

          <div className="rounded-xl border bg-card">
            {(subfolders ?? []).length === 0 && (files ?? []).length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Klasör boş.</div>
            ) : (
              <ul className="divide-y">
                {(subfolders ?? []).map((sf) => (
                  <li key={sf.id} className="flex items-center gap-3 px-4 py-3">
                    <FolderIcon className="h-5 w-5 text-amber-500" />
                    <span className="flex-1">{sf.name}</span>
                    <span className="text-xs text-muted-foreground">Klasör</span>
                  </li>
                ))}
                {(files ?? []).map((f) => (
                  <SharedFileRow key={f.id} file={f} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </ShareLayout>
    );
  }

  notFound();
}

async function SharedFileRow({
  file,
}: {
  file: {
    id: string;
    name: string;
    mime_type: string | null;
    size_bytes: number;
    storage_path: string;
  };
}) {
  const supabase = await createServiceClient();
  const { data } = await supabase.storage
    .from("drive")
    .createSignedUrl(file.storage_path, 60 * 60, { download: file.name });
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <FileIcon className="h-5 w-5 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">{formatBytes(file.size_bytes)}</div>
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href={data?.signedUrl ?? "#"}>
          <Download className="h-3.5 w-3.5" />
          İndir
        </a>
      </Button>
    </li>
  );
}

function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-semibold">
            Edel Drive
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/signup">Hesap aç</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

function Expired() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Bu link süresi dolmuş</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dosya sahibinden yeni bir link iste.
        </p>
      </div>
    </div>
  );
}
