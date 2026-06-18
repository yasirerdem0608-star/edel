import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EdelLogo } from "@/components/edel-logo";
import { CloudUpload, FolderKanban, Link2, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/drive");

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div className="hero-glow absolute inset-0 -z-10" />

      <header className="sticky top-0 z-30 border-b border-border bg-[rgba(253,246,236,0.85)] backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <EdelLogo />
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href="/login">Drive'a Gir</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container relative pt-24 pb-20 text-center">
        <p className="overline">EDEL ONLINE · TAKIM DEPOSU</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
          Ekibin için <span className="text-gradient">tek bir depo.</span>
          <br />
          Hafıza derdi yok.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-fg-muted">
          Edel Drive — bütün dersleri, materyalleri ve dokümanları tek yerden yönet.
          Sürükle bırak yükle, klasörle düzenle, link ile paylaş.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/login">Drive'a Gir</Link>
          </Button>
        </div>

        {/* Trust row */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            RLS ile güvenli
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CloudUpload className="h-3.5 w-3.5 text-brand" />
            Sınırsız storage
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-brand" />
            Kolay paylaşım
          </span>
        </div>
      </section>

      <section className="container relative pb-24">
        <div className="text-center">
          <p className="overline">NE YAPABİLİRSİN</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
            Drive'ın tüm güzelliği, takıma özel.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: CloudUpload,
              title: "Sürükle bırak",
              text: "Onlarca dosyayı paralel yükle. Tarayıcıdan direkt depoya.",
            },
            {
              icon: FolderKanban,
              title: "Klasör düzeni",
              text: "Sınırsız iç içe klasör, breadcrumb gezinme.",
            },
            {
              icon: Link2,
              title: "Link ile paylaş",
              text: "1 gün, 7 gün, 30 gün ya da süresiz paylaşım linkleri.",
            },
            {
              icon: ShieldCheck,
              title: "Takım izinleri",
              text: "Postgres RLS — workspace dışı kimse veriye dokunamaz.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="edel-card p-5 text-left">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-brand">
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <h3 className="mt-4 text-base font-bold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-surface-2/60">
        <div className="container flex h-16 items-center justify-between text-xs text-fg-muted">
          <span>© {new Date().getFullYear()} Edel Online</span>
          <span>Edel Drive · v0.1</span>
        </div>
      </footer>
    </main>
  );
}
