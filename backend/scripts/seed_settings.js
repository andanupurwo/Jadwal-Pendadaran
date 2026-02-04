import pool from '../config/database.js';

const DEFAULT_SETTINGS = {
    schedule_rooms: [
        '6.3.A', '6.3.B', '6.3.C', '6.3.D',
        '6.3.E', '6.3.F', '6.3.G', '6.3.H'
    ],
    schedule_times: [
        '08:30', '10:00', '11:30', '13:30'
    ],
    schedule_dates: [
        { value: '2026-02-16', label: 'Senin', display: '16 Feb' },
        { value: '2026-02-17', label: 'Selasa', display: '17 Feb' },
        { value: '2026-02-18', label: 'Rabu', display: '18 Feb' },
        { value: '2026-02-19', label: 'Kamis', display: '19 Feb' },
        { value: '2026-02-20', label: 'Jumat', display: '20 Feb' },
        { value: '2026-02-23', label: 'Senin', display: '23 Feb' },
        { value: '2026-02-24', label: 'Selasa', display: '24 Feb' },
        { value: '2026-02-25', label: 'Rabu', display: '25 Feb' },
        { value: '2026-02-26', label: 'Kamis', display: '26 Feb' },
        { value: '2026-02-27', label: 'Jumat', display: '27 Feb' }
    ]
};

async function seedSettings() {
    console.log('🌱 Seeding default settings...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
            // Check if exists
            const check = await client.query('SELECT 1 FROM app_settings WHERE setting_key = $1', [key]);

            if (check.rowCount === 0) {
                await client.query(
                    'INSERT INTO app_settings (setting_key, setting_value) VALUES ($1, $2)',
                    [key, JSON.stringify(value)]
                );
                console.log(`✅ Inserted ${key}`);
            } else {
                console.log(`ℹ️ ${key} already exists, skipping...`);
            }
        }

        await client.query('COMMIT');
        console.log('🎉 Settings seeding completed!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding settings:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seedSettings();
