import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CloudUpload, FolderKanban, Link2, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/drive");

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            E
          </div>
          Edel Drive
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Giriş</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Başla</Link>
          </Button>
        </div>
      </nav>

      <section className="mt-24 text-center">
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          Takımın için sınırsız, hızlı depo.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Edel Drive — ekibinin tüm dosyalarını tek yerden yönet. Sürükle bırak yükle,
          klasörle düzenle, link ile paylaş. Hafıza derdi yok.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Ücretsiz başla</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Giriş yap</Link>
          </Button>
        </div>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CloudUpload, title: "Sürükle bırak", text: "Onlarca dosyayı aynı anda paralel yükle." },
          { icon: FolderKanban, title: "Klasör düzeni", text: "Sınırsız iç içe klasör yapısı." },
          { icon: Link2, title: "Link ile paylaş", text: "Şifreli ve süreli paylaşım linkleri." },
          { icon: ShieldCheck, title: "Takım izinleri", text: "RLS ile workspace düzeyinde güvenlik." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border bg-card p-5">
            <Icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
