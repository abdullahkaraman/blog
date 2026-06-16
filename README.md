# Blog

Next.js ve Directus ile hazırlanmış basit blog/CMS projesi.

## Kullanılanlar

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Directus SDK
- pnpm

## Kurulum

Bağımlılıkları yükleyin:

```bash
pnpm install
```

Ortam değişkenlerini hazırlayın:

```bash
cp .env.example .env
```

`.env` içindeki değerleri kendi Directus kurulumunuza göre doldurun:

```env
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
DIRECTUS_SERVER_TOKEN=token_from_Webmaster_account
DIRECTUS_ADMIN_TOKEN=token_from_Admin_account
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Geliştirme

Projeyi yerelde çalıştırın:

```bash
pnpm run dev
```

Uygulama varsayılan olarak şu adreste açılır:

```text
http://localhost:3000
```

## Komutlar

```bash
pnpm run dev
pnpm run build
pnpm run start
pnpm run generate:types
pnpm run lint
pnpm run format
```

## Directus Tiplerini Güncelleme

Directus şeması değiştiğinde TypeScript tiplerini yenilemek için:

```bash
pnpm run generate:types
```

Bu komut `.env` dosyasındaki `NEXT_PUBLIC_DIRECTUS_URL` ve `DIRECTUS_ADMIN_TOKEN` değerlerini kullanır.

## Proje Yapısı

```text
src/app        Next.js route ve API dosyaları
src/components Ortak UI, layout, form ve blok bileşenleri
src/lib        Directus bağlantısı, veri çekme ve yardımcı fonksiyonlar
src/styles     Global stiller
src/types      Directus şema tipleri
public         Statik dosyalar
```

## Notlar

- Gerçek `.env` dosyası git'e eklenmez.
- Build çıktıları ve bağımlılıklar commit dışında tutulur.
- Directus bağlantısı olmadan içerik sayfaları doğru veri göstermez.
