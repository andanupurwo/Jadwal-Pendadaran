import pool from '../config/database.js';
import { createLog } from './logsController.js';

// Get all libur
export async function getAllLibur(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM libur ORDER BY date, time');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching libur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Create libur entry
export async function createLibur(req, res) {
    try {
        const { date, time, room, reason, nik } = req.body;

        // At least one of date or time must be provided
        if (!date && !time) {
            return res.status(400).json({ success: false, error: 'Either date or time is required' });
        }

        const { rows } = await pool.query(
            'INSERT INTO libur (date, time, room, reason, nik) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [date || null, time || null, room || null, reason || '', nik || null]
        );

        res.status(201).json({
            success: true,
            data: rows[0]
        });

        // Fetch nama dosen for better log
        let namaDosen = nik;
        try {
            const { rows: d } = await pool.query('SELECT nama FROM dosen WHERE nik = $1', [nik]);
            if (d.length > 0) namaDosen = d[0].nama;
        } catch (e) { }

        const infoWaktu = date ? (time ? `${date} jam ${time}` : `tanggal ${date}`) : `jam ${time}`;
        await createLog('CREATE', 'Ketersediaan Dosen', `Menandai ${namaDosen} TIDAK BERSEDIA pada ${infoWaktu} (${reason || 'Tanpa Alasan'})`);

    } catch (error) {
        console.error('Error creating libur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete libur entry
export async function deleteLibur(req, res) {
    try {
        const { id } = req.params;

        // Get details before delete for logging
        let logDetail = `aturan libur ID: ${id}`;
        try {
            const { rows: old } = await pool.query(
                `SELECT l.*, d.nama 
                 FROM libur l 
                 LEFT JOIN dosen d ON l.nik = d.nik 
                 WHERE l.id = $1`,
                [id]
            );
            if (old.length > 0) {
                const item = old[0];
                const infoWaktu = item.date ? (item.time ? `${item.date} jam ${item.time}` : `tanggal ${item.date}`) : `jam ${item.time}`;
                logDetail = `aturan ${item.nama || item.nik} pada ${infoWaktu}`;
            }
        } catch (e) { }

        const { rowCount } = await pool.query('DELETE FROM libur WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Libur entry not found' });
        }

        res.json({ success: true, message: 'Libur entry deleted successfully' });

        await createLog('DELETE', 'Ketersediaan Dosen', `Menghapus status tidak bersedia: ${logDetail}`);

    } catch (error) {
        console.error('Error deleting libur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete all libur entries for a specific dosen by NIK
export async function deleteLiburByNik(req, res) {
    try {
        const { nik } = req.params;

        const { rowCount } = await pool.query('DELETE FROM libur WHERE nik = $1', [nik]);

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'No libur entries found for this dosen' });
        }

        res.json({
            success: true,
            message: `Deleted ${rowCount} libur entries for dosen ${nik}`,
            deleted: rowCount
        });

        await createLog('DELETE', 'Jadwal Libur', `Menghapus SEMUA aturan libur untuk NIK: ${nik}`);
    } catch (error) {
        console.error('Error deleting libur by NIK:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete ALL libur entries (Clear Data)
export async function deleteAllLibur(req, res) {
    try {
        const { rowCount } = await pool.query('DELETE FROM libur');
        res.json({
            success: true,
            message: `All libur data cleared. Deleted ${rowCount} entries.`,
            deleted: rowCount
        });

        await createLog('DELETE ALL', 'Jadwal Libur', `Membersihkan SEMUA data aturan libur (${rowCount} baris)`);
    } catch (error) {
        console.error('Error deleting all libur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Bulk create libur
export async function bulkCreateLibur(req, res) {
    const client = await pool.connect();
    try {
        const { libur } = req.body;

        if (!Array.isArray(libur) || libur.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        await client.query('BEGIN');

        let insertedCount = 0;

        for (const item of libur) {
            if (!item.date) {
                continue;
            }

            try {
                await client.query(
                    'INSERT INTO libur (date, time, room, reason, nik) VALUES ($1, $2, $3, $4, $5)',
                    [item.date, item.time || null, item.room || null, item.reason || '', item.nik || null]
                );
                insertedCount++;
            } catch (err) {
                console.error('Error inserting libur:', item, err);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Inserted: ${insertedCount} libur entries`,
            inserted: insertedCount
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk creating libur:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}
