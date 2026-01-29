# Project Structure Documentation

## 📁 Struktur Folder

```
jadwal-pendadaran/
├── src/
│   ├── assets/
│   │   └── data/                    # Data CSV
│   │       ├── Data pegawai - DAAK.csv
│   │       └── Dosen Prodi.csv
│   ├── config/
│   │   └── constants.js             # Konstanta aplikasi (ROOMS, TIMES, DATES, dll)
│   ├── data/
│   │   └── store.js                 # State management & persistence
│   ├── logic/
│   │   ├── availability.js          # Logika ketersediaan dosen
│   │   └── matching.js              # Algoritma matching data
│   ├── utils/
│   │   └── helpers.js               # Fungsi utility umum
│   ├── loadDosenData.js             # Loader data SDM
│   ├── loadFacultyData.js           # Loader data fakultas
│   ├── main.js                      # Entry point aplikasi
│   └── style.css                    # Styling
├── public/                          # Static assets
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── README.md                        # Dokumentasi project
└── .gitignore                       # Git ignore rules
```

## 📦 Modul & Tanggung Jawab

### `src/config/constants.js`
**Tujuan**: Centralized configuration
- `ROOMS`: Array ruangan yang tersedia
- `TIMES`: Array waktu sesi ujian
- `DATES`: Array tanggal pelaksanaan
- `MAX_EXAMINER_ASSIGNMENTS`: Batas maksimal tugas penguji
- `DATA_PATHS`: Path ke file CSV

### `src/data/store.js`
**Tujuan**: State management & data persistence
- `MOCK_DATA`: Object utama untuk menyimpan semua data
- `appState`: State aplikasi (currentView, selectedDate, dll)
- Persistence helpers (save/load to LocalStorage)
- Re-export constants untuk backward compatibility

**Exports**:
- `MOCK_DATA`, `appState`
- `ROOMS`, `TIMES`, `DATES`, `MAX_EXAMINER_ASSIGNMENTS`
- `saveExcludedDosenToStorage()`, `loadExcludedDosenFromStorage()`
- `saveLiburToStorage()`, `loadLiburFromStorage()`
- `saveMahasiswaToStorage()`, `loadMahasiswaFromStorage()`
- `saveSlotsToStorage()`, `loadSlotsFromStorage()`

### `src/utils/helpers.js`
**Tujuan**: Utility functions yang reusable

**Exports**:
- `getAllDosen()`: Ambil semua dosen dari semua fakultas
- `sortData(data, column)`: Sort data berdasarkan kolom
- `filterData(data, term)`: Filter data berdasarkan search term
- `normalizeName(name)`: Normalisasi nama untuk matching
- `getSimilarity(s1, s2)`: Hitung similarity score dua string
- `parseCSVLine(line)`: Parse CSV line dengan handling quotes

### `src/logic/matching.js`
**Tujuan**: Algoritma matching data dosen dengan SDM

**Exports**:
- `processMatching()`: Main function untuk matching
- `MANUAL_OVERRIDES`: Object untuk override manual
- `SIMILARITY_THRESHOLD`: Threshold untuk matching

**Cara Kerja**:
1. Normalisasi nama dari CSV fakultas
2. Cari best match di master SDM
3. Apply manual overrides jika ada
4. Update matchResult di data dosen

### `src/logic/availability.js`
**Tujuan**: Logika pengecekan ketersediaan dosen

**Exports**:
- `isDosenAvailable(namaDosen, date, time, excludeSlotStudent)`: Check availability

**Aturan yang dicek**:
1. Status OFF (exclude = true)
2. Specific date rules
3. Date range rules
4. Recurring time rules
5. Existing schedule conflicts

### `src/loadDosenData.js`
**Tujuan**: Load master data SDM dari CSV

**Exports**:
- `loadDosenData()`: Async function untuk load CSV

**Format CSV**: `Data pegawai - DAAK.csv`
- Separator: `;` (semicolon)
- Columns: No, Nik, Status, Nama, Kategori, NIDN, Jenis Kelamin
- Filter: Hanya ambil yang Status = "DOSEN"

### `src/loadFacultyData.js`
**Tujuan**: Load data dosen per fakultas dari CSV

