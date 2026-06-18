"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatBytes } from "@/lib/utils";

type UploadState = {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

export function UploadDropzone({
  workspaceId,
  folderId,
  onComplete,
}: {
  workspaceId: string;
  folderId: string | null;
  onComplete: () => void;
}) {
  const [items, setItems] = useState<UploadState[]>([]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const newItems: UploadState[] = files.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        size: f.size,
        status: "pending",
        progress: 0,
      }));
      setItems((prev) => [...newItems, ...prev]);

      await Promise.all(
        files.map(async (file, idx) => {
          const it = newItems[idx];
          try {
            // 1) DB satırı (id'yi storage path için kullan)
            const { data: fileRow, error: insErr } = await supabase
              .from("files")
              .insert({
                workspace_id: workspaceId,
                folder_id: folderId,
                name: file.name,
                mime_type: file.type || null,
                size_bytes: file.size,
                storage_path: `${workspaceId}/${crypto.randomUUID()}/${file.name}`,
                created_by: userId,
              })
              .select("id, storage_path")
              .single();
            if (insErr || !fileRow) throw insErr ?? new Error("DB insert başarısız");

            setItems((prev) =>
              prev.map((x) => (x.id === it.id ? { ...x, status: "uploading" } : x)),
            );

            // 2) Storage'a yükle
            const { error: upErr } = await supabase.storage
              .from("drive")
              .upload(fileRow.storage_path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type || undefined,
              });
            if (upErr) {
              await supabase.from("files").delete().eq("id", fileRow.id);
              throw upErr;
            }

            setItems((prev) =>
              prev.map((x) =>
                x.id === it.id ? { ...x, status: "done", progress: 100 } : x,
              ),
            );
          } catch (e: any) {
            setItems((prev) =>
              prev.map((x) =>
                x.id === it.id
                  ? { ...x, status: "error", error: e?.message || "Hata" }
                  : x,
              ),
            );
          }
        }),
      );

      onComplete();
    },
    [workspaceId, folderId, onComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    noClick: false,
  });

  const active = items.filter((i) => i.status === "uploading" || i.status === "pending");

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/40",
        )}
      >
        <input {...getInputProps()} />
        <CloudUpload className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">
          {isDragActive ? "Bırakabilirsin..." : "Dosyaları buraya sürükle veya tıkla"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Birden fazla dosya seçebilirsin. Tarayıcıdan direkt Supabase Storage'a yüklenir.
        </p>
      </div>

      {items.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
            <span>{active.length > 0 ? `${active.length} dosya yükleniyor` : "Yüklemeler"}</span>
            {active.length === 0 && (
              <button onClick={() => setItems([])} className="hover:text-foreground">
                Temizle
              </button>
            )}
          </div>
          <ul className="divide-y">
            {items.slice(0, 10).map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                {it.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : it.status === "error" ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                <span className="flex-1 truncate">{it.name}</span>
                <span className="text-xs text-muted-foreground">{formatBytes(it.size)}</span>
                {it.status === "error" && (
                  <span className="text-xs text-destructive">{it.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
