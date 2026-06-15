# HadesTV

**HadesTV** adalah platform streaming TV publik berbasis web yang ringan, cepat, dan mengutamakan privasi. Temukan dan tonton ribuan saluran TV publik dari seluruh dunia — mulai dari berita Bloomberg, CNN, Al Jazeera, hingga saluran olahraga seperti beIN Sports dan Fox Sports — semuanya tanpa perlu login, tanpa iklan, dan tanpa pelacakan.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Bun](https://img.shields.io/badge/Bun-1.1-000000?logo=bun)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

> **Tonton dulu, konfigurasi belakangan.** Konten adalah raja. Antarmuka tidak boleh menghalangi pengalaman menonton.

---

## ✨ Highlight Fitur

- **🎬 Player HLS modern** — Pemutaran video stabil via `hls.js` dengan retry otomatis dan recovery untuk network/media error.
- **🔍 Pencarian super cepat** — Filter client-side dengan `WeakMap` cache + debounce 200ms. Ketik "Bloomberg", hasil muncul seketika.
- **🌍 2.000+ saluran** — Index dari `iptv-org` (39.000+ saluran tersedia, kami filter ke 2.000 teratas).
- **🏆 Rak Piala Dunia ⚽** — Koleksi broadcaster yang biasanya menyiarkan turnamen (beIN Sports, Fox Sports, CGTN, dll).
- **📈 Rak Ekonomi & Finansial** — Bloomberg, CNBC Asia, NDTV Profit, Reuters TV, dan lainnya.
- **📺 Rak Channel Pilihan Dunia** — Kurasi TV terbaik: CNN, Al Jazeera, France 24, Sky News, dan banyak lagi.
- **🇮🇩 Prioritas Indonesia** — Channel Indonesia naik ke atas daftar (151+ saluran: TVRI, CNN Indonesia, CNBC Indonesia, dll).
- **🌐 Pemilih negara searchable** — Ketik untuk mencari, dengan keyboard navigation (Enter, Escape, Arrow).
- **⭐ Favorit lokal** — Disimpan di browser, tidak ada cloud, tidak ada akun.
- **📱 Responsif** — Optimal di desktop, tablet, dan mobile (breakpoints sm/md/lg/xl/2xl).
- **🎨 UI modern** — Gradient shelves, sticky header, pill-shaped stat badges, hover effects.
- **🚀 Bun runtime** — HMR, bundling, dan serving dalam satu tool. Cepat.
- **🔒 Privasi** — Zero tracking, zero telemetry. Semua preferensi di `localStorage`.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | [Bun](https://bun.sh) 1.1+ (all-in-one JavaScript/TypeScript runtime) |
| **Frontend** | [React 19](https://react.dev) dengan TypeScript |
| **Server** | Native `Bun.serve` + `Bun.build` untuk HTML imports |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com/) primitives |
| **Video** | [HLS.js](https://github.com/video-dev/hls.js/) untuk M3U8 streaming |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Data sources** | [iptv-org](https://github.com/iptv-org/iptv) + [Free-TV/IPTV](https://github.com/Free-TV/IPTV) |

---

## 📦 Instalasi

### Prasyarat

- [Bun](https://bun.sh) ≥ 1.1
- Browser modern (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Langkah

1. **Klon repositori:**
   ```bash
   git clone https://github.com/podsni/hadestv.git
   cd hadestv
   ```

2. **Instal dependensi:**
   ```bash
   bun install
   ```

3. **Jalankan server development:**
   ```bash
   bun dev
   ```

4. **Buka** [http://localhost:3000](http://localhost:3000) di browser.

---

## 💻 Perintah

| Perintah | Deskripsi |
|----------|-----------|
| `bun dev` | Menjalankan server dev dengan HMR di port 3000 |
| `bun start` | Menjalankan server dalam mode produksi |
| `bun run build` | Build bundle ke folder `dist/` |
| `bun test` | Menjalankan unit test (Bun test runner) |

### Environment Variables (Opsional)

Semua variabel di bawah ini punya default yang sudah bekerja out-of-the-box.

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `PORT` | `3000` | Port server |
| `IPTV_API_BASE` | `https://iptv-org.github.io/api` | Base URL API iptv-org |
| `FREE_TV_PLAYLIST` | `https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8` | URL master playlist Free-TV |
| `CHANNEL_CACHE_TTL_MS` | `1800000` (30 min) | TTL cache channel catalog di memori |
| `CHANNEL_LIMIT` | `2000` | Maksimum channel yang dimuat |

---

## 📂 Struktur Proyek

```
hadestv/
├── src/
│   ├── components/
│   │   ├── channel/             # Komponen spesifik channel
│   │   │   ├── CategoryChips.tsx       # Chip filter kategori
│   │   │   ├── CategoryShelf.tsx       # Rak channel (World Cup, dll)
│   │   │   ├── ChannelDetails.tsx      # Panel detail + stream alternatif
│   │   │   ├── ChannelFilters.tsx      # Filter negara/kategori/bahasa
│   │   │   ├── ChannelList.tsx         # Daftar channel scrollable
│   │   │   └── ChannelLogo.tsx         # Logo channel (dengan fallback)
│   │   ├── layout/              # Komponen layout
│   │   │   └── AppHeader.tsx           # Header sticky dengan stats
│   │   ├── player/              # Komponen video player
│   │   │   ├── PlayerOverlay.tsx       # Loading/error overlay
│   │   │   └── StreamPlayer.tsx        # HLS.js wrapper
│   │   └── ui/                  # Komponen UI generik
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── searchable-select.tsx   # Combobox searchable kustom
│   │       ├── select.tsx
│   │       └── textarea.tsx
│   ├── hooks/
│   │   ├── useChannelCatalog.ts        # Fetch & cache channel list
│   │   ├── useDebouncedValue.ts        # Debounce hook
│   │   └── useFavorites.ts             # LocalStorage favorites
│   ├── lib/
│   │   ├── featured.ts                 # Daftar ID channel pilihan
│   │   ├── iptv.ts                     # Pipeline: fetch → build → filter
│   │   ├── iptv.test.ts                # Unit test
│   │   ├── m3u.ts                      # Parser M3U8 untuk Free-TV
│   │   └── utils.ts                    # cn() class merger
│   ├── server/
│   │   └── iptvService.ts              # Backend: parallel fetch + merge
│   ├── data/
│   │   └── fallbackCatalog.ts          # Channel fallback saat offline
│   ├── App.tsx                         # Root component
│   ├── frontend.tsx                    # Client entry
│   ├── index.html                      # HTML template
│   ├── index.css                       # Global styles
│   └── index.ts                        # Server entry (Bun.serve)
├── docs/                               # Dokumentasi tambahan
├── package.json
├── tsconfig.json
├── bunfig.toml
├── build.ts                            # Build script
└── README.md
```

---

## 🎯 Cara Pakai

### 1. Browsing Channel

Buka [http://localhost:3000](http://localhost:3000). Anda akan melihat tiga rak pilihan di atas daftar channel lengkap:

- **🏆 Piala Dunia ⚽** — Broadcaster turnamen (beIN, Fox, NBC, dll)
- **📺 Channel pilihan dunia** — TV terbaik (CNN, Bloomberg, Al Jazeera, dll)
- **📈 Ekonomi & Finansial** — Bloomberg, CNBC, Reuters, dll

Klik channel mana saja untuk langsung menonton.

### 2. Search

Ketik di kotak pencarian. Hasil muncul **instan** (client-side, tanpa network call). Pencarian cocok dengan:
- Nama channel (mis. "Bloomberg", "TVRI")
- Negara (mis. "Indonesia", "United States")
- Kategori (mis. "news", "sports")
- Bahasa (mis. "English", "Indonesian")

### 3. Filter Negara

Klik tombol "Negara" di sidebar. Pilih dari dropdown searchable. Negara-negara Asia Tenggara (ID, MY, SG, TH, PH, VN, BN) muncul di atas secara default.

### 4. Stream Alternatif

Setiap channel bisa punya banyak stream. Klik tombol di bagian "Stream alternatif" untuk pindah ke sumber lain jika satu gagal.

### 5. Favorit

Klik ikon ❤️ di pojok kanan channel atau tombol "Favorit" di panel detail. Filter "Hanya favorit" di header filter untuk menyembunyikan yang lain.

---

## 🧪 Testing

```bash
bun test
```

Test suite mencakup:
- Filter channels (query, country, category, language, favorites)
- Sort & priority
- Search index cache
- Edge cases (empty, undefined)

---

## 🎨 Prinsip Desain

1. **Tonton Dulu, Konfigurasi Belakangan** — Konten adalah raja. Antarmuka tidak boleh menghalangi.
2. **Status Jujur** — Feedback loading/error yang jelas. Tidak ada spinner palsu.
3. **Privasi adalah Fitur** — Semua preferensi di `localStorage`. Zero tracking.
4. **Ringan & Jelas** — Hindari visual yang berisik atau iklan. Focus pada konten.
5. **Mobile-First** — Dirancang untuk mobile, ditingkatkan untuk desktop.
6. **Indonesia-Friendly** — Prioritas channel lokal, default Indonesia, label Bahasa Indonesia.

---

## 📊 Sumber Data

HadesTV mengindeks dua sumber publik:

### 1. [iptv-org](https://github.com/iptv-org/iptv) (primary)

- **39.656** channel terdaftar
- Metadata: nama, negara, kategori, bahasa, logo, stream URL
- Update mingguan oleh komunitas
- API: `https://iptv-org.github.io/api/`

### 2. [Free-TV/IPTV](https://github.com/Free-TV/IPTV) (secondary)

- Stream tambahan untuk channel yang tidak ada di iptv-org
- Format M3U8 dengan metadata (tvg-id, tvg-country, tvg-logo, group-title)
- Sumber untuk berita, olahraga, dan TV lokal

### 3. Fallback Catalog (offline)

Hard-coded `fallbackCatalog.ts` dengan 3 channel yang terverifikasi (WION, Voice of America, DW) untuk digunakan saat API gagal.

---

## ⚠️ Disclaimer

HadesTV adalah **alat pencarian dan pemutaran** konten yang tersedia secara publik. Kami tidak memiliki, meng-host, atau menyediakan saluran TV itu sendiri. Semua konten berasal dari sumber pihak ketiga (`iptv-org`, `Free-TV/IPTV`).

- Hak siar dan konten tetap milik pemilik channel masing-masing.
- Data NSFW dan blocklist otomatis disembunyikan.
- Pastikan Anda mematuhi hukum hak cipta di wilayah Anda saat menggunakan aplikasi ini.

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Area yang bisa dibantu:

- 🎨 **UI/UX** — Polish, animasi, micro-interactions
- 🐛 **Bug fix** — Test di berbagai browser & device
- 📺 **Channel curated lists** — Update `src/lib/featured.ts` dengan ID channel baru
- 🌐 **Internasionalisasi** — Multi-bahasa (saat ini Bahasa Indonesia)
- 🧪 **Test** — Unit test, integration test, e2e test

### Development Workflow

1. Fork & clone
2. `bun install`
3. `bun dev` (dengan HMR)
4. Buat perubahan, test di browser
5. Commit dengan pesan yang jelas
6. Push & buat Pull Request

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 🙏 Kredit

- **[iptv-org](https://github.com/iptv-org/iptv)** — Data channel & stream
- **[Free-TV/IPTV](https://github.com/Free-TV/IPTV)** — Sumber stream tambahan
- **[hls.js](https://github.com/video-dev/hls.js/)** — Player video
- **[Bun](https://bun.sh)** — Runtime
- **[React](https://react.dev)**, **[Tailwind](https://tailwindcss.com)**, **[Radix UI](https://www.radix-ui.com/)**, **[Lucide](https://lucide.dev)** — Frontend stack

---

## 📞 Kontak

- **GitHub Issues**: [github.com/podsni/hadestv/issues](https://github.com/podsni/hadestv/issues)
- **Diskusi**: Buka discussion di repository

---

<div align="center">

**Dibuat dengan ❤️ untuk penikmat siaran publik.**

⭐ Star repo ini jika HadesTV bermanfaat untuk Anda!

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk riwayat pembaruan.

</div>
