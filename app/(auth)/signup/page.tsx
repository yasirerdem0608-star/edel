"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { workspace_name: workspace } },
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    if (!data.session) {
      setInfo("E-postanı kontrol et — doğrulama linki gönderildi.");
      return;
    }
    router.push("/drive");
    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Hesap oluştur</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Takımın için ilk workspace'i de oluşturalım.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <Input
          placeholder="Takım/şirket adı"
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {err && <p className="text-sm text-destructive">{err}</p>}
        {info && <p className="text-sm text-emerald-600">{info}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Hesabı oluştur"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
