import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jadwal_pendadaran',
    port: process.env.DB_PORT || 5432,
});

// Test koneksi
pool.connect()
    .then(client => {
        console.log('✅ PostgreSQL Database connected successfully');
        client.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

export default pool;
