# Edel Drive

Edel ekibinin dosya deposu. Next.js 15 + Supabase (Auth + Storage + Postgres). **Edel Design System** ile entegre.

## Özellikler

- Workspace bazlı takım dosya yönetimi (RLS ile izolasyon)
- Sürükle-bırak çoklu dosya yükleme (tarayıcıdan direkt Supabase Storage'a)
- Klasör ağacı, breadcrumb gezinme
- Dosya/klasör için süresiz veya süreli paylaşım linkleri (1g/7g/30g/süresiz)
- Resim, video, PDF için yerleşik önizleme
- Edel Orange brand kimliği, Geist font, warm cream surfaces

## Design System

Tokenlar `app/globals.css` içinde **Edel Design System** ile birebir senkron:

- **Brand:** `#ea580c` Edel Orange + `#ef4444` red accent
- **Surfaces:** `#fffbf5` warm cream bg, `#ffffff` cards
- **Typography:** Geist (sans) + Geist Mono — Google Fonts CDN
- **Cards:** warm-tinted shadow (`0 2px 10px rgba(146,64,14,.06)`) + soft hover
- **Buttons:** rounded-xl, bold weight, orange glow shadow, hover translate-y
- **Overline:** `.overline` utility (orange, 11px, 1.5px tracking, uppercase) — section eyebrow
- **Logo:** `/public/EdelLogomark.svg` + `EdelLogotype.svg`

Tailwind utility'leri Edel'in token isimlerini takip ediyor: `bg-bg`, `bg-surface`, `bg-surface-2`, `text-fg`, `text-fg-muted`, `text-fg-soft`, `text-brand`, `border-border`, `border-border-light`, `shadow-card`, `shadow-glow-primary`.

## Kurulum

1. **Supabase projesi oluştur** ve şunları al:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (public share sayfası için)

2. **Şemayı uygula** (SQL editörü ya da CLI ile):
   ```bash
   supabase db push
   # veya supabase/migrations/0001_init.sql içeriğini SQL editörüne yapıştır.
   ```

3. **Çalıştır:**
   ```bash
   cp .env.example .env.local
   # anahtarları doldur
   npm install
   npm run dev
   ```

## Mimari

```
app/
  (auth)/login, signup     – Edel kart, overline pattern
  (app)/drive              – ana dosya tarayıcısı
  share/[token]            – public paylaşım sayfası (service-role)
  page.tsx                 – landing (hero glow + orange CTA + feature grid)
components/
  edel-logo.tsx            – brand logo (SVG)
  drive-browser.tsx        – grid, kebab menü, klasör/dosya kartları
  upload-dropzone.tsx      – paralel upload, ilerleme listesi
  share-dialog.tsx         – link oluşturucu
  file-preview.tsx         – resim/video/PDF iframe önizleme
  ui/                      – shadcn-stili button, input, dialog, dropdown
lib/
  supabase/{client,server,middleware}.ts
  workspace.ts             – ilk workspace bootstrap
  utils.ts                 – cn, formatBytes, formatDate
supabase/migrations/
  0001_init.sql            – tablolar + RLS + storage bucket
```

## Hafıza/boyut

- Tarayıcı → Supabase Storage direkt yükleme. Next.js sunucusu dosya bytes'ı asla taşımaz: pratikte sınırsız boyut, RAM darboğazı yok.
- Storage bucket büyüme limiti Supabase plan tier'ına bağlı.

## Sıradakiler

- [ ] Takım üyesi davet sistemi (e-posta ile)
- [ ] Çoklu workspace anahtarlayıcı
- [ ] Dark mode toggle (token'lar hazır, butona bağlanacak)
- [ ] Dosya/klasör sürükleyerek taşıma
- [ ] Tam metin arama (Postgres `tsvector`)
- [ ] Sürüm geçmişi
