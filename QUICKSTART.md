# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan aplikasi Jadwal Pendadaran.

## ⚡ Super Quick Start (Recommended)

Jalankan setup script otomatis:

```bash
# Dari root project
./setup.sh
```

Script akan:
- Install semua dependencies (backend & frontend)
- Setup .env files
- Memberikan instruksi langkah selanjutnya

## 📋 Manual Setup

### 1️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2️⃣ Setup Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_pgsql_password
DB_NAME=jadwal_pendadaran
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend:**
File `.env` sudah ada dengan default:
```env
VITE_API_URL=http://localhost:3000/api
```

### 3️⃣ Setup Database

**Start PostgreSQL:**
```bash
# macOS (dengan Homebrew)
brew services start PostgreSQL

# Linux
sudo systemctl start PostgreSQL
```

**Initialize Database:**
```bash
cd backend
npm run init-db
```

Output expected:
```
✅ Database 'jadwal_pendadaran' created
✅ Table master_dosen created
✅ Table dosen created
✅ Table mahasiswa created
✅ Table libur created
✅ Table slots created
✅ Table slot_examiners created
✅ Table app_settings created
🎉 Database initialization completed successfully!
```

### 4️⃣ Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Output expected:
```
✅ PostgreSQL Database connected successfully
🚀 Jadwal Pendadaran Backend API
📡 Server running on: http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Output expected:
```
VITE v7.2.4  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 5️⃣ Open Application

Buka browser dan akses:
```
http://localhost:5173
```

## ✅ Verification Checklist

- [ ] Backend running di port 3000
- [ ] Frontend running di port 5173
- [ ] PostgreSQL database created
- [ ] No console errors
- [ ] Data dosen loaded from CSV
- [ ] Can navigate between pages

## 🧪 Test the Application

### 1. Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get mahasiswa (should be empty initially)
curl http://localhost:3000/api/mahasiswa

# Get dosen (should be loaded from CSV)
curl http://localhost:3000/api/dosen
```

### 2. Test Frontend

1. **Navigate to Dosen page** - Should show list of dosen grouped by fakultas
2. **Navigate to Mahasiswa page** - Add a test student
3. **Navigate to Logika page** - Try generating schedule
4. **Navigate to Ruangan page** - View the generated schedule

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend API"

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not running, start it:
cd backend
npm run dev
```

### Issue: "Database connection failed"

**Solution:**
```bash
# Check PostgreSQL is running
PostgreSQL -u root -p

# If error, start PostgreSQL:
# macOS:
brew services start PostgreSQL

# Linux:
sudo systemctl start PostgreSQL
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in backend/.env:
PORT=3001
```

### Issue: "Port 5173 already in use"

**Solution:**
```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Vite will automatically use next available port
```

### Issue: "Data dosen tidak muncul"

**Solution:**
1. Check backend console for errors
2. Verify CSV files exist in `frontend/src/assets/data/`
3. Refresh the page
4. Check browser console for errors

## 📊 Next Steps

After successful setup:

1. **Import Data**
   - Data dosen akan otomatis dimuat dari CSV
   - Tambahkan data mahasiswa melalui UI

2. **Configure Settings**
   - Edit `frontend/src/config/constants.js` untuk:
     - Tanggal pelaksanaan
     - Ruangan yang tersedia
     - Waktu sesi

3. **Generate Schedule**
   - Navigasi ke halaman "Logika"
   - Pilih scope dan mode
   - Klik "Proses Jadwal Otomatis"

4. **Review Results**
   - Navigasi ke halaman "Ruangan"
   - Filter berdasarkan tanggal
   - Export jika diperlukan

## 📚 Documentation

- **[README.md](../README.md)** - Project overview
- **[API.md](../docs/API.md)** - API documentation
- **[ARCHITECTURE.md](../docs/ARCHITECTURE.md)** - System architecture
- **[REFACTORING.md](../docs/REFACTORING.md)** - Refactoring notes
- **[Backend README](../backend/README.md)** - Backend details
- **[Frontend README](../frontend/README.md)** - Frontend details

## 💡 Tips

1. **Development**
   - Use `npm run dev` untuk auto-reload
   - Check browser console untuk errors
   - Check terminal untuk backend logs

2. **Database**
   - Backup database sebelum testing:
     ```bash
     PostgreSQLdump -u root -p jadwal_pendadaran > backup.sql
     ```
   - Restore jika diperlukan:
     ```bash
     PostgreSQL -u root -p jadwal_pendadaran < backup.sql
     ```

3. **Performance**
   - Tutup unused browser tabs
   - Clear browser cache jika ada masalah
   - Restart backend jika response lambat

## 🎉 Success!

Jika semua berjalan lancar, Anda seharusnya melihat:
- ✅ Frontend loading dengan sidebar navigation
- ✅ Data dosen muncul di halaman Dosen
- ✅ Bisa CRUD mahasiswa
- ✅ Bisa generate jadwal otomatis
- ✅ Bisa lihat hasil jadwal

---

**Happy Coding! 🚀**
