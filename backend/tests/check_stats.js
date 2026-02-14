
const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'jadwal_pendadaran',
    port: 5432,
});

async function check() {
    const client = await pool.connect();
    try {
        const resDosen = await client.query("SELECT prodi, count(*) FROM dosen GROUP BY prodi");
        console.log("Dosen Per Prodi:", resDosen.rows);

        const resNovita = await client.query("SELECT * FROM libur WHERE dosen_name LIKE '%Novita%'");
        console.log("Libur Novita:", resNovita.rows);

        const resMhs = await client.query("SELECT prodi, count(*) FROM mahasiswa WHERE scheduled = false GROUP BY prodi"); // No 'scheduled' column maybe?
        // Let's check mahasiswa
        const resMhsILKOM = await client.query("SELECT count(*) FROM mahasiswa WHERE prodi = 'S1 Ilmu Komunikasi'");
        console.log("Total Mhs ILKOM:", resMhsILKOM.rows[0].count);

        const resExILKOM = await client.query("SELECT count(*) FROM dosen WHERE prodi = 'S1 Ilmu Komunikasi'");
        console.log("Total Dosen ILKOM:", resExILKOM.rows[0].count);

        const resSettings = await client.query("SELECT * FROM settings");
        console.log("Settings:", resSettings.rows);

    } finally {
        client.release();
        pool.end();
    }
}
check();
