import pool from '../config/database.js';

// Get all dosen grouped by fakultas
export async function getAllDosen(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM dosen ORDER BY fakultas, nama');

        // Group by fakultas
        const grouped = {
            FIK: [],
            FES: [],
            FST: []
        };

        rows.forEach(dosen => {
            if (grouped[dosen.fakultas]) {
                grouped[dosen.fakultas].push({
                    id: dosen.id,
                    nik: dosen.nik,
                    nama: dosen.nama,
                    prodi: dosen.prodi,
                    fakultas: dosen.fakultas,
                    exclude: Boolean(dosen.exclude),
                    pref_gender: dosen.pref_gender || null,
                    max_slots: dosen.max_slots || null
                });
            }
        });

        res.json({ success: true, data: grouped });
    } catch (error) {
        console.error('Error fetching dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get dosen by fakultas
export async function getDosenByFakultas(req, res) {
    try {
        const { fakultas } = req.params;
        const { rows } = await pool.query('SELECT * FROM dosen WHERE fakultas = $1 ORDER BY nama', [fakultas.toUpperCase()]);

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Toggle exclude dosen
export async function toggleExcludeDosen(req, res) {
    try {
        const { nik } = req.params;
        const { exclude } = req.body;

        const { rowCount } = await pool.query(
            'UPDATE dosen SET exclude = $1 WHERE nik = $2',
            [exclude ? true : false, nik]
        );

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Dosen not found' });
        }

        res.json({ success: true, message: 'Dosen exclusion status updated' });
    } catch (error) {
        console.error('Error updating dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Bulk insert dosen from CSV
export async function bulkInsertDosen(req, res) {
    const client = await pool.connect();
    try {
        const { dosen } = req.body;

        if (!Array.isArray(dosen) || dosen.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        await client.query('BEGIN');

        let insertedCount = 0;

        for (const d of dosen) {
            if (!d.nik || !d.nama || !d.fakultas) {
                continue;
            }

            try {
                await client.query(
                    `INSERT INTO dosen (nik, nama, prodi, fakultas, exclude, pref_gender, max_slots) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     ON CONFLICT (nik) 
                     DO UPDATE SET nama = EXCLUDED.nama, prodi = EXCLUDED.prodi, fakultas = EXCLUDED.fakultas, pref_gender = EXCLUDED.pref_gender, max_slots = EXCLUDED.max_slots`,
                    [d.nik, d.nama, d.prodi || '', d.fakultas, false, d.pref_gender || null, d.max_slots || null]
                );
                insertedCount++;
            } catch (err) {
                console.error('Error inserting dosen:', d, err);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Inserted/Updated: ${insertedCount} dosen`,
            inserted: insertedCount
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk inserting dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Get master dosen (from SDM)
export async function getMasterDosen(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM master_dosen ORDER BY nama');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching master dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Bulk insert master dosen
export async function bulkInsertMasterDosen(req, res) {
    const client = await pool.connect();
    try {
        const { dosen } = req.body;

        if (!Array.isArray(dosen) || dosen.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        await client.query('BEGIN');

        let insertedCount = 0;

        for (const d of dosen) {
            if (!d.nik || !d.nama) {
                continue;
            }

            try {
                await client.query(
                    `INSERT INTO master_dosen (nik, nama, status, kategori, nidn, jenis_kelamin) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     ON CONFLICT (nik) 
                     DO UPDATE SET nama = EXCLUDED.nama, status = EXCLUDED.status, kategori = EXCLUDED.kategori`,
                    [d.nik, d.nama, d.status || '', d.kategori || '', d.nidn || '', d.jenisKelamin || '']
                );
                insertedCount++;
            } catch (err) {
                console.error('Error inserting master dosen:', d, err);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Inserted/Updated: ${insertedCount} master dosen`,
            inserted: insertedCount
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk inserting master dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Delete dosen permanently
export async function deleteDosen(req, res) {
    const client = await pool.connect();
    try {
        const { nik } = req.params;
        await client.query('BEGIN');

        // Get dosen name first (because mahasiswa links via name, sadly)
        const { rows: dosenRows } = await client.query('SELECT nama FROM dosen WHERE nik = $1', [nik]);
        if (dosenRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Dosen tidak ditemukan' });
        }
        const namaDosen = dosenRows[0].nama;

        // Check dependencies in Mahasiswa
        const { rows: activeMhs } = await client.query('SELECT count(*) as count FROM mahasiswa WHERE pembimbing = $1', [namaDosen]);
        if (parseInt(activeMhs[0].count) > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: `Gagal hapus: Dosen ini masih menjadi pembimbing ${activeMhs[0].count} mahasiswa. Ganti pembimbing mahasiswa terlebih dahulu.` });
        }

        // Delete from Libur
        await client.query('DELETE FROM libur WHERE nik = $1', [nik]);

        // Delete from Dosen
        await client.query('DELETE FROM dosen WHERE nik = $1', [nik]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Dosen berhasil dihapus permanen.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Delete master dosen permanently
export async function deleteMasterDosen(req, res) {
    try {
        const { nik } = req.params;

        const { rowCount } = await pool.query('DELETE FROM master_dosen WHERE nik = $1', [nik]);

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Master dosen tidak ditemukan' });
        }

        res.json({ success: true, message: 'Data Master SDM berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting master dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Update dosen
export async function updateDosen(req, res) {
    try {
        const { nik } = req.params;
        const { nama, prodi, fakultas, pref_gender, max_slots } = req.body;

        const { rowCount } = await pool.query(
            'UPDATE dosen SET nama = $1, prodi = $2, fakultas = $3, pref_gender = $4, max_slots = $5 WHERE nik = $6',
            [nama, prodi, fakultas, pref_gender || null, max_slots || null, nik]
        );

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Dosen not found' });
        }

        res.json({ success: true, data: { nik, nama, prodi, fakultas, pref_gender } });
    } catch (error) {
        console.error('Error updating dosen:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
