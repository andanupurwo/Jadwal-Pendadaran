# 🔍 DEEP AUDIT REPORT - Jadwal Pendadaran Application
**Date:** 2026-02-13  
**Severity Level:** Mixed (Critical → Low)  
**Total Issues Found:** 42

---

## 📋 EXECUTIVE SUMMARY

Aplikasi ini sudah cukup matang untuk development, namun ada **beberapa isu kritis** yang perlu difix sebelum production:

- ✋ **5 CRITICAL ISSUES** (security/data integrity)
- ⚠️ **12 MAJOR BUGS** (functionality issues)
- 🟡 **15 CODE QUALITY** issues
- 📊 **10 PERFORMANCE** optimization opportunities

---

## 🔴 CRITICAL ISSUES (MUST FIX)

### 1. **Race Condition in Schedule Generation**
**File:** `backend/controllers/scheduleController.js` (lines 290-300)  
**Severity:** 🔴 CRITICAL  
**Problem:**
```javascript
// RACE CONDITION: examinerCounts updated DURING iteration
examinerCounts[ex] = (examinerCounts[ex] || 0) + 1;
// But quota check happens BEFORE this count is updated
if (d.max_slots !== null && currentCount >= d.max_slots) continue;
```
**Impact:** Dosen bisa exceed quota jika diproses paralel  
**Fix:** Use atomic updates atau lock dengan database transaction
```javascript
// Recommendation: Move quota validation to DB level atau use SERIALIZABLE transaction
await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
```

---

### 2. **Missing `exclude` Column in Database Schema**
**File:** `backend/database/init.js` (line 70)  
**Severity:** 🔴 CRITICAL  
**Problem:**
```javascript
// Schema has: excluded BOOLEAN DEFAULT FALSE
// But code refers to: dosen.exclude
// Mismatch between DB column name dan application code
```
**Current Code:** `dosenData.exclude` (inconsistent)  
**DB Schema:** `excluded` (column name)  
**Impact:** Exclude toggle tidak bekerja sempurna  
**Fix:**
```sql
-- Migration needed:
ALTER TABLE dosen RENAME COLUMN excluded TO exclude;
-- Or update all references dari .exclude ke .excluded
```

---

### 3. **Missing `pref_gender` & `max_slots` Column in Database**
**File:** `backend/database/init.js`  
**Severity:** 🔴 CRITICAL  
**Problem:**
```javascript
// Code updates max_slots dan pref_gender:
'UPDATE dosen SET nama = $1, ... pref_gender = $4, max_slots = $5 ...'
// Tapi column tidak ada di CREATE TABLE
```
**Impact:** Update dosen gagal, kuota tidak bisa disimpan  
**Fix:**
```sql
ALTER TABLE dosen ADD COLUMN IF NOT EXISTS pref_gender VARCHAR(10);
ALTER TABLE dosen ADD COLUMN IF NOT EXISTS max_slots INT;
ALTER TABLE dosen ALTER COLUMN pref_gender SET DEFAULT NULL;
ALTER TABLE dosen ALTER COLUMN max_slots SET DEFAULT NULL;
```

---

### 4. **Missing `penguji_1`, `penguji_2` Column in Mahasiswa Table**
**File:** `backend/controllers/mahasiswaController.js` (line 47)  
**Severity:** 🔴 CRITICAL  
**Problem:**
```javascript
// Trying to insert penguji_1, penguji_2 tapi column tidak ada:
'INSERT INTO mahasiswa (..., penguji_1, penguji_2, ...) ...'
```
**Fix:**
```sql
ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penguji_1 VARCHAR(255);
ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penguji_2 VARCHAR(255);
```

---

### 5. **SQL Injection Risk in Libur Table**
**File:** `backend/controllers/liburController.js` (line ~25)  
**Severity:** 🔴 CRITICAL  
**Problem:**
```javascript
// Missing foreign key validation untuk NIK
const { rows } = await pool.query(
    'INSERT INTO libur (date, time, room, reason, nik) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [date || null, time || null, room || null, reason || '', req.body.nik || null]
);
// Tidak validate apakah NIK ada di tabel dosen
```
**Impact:** Data orphan bisa terbentuk  
**Fix:**
```sql
-- Add foreign key constraint di libur table:
ALTER TABLE libur ADD COLUMN IF NOT EXISTS dosen_id INT;
ALTER TABLE libur ADD CONSTRAINT fk_libur_dosen FOREIGN KEY (dosen_id) REFERENCES dosen(id);
-- Atau validasi di code:
const { rowCount } = await pool.query(
    'SELECT 1 FROM dosen WHERE nik = $1', [req.body.nik]
);
if (rowCount === 0) return res.status(400).json({ error: 'NIK not found' });
```

