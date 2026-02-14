import pool from './backend/config/database.js';

async function checkDosen() {
    try {
        const { rows } = await pool.query("SELECT nama, max_slots FROM dosen WHERE nama LIKE '%Achmad Fauzan%'");
        console.log('Dosen data:', rows);

        const { rows: slots } = await pool.query(`
            SELECT s.*, se.examiner_name 
            FROM slots s 
            LEFT JOIN slot_examiners se ON s.id = se.slot_id 
            WHERE se.examiner_name LIKE '%Achmad Fauzan%'
            ORDER BY s.date, s.time
        `);
        console.log(`\nSlots for this dosen: ${slots.length} total`);
        slots.forEach(s => {
            console.log(`- ${s.date} ${s.time} (${s.room}): ${s.student} - Examiner: ${s.examiner_name}`);
        });

        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkDosen();
