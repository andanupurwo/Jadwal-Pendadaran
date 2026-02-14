import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateAddExaminers() {
    const client = await pool.connect();

    try {
        console.log('🔄 Starting migration: Add penguji_1 and penguji_2 columns to mahasiswa table...');

        await client.query('BEGIN');

        // Add columns if they don't exist
        await client.query(`
            ALTER TABLE mahasiswa 
            ADD COLUMN IF NOT EXISTS penguji_1 VARCHAR(255),
            ADD COLUMN IF NOT EXISTS penguji_2 VARCHAR(255)
        `);

        await client.query('COMMIT');

        console.log('✅ Migration completed successfully!');
        console.log('   - Added column: penguji_1 (VARCHAR 255, nullable)');
        console.log('   - Added column: penguji_2 (VARCHAR 255, nullable)');
        console.log('');
        console.log('ℹ️  Existing data will have NULL values for these columns.');
        console.log('   Students without pre-assigned examiners will use auto-assignment.');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
}

// Run migration
migrateAddExaminers();
