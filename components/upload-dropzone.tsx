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
  });

  const active = items.filter((i) => i.status === "uploading" || i.status === "pending");

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ease-edel",
          isDragActive
            ? "border-brand bg-primary-soft/40 scale-[1.005]"
            : "border-border bg-surface-3/40 hover:border-[#fdba74] hover:bg-surface-3/70",
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-brand">
          <CloudUpload className="h-7 w-7" strokeWidth={2.25} />
        </div>
        <p className="mt-4 text-base font-bold text-fg">
          {isDragActive ? "Bırakabilirsin..." : "Dosyaları buraya sürükle"}
        </p>
        <p className="mt-1 text-sm text-fg-muted">
          ya da tıklayarak seç — tarayıcıdan direkt depoya, hafıza derdi yok.
        </p>
      </div>

      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-light bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-border-light px-4 py-2.5 text-xs">
            <span className="font-bold text-fg">
              {active.length > 0 ? `${active.length} dosya yükleniyor...` : "Yüklemeler"}
            </span>
            {active.length === 0 && (
              <button
                onClick={() => setItems([])}
                className="font-semibold text-fg-muted hover:text-fg"
              >
                Temizle
              </button>
            )}
          </div>
          <ul className="divide-y divide-border-light">
            {items.slice(0, 10).map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                {it.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : it.status === "error" ? (
                  <AlertCircle className="h-4 w-4 text-accent" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-brand" />
                )}
                <span className="flex-1 truncate font-medium text-fg">{it.name}</span>
                <span className="text-xs text-fg-soft">{formatBytes(it.size)}</span>
                {it.status === "error" && (
                  <span className="text-xs font-medium text-accent">{it.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
