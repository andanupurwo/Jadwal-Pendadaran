import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import mahasiswaRoutes from './routes/mahasiswa.js';
import dosenRoutes from './routes/dosen.js';
import liburRoutes from './routes/libur.js';
import slotsRoutes from './routes/slots.js';
import scheduleRoutes from './routes/schedule.js';
import settingsRoutes from './routes/settings.js';
import authRoutes from './routes/auth.js';
import logsRoutes from './routes/logs.js';

// Import database
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Jadwal Pendadaran API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/dosen', dosenRoutes);
app.use('/api/libur', liburRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, async () => {
    // Auto-migration: Ensure gender column exists in mahasiswa
    try {
        await pool.query(`ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`);
        // New: Add pref_gender column to dosen
        await pool.query(`ALTER TABLE dosen ADD COLUMN IF NOT EXISTS pref_gender VARCHAR(1)`);
        console.log('✅ Database Schema verified: gender columns exist');
    } catch (e) {
        console.error('⚠️ Database Schema Check Failed:', e.message);
    }

    console.log('');
    console.log('================================================');
    console.log('🚀 Jadwal Pendadaran Backend API');
    console.log('================================================');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    console.log('================================================');
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET    /health');
    console.log('  GET    /api/mahasiswa');
    console.log('  GET    /api/dosen');
    console.log('  GET    /api/libur');
    console.log('  GET    /api/slots');
    console.log('  POST   /api/schedule/generate');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await pool.end();
    process.exit(0);
});

export default app;
