import pool from '../config/database.js';

// Get all mahasiswa
export async function getAllMahasiswa(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM mahasiswa ORDER BY nim');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get mahasiswa by NIM
export async function getMahasiswaByNim(req, res) {
    try {
        const { nim } = req.params;
        const { rows } = await pool.query('SELECT * FROM mahasiswa WHERE nim = $1', [nim]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Mahasiswa not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create mahasiswa
export async function createMahasiswa(req, res) {
    try {
        const { nim, nama, prodi, pembimbing } = req.body;

        if (!nim || !nama || !prodi) {
            return res.status(400).json({ success: false, error: 'NIM, nama, and prodi are required' });
        }

        const { rows } = await pool.query(
            'INSERT INTO mahasiswa (nim, nama, prodi, pembimbing) VALUES ($1, $2, $3, $4) RETURNING *',
            [nim, nama, prodi, pembimbing || null]
        );

        res.status(201).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation in Postgres
            return res.status(409).json({ success: false, error: 'NIM already exists' });
        }
        console.error('Error creating mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Update mahasiswa
export async function updateMahasiswa(req, res) {
    try {
        const { nim } = req.params;
        const { nama, prodi, pembimbing } = req.body;

        const { rowCount } = await pool.query(
            'UPDATE mahasiswa SET nama = $1, prodi = $2, pembimbing = $3 WHERE nim = $4',
            [nama, prodi, pembimbing || null, nim]
        );

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Mahasiswa not found' });
        }

        res.json({ success: true, data: { nim, nama, prodi, pembimbing } });
    } catch (error) {
        console.error('Error updating mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete mahasiswa
// Delete mahasiswa
export async function deleteMahasiswa(req, res) {
    const client = await pool.connect();
    try {
        const { nim } = req.params;

        await client.query('BEGIN');

        // Delete associated slots first (because ON DELETE SET NULL would break the link)
        await client.query('DELETE FROM slots WHERE mahasiswa_nim = $1', [nim]);

        // Delete the student
        const { rowCount } = await client.query('DELETE FROM mahasiswa WHERE nim = $1', [nim]);

        if (rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Mahasiswa not found' });
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Mahasiswa and associated schedule deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Bulk create mahasiswa
export async function bulkCreateMahasiswa(req, res) {
    const client = await pool.connect();
    try {
        const { mahasiswa } = req.body;

        if (!Array.isArray(mahasiswa) || mahasiswa.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        await client.query('BEGIN');

        let insertedCount = 0;
        let skippedCount = 0;

        for (const mhs of mahasiswa) {
            if (!mhs.nim || !mhs.nama || !mhs.prodi) {
                skippedCount++;
                continue;
            }

            try {
                await client.query(
                    `INSERT INTO mahasiswa (nim, nama, prodi, pembimbing) 
                     VALUES ($1, $2, $3, $4) 
                     ON CONFLICT (nim) 
                     DO UPDATE SET nama = EXCLUDED.nama, prodi = EXCLUDED.prodi, pembimbing = EXCLUDED.pembimbing`,
                    [mhs.nim, mhs.nama, mhs.prodi, mhs.pembimbing || null]
                );
                insertedCount++;
            } catch (err) {
                console.error('Error inserting:', mhs, err);
                skippedCount++;
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Inserted/Updated: ${insertedCount}, Skipped: ${skippedCount}`,
            inserted: insertedCount,
            skipped: skippedCount
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk creating mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}
