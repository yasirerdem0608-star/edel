"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Download } from "lucide-react";
import { formatBytes } from "@/lib/utils";

type FileRow = {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number;
  storage_path: string;
};

export function FilePreview({ file, onClose }: { file: FileRow | null; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.storage
        .from("drive")
        .createSignedUrl(file.storage_path, 60 * 10);
      setUrl(data?.signedUrl ?? null);
    })();
  }, [file]);

  if (!file) return null;
  const mime = file.mime_type || "";

  return (
    <Dialog open={!!file} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <p className="overline">ÖNİZLEME</p>
          <DialogTitle className="mt-1 truncate pr-8">{file.name}</DialogTitle>
          <p className="text-xs text-fg-soft">
            {formatBytes(file.size_bytes)} {mime && `· ${mime}`}
          </p>
        </DialogHeader>

        <div className="grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-border-light bg-surface-2">
          {!url ? (
            <p className="text-sm text-fg-muted">Yükleniyor...</p>
          ) : mime.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={file.name} className="max-h-[70vh] w-full object-contain" />
          ) : mime.startsWith("video/") ? (
            <video src={url} controls className="max-h-[70vh] w-full" />
          ) : mime === "application/pdf" ? (
            <iframe src={url} className="h-[70vh] w-full" />
          ) : (
            <div className="p-12 text-center text-sm text-fg-muted">
              Bu dosya türü için önizleme yok. İndir butonunu kullanabilirsin.
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button asChild>
            <a href={url ?? "#"} download={file.name}>
              <Download className="h-4 w-4" />
              İndir
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
