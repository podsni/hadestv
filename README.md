# HadesTV

HadesTV adalah platform streaming IPTV berbasis web yang ringan, cepat, dan mengutamakan privasi. Aplikasi ini memungkinkan pengguna untuk menemukan dan menonton ribuan saluran TV publik dari seluruh dunia tanpa perlu mendaftar, onboarding, atau memberikan data pribadi.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Bun](https://img.shields.io/badge/Bun-1.1-000000?logo=bun)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)

## 🚀 Fitur Utama

- **Discovery Cepat**: Cari saluran berdasarkan nama, negara, kategori, atau bahasa dengan antarmuka yang responsif.
- **Player HLS Terintegrasi**: Pemutaran video berkualitas tinggi menggunakan `hls.js` untuk dukungan stream M3U8 yang stabil.
- **Favorit Lokal**: Simpan saluran favorit Anda langsung di browser tanpa sinkronisasi cloud atau akun.
- **Tanpa Login**: Akses langsung ke konten. Tidak ada pengumpulan data, tidak ada pelacakan.
- **Desain Adaptif**: Pengalaman menonton yang optimal baik di desktop maupun perangkat seluler.
- **Sumber Terpercaya**: Menggunakan metadata dari komunitas `iptv-org` yang selalu diperbarui.

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh) (Fast all-in-one JavaScript runtime)
- **Frontend**: [React 19](https://react.dev) dengan TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) & [Radix UI](https://www.radix-ui.com/)
- **Ikon**: [Lucide React](https://lucide.dev)
- **Video Playback**: [HLS.js](https://github.com/video-dev/hls.js/)
- **Bundling/Serving**: Fitur native `Bun.serve` dan transpiler built-in Bun.

## 📦 Instalasi

Pastikan Anda telah menginstal [Bun](https://bun.sh) di sistem Anda.

1. Klon repositori ini:
   ```bash
   git clone git@github.com:podsni/hadestv.git
   cd hadestv
   ```

2. Instal dependensi:
   ```bash
   bun install
   ```

## 💻 Penggunaan

### Pengembangan
Jalankan server pengembangan dengan Hot Module Replacement (HMR):
```bash
bun dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Produksi
Untuk menjalankan aplikasi dalam mode produksi:
```bash
bun start
```

### Build
Jika Anda ingin melakukan build manual:
```bash
bun run build
```

## 📂 Struktur Proyek

```text
├── src/
│   ├── components/      # Komponen UI (Atomic & Layout)
│   ├── hooks/           # Custom React hooks (Favorites, Catalog)
│   ├── lib/             # Logika inti & Utility (IPTV handling)
│   ├── server/          # Backend service (Bun.serve logic)
│   ├── data/            # Data statis & fallback
│   ├── App.tsx          # Komponen utama aplikasi
│   ├── frontend.tsx     # Entry point client-side
│   └── index.ts         # Entry point server-side (Bun)
├── styles/              # Global CSS & Tailwind config
└── tests/               # Unit & Integration tests
```

## 📖 Prinsip Desain

1. **Tonton Dulu, Konfigurasi Belakangan**: Konten adalah raja. Antarmuka tidak boleh menghalangi pengalaman menonton.
2. **Status Jujur**: Memberikan feedback yang jelas saat loading atau jika stream mengalami gangguan.
3. **Privasi adalah Fitur**: Semua preferensi disimpan secara lokal di perangkat pengguna.
4. **Ringan & Jelas**: Menghindari elemen visual yang berisik atau iklan palsu.

## ⚠️ Disclaimer

HadesTV adalah alat pencarian dan pemutaran konten yang tersedia secara publik. Kami tidak memiliki, meng-host, atau menyediakan saluran TV itu sendiri. Semua konten berasal dari sumber pihak ketiga yang dikumpulkan oleh komunitas `iptv-org`. Pastikan Anda mematuhi hukum hak cipta di wilayah Anda saat menggunakan aplikasi ini.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---
Dibuat dengan ❤️ untuk penikmat siaran publik. Lihat [CHANGELOG.md](./CHANGELOG.md) untuk riwayat pembaruan.
