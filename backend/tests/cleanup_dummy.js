import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

async function cleanup() {
    try {
        console.log('Starting cleanup of dummy data...');

        // 1. Delete slots associated with dummy students
        const slotCleanup = await pool.query("DELETE FROM slots WHERE mahasiswa_nim LIKE 'NIM%'");
        console.log(`✅ Deleted ${slotCleanup.rowCount} slots associated with dummy students.`);

        // 2. Delete dummy students
        const mhsCleanup = await pool.query("DELETE FROM mahasiswa WHERE nim LIKE 'NIM%' OR nama LIKE 'Student%'");
        console.log(`✅ Deleted ${mhsCleanup.rowCount} dummy student records.`);

        await pool.end();
        console.log('🎉 Cleanup completed successfully.');
    } catch (err) {
        console.error('❌ Error during cleanup:', err.message);
    }
}

cleanup();
