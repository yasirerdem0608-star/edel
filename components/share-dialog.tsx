"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
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

type Target =
  | { kind: "file"; id: string; name: string }
  | { kind: "folder"; id: string; name: string }
  | null;

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
  const [expires, setExpires] = useState<"never" | "1d" | "7d" | "30d">("never");
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
          <DialogTitle>Paylaş: {target?.name}</DialogTitle>
        </DialogHeader>

        {!link ? (
          <>
            <div className="space-y-2 text-sm">
              <label className="font-medium">Bitiş süresi</label>
              <div className="grid grid-cols-4 gap-2">
                {(["never", "1d", "7d", "30d"] as const).map((v) => (
                  <Button
                    key={v}
                    type="button"
                    variant={expires === v ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExpires(v)}
                  >
                    {v === "never" ? "Süresiz" : v.replace("d", " gün")}
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={createLink} disabled={loading}>
                {loading ? "Oluşturuluyor..." : "Link oluştur"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Input value={link} readOnly onFocus={(e) => e.currentTarget.select()} />
              <Button variant="outline" size="icon" onClick={copy}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bu link {expires === "never" ? "süresiz" : `${expires.replace("d", " gün")} boyunca`} geçerlidir.
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
