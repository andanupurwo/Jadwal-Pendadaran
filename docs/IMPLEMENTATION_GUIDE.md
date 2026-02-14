# 🔧 IMPLEMENTATION GUIDE - Audit Fixes

**Priority Order:** Critical → Major → Medium

---

## 🚨 CRITICAL FIXES (Do First)

### 1. Run Database Migration
```bash
cd backend
psql -h 127.0.0.1 -U postgres -d jadwal_pendadaran \
  -f ../database/migrate_20260213_critical_fixes.sql
```
✅ This fixes missing columns and indexes

---

### 2. Update Backend Code - Column Name Consistency

**File:** `backend/controllers/dosenController.js`

Change all occurrences of `.exclude` to use consistent name:
```javascript
// Current:
exclude: Boolean(dosen.exclude)

// Should be:
exclude: Boolean(dosen.exclude)  // Keep this, migration renames DB column
```

---

### 3. Add Foreign Key Validation in Libur Controller

**File:** `backend/controllers/liburController.js` (Create Libur function)

```javascript
export async function createLibur(req, res) {
    try {
        const { date, time, room, reason, nik } = req.body;

        // At least one of date or time must be provided
        if (!date && !time) {
            return res.status(400).json({ 
                success: false, 
                error: 'Either date or time is required' 
            });
        }

        // ⭐⭐⭐ ADD THIS: Validate NIK exists in dosen table
        if (nik) {
            const { rowCount } = await pool.query(
                'SELECT 1 FROM dosen WHERE nik = $1',
                [nik]
            );
            if (rowCount === 0) {
                return res.status(400).json({
                    success: false,
                    error: `Dosen dengan NIK ${nik} tidak ditemukan`
                });
            }
        }

        const { rows } = await pool.query(
            'INSERT INTO libur (date, time, room, reason, nik, dosen_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [date || null, time || null, room || null, reason || '', nik || null, req.body.dosen_name || null]
        );

        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        if (error.code === '23505') {  // Unique violation
            return res.status(409).json({ 
                success: false, 
                error: 'Libur entry untuk dosen/tanggal/waktu ini sudah ada' 
            });
        }
        console.error('Error creating libur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
```

---

### 4. Fix N+1 Query Problem in Slots Controller

**File:** `backend/controllers/slotsController.js` → `getAllSlots()` function

**Current (SLOW):**
```javascript
export async function getAllSlots(req, res) {
    try {
        const { rows: slots } = await pool.query(
            'SELECT * FROM slots ORDER BY date, time, room'
        );

        // ❌ BAD: N+1 query problem
        const slotsWithExaminers = await Promise.all(
            slots.map(async (slot) => {
                const { rows: examiners } = await pool.query(
                    'SELECT examiner_name FROM slot_examiners WHERE slot_id = $1',
                    [slot.id]
                );
                return {
                    id: slot.id,
                    ...
                    examiners: examiners.map(e => e.examiner_name)
                };
            })
        );

        res.json({ success: true, data: slotsWithExaminers });
    } catch (error) {
        // ...
    }
}
```

**Fixed (FAST):**
```javascript
export async function getAllSlots(req, res) {
    try {
        const { rows: slots } = await pool.query(
            'SELECT * FROM slots ORDER BY date, time, room'
        );

        // ✅ GOOD: Single batch query
        const { rows: examinerRows } = await pool.query(
            'SELECT slot_id, examiner_name FROM slot_examiners ORDER BY slot_id, examiner_order'
        );

        // Map examiners to slots
        const slotExaminersMap = {};
        examinerRows.forEach(row => {
            if (!slotExaminersMap[row.slot_id]) {
                slotExaminersMap[row.slot_id] = [];
            }
            slotExaminersMap[row.slot_id].push(row.examiner_name);
        });

        const slotsWithExaminers = slots.map(slot => ({
            id: slot.id,
            date: slot.date,
            time: slot.time,
            room: slot.room,
            student: slot.student,
            examiners: slotExaminersMap[slot.id] || []
        }));

        res.json({ success: true, data: slotsWithExaminers });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
```

---

### 5. Fix JWT Secret Configuration

**File:** `.env`

```env
# Add strong JWT_SECRET
JWT_SECRET=your_super_secret_key_here_minimum_32_chars_long
```

**File:** `backend/controllers/authController.js`

```javascript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set. Please configure it in .env file');
}
```

---

### 6. Add Rate Limiting to Backend

**File:** `backend/server.js`

```javascript
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';  // Add this
import dotenv from 'dotenv';

// ... imports ...

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ⭐ Add rate limiting middleware
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,                   // 100 requests per window
    message: 'Terlalu banyak request, silakan coba lagi dalam 15 menit',
    standardHeaders: true,
    legacyHeaders: false
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                     // 5 login attempts per window (strict)
    message: 'Terlalu banyak percobaan login, silakan coba lagi dalam 15 menit',
    skipSuccessfulRequests: true  // Only count failed attempts
});

// Middleware
app.use(cors({ ... }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);

// Health check (no rate limit)
app.get('/health', (req, res) => { ... });

// Routes
app.use('/api/mahasiswa', mahasiswaRoutes);
// ... rest of routes ...
```

**Update package.json:**
```bash
npm install express-rate-limit
```

---

### 7. Fix Frontend Token Validation

