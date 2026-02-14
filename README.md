# Sistem Jadwal Pendadaran AI - Full Stack

Aplikasi web full-stack modern untuk manajemen dan penjadwalan otomatis ujian pendadaran menggunakan algoritma AI.

## 🏗️ Arsitektur

Project ini telah dipisahkan menjadi **Frontend** dan **Backend** dengan PostgreSQL database:

```
jadwal-pendadaran/
├── frontend/          # Client-side application (Vite + Vanilla JS)
├── backend/           # Server-side API (Node.js + Express + PostgreSQL)
├── docs/              # Documentation
└── README.md          # This file
```

## 🚀 Fitur Utama

- **Penjadwalan Otomatis (Advanced Engine)** - Algoritma Sequential Greedy dengan strategi Student-First (prioritas mahasiswa bimbingan tersulit).
- **Proteksi Pembimbing** - Menjamin ketersediaan dosen pembimbing untuk mahasiswanya sendiri sebelum dijadikan penguji orang lain.
- **Manajemen Dosen** - Import dan kelola data dosen dari berbagai fakultas (FIK, FES, FST).
- **Manajemen Mahasiswa** - Kelola data mahasiswa dan pembimbing.
- **Aturan Ketersediaan** - Atur jadwal libur dan ketidaktersediaan dosen dengan matching nama yang cerdas.
- **Validasi Data** - Matching otomatis dengan master data SDM.
- **Gender Constraint** - Dukungan preferensi gender untuk tim penguji.

## 🛠️ Tech Stack

### Frontend
- **Vite** - Build tool & dev server
- **Vanilla JavaScript** - ES6+ modules
- **CSS3** - Modern styling dengan custom properties
- **Fetch API** - Komunikasi dengan backend

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database
- **PostgreSQL** - Relational database
- 7 tables: `master_dosen`, `dosen`, `mahasiswa`, `libur`, `slots`, `slot_examiners`, `app_settings`

# Jadwal Pendadaran AI System

System penjadwalan otomatis untuk pendadaran mahasiswa menggunakan algoritma cerdas, dibangun dengan Stack Modern (Node.js, React/Vite, PostgreSQL).

## 🐳 Quick Start dengan Docker (Recommended)

Cara termudah untuk menjalankan aplikasi ini adalah menggunakan Docker. Pastikan Docker Desktop sudah terinstall.

### 1. Persiapan
Pastikan file backup database tersedia di `backend/database/backup_latest.sql` (jika ada).

### 2. Jalankan Aplikasi
Buka terminal di root project dan jalankan:

```bash
docker-compose up --build
```

### 3. Akses Aplikasi
- **Frontend (Web App)**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Database**: Port 5433

> **Catatan Port:**
> Kami menggunakan port `8080` (Frontend), `3001` (Backend), dan `5433` (DB) untuk menghindari konflik dengan aplikasi lain yang mungkin sedang berjalan di komputer Anda.

### 4. Menghentikan Aplikasi
Tekan `Ctrl+C` atau jalankan:
```bash
docker-compose down
```

## 🛠 Manual Installation (Tanpa Docker)

### Prerequisites

- **Node.js** v18+ 
- **PostgreSQL** v15+
- **npm** atau **yarn**

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd jadwal-pendadaran
```

#### 2. Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy dan edit .env
cp .env.example .env
# Edit .env dan sesuaikan kredensial PostgreSQL Anda

# Inisialisasi database
npm run init-db

# Jalankan server
npm start
# atau untuk development dengan auto-reload:
npm run dev
```

Backend akan berjalan di `http://localhost:3000`

#### 3. Setup Frontend

```bash
# Masuk ke folder frontend (dari root)
cd frontend

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

#### 4. Akses Aplikasi

Buka browser dan akses `http://localhost:5173`

## 📚 Dokumentasi Detail

- **Frontend**: Lihat [frontend/README.md](frontend/README.md)
- **Backend**: Lihat [backend/README.md](backend/README.md)

