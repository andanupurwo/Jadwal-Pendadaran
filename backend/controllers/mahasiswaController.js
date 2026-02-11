import pool from '../config/database.js';
import { createLog } from './logsController.js';

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
        const { nim, nama, prodi, pembimbing, gender } = req.body;

        if (!nim || !nama || !prodi) {
            return res.status(400).json({ success: false, error: 'NIM, nama, and prodi are required' });
        }

        const { rows } = await pool.query(
            'INSERT INTO mahasiswa (nim, nama, prodi, pembimbing, gender) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nim, nama, prodi, pembimbing || null, gender || null]
        );

        res.status(201).json({
            success: true,
            data: rows[0]
        });

        await createLog('CREATE', 'Mahasiswa', `Menambah data mahasiswa ${req.body.nama} (${req.body.nim}) - Prodi: ${req.body.prodi}`);
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
        const { nama, prodi, pembimbing, gender } = req.body;

        const { rowCount } = await pool.query(
            'UPDATE mahasiswa SET nama = $1, prodi = $2, pembimbing = $3, gender = $4, updated_at = CURRENT_TIMESTAMP WHERE nim = $5',
            [nama, prodi, pembimbing || null, gender || null, nim]
        );

        if (rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Mahasiswa not found' });
        }

        res.json({ success: true, data: { nim, nama, prodi, pembimbing, gender } });

        await createLog('UPDATE', 'Mahasiswa', `Update data mahasiswa ${nama} (${nim})`);
    } catch (error) {
        console.error('Error updating mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

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

        await createLog('DELETE', 'Mahasiswa', `Menghapus data mahasiswa NIM ${nim}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Delete ALL mahasiswa
export async function deleteAllMahasiswa(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete associated slots first
        await client.query('DELETE FROM slots');

        // Delete all students
        const { rowCount } = await client.query('DELETE FROM mahasiswa');

        await client.query('COMMIT');
        res.json({ success: true, message: `All mahasiswa (${rowCount}) and schedules deleted successfully` });

        await createLog('DELETE ALL', 'Mahasiswa', `Membersihkan SEMUA data mahasiswa (${rowCount} data)`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting all mahasiswa:', error);
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

        // 1. Fetch all canonical Dosen names for verification
        const { rows: allDosen } = await client.query('SELECT nama FROM dosen');
        const validDosenNames = allDosen.map(d => d.nama);

        // Helper: Levenshtein Distance for typo tolerance
        function levenshtein(a, b) {
            const matrix = [];
            for (let i = 0; i <= b.length; i++) matrix[i] = [i];
            for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1, // substitution
                            Math.min(
                                matrix[i][j - 1] + 1, // insertion
                                matrix[i - 1][j] + 1  // deletion
                            )
                        );
                    }
                }
            }
            return matrix[b.length][a.length];
        }

        // Helper to normalize name (strip titles and punctuation)
        function normalizeVerifier(name) {
            if (!name) return '';
            return name
                .toLowerCase()
                .replace(/[.,]/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/\b(dr|drs|prof|s\.?si|s\.?kom|s\.?t|s\.?e|s\.?ip|s\.?sos|m\.?kom|m\.?t|m\.?eng|m\.?si|m\.?ak|m\.?ba|m\.?m|m\.?a|m\.?i\.kom|ph\.?d|ak|ca|ll\.?m)\b/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // Helper to find best match
        function findCanonicalName(inputName) {
            if (!inputName) return null;
            const cleanInput = normalizeVerifier(inputName);
            if (!cleanInput || cleanInput.length < 3) return inputName;

            // 1. Exact match (Original or Normalized)
            const exactMatch = validDosenNames.find(d =>
                d.toLowerCase() === inputName.toLowerCase().trim() ||
                normalizeVerifier(d) === cleanInput
            );
            if (exactMatch) return exactMatch;

            // 2. Substring match (Input in Canonical or Canonical in Input)
            // Prioritize: Canonical contains Input (e.g. "Mulia Sulistiyono" contains "Mulia")
            const containedMatches = validDosenNames.filter(d => normalizeVerifier(d).includes(cleanInput));
            if (containedMatches.length === 1) return containedMatches[0];

            // 3. Fuzzy Match (Levenshtein)
            let bestMatch = null;
            let bestScore = 0; // 0 to 1 similarity

            for (const validName of validDosenNames) {
                const cleanValid = normalizeVerifier(validName);
                const distance = levenshtein(cleanInput, cleanValid);
                const maxLength = Math.max(cleanInput.length, cleanValid.length);
                const similarity = (maxLength - distance) / maxLength;

                if (similarity > bestScore) {
                    bestScore = similarity;
                    bestMatch = validName;
                }
            }

            // Threshold: 85% similarity (High confidence)
            if (bestScore > 0.85) {
                return bestMatch;
            }

            return inputName; // No confident match found
        }

        let insertedCount = 0;
        let skippedCount = 0;
        let correctedCount = 0;

        for (const mhs of mahasiswa) {
            if (!mhs.nim || !mhs.nama || !mhs.prodi) {
                skippedCount++;
                continue;
            }

            let finalPembimbing = mhs.pembimbing || null;
            if (finalPembimbing) {
                const canonical = findCanonicalName(finalPembimbing);
                if (canonical && canonical !== finalPembimbing) {
                    finalPembimbing = canonical;
                    correctedCount++;
                }
            }

            try {
                await client.query(
                    `INSERT INTO mahasiswa (nim, nama, prodi, pembimbing, gender) 
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (nim) DO UPDATE 
                     SET nama = EXCLUDED.nama, 
                         prodi = EXCLUDED.prodi, 
                         pembimbing = EXCLUDED.pembimbing,
                         gender = EXCLUDED.gender,
                         updated_at = CURRENT_TIMESTAMP`,
                    [mhs.nim, mhs.nama, mhs.prodi, finalPembimbing, mhs.gender || null]
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
            message: `Processed ${insertedCount} students. Auto-corrected ${correctedCount} supervisor names.`,
            inserted: insertedCount,
            skipped: skippedCount,
            skipped: skippedCount,
            corrected: correctedCount
        });

        await createLog('IMPORT', 'Mahasiswa', `Bulk import ${insertedCount} data mahasiswa. Auto-correct pembimbing: ${correctedCount}.`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error bulk creating mahasiswa:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}
