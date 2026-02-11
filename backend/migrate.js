import dotenv from 'dotenv';
dotenv.config();
import pool from './config/database.js';

async function migrate() {
    try {
        console.log('🚀 Starting migration...');

        // Add gender column to mahasiswa
        await pool.query(`ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`);
        console.log('✅ Added gender column to mahasiswa table');

        console.log('🎉 Migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
