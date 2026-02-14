# 📋 Struktur Rincian Jadwal Dosen (Enhanced)

## Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Versi View](#versi-view)
- [Detail Struktur](#detail-struktur)
- [Fitur-fitur](#fitur-fitur)
- [Cara Menggunakan](#cara-menggunakan)

---

## Gambaran Umum

Sistem Jadwal Pendadaran menyediakan **dua level detail** untuk Rincian Jadwal Dosen:

### 1️⃣ **Rincian Jadwal Dosen - SimpleView** (Sudah Ada)
   - Tampilan ringkas jadwal dosen
   - Info: Tanggal, Waktu, Ruang, Mahasiswa, Peran
   - Statistik dasar (Total Bimbingan, Total Menguji)

### 2️⃣ **Rincian Jadwal Dosen - DetailView** (Baru!)
   - Tampilan komprehensif dengan informasi lengkap
   - Info dosen lengkap (NIK, Prodi, Fakultas, Status)
   - Statistik detail (Penguji 1, Penguji 2, Bimbingan)
   - Jadwal terstruktur per tanggal
   - Info mahasiswa per jadwal (NIM, Prodi)
   - Opsi Cetak/Export

---

## Versi View

### Simple View (Default)
```
┌─────────────────────────────────────┐
│  Rincian Jadwal Dosen               │
│  Dr. John Doe, M.Kom.               │
├─────────────────────────────────────┤
│ [Total Bimbingan: X]  [Total Menguji: Y] │
├─────────────────────────────────────┤
│ Tabel Sederhana                     │
│ - Waktu | Ruang | Mahasiswa | Peran │
└─────────────────────────────────────┘
```

**Fitur:**
- ✅ Lihat jadwal basic
- ✅ Identifikasi peran (Pembimbing/Penguji)
- ✅ Statistik umum

---

### Detail View (New!)
```
┌──────────────────────────────────────────┐
│  📋 Rincian Jadwal Dosen (Detail)        │
├──────────────────────────────────────────┤
│  INFORMASI DOSEN                         │
│  ┌────────────────────────────────────┐ │
│  │ NIK: 12345678 | Prodi: S1 IF       │ │
│  │ Fakultas: FIK | Status: AKTIF ✓   │ │
│  └────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ STATISTIK JADWAL                         │
│ ┌─────┬─────┬─────┬──────┐             │
│ │Total│Pemb │Penguji1│Penguji2│       │
│ │ 10  │ 3   │ 4    │ 3    │       │
│ └─────┴─────┴─────┴──────┘             │
├──────────────────────────────────────────┤
│ JADWAL LENGKAP (Grouped by Date)        │
│                                        │
│ 📅 Senin, 16 Februari 2026  [3 Jadwal] │
│   ├─ 08:30 - Ruang A1                 │
│   │  Mahasiswa: Rina Wati (NIM: 22.12.001)│
│   │  Prodi: S1 SI | Peran: Pembimbing   │
│   │  Penguji Lain: 2 orang             │
│   │                                   │
│   ├─ 10:00 - Ruang B2                 │
│   │  ...                              │
│                                        │
│ 📅 Selasa, 17 Februari 2026 [2 Jadwal] │
│   ├─ 09:00 - Ruang A3                 │
│   │  ...                              │
├──────────────────────────────────────────┤
│ [🖨️  Cetak]  [Tutup]                    │
└──────────────────────────────────────────┘
```

**Fitur:**
- ✅ Informasi dosen lengkap (NIK, Prodi, Fakultas, Status)
- ✅ Statistik detail (Pembimbing, Penguji 1, Penguji 2)
- ✅ Jadwal grouped by date untuk readability
- ✅ Info mahasiswa detail (NIM, Prodi) per jadwal
- ✅ Visualisasi jumlah penguji lain
- ✅ Opsi cetak untuk laporan

---

## Detail Struktur

### 📝 Data Structure

#### Dosen Info Section
```javascript
{
  nik: string,           // e.g., "12345678"
  nama: string,          // e.g., "Dr. John Doe, M.Kom."
  prodi: string,         // e.g., "S1 Informatika"
  prodi_short: string,   // e.g., "S1 IF"
  fakultas: string,      // e.g., "FIK"
  status: string,        // "AKTIF" atau "OFF"
  exclude: boolean       // false = AKTIF, true = OFF
}
```

#### Schedule Item Structure
```javascript
{
  date: string,               // "2026-02-16"
  time: string,               // "08:30"
  room: string,               // "A1"
  student: string,            // Nama mahasiswa
  mahasiswaNIM: string,       // "22.12.001"
  mahasiswaProdi: string,     // "S1 Sistem Informasi"
  role: string,               // "Pembimbing" atau "Penguji 1" atau "Penguji 2"
  examiners: string[],        // Daftar nama penguji
  formatted: {
    dateFormatted: string,    // "Senin, 16 Februari 2026"
    daySchedules: Map<date, slots[]>
  }
}
```

#### Statistics Structure
```javascript
{
  totalSlots: number,        // Total jadwal
  totalBimbingan: number,    // Count role === "Pembimbing"
  totalMenguji: number,      // Count role !== "Pembimbing"
  totalPenguji1: number,     // Count role === "Penguji 1"
  totalPenguji2: number,     // Count role === "Penguji 2"
}
```

---

## Fitur-fitur

### 1. Informasi Dosen Lengkap
- Menampilkan NIK, Prodi, Fakultas dalam kartu header
- Indikator status (AKTIF/OFF)
- Gradien visual untuk emphasis

### 2. Statistik Komprehensif
- Total Jadwal (keseluruhan)
- Total Bimbingan (sebagai Pembimbing)
- Total Penguji 1
- Total Penguji 2
- Color-coded boxes untuk mudah dibedakan

### 3. Jadwal Terstruktur
- **Grouped by Date**: Jadwal dikelompokkan per tanggal untuk readability
- **Format Tanggal**: Menampilkan hari dalam bahasa Indonesia
- **Jadwal Counter**: Jumlah jadwal per hari ditampilkan
- **Card-based Layout**: Setiap jadwal dalam kartu terpisah

### 4. Detail Mahasiswa Per Jadwal
- Nama mahasiswa dengan highlight
- NIM (Nomor Identitas Mahasiswa)
- Prodi dengan shortname (e.g., "S1 IF")
- Info penguji lain yang bertugas

### 5. Visualisasi Peran
- **Pembimbing**: Badge primary (biru)
- **Penguji 1**: Badge success (hijau)
- **Penguji 2**: Badge warning (kuning)

### 6. Opsi Cetak
- Tombol "Cetak" untuk print ke PDF
- Format print yang clean dan profesional
- Meta info (tanggal cetak, nama dosen)

---

## Cara Menggunakan

### 1️⃣ Akses dari Halaman Dosen
```
Halaman: Management Dosen
  ↓
  Klik nama dosen (dengan icon 📅)
  ↓
  Modal "Rincian Jadwal Dosen" (Simple View) terbuka
```

### 2️⃣ Buka Detail View
```
Di Modal Simple View:
  ↓
  Klik tombol "📋 Lihat Detail Lengkap"
  ↓
  Modal "Rincian Jadwal Dosen (Detail)" terbuka
```

### 3️⃣ Cetak Jadwal
```
Di Modal Detail View:
  ↓
  Klik tombol "🖨️ Cetak"
  ↓
  Preview print terbuka
  ↓
  Cetak atau simpan sebagai PDF
```

---

## Teknologi & File

### Frontend Files
```
frontend/src/ui/components/
├── DosenScheduleModal.js              (Simple view - existing)
├── DosenDetailedScheduleModal.js       (Detail view - NEW!)
└── Modals.js                          (Integration)

frontend/src/
├── main.js                 (Added import & export)
└── utils/
    └── constants.js        (PRODI_SHORTNAMES)
```

### Key Functions

#### Simple View
```javascript
import { showLecturerSchedule } from './ui/components/DosenScheduleModal.js';

// Usage
window.showLecturerSchedule('Dr. John Doe, M.Kom.');
```

#### Detail View
```javascript
import { showDetailedLecturerSchedule } from './ui/components/DosenDetailedScheduleModal.js';

// Usage
window.showDetailedLecturerSchedule('Dr. John Doe, M.Kom.');
```

---

## UX Flow

```
┌─────────────────────────────────────────────┐
│     Management Dosen (Main Page)            │
│                                              │
│ [Tabel Dosen]                               │
│ Nama (🎯 Klik untuk jadwal)                 │
└─────────────────────────────────────────────┘
            ↓ Click nama dosen
┌─────────────────────────────────────────────┐
│  Rincian Jadwal Dosen (Simple View)        │
│                                              │
│  [Statistik Umum]                            │
│  [Tabel Dasar Jadwal]                       │
│                                              │
│  [📋 Lihat Detail] [Tutup]                  │
└─────────────────────────────────────────────┘
            ↓ Click "Lihat Detail"
┌─────────────────────────────────────────────┐
│  📋 Rincian Jadwal Dosen (Detail View)     │
│                                              │
│  [Info Dosen Lengkap]                      │
│  [Statistik Detail - 4 Metrik]              │
│  [Jadwal Grouped by Date]                   │
│  [Info Mahasiswa Detail per Jadwal]        │
│                                              │
│  [🖨️  Cetak] [Tutup]                       │
└─────────────────────────────────────────────┘
            ↓ Click "Cetak"
         [Print Preview]
```

---

## Fitur Tambahan (Future Enhancement)

- [ ] Export as PDF (automated)
- [ ] Export as Excel
- [ ] Email schedule ke dosen
- [ ] Filter by date range
- [ ] Filter by student prodi
- [ ] Comparison dengan dosen lain
- [ ] Calendar view option
- [ ] Conflict detection panel
- [ ] Notes/remarks per session
- [ ] Performance metrics (load distribution)

---

## Screenshot Reference

### Simple View (Top)
```
┌──────────────────────────┐
│ Rincian Jadwal Dosen     │
│ Dr. John Doe, M.Kom.     │
├──────────────────────────┤
│ [Stat1] [Stat2]          │
├──────────────────────────┤
│    Tabel Jadwal          │
│  (4 kolom, kompak)       │
├──────────────────────────┤
│ [Detail] [Tutup]         │
└──────────────────────────┘
```

### Detail View (Enhanced)
```
┌────────────────────────────────┐
│ 📋 Rincian Jadwal (Detail)     │
├────────────────────────────────┤
│     Kartu Info Dosen           │
│ (Warna, 4 field info)          │
├────────────────────────────────┤
│     Statistik 4 Metrik         │
│ (Grid 4 kolom, warna-warni)    │
├────────────────────────────────┤
│  📅 Tanggal [n Jadwal]        │
│   ├─ Waktu | Ruang            │
│   │  Mahasiswa + NIM + Prodi   │
│   │  Peran | Penguji Lain      │
├────────────────────────────────┤
│ [🖨️ Cetak] [Tutup]           │
└────────────────────────────────┘
```

---

## API Dependencies

### Dari APP_DATA
```javascript
APP_DATA.slots      // Jadwal yang sudah digenerate
APP_DATA.mahasiswa  // Data mahasiswa (untuk NIM, Prodi)
```

### Dari Helper Functions
```javascript
compareNames()      // Matching nama dosen (case-insensitive)
getAllDosen()       // Get semua dosen + info lengkap
PRODI_SHORTNAMES    // Mapping prodi ke shortname
```

---

## Notes

- ✅ Backward compatible dengan existing simple view
- ✅ Responsive design untuk mobile/tablet
- ✅ Print-friendly styling
- ✅ Localized dates (Indonesian format)
- ✅ Smooth animations
- ✅ Sticky header untuk better UX

---

**Last Updated:** February 13, 2026  
**Version:** 1.0 (Initial Release)