---

## ⚠️ MAJOR BUGS (SHOULD FIX SOON)

### 6. **Inconsistent Column Name: `excluded` vs `exclude`**
**Files:** Multiple  
**Severity:** ⚠️ MAJOR  
**List of Inconsistencies:**
```
DB Column:   excluded (init.js line 70)
Code Usage:  dosen.exclude (multiple controllers)
            dosenData.exclude (scheduleController.js)
```
**Impact:** Exclude dosen mungkin tidak work correctly  
**Fix:** Standardize ke `exclude` everywhere atau `excluded` everywhere

---

### 7. **Missing Validation: Slot Uniqueness Not Enforced on examiners**
**File:** `backend/controllers/scheduleController_snippet.js`  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
// Tidak cek jika examiner sudah ada di slot examiners
// Bisa insert duplicate examiner names
INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order)
```
**Fix:**
```sql
-- Add unique constraint:
ALTER TABLE slot_examiners ADD CONSTRAINT unique_slot_examiner 
  UNIQUE (slot_id, examiner_name);
```

---

### 8. **No Input Sanitization for CSV Uploads**
**File:** `frontend/src/ui/components/Modals.js` (line ~730)  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
// Direct CSV parse tanpa sanitasi
let nama = fields[1] || '';
let nik = fields[0] || '';
// Bisa ada injection melalui CSV
```
**Fix:**
```javascript
// Sanitasi input:
function sanitizeInput(str) {
    return String(str).trim()
        .replace(/[<>"/]/g, '')  // Remove potential HTML/SQL chars
        .substring(0, 255);      // Limit length
}
```

---

### 9. **Password Stored with Weak Hashing Config**
**File:** `backend/database/init.js` (line ~175)  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
const hashedPassword = await bcrypt.hash('admin123', 10);
// Hardcoded default password in code - SECURITY RISK
```
**Fix:**
```javascript
// Move ke .env atau tidak auto-create
const DEFAULT_BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || 10);
// Jangan hardcode password di code
```

---

### 10. **JWT Secret Hardcoded & Weak**
**File:** `backend/controllers/authController.js` (line 6)  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_in_production_please';
// Fallback secret terlalu lemah, tidak random
```
**Fix:**
```javascript
// .env harus punya strong secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in .env');
}
```

---

### 11. **Libur Table Missing NIK Index**
**File:** `backend/database/init.js`  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
// Tidak ada index untuk libur.nik atau libur.dosen_name
// Setiap isDosenAvailable() scan seluruh libur table
```
**Impact:** Performance degradation untuk search ketersediaan  
**Fix:**
```sql
CREATE INDEX idx_libur_nik ON libur(nik);
CREATE INDEX idx_libur_date ON libur(date);
CREATE INDEX idx_libur_dosen_name ON libur(dosen_name);
```

---

### 12. **No Transaction Rollback for Bulk Mahasiswa Insert**
**File:** `backend/controllers/mahasiswaController.js` (line ~270)  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
for (const m of mahasiswa) {
    try {
        await client.query(...)  // Insert student
    } catch (err) {
        console.error(...) // Just log, continue
        // Jika error di tengah-tengah, beberapa done, some gagal
    }
}
```
**Impact:** Inconsistent data state  
**Fix:**
```javascript
// Use transaction for bulk:
await client.query('BEGIN');
try {
    for (const m of mahasiswa) {
        await client.query(...)
    }
    await client.query('COMMIT');
} catch (err) {
    await client.query('ROLLBACK');
    throw err;
}
```

---

### 13. **Missing Error Handling for Libur Overlaps**
**File:** `backend/controllers/liburController.js`  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
// Tidak cek jika entry sudah ada
// Bisa insert duplicate libur untuk same date+time+dosen
INSERT INTO libur (date, time, room, reason, nik)
```
**Fix:**
```sql
-- Add unique constraint:
ALTER TABLE libur ADD CONSTRAINT unique_libur_entry 
  UNIQUE (date, time, nik);
