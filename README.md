# SayaMuslim

Web app yang menggunakan API publik myQuran secara langsung (tanpa backend/proxy).
Spesifikasi endpoint ada di `apimuslim.json`.

## Base URL
- `https://api.myquran.com/v3/`

## Struktur
- `apimuslim.json`: spesifikasi OpenAPI sumber
- `BLUEPRINT.md`: rancangan fitur
- `index.html`: halaman utama
- `styles.css`: styling UI
- `app.js`: logic fetch ke API

Catatan:
- Beberapa request `GET` di-cache ringan di `localStorage` (default 5 menit) untuk mempercepat UX.

## Docker (GHCR)
Workflow manual tersedia di `/.github/workflows/ghcr.yml` untuk build dan push image:
- `ghcr.io/gunanto/muslim:latest`

## Docker Compose (Contoh)
Jalankan web statis dari image GHCR:

```bash
docker compose up -d
```

```yaml
services:
  web:
    image: ghcr.io/gunanto/muslim:latest
    ports:
      - "8080:80"
```

## Contoh Endpoint
Semua endpoint mengikuti path upstream di atas.

- `GET /sholat/kabkota/semua`
- `GET /sholat/kabkota/cari/{keyword}`
- `POST /sholat/kabkota/cari`
- `GET /sholat/jadwal/{id}/today`
- `GET /sholat/jadwal/{id}/{period}`
- `GET /cal/today`
- `GET /cal/ce/{date}`
- `GET /cal/hijr/{date}`
- `GET /quran`
- `GET /quran/{surah}`
- `GET /quran/{surah}/{ayah}`
- `POST /quran/search`
- `GET /quran/juz/{number}`
- `GET /quran/page/{number}`
- `GET /quran/manzil/{number}`
- `GET /quran/ruku/{number}`
- `GET /quran/hizb/{number}`
- `GET /quran/random`
- `GET /hadis/enc`
- `GET /hadis/enc/show/{id}`
- `GET /hadis/enc/random`
- `GET /hadis/enc/explore`
- `GET /hadis/enc/cari/{keyword}`
- `GET /hadis/enc/next/{id}`
- `GET /hadis/enc/prev/{id}`
- `GET /hadis/perawi`
- `GET /hadist/perawi/browse`
- `GET /hadist/perawi/id/{id}`

## Contoh Request

```bash
# Jadwal sholat (hari ini) untuk id kab/kota
curl -s "https://api.myquran.com/v3/sholat/jadwal/eda80a3d5b344bc40f3bc04f65b7a357/today"

# Cari kab/kota dengan keyword
curl -s "https://api.myquran.com/v3/sholat/kabkota/cari/kediri"

# Kalender Hijriah hari ini
curl -s "https://api.myquran.com/v3/cal/today"

# Konversi CE -> Hijriah
curl -s "https://api.myquran.com/v3/cal/ce/2026-02-03"

# List surah
curl -s "https://api.myquran.com/v3/quran"

# Detail ayat (dengan terjemah + audio_url)
curl -s "https://api.myquran.com/v3/quran/1/1"

# Pencarian ayat
curl -s -X POST "https://api.myquran.com/v3/quran/search" \\
  -H "Content-Type: application/json" \\
  -d '{\"keyword\":\"pujian\",\"limit\":10}'

# Hadis random
curl -s "https://api.myquran.com/v3/hadis/enc/random"

# Browse perawi
curl -s "https://api.myquran.com/v3/hadist/perawi/browse?page=1&limit=10"
```
