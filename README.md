# Jadwal Pendadaran AI 🎓

Sistem Penjadwalan Sidang Pendadaran Otomatis berbasis Web.

![Project Status](https://img.shields.io/badge/status-production_ready-success)
![Docker](https://img.shields.io/badge/docker-supported-blue)

## 📋 Tentang Aplikasi
Aplikasi ini dirancang untuk mempermudah prodi dalam menyusun jadwal sidang pendadaran mahasiswa. Menggunakan algoritma cerdas untuk memasangkan mahasiswa, dosen pembimbing, dan penguji dalam slot waktu dan ruangan yang tersedia tanpa bentrok.

## 🚀 Fitur Utama
- **Penjadwalan Otomatis**: Generate jadwal ratusan mahasiswa dalam hitungan detik.
- **Drag & Drop**: Kemudahan memindahkan jadwal secara manual.
- **Export Data**: Unduh jadwal dalam format Excel/CSV.
- **Manajemen Data**: CRUD data Mahasiswa, Dosen, Ruangan, dan Libur.
- **Keamanan**: Proteksi terhadap aksi berbahaya (Hapus Semua, Reset) dengan konfirmasi berlapis.
- **Log Aktivitas**: Mencatat setiap perubahan data untuk audit trail.

## 🛠️ Teknologi
- **Frontend**: Vanilla Javascript + Vite (Ringan & Cepat)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Infrastructure**: Docker & Docker Compose

## 📂 Struktur Folder
```
jadwal_pendadaran/
├── backend/            # Server-side logic (Node.js)
│   ├── src/            # Source code (Controller, Routes, Config)
│   └── database/       # Migration & Backup files
├── frontend/           # Client-side logic (Vite)
│   ├── src/            # Components, Pages, Logic
│   └── public/         # Static assets
├── docs/               # Dokumentasi teknis
├── trash/              # Arsip file lama (segara dihapus)
└── docker-compose.yml  # Orkestrasi container
```

## 🏁 Cara Menjalankan (Production)

Pastikan **Docker** dan **Docker Compose** sudah terinstall.

1.  **Clone Repository**
    ```bash
    git clone https://github.com/andanupurwo/jadwal_pendadaran.git
    cd jadwal_pendadaran
    ```

2.  **Jalankan dengan Docker**
    ```bash
    docker-compose up -d --build
    ```

3.  **Akses Aplikasi**
    Buka browser dan kunjungi: `http://localhost:8080`

## 🛡️ Kebijakan Privasi & Keamanan Data
- **Data Produksi**: Data mahasiswa dan dosen tersimpan aman di **Database PostgreSQL** (Docker Volume) dan **TIDAK** disertakan dalam repository ini.
- **Bebas Mock Data**: Kode sumber telah dibersihkan dari data dummy/mock yang berpotensi membingungkan.
- **Proteksi Aksi**: Fitur berbahaya (Reset, Hapus Semua) dilindungi konfirmasi ganda.

## 🧹 Status Kebersihan Kode
- **No Dead Code**: Skrip tidak terpakai dan console.log debug telah dibersihkan.
- **Struktur Standar**: Mengikuti best practice struktur project modern.
- **Optimized**: Bundle frontend diminimalkan untuk performa terbaik.

## 🤝 Kontribusi (Dev)
Lihat folder `docs/` untuk panduan kontribusi lebih lanjut.

---
© 2026 Tim Pengembang Jadwal Pendadaran