```

---

### 14. **Frontend Authentication Token Not Validated**
**File:** `frontend/src/services/auth.js` (line ~40)  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
export function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;  // Just check if exists, tidak validate
}
// Token bisa expired atau invalid, tapi code anggap ok
```
**Fix:**
```javascript
export function isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');  // Auto cleanup
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}
```

---

### 15. **Missing CORS Preflight for Requests**
**File:** `backend/server.js` (line ~25)  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
// Missing OPTIONS routing untuk complex requests
```
**Fix:**
```javascript
app.options('*', cors());  // Enable preflight untuk all routes
```

---

### 16. **No Rate Limiting on API**
**File:** `backend/server.js`  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
// Tidak ada rate limiting, bisa bruteforce login atau DDoS
```
**Fix:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // limit each IP to 100 requests per windowMs
    message: 'Terlalu banyak request, silakan coba lagi nanti'
});

app.use('/api/auth/login', limiter);
```

---

### 17. **No Validation for Duplicate Slots**
**File:** `backend/controllers/scheduleController.js`  
**Severity:** ⚠️ MAJOR  
**Problem:**
```javascript
// Constraint UNIQUE (date, time, room) hanya cek satu ruangan
// Tapi bisa ada konflik dosen di time yang sama
const slotExists = slotsData.find(s => 
    s.date === dateObj.value && s.time === time && s.room === room
);
// Tidak validate apakah penguji bentrok
```

---

## 🟡 CODE QUALITY ISSUES

### 18. **Inconsistent Error Messages**
**Files:** Multiple controllers  
**Severity:** 🟡 MEDIUM  
**Example:**
```javascript
// Sometimes:
res.status(500).json({ success: false, error: error.message });
// Sometimes:
res.status(500).json({ success: false, error: 'Internal server error' });
// Inconsistent format
```
**Fix:** Standardize error responses dengan consistent format

---

### 19. **Too Many Console.log Statements**
**Files:** Semua backend files  
**Severity:** 🟡 MEDIUM  
**Problem:** Production logging tidak proper, terlalu verbose  
**Fix:** Implement proper logging dengan Winston atau Pino:
```javascript
import logger from './config/logger.js';
logger.info('Message');
logger.error('Error', { error });
```

---

### 20. **Inconsistent Naming: `excluded` vs `exclude`**
**Files:** multiple  
**Severity:** 🟡 MEDIUM  
**Fix:** Choose one and standardize

---

### 21. **No JSDoc Comments on Functions**
**Files:** All backend controllers  
**Severity:** 🟡 MEDIUM  
**Fix:** Add JSDoc untuk API clarity
```javascript
/**
 * Create new mahasiswa
 * @param {Object} req - Express request
 * @param {string} req.body.nim - Student NIM
 * @param {string} req.body.nama - Student Name
 * @returns {Object} - Created student data
 */
export async function createMahasiswa(req, res) { ... }
```

---

### 22. **Magic Numbers in Code**
**File:** `backend/controllers/scheduleController.js`  
**Severity:** 🟡 MEDIUM  
**Example:**
```javascript
if (candidates.length >= 2) break;  // Why 2? Should be constant
```
**Fix:**
```javascript
const REQUIRED_EXAMINERS = 2;
const SUPERVISOR_POSITION = examiners.length - 1;
```

---

### 23. **No Input Validation Middleware**
**Files:** All routes  
**Severity:** 🟡 MEDIUM  
**Problem:** Each controller validates input instead of middleware  
**Fix:**
```javascript
import { body, validationResult } from 'express-validator';

const validateMahasiswa = [
    body('nim').notEmpty().isLength({ min: 5, max: 50 }),
    body('nama').notEmpty().isLength({ min: 3, max: 255 }),
    body('prodi').notEmpty()
];