## 🔧 Konfigurasi

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jadwal_pendadaran
DB_PORT=3306

PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎯 Workflow Penggunaan

1. **Start Backend**: Jalankan backend API terlebih dahulu
2. **Start Frontend**: Jalankan frontend dev server
3. **Import Data Dosen**: Data dosen akan otomatis dimuat dari CSV
4. **Tambah Mahasiswa**: Input data mahasiswa yang akan ujian
5. **Atur Ketersediaan**: Set jadwal libur atau ketidaktersediaan dosen
6. **Generate Jadwal**: Klik tombol "Proses Jadwal Otomatis"
7. **Review & Export**: Periksa hasil dan export jika diperlukan

## 📊 Database Schema

### Tables

1. **master_dosen** - Data master dari SDM
   - Menyimpan data lengkap dosen (NIK, nama, NIDN, dll)

2. **dosen** - Data dosen per fakultas
   - Relasi dengan master_dosen
   - Include flag `excluded` untuk disable dosen

3. **mahasiswa** - Data mahasiswa
   - NIM, nama, prodi, pembimbing

4. **libur** - Hari libur dan unavailability
   - Tanggal, waktu, ruangan, alasan

5. **slots** - Jadwal yang sudah digenerate
   - Tanggal, waktu, ruangan, mahasiswa

6. **slot_examiners** - Penguji untuk setiap slot
   - Relasi ke slots dengan CASCADE delete

7. **app_settings** - Application settings
   - Key-value store untuk konfigurasi

## 🔌 API Endpoints

### Main Endpoints

```
GET    /health                          # Health check
GET    /api/mahasiswa                   # Get all mahasiswa
POST   /api/mahasiswa                   # Create mahasiswa
GET    /api/dosen                       # Get all dosen
POST   /api/schedule/generate           # Generate schedule
GET    /api/slots                       # Get all slots
```

Lihat [backend/README.md](backend/README.md) untuk daftar lengkap endpoint.

## 🧪 Testing

### Test Backend
```bash
cd backend
# Test health check
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/mahasiswa
```

### Test Frontend
```bash
cd frontend
npm run dev
# Buka http://localhost:5173
```

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd backend
NODE_ENV=production npm start
```

Untuk production, gunakan PM2:
```bash
npm install -g pm2
pm2 start server.js --name jadwal-api
```

#### Frontend
```bash
cd frontend
npm run build
# Output di folder dist/
```

Deploy folder `dist/` ke web server (Nginx, Apache, etc.)

### Environment Variables

Pastikan set environment variables yang sesuai untuk production:
- Database credentials yang aman
- CORS origin yang sesuai
- NODE_ENV=production

## 🤝 Kontribusi

Project ini menggunakan modular architecture untuk memudahkan pengembangan:

### Backend
- Tambah endpoint baru di `routes/`
- Tambah business logic di `controllers/`
- Update database schema di `scripts/initDatabase.js`

### Frontend
- Tambah page baru di `src/ui/pages/`
- Tambah API call di `src/services/api.js`
- Update routing di `src/ui/router.js`

## 🐛 Troubleshooting

### Backend tidak bisa connect ke PostgreSQL
- Cek PostgreSQL service sudah running
- Cek kredensial di `.env`
- Cek port 3306 tidak bentrok

### Frontend tidak bisa connect ke Backend
- Pastikan backend running di port 3000
- Cek CORS settings
- Cek `.env` di frontend

### Database migration error
- Drop database: `DROP DATABASE jadwal_pendadaran;`
- Run init lagi: `npm run init-db`

## 📝 Changelog

### Version 1.0.0 - Full Stack Migration
- ✅ Pisahkan frontend dan backend
- ✅ Implementasi REST API
- ✅ Migrasi dari LocalStorage ke PostgreSQL
- ✅ Maintain semua fitur dan business logic existing
- ✅ Add comprehensive error handling
- ✅ Add API documentation

## 📝 License

Private - Internal Use Only

## 👥 Tim Pengembang

Developed for **Universitas Dian Nuswantoro**

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.
