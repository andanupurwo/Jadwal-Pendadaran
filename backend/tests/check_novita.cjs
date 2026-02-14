
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
        const resNovita = await client.query("SELECT * FROM dosen WHERE nama LIKE '%Novita%'");
        if (resNovita.rows.length > 0) {
            const d = resNovita.rows[0];
            console.log("Novita:", d);

            const resSameFaculty = await client.query("SELECT prodi, count(*) FROM dosen WHERE fakultas = $1 GROUP BY prodi", [d.fakultas]);
            console.log(`Dosen in Faculty ${d.fakultas}:`, resSameFaculty.rows);

            const resSameProdi = await client.query("SELECT * FROM dosen WHERE prodi = $1", [d.prodi]);
            console.log(`Dosen in Prodi ${d.prodi}:`, resSameProdi.rows.map(x => x.nama));
        } else {
            console.log("Novita not found in DB");
        }

    } finally {
        client.release();
        pool.end();
    }
}
check();
