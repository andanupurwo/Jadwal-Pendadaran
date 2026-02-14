import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'jadwal_pendadaran'
    });

    try {
        await client.connect();
        console.log('🔗 Connected to database for migration');

        // Add max_slots column if not exists
        await client.query(`
            ALTER TABLE dosen ADD COLUMN IF NOT EXISTS max_slots INTEGER DEFAULT NULL;
        `);
        console.log('✅ Column max_slots added to table dosen');

    } catch (error) {
        console.error('❌ Error running migration:', error);
    } finally {
        await client.end();
    }
}

runMigration();
