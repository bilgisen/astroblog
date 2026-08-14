# BACKEND_NOTES.md — Payload / paback worker optimizasyon notları

Bu dosya, `paback` worker ve Payload CMS backend'inin yavaşlığını araştıracak
AI/geliştirici için ölçüm ve tespit notlarını içerir. Frontend (astroblog) tarafı
cache eklenerek tolere edildi; asıl kök neden backend tarafında.

## Ölçülen sorun (2026-08-14)

Payload REST API yanıt süreleri **çok yavaş ve dengesiz** (doğrudan
`https://admin.paraanaliz.com` üzerinden ölçüldü):

| Endpoint | Süre |
|---|---|
| `/api/news?...&limit=30` | 29 sn |
| `/api/news?...&limit=60` | 1.8 sn |
| `/api/news?...&limit=100` | 37 sn |
| `/api/news?...page=2&limit=100` | 2.5 sn |
| `/api/blog?...&limit=10&sort=-publishedAt` | 33.8 sn |

Aynı sorgu aynı limitlerle 1.8 sn ile 37 sn arasında değişiyor → soğuk başlangıç /
DB / bağlantı havuzu / kaynak yarışı gibi dengesiz bir kaynak işaret ediyor.

## Etki

- Frontend (astroblog worker) her SSR render'ında 3–6 Payload çağrısı yapıyordu.
  Hiçbir katmanda cache yoktu → ilk ziyaret TTFB 35–90 sn'ye çıkıyordu.
- Frontend tarafı artık:
  - `fetchFromPayload` sonuçlarını Cloudflare Cache API'de **120 sn** cache'liyor.
  - HTML sayfaları **60s + SWR 300s** edge cache'liyor (middleware).
  - Media proxy dosyaları **86400 sn** cache'liyor.
  - Liste sorgularında Payload `?select[...]` ile `body` (Lexical JSON) hariç
    tutuluyor → cevap boyutu ~10x küçüldü (ör. 5 haber select'siz ~377KB,
    select'li ~3.8KB).

## Frontend'de cache dışında yapılanlar

- Ana sayfa blog `limit=40 → 18`.
- Ana sayfa + haber detaydaki tagged/slider sorguları `Promise.all` içine alındı.
- Bu değişiklikler backend'i yavaşlatmaz; backend'in **asıl gecikmesi** (1.8–37 sn)
  hâlâ çözülmedi.

## Backend tarafında araştırılacaklar (öneriler)

1. **paback worker → Payload gecikmesi**: service binding üzerinden
   (`http://admin/...`) yapılan çağrı ile doğrudan `admin.paraanaliz.com` çağrısını
   karşılaştır. Binding'in kendisi ek gecikme ekliyor mu?
2. **Soğuk başlangıç**: paback/Payload worker free tier'da ise CPU sınırı ve cold
   start olabilir. `wrangler tail`/Observability (wrangler.toml'da `[observability]`)
   ile invocation sürelerine bak.
3. **`draft=true` maliyeti**: Payload draft sorguları `_drafts` tablosuyla birleşim
   yapar; dizin/index eksikse yavaş olabilir. Sorgu planına bak.
4. **`depth=1/2` population**: `featuredImage`, `author`, `category` population'ı
   her satır için ek sorgu demek. N+1 olabilir.
5. **Hafif liste endpoint'i**: Payload'a listeleme için `body` içermeyen, önceden
   optimize edilmiş bir endpoint ekle (veya paback'ta karşılık gelen field
   projection'ı uygula). Frontend zaten `?select[...]` kullanıyor; backend tarafı
   `select` varsayılanı da ekleyebilir.
6. **Veritabanı**: Payload'un bağlandığı DB'nin yükü/bağlantı limiti. Aynı
   limit+filtre sorgularının tutarlılığı DB query cache ile artabilir.
7. **Cron/warm-up**: sık kullanılan endpoint'leri düzenli aralıklarla çağıran bir
   `scheduled` handler warm cache tutabilir (sorgu cache'i + paback hot start).

## Doğrulama kriterleri

- Aynı endpoint üst üste 3 çağrıda süreler birbirine yakın ve **< 2 sn** olmalı.
- `/api/news?depth=1&draft=true&trash=false&page=1&limit=60` < 2 sn.
- `/api/blog?depth=2&draft=true&trash=false&page=1&limit=10&sort=-publishedAt` < 2 sn.