# BLUEPRINT

## Tujuan
Membangun web app yang menampilkan layanan: Jadwal Sholat, Kalender Hijriah, Al-Qur'an (terjemah + audio), Hadis, dan Perawi Hadis. Aplikasi harus responsif untuk HP dan tetap nyaman di desktop.

## Target Pengguna
- Pengguna umum yang mencari jadwal sholat dan informasi ibadah harian.
- Pengguna yang ingin membaca Al-Qur'an dan hadis dengan terjemah.
- Pengguna yang membutuhkan data perawi atau referensi hadis.

## Lingkup Fitur (Menu)

### 1) Jadwal Sholat
- Cari lokasi kab/kota berdasarkan keyword.
- Tampilkan jadwal sholat harian untuk lokasi terpilih.
- Opsi periode: hari ini, minggu ini, bulan ini.
- Simpan lokasi terakhir (local storage) untuk akses cepat.

Data API terkait:
- `GET /sholat/kabkota/semua`
- `GET /sholat/kabkota/cari/{keyword}`
- `POST /sholat/kabkota/cari`
- `GET /sholat/jadwal/{id}/today`
- `GET /sholat/jadwal/{id}/{period}`

### 2) Kalender Hijriah
- Info tanggal Hijriah hari ini.
- Konversi tanggal CE ke Hijriah.
- Konversi tanggal Hijriah ke CE.
- Dukungan parameter metode/penyesuaian jika tersedia.

Data API terkait:
- `GET /cal/today`
- `GET /cal/ce/{date}`
- `GET /cal/hijr/{date}`

### 3) Al-Qur'an (Terjemah + Audio)
- Daftar surah.
- Detail surah (daftar ayat + terjemah).
- Detail ayat tertentu.
- Pencarian ayat berdasarkan keyword.
- Akses Juz, Page, Manzil, Ruku, Hizb.
- Putar audio ayat (jika `audio_url` tersedia).

Data API terkait:
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

### 4) Hadis
- Koleksi hadis ensiklopedia.
- Detail hadis (arab + terjemah jika ada).
- Random hadis.
- Explore hadis dengan pagination.
- Cari hadis dengan keyword.
- Navigasi next/prev dari hadis.

Data API terkait:
- `GET /hadis/enc`
- `GET /hadis/enc/show/{id}`
- `GET /hadis/enc/random`
- `GET /hadis/enc/explore`
- `GET /hadis/enc/cari/{keyword}`
- `GET /hadis/enc/next/{id}`
- `GET /hadis/enc/prev/{id}`

### 5) Perawi Hadis
- Ringkasan total perawi.
- Daftar perawi (browse + pagination).
- Detail perawi.

Data API terkait:
- `GET /hadis/perawi`
- `GET /hadist/perawi/browse`
- `GET /hadist/perawi/id/{id}`

## Struktur Navigasi
- Navbar utama dengan menu: Sholat, Kalender Hijriah, Al-Qur'an, Hadis, Perawi.
- Mobile: bottom navigation atau hamburger menu.

## Layout & Responsiveness
- Mobile-first: satu kolom, kartu ringkas, tombol besar.
- Desktop: dua kolom untuk konten + panel samping (filter/cari).
- Gunakan grid responsif dan ukuran font yang nyaman dibaca.

## Halaman & Komponen Kunci

### Jadwal Sholat
- Search bar lokasi.
- Tabel/jadwal harian.
- Tabs: Hari ini | Minggu | Bulan.

### Kalender Hijriah
- Card info hari ini.
- Form konversi CE → Hijriah.
- Form konversi Hijriah → CE.

### Al-Qur'an
- List surah (filter + search).
- Detail surah: daftar ayat dengan terjemah.
- Player audio per ayat.
- Pencarian global ayat.

### Hadis
- List + search.
- Detail hadis.
- Navigasi prev/next.

### Perawi
- List perawi dengan pagination.
- Detail perawi.

## UX & Performa
- Simpan preferensi lokasi sholat di local storage.
- Debounce untuk search input.
- Caching hasil query populer.
- Skeleton loading untuk respons cepat.

## Status & Error Handling
- Empty state ketika data tidak ada.
- Error messages yang jelas.
- Loading indicator di setiap fetch.

## Non-Functional
- Responsif untuk HP (<= 480px) dan tablet.
- Aksesibilitas dasar: kontras warna, ukuran font, fokus keyboard.
- Bahasa: Indonesia.

## MVP Scope
- Fokus pada menu: Sholat, Kalender Hijriah, Al-Qur'an, Hadis, Perawi.
- Minimal fitur: search lokasi, jadwal today, list surah + detail, hadis explore + detail, perawi browse.

## Out of Scope (untuk nanti)
- Login & profil.
- Bookmark dan riwayat baca.
- Notifikasi adzan.

