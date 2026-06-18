"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderPlus,
  Home,
  Image as ImageIcon,
  FileText,
  Film,
  File as FileIcon,
  MoreHorizontal,
  Download,
  Link2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UploadDropzone } from "@/components/upload-dropzone";
import { FilePreview } from "@/components/file-preview";
import { ShareDialog } from "@/components/share-dialog";
import { createClient } from "@/lib/supabase/client";
import { cn, formatBytes, formatDate } from "@/lib/utils";

type Folder = { id: string; name: string; created_at: string };
type FileRow = {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number;
  storage_path: string;
  created_at: string;
};

export function DriveBrowser({
  workspaceId,
  folderId,
  folders,
  files,
  breadcrumbs,
}: {
  workspaceId: string;
  folderId: string | null;
  folders: Folder[];
  files: FileRow[];
  breadcrumbs: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [preview, setPreview] = useState<FileRow | null>(null);
  const [shareTarget, setShareTarget] = useState<
    | { kind: "file"; id: string; name: string }
    | { kind: "folder"; id: string; name: string }
    | null
  >(null);

  async function createFolder() {
    const supabase = createClient();
    const name = newFolderName.trim();
    if (!name) return;
    const { error } = await supabase.from("folders").insert({
      workspace_id: workspaceId,
      parent_id: folderId,
      name,
      created_by: (await supabase.auth.getUser()).data.user!.id,
    });
    setNewFolderOpen(false);
    setNewFolderName("");
    if (!error) router.refresh();
  }

  async function deleteFolder(id: string) {
    if (!confirm("Klasör ve içindekiler silinecek. Emin misin?")) return;
    const supabase = createClient();
    await supabase.from("folders").delete().eq("id", id);
    router.refresh();
  }

  async function deleteFile(file: FileRow) {
    if (!confirm(`'${file.name}' silinecek.`)) return;
    const supabase = createClient();
    await supabase.storage.from("drive").remove([file.storage_path]);
    await supabase.from("files").delete().eq("id", file.id);
    router.refresh();
  }

  async function downloadFile(file: FileRow) {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("drive")
      .createSignedUrl(file.storage_path, 60, { download: file.name });
    if (data?.signedUrl) window.location.href = data.signedUrl;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {breadcrumbs.length === 0 ? "Tüm dosyalar" : breadcrumbs[breadcrumbs.length - 1].name}
        </h1>
        <div className="flex items-center gap-2">
          <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4" />
                Yeni klasör
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni klasör</DialogTitle>
              </DialogHeader>
              <Input
                autoFocus
                placeholder="Klasör adı"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFolder()}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setNewFolderOpen(false)}>
                  İptal
                </Button>
                <Button onClick={createFolder}>Oluştur</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <UploadDropzone
        workspaceId={workspaceId}
        folderId={folderId}
        onComplete={() => router.refresh()}
      />

      <section>
        {folders.length === 0 && files.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            Burası boş. Dosya yükle veya yeni klasör oluştur.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((f) => (
              <div
                key={f.id}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <Link
                  href={`/drive?folder=${f.id}`}
                  className="flex flex-1 items-center gap-3 truncate"
                >
                  <FolderIcon className="h-8 w-8 flex-shrink-0 text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(f.created_at)}</div>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setShareTarget({ kind: "folder", id: f.id, name: f.name })}
                    >
                      <Link2 className="h-4 w-4" />
                      Paylaş
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => deleteFolder(f.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {files.map((file) => (
              <div
                key={file.id}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
              >
                <button
                  onClick={() => setPreview(file)}
                  className="flex flex-1 items-center gap-3 truncate text-left"
                >
                  <FileTypeIcon mime={file.mime_type} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatBytes(file.size_bytes)} · {formatDate(file.created_at)}
                    </div>
                  </div>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => downloadFile(file)}>
                      <Download className="h-4 w-4" />
                      İndir
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShareTarget({ kind: "file", id: file.id, name: file.name })}
                    >
                      <Link2 className="h-4 w-4" />
                      Paylaş
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => deleteFile(file)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </section>

      <FilePreview file={preview} onClose={() => setPreview(null)} />
      <ShareDialog
        target={shareTarget}
        workspaceId={workspaceId}
        onClose={() => setShareTarget(null)}
      />
    </div>
  );
}

function Breadcrumbs({ items }: { items: { id: string; name: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/drive" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
        Drive
      </Link>
      {items.map((it, i) => (
        <span key={it.id} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/drive?folder=${it.id}`}
            className={cn(
              "hover:text-foreground",
              i === items.length - 1 && "text-foreground font-medium",
            )}
          >
            {it.name}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function FileTypeIcon({ mime }: { mime: string | null }) {
  const base = "h-8 w-8 flex-shrink-0";
  if (!mime) return <FileIcon className={cn(base, "text-muted-foreground")} />;
  if (mime.startsWith("image/")) return <ImageIcon className={cn(base, "text-emerald-500")} />;
  if (mime.startsWith("video/")) return <Film className={cn(base, "text-purple-500")} />;
  if (mime === "application/pdf" || mime.startsWith("text/"))
    return <FileText className={cn(base, "text-rose-500")} />;
  return <FileIcon className={cn(base, "text-muted-foreground")} />;
}