router.post('/', validateMahasiswa, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ... handle
});
```

---

### 24. **Frontend State Management Too Simple**
**File:** `frontend/src/data/store.js`  
**Severity:** 🟡 MEDIUM  
**Problem:**
```javascript
export let APP_DATA = { ... };  // Mutable global, tidak trackable
// Tidak ada undo/redo, tidak ada proper change detection
```
**Recommendation:** Consider using MobX atau simple pub/sub pattern

---

### 25. **No Environment Variable Validation**
**File:** `backend/server.js` / `backend/config/database.js`  
**Severity:** 🟡 MEDIUM  
**Problem:**
```javascript
host: process.env.DB_HOST || 'localhost'  // Silent fallback
```
**Fix:**
```javascript
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        throw new Error(`Missing required environment variable: ${env}`);
    }
});
```

---

### 26. **No API Version Control**
**Files:** All API routes  
**Severity:** 🟡 MEDIUM  
**Problem:** API tidak versioned, breaking changes bisa break clients  
**Fix:**
```
GET /api/v1/mahasiswa  (instead of /api/mahasiswa)
```

---

### 27. **Weak Passwords for Default Admin**
**File:** `backend/database/init.js`  
**Severity:** 🟡 MEDIUM  
**Fix:** Force password change on first login atau use stronger default

---

## 📊 PERFORMANCE ISSUES

### 28. **N+1 Query Problem in Slots Fetching**
**File:** `backend/controllers/slotsController.js` (line ~15)  
**Severity:** 📊 MEDIUM  
**Problem:**
```javascript
const slotsWithExaminers = await Promise.all(
    slots.map(async (slot) => {
        const { rows: examiners } = await pool.query(
            'SELECT examiner_name FROM slot_examiners WHERE slot_id = $1',
            [slot.id]  // SEPARATE QUERY PER SLOT!
        );
        return { ...slot, examiners: examiners.map(e => e.examiner_name) };
    })
);
```
**Impact:** Untuk 1000 slots = 1000 extra queries!  
**Fix:**
```javascript
const { rows: allExaminers } = await pool.query(
    'SELECT slot_id, examiner_name FROM slot_examiners'
);
const examinerMap = {};
allExaminers.forEach(row => {
    if (!examinerMap[row.slot_id]) examinerMap[row.slot_id] = [];
    examinerMap[row.slot_id].push(row.examiner_name);
});
const slotsWithExaminers = slots.map(slot => ({
    ...slot,
    examiners: examinerMap[slot.id] || []
}));
```

---

### 29. **Missing Database Connection Pooling Configuration**
**File:** `backend/config/database.js`  
**Severity:** 📊 MEDIUM  
**Problem:** Node-postgres Pool tidak di-configure optimal
```javascript
// Ketika traffic tinggi, bisa kehabisan connections
```
**Fix:**
```javascript
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,                      // Max pool size
    idleTimeoutMillis: 30000,     // Release idle connections
    connectionTimeoutMillis: 2000  // Connection timeout
});
```

---

### 30. **Frontend Loading All Data at Once**
**File:** `frontend/src/data/store.js` (initializeData function)  
**Severity:** 📊 MEDIUM  
**Problem:**
```javascript
// Loads ALL:
await loadMahasiswaFromAPI();    // All students
await loadDosenFromAPI();        // All lecturers
await loadLiburFromAPI();        // All unavailability
await loadSlotsFromAPI();        // All slots
// Bisa lambat untuk large datasets
```
**Fix:** Implement pagination/lazy loading:
```javascript
export async function loadMahasiswaFromAPI(page = 1, limit = 50) {
    const response = await mahasiswaAPI.getAll({ page, limit });
    // ...
}
```

---

### 31. **No Caching Strategy**
**Files:** All frontend services  
**Severity:** 📊 MEDIUM  
**Problem:** Setiap re-render fetch data lagi  
**Fix:**
```javascript
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getMahasiswaWithCache() {
    if (cache.mahasiswa && cache.mahasiswaTime > Date.now() - CACHE_TTL) {
        return cache.mahasiswa;
    }
    const data = await mahasiswaAPI.getAll();
    cache.mahasiswa = data;
    cache.mahasiswaTime = Date.now();
    return data;
}
```

---

### 32. **Inefficient Array Operations**
**File:** `backend/controllers/scheduleController.js` (line ~290)  
**Severity:** 📊 MEDIUM  
**Problem:**
```javascript
// O(n) lookup dalam loop - O(n²) complexity
const isBusy = slot.examiners && slot.examiners.some(ex => 
    normalizeName(ex) === searchNameNorm
);
```
**Fix:**
```javascript
// Use Set untuk O(1) lookup
const normalizedExaminers = new Set(
    slot.examiners.map(ex => normalizeName(ex))
);
const isBusy = normalizedExaminers.has(searchNameNorm);
```

---

### 33. **No Database Query Optimization**
**File:** Multiple controllers  
**Severity:** 📊 MEDIUM  
**Problem:**
```javascript
await pool.query('SELECT * FROM dosen WHERE exclude = FALSE');
// Tidak specify columns yang dibutuhkan
```
**Fix:**
```javascript
await pool.query(`
    SELECT id, nik, nama, prodi, fakultas, pref_gender, max_slots 
    FROM dosen 
    WHERE exclude = FALSE
`);
```

---

### 34. **Synchronous File Operations**
**File:** Various  
**Severity:** 📊 MEDIUM  
**Problem:** Some file operations bisa block event loop  
**Fix:** Use async file operations

---

### 35. **No Compression Middleware**
**File:** `backend/server.js`  
**Severity:** 📊 MEDIUM  
**Problem:** API responses tidak compressed
```javascript
// Add:
import compression from 'compression';
app.use(compression());  // Gzip responses
```

---

### 36. **Missing Database Statistics Collection**
**Severity:** 📊 MEDIUM  
**Fix:**
```sql
-- Periodically:
ANALYZE;
VACUUM ANALYZE;
```

---

### 37. **No API Response Pagination**
**File:** All GET endpoints  
**Severity:** 📊 MEDIUM  
**Problem:** Endpoint mengembalikan ALL data
```javascript
GET /api/slots  // Bisa return 10,000 slots!
```
**Fix:**
```javascript
GET /api/slots?page=1&limit=50&date=2026-02-16
```

---

## 🗄️ DATABASE ISSUES

### 38. **Missing Indexes on Foreign Keys**
**File:** `backend/database/init.js`  
**Severity:** 🗄️ MEDIUM  
**Problem:**
```sql
-- slot_examiners(slot_id) ada index dari PRIMARY KEY
-- Tapi FOREIGN KEYs tidak auto-indexed di PostgreSQL
```
**Fix:**
```sql
CREATE INDEX idx_slot_examiners_slot_id ON slot_examiners(slot_id);
CREATE INDEX idx_mahasiswa_nim ON mahasiswa(nim);
```

---

### 39. **Date/Time Format Inconsistency**
**File:** Database & code  
**Severity:** 🗄️ MEDIUM  
**Problem:**
```javascript
// DB stores as VARCHAR(20)
// Format: "2026-02-16" or "02/16/2026" or "16-02-2026"?
// Tidak consistent
```
**Fix:**
```sql
-- Change to DATE type:
ALTER TABLE libur ALTER COLUMN date TYPE DATE USING date::date;
ALTER TABLE slots ALTER COLUMN date TYPE DATE USING date::date;
ALTER TABLE slots ALTER COLUMN time TYPE TIME USING time::time;
```

---

### 40. **No Database Backups Strategy Documented**
**Severity:** 🗄️ MEDIUM  
**Recommendation:**
```bash
# Add backup script:
pg_dump -U postgres jadwal_pendadaran > backup_$(date +%Y%m%d).sql
# Automate dengan cron
```

---

## 🔒 SECURITY ISSUES

### 41. **No HTTPS Enforcement**
**Severity:** 🔒 MEDIUM  
**File:** `backend/server.js`  
**Fix:** Add helmet middleware & enforce HTTPS in production
```javascript
import helmet from 'helmet';
app.use(helmet());  // Security headers

