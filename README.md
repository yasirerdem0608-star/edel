# Edel Drive

Takım için Drive benzeri dosya deposu. Next.js 15 + Supabase (Auth + Storage + Postgres).

## Özellikler

- Workspace bazlı takım dosya yönetimi (RLS ile izolasyon)
- Sürükle-bırak çoklu dosya yükleme (tarayıcıdan direkt Supabase Storage'a)
- Klasör ağacı, breadcrumb gezinme
- Dosya/klasör için süresiz veya süreli paylaşım linkleri
- Resim, video, PDF için yerleşik önizleme
- shadcn-stili UI bileşenleri (design system bunun üzerine entegre edilecek)

## Kurulum

1. **Supabase projesi oluştur** ve şunları al:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (share sayfaları için)

2. **Şemayı uygula:**
   ```bash
   # Supabase CLI ile:
   supabase db push
   # veya supabase/migrations/0001_init.sql içeriğini SQL editörüne yapıştır.
   ```

3. **Bağımlılıkları yükle ve çalıştır:**
   ```bash
   cp .env.example .env.local
   # .env.local dosyasını doldur
   npm install
   npm run dev
   ```

## Mimari

- `app/(auth)` – login/signup
- `app/(app)/drive` – ana dosya tarayıcısı
- `app/share/[token]` – public paylaşım sayfası (RLS bypass için service-role)
- `components/upload-dropzone.tsx` – paralel upload, ilerleme listesi
- `components/drive-browser.tsx` – grid görünüm, kebab menüsü
- `components/share-dialog.tsx` – link oluşturucu (1g/7g/30g/süresiz)
- `lib/supabase/{client,server,middleware}.ts` – SSR-uyumlu Supabase istemcileri
- `supabase/migrations/0001_init.sql` – tablo + RLS + storage bucket

## Hafıza/boyut

- Dosyalar tarayıcıdan direkt Supabase Storage'a yüklenir; Next.js sunucusu hiç dosya verisi taşımaz. Bu sayede ne RAM ne network sınırı uygulamada darboğaz olmaz.
- Supabase Storage bucket'ında pratikte sınırsız büyüme (proje plan tier'ına bağlı).

## Sıradakiler

- Takım üyesi davet sistemi (e-posta ile)
- Çoklu workspace anahtarlayıcı
- Sürüm geçmişi
- Tam metin arama (Postgres `tsvector`)
