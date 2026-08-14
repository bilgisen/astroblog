# AGENTS.md — paraanaliz.com Frontend

Bu dosya, bu proje üzerinde çalışan AI/açıkça görev verilen geliştiriciler için proje özetidir.
Frontend'in düzgün çalışması için gerekli mimari bilgileri, komutları ve kritik kuralları içerir.

## Proje nedir?

Para Analiz (`https://paraanaliz.com`) haber sitesinin frontend'i.
Türkçe, finans/haber içerikli. İçerik **Payload CMS**'ten çekilir.

- Framework: **Astro 6** (SSR, `output: 'server'`)
- Deploy: **Cloudflare Workers** (`astroblog` worker) — `wrangler deploy`
- Tema: Tailwind CSS 4 + shadcn/ui bileşenleri

## Backend durumu (kontrol edildi)

- Payload CMS: `https://admin.paraanaliz.com` — **çalışıyor (200 OK)**
- Test edilen endpoint'ler hepsi 200 döndü:
  - `/api/news?depth=1&draft=true&trash=false&page=1&limit=60`
  - `/api/news?...limit=100`
  - `/api/blog?depth=2&draft=true&trash=false&page=1&limit=10&sort=-publishedAt`
  - `/api/media/file/970x250.jpg`, `gedik.jpg`, `320x100.jpg` (banner görselleri mevcut)

## Mimari — veri akışı

```
Tarayıcı ──> astroblog (Cloudflare Worker, bu repo)
                │  PABACK service binding (Worker-to-Worker, "http://admin/...")
                ▼
             paback worker ──> Payload CMS (admin.paraanaliz.com)
```

- **Production**: `src/lib/payload.ts` içindeki `fetchFromPayload()`, `env.PABACK` service
  binding'i ile `http://admin/<endpoint>` çağırır.
- **Lokal geliştirme**: PABACK binding olmadığı için `PAYLOAD_API_URL` env değişkenine
  düşer (`https://admin.paraanaliz.com`).

## Kurulum / Komutlar

```sh
# Lokal çalıştırma (env gerekli)
PAYLOAD_API_URL=https://admin.paraanaliz.com npm run dev

# Build
npm run build

# Deploy (Cloudflare Workers)
npm run deploy
```

Lokal ortamda Payload'a erişmek için `PAYLOAD_API_URL` zorunlu (`.env.example` içinde örnek var).
Production'da PABACK binding kullanıldığı için env gerekmez.

## Worker bindings (wrangler.toml)

| Binding | Tip | Amaç |
|---|---|---|
| `PABACK` | service binding | Payload backend'e worker-to-worker erişim |
| `IMAGES` | Cloudflare Images | görsel işleme |
| `SESSION` | KV | Astro session |
| `ASSETS` | static assets | `dist/client` |

## Kritik dosyalar

| Dosya | Görevi |
|---|---|
| `src/lib/payload.ts` | Payload API istemcisi + tipler + yardımcılar (Cache API cache'li) |
| `src/middleware.ts` | HTML sayfaları edge cache (`60s + SWR 300s`) |
| `src/pages/media/[...path].ts` | Görsel proxy: `/media/api/media/file/...` → admin (86400s cache) |
| `src/pages/haberler/index.astro` | Haberler listesi (toplam 100 haber, 30'ar açılır) |
| `src/pages/haberler/[slug].astro` | Haber detay |
| `src/pages/index.astro` | Ana sayfa (slider, sponsor banner, sidebar) |
| `src/pages/adverts.astro` | Özel/reklam haberleri (kategori 28) |
| `src/components/BaseHead.astro` | `<head>`; **CookieYes** (izin) scripti burada |

## API istemcisi — önemli fonksiyonlar

- `fetchNewsList(page, limit, excludeCategoryIds?)` — haber listesi
- `fetchNewsByCategory(categoryId, page, limit)` — kategoriye göre
- `fetchNewsById(id)` / `fetchNewsBySlug(slug)` — tekil haber
- `fetchBlogList(page, limit)` / `fetchBlogBySlug(slug)` — köşe yazıları
- `resolveMediaUrl(url)` — görsel URL'lerini `/media/...` proxy'sine çevirir
- `lexicalToPlainText(body)` / `lexicalToHtml(body)` — Lexical rich text dönüştürücü

## Kritik kurallar / dikkat edilecekler

1. **Görsel URL'leri**: Payload'tan gelen `/api/media/file/...` yollarını asla doğrudan
   kullanma; her zaman `resolveMediaUrl()` ile `/media/...` proxy'sine çevir (sosyal medya
   crawler'ları için kendi domaininden servis edilir).
2. **`draft=true`** sorgularda zorunlu; admin'de taslak olarak bekleyen haberler yayında görünür.
3. **Reklam kategorileri**: Kategori `28` (reklam) genel haber akışlarından hariç tutulur
   (`where[category][not_in][]=28`). `adverts.astro` özellikle kategori 28'i çeker.
4. **Haberler sayfası**: Toplam `100` haber listelenir, ilk 30 gösterilir, "Daha Fazla" ile
   30'ar açılır. Sayı değişirse `maxNews` ve `currentlyShown` değişkenlerini birlikte güncelle.
5. **Site dili Türkçe** — metin, alt attribute ve UI çevirileri Türkçe olmalı.
6. **CookieYes** scripti `BaseHead.astro`'dan kaldırıldı (üçüncü taraf hesap 403
   dönüyordu). Tekrar eklenirse hesabın aktif olduğundan emin ol.
7. **Sitemap/RSS**: `src/pages/sitemap-*.xml.ts` ve `rss.xml.js` doğrudan Payload'u çeker;
   limit değerlerini büyütürken Payload API limitine dikkat et.
8. Deploy öncesi **build al ve hataları kontrol et**; `dist/` eski kalırsa deploy eski
   sürümü yükler.
9. **Caching**: `fetchFromPayload` yanıtları Cache API'de 120s, HTML sayfaları
   middleware'de `60s + SWR 300s`, media proxy 86400s cache'lenir. Liste sorgularında
   Payload `?select[...]` ile `body` hariç tutulur (payload ~10x küçülür) — detay
   sayfalarında `body` gerekir, orada select uygulanmaz.
10. **Backend yavaşlığı**: Payload API 1.8–37s arası dengesiz; cache bunu tolere eder.
    Kökten çözüm için `BACKEND_NOTES.md`'ye bak.
