import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './backend/.env' });

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

async function checkData() {
    try {
        const { rows } = await pool.query("SELECT nim, nama FROM mahasiswa WHERE nim LIKE 'NIM%' OR nama LIKE 'Student%' LIMIT 10");
        console.log('Dummy Data found:', rows);

        const { rows: countRows } = await pool.query("SELECT COUNT(*) FROM mahasiswa WHERE nim LIKE 'NIM%' OR nama LIKE 'Student%'");
        console.log('Total Dummy Data count:', countRows[0].count);

        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkData();
