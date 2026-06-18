"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/drive";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="edel-card p-7">
      <div className="text-center">
        <p className="overline">EDEL DRIVE</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Tekrar hoş geldin</h1>
        <p className="mt-1 text-sm text-fg-muted">Drive hesabına gir, kaldığın yerden devam et.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent">
            {err}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Giriliyor..." : "Giriş Yap"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-fg-muted">
        Hesabın yok mu?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