// In production:
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            return res.redirect(301, 'https://' + req.header('host') + req.url);
        }
        next();
    });
}
```

---

### 42. **localStorage Token Vulnerable to XSS**
**File:** `frontend/src/services/auth.js`  
**Severity:** 🔒 MEDIUM  
**Problem:**
```javascript
localStorage.setItem('token', response.token);  // Vulnerable to XSS
```
**Fix:** Use httpOnly cookies instead (server-side):
```javascript
// Backend should set:
res.cookie('token', token, {
    httpOnly: true,    // Not accessible via JS
    secure: true,      // HTTPS only
    sameSite: 'strict' // CSRF protection
});
```

---

## 📈 OPTIMIZATION RECOMMENDATIONS

### Backend Optimizations

1. **Add Query Caching Layer**
   - Redis untuk frequent queries
   - TTL-based cache untuk settings

2. **Batch Processing**
   - Implement job queue (Bull, BullMQ)
   - Async schedule generation untuk load > 500 students

3. **API Gateway**
   - Tambah API versioning
   - Request/response compression
   - OpenAPI/Swagger documentation

4. **Database Tuning**
   ```sql
   -- Increase work_mem untuk complex queries
   SET work_mem = '256MB';
   
   -- Tune query planner
   EXPLAIN ANALYZE SELECT ... ;
   ```

---

### Frontend Optimizations

1. **Code Splitting & Lazy Loading**
   ```javascript
   const HomePage = lazy(() => import('./pages/Home.js'));
   const DoseenPage = lazy(() => import('./pages/Dosen.js'));
   ```

2. **Virtual Scrolling for Large Lists**
   - Implement untuk 1000+ mahasiswa

3. **Service Workers**
   - Offline support
   - Background sync

4. **Module Bundling**
   - Add bundler (Vite/Rollup config)
   - Tree-shaking unused code

---

### Database Optimizations

1. **Partitioning**
   ```sql
   -- Partition slots by date untuk faster queries
   CREATE TABLE slots_2026_02 PARTITION OF slots
   FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
   ```

2. **Materialized Views**
   ```sql
   CREATE MATERIALIZED VIEW examiner_load AS
   SELECT examiner_name, COUNT(*) as slot_count
   FROM slot_examiners
   GROUP BY examiner_name;
   ```

3. **Read Replicas**
   - Master untuk writes
   - Replicas untuk reads (reports, scheduling preview)

---

## 🛠️ QUICK FIX CHECKLIST

**Priority 1 (This Week):**
- [ ] Fix missing `exclude`, `pref_gender`, `max_slots`, `penguji_1`, `penguji_2` columns
- [ ] Add foreign key validation untuk libur.nik
- [ ] Fix N+1 query dalam getAllSlots
- [ ] Implement JWT token validation in frontend
- [ ] Add CORS preflight handling

**Priority 2 (Next 2 Weeks):**
- [ ] Add input validation middleware
- [ ] Implement rate limiting
- [ ] Add unique constraints untuk duplicate prevention
- [ ] Setup proper logging instead console.log
- [ ] Add database indexes untuk foreign keys

**Priority 3 (This Month):**
- [ ] Implement pagination untuk large datasets
- [ ] Add caching layer (Redis)
- [ ] Move token from localStorage to httpOnly cookies
- [ ] Add JSDoc comments
- [ ] Create API documentation (Swagger)

---

## 📝 MIGRATION SCRIPTS NEEDED

```sql
-- Run ini sebelum app bisa berfungsi optimal:

