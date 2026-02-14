
import pool from '../../config/database.js';

async function migrate() {
    try {
        await pool.query('ALTER TABLE libur ADD COLUMN IF NOT EXISTS nik VARCHAR(50)');
        console.log('✅ Added nik column to libur table');

        // Also add index for performance
        await pool.query('CREATE INDEX IF NOT EXISTS idx_libur_nik ON libur(nik)');
        console.log('✅ Added index on libur(nik)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

