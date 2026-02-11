import pool from '../config/database.js';
import { createLog } from './logsController.js';

// Get all slots with examiners
export async function getAllSlots(req, res) {
    try {
        const { rows: slots } = await pool.query('SELECT * FROM slots ORDER BY date, time, room');

        // Get examiners for each slot
        const slotsWithExaminers = await Promise.all(
            slots.map(async (slot) => {
                const { rows: examiners } = await pool.query(
                    'SELECT examiner_name FROM slot_examiners WHERE slot_id = $1 ORDER BY examiner_order',
                    [slot.id]
                );

                return {
                    id: slot.id,
                    date: slot.date,
                    time: slot.time,
                    room: slot.room,
                    student: slot.student,
                    examiners: examiners.map(e => e.examiner_name)
                };
            })
        );

        res.json({ success: true, data: slotsWithExaminers });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get slots by date
export async function getSlotsByDate(req, res) {
    try {
        const { date } = req.params;
        const { rows: slots } = await pool.query('SELECT * FROM slots WHERE date = $1 ORDER BY time, room', [date]);

        const slotsWithExaminers = await Promise.all(
            slots.map(async (slot) => {
                const { rows: examiners } = await pool.query(
                    'SELECT examiner_name FROM slot_examiners WHERE slot_id = $1 ORDER BY examiner_order',
                    [slot.id]
                );

                return {
                    id: slot.id,
                    date: slot.date,
                    time: slot.time,
                    room: slot.room,
                    student: slot.student,
                    examiners: examiners.map(e => e.examiner_name)
                };
            })
        );

        res.json({ success: true, data: slotsWithExaminers });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// Delete all slots (reset schedule)
export async function deleteAllSlots(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query('DELETE FROM slot_examiners');
        const { rowCount } = await client.query('DELETE FROM slots');

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'All slots deleted successfully',
            deletedCount: rowCount
        });

        await createLog('DELETE ALL', 'Jadwal', `Menghapus SEMUA jadwal ujian (${rowCount} slot)`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting slots:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Delete single slot
export async function deleteSlot(req, res) {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Fetch info before delete for logging
        let logInfo = `Slot ID ${id}`;
        try {
            const { rows: slotInfo } = await client.query('SELECT * FROM slots WHERE id = $1', [id]);
            if (slotInfo.length > 0) {
                logInfo = `${slotInfo[0].student} pada ${slotInfo[0].date} ${slotInfo[0].time}`;
            }
        } catch (e) { }

        // slot_examiners will be deleted automatically due to CASCADE
        const { rowCount } = await client.query('DELETE FROM slots WHERE id = $1', [id]);

        if (rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Slot not found' });
        }

        await client.query('COMMIT');

        res.json({ success: true, message: 'Slot deleted successfully' });

        await createLog('DELETE', 'Jadwal Ujian', `Menghapus jadwal ujian: ${logInfo}`);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting slot:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Create slots (from scheduling engine)
export async function createSlots(req, res) {
    const client = await pool.connect();
    try {
        const { slots } = req.body;

        if (!Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        await client.query('BEGIN');

        let insertedCount = 0;

        for (const slot of slots) {
            if (!slot.date || !slot.time || !slot.room || !slot.student) {
                continue;
            }

            try {
                // Insert slot
                const { rows: slotRows } = await client.query(
                    'INSERT INTO slots (date, time, room, student, mahasiswa_nim) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [slot.date, slot.time, slot.room, slot.student, slot.mahasiswa_nim || null]
                );

                const slotId = slotRows[0].id;

                // Insert examiners
                if (Array.isArray(slot.examiners)) {
                    for (let i = 0; i < slot.examiners.length; i++) {
                        await client.query(
                            'INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order) VALUES ($1, $2, $3)',
                            [slotId, slot.examiners[i], i]
                        );
                    }
                }

                insertedCount++;
            } catch (err) {
                // Skip duplicates (23505 = unique_violation)
                if (err.code === '23505') {
                    console.log('Slot already exists, skipping:', slot.date, slot.time, slot.room);
                } else {
                    console.error('Error inserting slot:', slot, err);
                }
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Inserted: ${insertedCount} slots`,
            inserted: insertedCount
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating slots:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}