**Exports**:
- `loadFacultyData()`: Async function untuk load CSV
- `verifyFacultyData()`: Verify dan trigger matching

**Format CSV**: `Dosen Prodi.csv`
- Separator: `,` (comma)
- Columns: Nomor, NIK, Nama, Prodi, Fakultas
- Group by: Fakultas (FIK, FES, FST)

### `src/main.js`
**Tujuan**: Main application logic & UI rendering

**Struktur**:
1. Imports dari semua modul
2. State aliases untuk backward compatibility
3. Helper functions (parseCSVLine, importFaculty)
4. Views object (home, dosen, mahasiswa, libur, logic)
5. Navigation & rendering logic
6. Window functions untuk event handlers
7. Modal handlers
8. Schedule generation logic
9. Initialization

## 🔄 Data Flow

```
1. Initialization (initializeApp)
   ↓
2. Load CSV Data
   ├── loadDosenData() → MOCK_DATA.masterDosen
   └── loadFacultyData() → MOCK_DATA.facultyData
   ↓
3. Process Matching
   └── processMatching() → Update matchResult
   ↓
4. Load from LocalStorage
   ├── loadExcludedDosenFromStorage()
   ├── loadLiburFromStorage()
   ├── loadMahasiswaFromStorage()
   └── loadSlotsFromStorage()
   ↓
5. Render Initial View
   └── navigate('home')
```

## 🎨 UI Components

### Views
- `home`: Jadwal ruangan (grid view)
- `dosen`: Data dosen (tabbed: FIK, FES, FST, SDM)
- `mahasiswa`: Data mahasiswa (table)
- `libur`: Aturan ketersediaan (table)
- `logic`: Eksplorasi algoritma (info)

### Modals
- Add Mahasiswa Modal
- Add Dosen Modal
- Add Libur Modal
- Slot Detail Modal

## 💾 Data Persistence

Semua data disimpan di LocalStorage dengan key:
- `excluded_dosen_v1`: Dosen yang di-exclude
- `libur_data_v1`: Aturan ketersediaan
- `mahasiswa_data_v1`: Data mahasiswa
- `slots_data_v1`: Data jadwal

## 🚀 Development Workflow

1. **Tambah Fitur Baru**:
   - Logic → `src/logic/`
   - Utility → `src/utils/`
   - Constants → `src/config/`
   - UI → `src/main.js` (views)

2. **Update Data Format**:
   - Update loader di `loadDosenData.js` atau `loadFacultyData.js`
   - Update store structure di `src/data/store.js`

3. **Testing**:
   ```bash
   npm run dev
   ```
   - Test di browser
   - Check console untuk errors
   - Verify LocalStorage persistence

## 📝 Best Practices

1. **Modular Code**: Pisahkan logic ke modul yang sesuai
2. **Single Responsibility**: Setiap function punya satu tujuan
3. **Constants**: Gunakan constants dari `config/` jangan hardcode
4. **Error Handling**: Selalu wrap async operations dengan try-catch
5. **Comments**: Tambahkan comment untuk logic yang kompleks
6. **Naming**: Gunakan nama yang descriptive dan consistent

## 🔧 Maintenance

### Update Tanggal Periode
Edit `src/config/constants.js`:
```javascript
export const DATES = [
    { value: '2026-03-01', label: 'Senin', display: '1 Mar' },
    // ... tambah tanggal baru
];
```

### Update Ruangan
Edit `src/config/constants.js`:
```javascript
export const ROOMS = ['6.3.A', '6.3.B', /* tambah ruangan */];
```

### Update CSV Data
Replace file di `src/assets/data/`:
- `Data pegawai - DAAK.csv` (master SDM)
- `Dosen Prodi.csv` (data fakultas)

## 🐛 Troubleshooting

### Data tidak muncul
1. Check browser console untuk errors
2. Verify CSV path di loader files
3. Clear LocalStorage: `localStorage.clear()`

### Matching tidak akurat
1. Update `MANUAL_OVERRIDES` di `src/logic/matching.js`
2. Adjust `SIMILARITY_THRESHOLD`

### Jadwal tidak ter-generate
1. Check ketersediaan dosen
2. Verify mahasiswa punya pembimbing
3. Check console untuk constraint violations