-- 1. Add missing columns
ALTER TABLE dosen ADD COLUMN IF NOT EXISTS exclude BOOLEAN DEFAULT FALSE;
ALTER TABLE dosen ADD COLUMN IF NOT EXISTS pref_gender VARCHAR(10);
ALTER TABLE dosen ADD COLUMN IF NOT EXISTS max_slots INT;
ALTER TABLE dosen RENAME COLUMN excluded TO exclude;  -- If exists

ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penguji_1 VARCHAR(255);
ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penguji_2 VARCHAR(255);

ALTER TABLE libur ADD COLUMN IF NOT EXISTS dosen_name VARCHAR(255);

-- 2. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_libur_nik ON libur(nik);
CREATE INDEX IF NOT EXISTS idx_libur_date ON libur(date);
CREATE INDEX IF NOT EXISTS idx_libur_dosen_name ON libur(dosen_name);
CREATE INDEX IF NOT EXISTS idx_slot_examiners_slot_id ON slot_examiners(slot_id);
CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON mahasiswa(nim);

-- 3. Add constraints
ALTER TABLE libur ADD CONSTRAINT unique_libur_entry 
  UNIQUE (date, time, nik);

ALTER TABLE slot_examiners ADD CONSTRAINT unique_slot_examiner 
  UNIQUE (slot_id, examiner_name);
```

---

## 🎯 CONCLUSION

Aplikasi ini memiliki **solid foundation** tapi membutuhkan perbaikan di area:
1. ✅ Database schema consistency
2. ✅ Error handling & validation
3. ✅ Security hardening
4. ✅ Performance optimization

**Estimated fix time:** 3-5 hari development untuk fix Critical + Major issues.

Setelah fix semua critical issues, aplikasi **siap untuk production deployment**.

---

**Report by:** AI Code Audit  
**Last Updated:** 2026-02-13