**File:** `frontend/src/services/auth.js`

```javascript
export function isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        // Decode JWT payload (without verification, just structure check)
        const parts = token.split('.');
        if (parts.length !== 3) {
            localStorage.removeItem('token');
            return false;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Check expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.warn('Token expired');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
        
        return true;
    } catch (e) {
        console.error('Invalid token format:', e);
        localStorage.removeItem('token');
        return false;
    }
}
```

---

## ⚠️ MAJOR FIXES (Next Priority)

### 8. Add Input Validation Middleware

**File:** `backend/middleware/validators.js` (create new file)

```javascript
import { body, validationResult } from 'express-validator';

export function validateMahasiswa(req, res, next) {
    const errors = [
        body('nim')
            .trim().notEmpty().isLength({ min: 5, max: 50 })
            .withMessage('NIM harus 5-50 karakter'),
        body('nama')
            .trim().notEmpty().isLength({ min: 3, max: 255 })
            .withMessage('Nama harus 3-255 karakter'),
        body('prodi')
            .trim().notEmpty()
            .withMessage('Program studi wajib diisi'),
        body('gender')
            .optional().trim().isIn(['L', 'P', 'Laki-laki', 'Perempuan'])
            .withMessage('Gender invalid')
    ];

    return [
        ...errors,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }
            next();
        }
    ];
}

export function validateLibur(req, res, next) {
    const errors = [
        body('date')
            .optional().matches(/^\d{4}-\d{2}-\d{2}$/)
            .withMessage('Format tanggal harus YYYY-MM-DD'),
        body('time')
            .optional().matches(/^\d{2}:\d{2}$/)
            .withMessage('Format waktu harus HH:MM'),
        body('reason')
            .optional().trim().isLength({ max: 255 })
    ];

    return [
        ...errors,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    success: false, 
                    errors: errors.array() 
                });
            }
            next();
        }
    ];
}
```

**Update routes:** `backend/routes/mahasiswa.js`

```javascript
import { validateMahasiswa } from '../middleware/validators.js';

router.post('/', validateMahasiswa, mahasiswaController.createMahasiswa);
router.put('/:nim', validateMahasiswa, mahasiswaController.updateMahasiswa);
```

---

### 9. Add Environment Variable Validation

**File:** `backend/config/env.js` (create new file)

```javascript
export function validateEnvironment() {
    const required = [
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'JWT_SECRET',
        'CORS_ORIGIN'
    ];

    const missing = required.filter(env => !process.env[env]);

    if (missing.length > 0) {
        const msg = `Missing required environment variables: ${missing.join(', ')}`;
        console.error(`❌ ${msg}`);
        throw new Error(msg);
    }

    console.log('✅ All environment variables validated');
}
```

**Use in server.js:**
```javascript
import { validateEnvironment } from './config/env.js';

dotenv.config();
validateEnvironment();  // Call this before anything else

app.listen(PORT, () => { ... });
```

---

### 10. Add Proper Logging

**File:** `backend/config/logger.js` (create new file)

```javascript
export function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...data
    };

    switch (level) {
        case 'info':
            console.log(`[ℹ️  INFO] ${message}`, data);
            break;
        case 'warn':
            console.warn(`[⚠️  WARN] ${message}`, data);
            break;
        case 'error':
            console.error(`[❌ ERROR] ${message}`, data);
            break;
        case 'debug':
            if (process.env.DEBUG === 'true') {
                console.log(`[🐛 DEBUG] ${message}`, data);
            }
            break;
    }

    // In production, send to external logging service (Sentry, Datadog, etc)
}

export const logger = {
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
    debug: (msg, data) => log('debug', msg, data)
};
```

---

## 📝 TESTING CHECKLIST

After applying fixes:

### Backend Tests
- [ ] Test creating mahasiswa with duplicate NIM (should return 409)
- [ ] Test creating libur with invalid NIK (should return 400)
- [ ] Test schedule generation with large dataset (1000+ students)
- [ ] Test login rate limiting (5 attempts should block 6th)
- [ ] Test all API endpoints with missing fields (should validate)

### Database Tests
- [ ] Verify no duplicate libur entries possible
- [ ] Verify no duplicate examiners in same slot
- [ ] Check query performance on 10,000 slots
- [ ] Verify foreign key constraints working

### Frontend Tests
- [ ] Test login with expired token
- [ ] Test scheduling generation
- [ ] Verify exclude dosen toggle works
- [ ] Test max_slots quota enforcement

---

## 🚀 DEPLOYMENT CHECKLIST

Before going to production:

- [ ] All critical fixes applied
- [ ] Database migration successfully run
- [ ] Environment variables set (especially JWT_SECRET)
- [ ] HTTPS enabled
- [ ] CORS whitelist configured for production domain
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Database backups scheduled
- [ ] API documentation updated
- [ ] Security headers added (helmet)

---

## 📊 Performance Monitoring Commands

```bash
# Monitor database query performance
EXPLAIN ANALYZE SELECT * FROM slots WHERE date = '2026-02-16';

# Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

# Monitor slow queries (if configured)
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

**Next Steps:**
1. Apply Critical Fixes (1-7)
2. Test thoroughly
3. Run Performance Tests
4. Apply Major Fixes (8-10)
5. Deploy to Staging
6. Final Testing
7. Production Deployment
