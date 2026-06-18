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
    <div className="edel-card p-7">
      <div className="text-center">
        <p className="overline">HEMEN BAŞLA</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Hesap oluştur</h1>
        <p className="mt-1 text-sm text-fg-muted">Takımının ilk workspace'ini birlikte kuralım.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <Input
          placeholder="Takım / şirket adı"
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
        {err && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent">
            {err}
          </p>
        )}
        {info && (
          <p className="rounded-md bg-[#dcfce7] px-3 py-2 text-xs font-medium text-success">
            {info}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Oluşturuluyor..." : "Ücretsiz Başla"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-fg-muted">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
