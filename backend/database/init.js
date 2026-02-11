import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function initializeDatabase() {
    let client;

    try {
        // Koneksi awal ke database default postgres
        client = new Client({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 5432,
            database: 'postgres'
        });

        await client.connect();
        console.log('🔗 Connected to PostgreSQL server');

        const dbName = process.env.DB_NAME || 'jadwal_pendadaran';

        // Cek apakah database sudah ada
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`✅ Database '${dbName}' created`);
        } else {
            console.log(`ℹ️ Database '${dbName}' already exists`);
        }

        await client.end();

        // Koneksi ulang ke database yang baru dibuat
        client = new Client({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 5432,
            database: dbName
        });
        await client.connect();

        // Tabel: master_dosen
        await client.query(`
            CREATE TABLE IF NOT EXISTS master_dosen (
                id SERIAL PRIMARY KEY,
                nik VARCHAR(50) UNIQUE NOT NULL,
                nama VARCHAR(255) NOT NULL,
                status VARCHAR(50),
                kategori VARCHAR(100),
                nidn VARCHAR(50),
                jenis_kelamin VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table master_dosen created');

        // Tabel: dosen
        await client.query(`
            CREATE TABLE IF NOT EXISTS dosen (
                id SERIAL PRIMARY KEY,
                nik VARCHAR(50) NOT NULL UNIQUE,
                nama VARCHAR(255) NOT NULL,
                prodi VARCHAR(255),
                fakultas VARCHAR(10) NOT NULL,
                excluded BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table dosen created');

        // Tabel: mahasiswa
        await client.query(`
            CREATE TABLE IF NOT EXISTS mahasiswa (
                id SERIAL PRIMARY KEY,
                nim VARCHAR(50) UNIQUE NOT NULL,
                nama VARCHAR(255) NOT NULL,
                prodi VARCHAR(255) NOT NULL,
                gender VARCHAR(10),
                pembimbing VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration: Add gender column if not exists
        try {
            await client.query(`ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`);
        } catch (e) {
            console.log('Migration: gender column already exists or error', e.message);
        }

        console.log('✅ Table mahasiswa created/updated');

        // Tabel: libur
        await client.query(`
            CREATE TABLE IF NOT EXISTS libur (
                id SERIAL PRIMARY KEY,
                date VARCHAR(20) NOT NULL,
                time VARCHAR(20),
                room VARCHAR(100),
                reason VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table libur created');

        // Tabel: slots
        await client.query(`
            CREATE TABLE IF NOT EXISTS slots (
                id SERIAL PRIMARY KEY,
                date VARCHAR(20) NOT NULL,
                time VARCHAR(20) NOT NULL,
                room VARCHAR(100) NOT NULL,
                student VARCHAR(255) NOT NULL,
                mahasiswa_nim VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_slot UNIQUE (date, time, room),
                FOREIGN KEY (mahasiswa_nim) REFERENCES mahasiswa(nim) ON DELETE SET NULL
            )
        `);
        console.log('✅ Table slots created');

        // Tabel: slot_examiners
        await client.query(`
            CREATE TABLE IF NOT EXISTS slot_examiners (
                id SERIAL PRIMARY KEY,
                slot_id INT NOT NULL,
                examiner_name VARCHAR(255) NOT NULL,
                examiner_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table slot_examiners created');

        // Tabel: app_settings
        await client.query(`
            CREATE TABLE IF NOT EXISTS app_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table app_settings created');

        // Tabel: users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table users created');

        // Tabel: activity_logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                action_type VARCHAR(50) NOT NULL,
                target VARCHAR(100) NOT NULL,
                description TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table activity_logs created');

        // Seed Admin if not exists
        const { rowCount: userCount } = await client.query('SELECT 1 FROM users LIMIT 1');
        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query(
                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
                ['admin', hashedPassword, 'admin']
            );
            console.log('👤 Default admin user created (admin / admin123)');
        }

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_nik ON master_dosen(nik)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_dosen_nik ON dosen(nik)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_nim ON mahasiswa(nim)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_examiner_slot ON slot_examiners(slot_id)');

        console.log('');
        console.log('🎉 PostgreSQL Database initialization completed successfully!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        if (client) {
            await client.end();
        }
    }
}

initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
