import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EdelLogo } from "@/components/edel-logo";
import { Download, File as FileIcon, Folder as FolderIcon } from "lucide-react";
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
        <div className="edel-card p-7">
          <p className="overline">PAYLAŞILAN DOSYA</p>
          <div className="mt-3 flex items-start gap-4">
            <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-primary-soft text-brand">
              <FileIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold tracking-tight">{file.name}</h1>
              <p className="mt-1 text-sm text-fg-muted">
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
            <div className="mt-6 grid place-items-center overflow-hidden rounded-2xl border border-border-light bg-surface-2">
              {file.mime_type?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.data.signedUrl}
                  alt={file.name}
                  className="max-h-[70vh] w-full object-contain"
                />
              ) : file.mime_type?.startsWith("video/") ? (
                <video src={preview.data.signedUrl} controls className="max-h-[70vh] w-full" />
              ) : file.mime_type === "application/pdf" ? (
                <iframe src={preview.data.signedUrl} className="h-[70vh] w-full" />
              ) : (
                <p className="py-12 text-sm text-fg-muted">
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
        <div className="space-y-5">
          <div>
            <p className="overline">PAYLAŞILAN KLASÖR</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-brand">
                <FolderIcon className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{folder.name}</h1>
            </div>
          </div>

          <div className="edel-card overflow-hidden p-0">
            {(subfolders ?? []).length === 0 && (files ?? []).length === 0 ? (
              <div className="p-14 text-center text-sm text-fg-muted">Klasör boş.</div>
            ) : (
              <ul className="divide-y divide-border-light">
                {(subfolders ?? []).map((sf) => (
                  <li key={sf.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-brand">
                      <FolderIcon className="h-4 w-4" />
                    </div>
                    <span className="flex-1 font-bold">{sf.name}</span>
                    <span className="text-xs font-medium text-fg-soft">Klasör</span>
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
    <li className="flex items-center gap-3 px-5 py-3.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-fg-muted">
        <FileIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{file.name}</div>
        <div className="text-xs text-fg-soft">{formatBytes(file.size_bytes)}</div>
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-[rgba(253,246,236,0.85)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <EdelLogo href="/" />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Giriş Yap</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">{children}</main>
    </div>
  );
}

function Expired() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="edel-card max-w-md p-10 text-center">
        <p className="overline">SÜRESİ DOLDU</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Bu linkin süresi dolmuş</h1>
        <p className="mt-3 text-sm text-fg-muted">
          Dosya sahibinden yeni bir paylaşım linki isteyebilirsin.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/">Anasayfaya dön</Link>
        </Button>
      </div>
    </div>
  );
}
