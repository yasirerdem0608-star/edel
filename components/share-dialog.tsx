"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Target =
  | { kind: "file"; id: string; name: string }
  | { kind: "folder"; id: string; name: string }
  | null;

const OPTIONS = [
  { v: "never", label: "Süresiz" },
  { v: "1d", label: "1 gün" },
  { v: "7d", label: "7 gün" },
  { v: "30d", label: "30 gün" },
] as const;

export function ShareDialog({
  target,
  workspaceId,
  onClose,
}: {
  target: Target;
  workspaceId: string;
  onClose: () => void;
}) {
  const [link, setLink] = useState<string | null>(null);
  const [expires, setExpires] = useState<(typeof OPTIONS)[number]["v"]>("never");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!target) {
      setLink(null);
      setCopied(false);
      setExpires("never");
    }
  }, [target]);

  async function createLink() {
    if (!target) return;
    setLoading(true);
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setLoading(false);
      return;
    }

    const expiresAt =
      expires === "never"
        ? null
        : new Date(
            Date.now() +
              { "1d": 1, "7d": 7, "30d": 30 }[expires] * 24 * 60 * 60 * 1000,
          ).toISOString();

    const { data, error } = await supabase
      .from("share_links")
      .insert({
        workspace_id: workspaceId,
        file_id: target.kind === "file" ? target.id : null,
        folder_id: target.kind === "folder" ? target.id : null,
        expires_at: expiresAt,
        created_by: user.id,
      })
      .select("token")
      .single();
    setLoading(false);
    if (error || !data) return;

    const base = typeof window !== "undefined" ? window.location.origin : "";
    setLink(`${base}/share/${data.token}`);
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-brand">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <p className="overline">PAYLAŞIM LİNKİ</p>
              <DialogTitle className="mt-0.5 truncate pr-8">{target?.name}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {!link ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-bold text-fg">Bitiş süresi</label>
              <div className="grid grid-cols-4 gap-2">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setExpires(opt.v)}
                    className={cn(
                      "h-10 rounded-lg border text-xs font-bold transition-all ease-edel",
                      expires === opt.v
                        ? "border-brand bg-primary-soft text-brand shadow-glow-primary"
                        : "border-border-light bg-surface text-fg-muted hover:border-border hover:text-fg",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-fg-soft">
                Link sahibi olan herkes, süre dolana kadar erişebilir.
              </p>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={createLink} disabled={loading}>
                {loading ? "Oluşturuluyor..." : "Link Oluştur"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input value={link} readOnly onFocus={(e) => e.currentTarget.select()} />
              <Button variant="outline" size="icon" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-fg-soft">
              {expires === "never"
                ? "Bu link süresizdir."
                : `Bu link ${OPTIONS.find((o) => o.v === expires)?.label.toLowerCase()} geçerlidir.`}
            </p>
            <DialogFooter>
              <Button onClick={onClose}>Kapat</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
