import pool from '../config/database.js';

export async function createLog(actionType, target, description) {
    try {
        await pool.query(
            'INSERT INTO activity_logs (action_type, target, description) VALUES ($1, $2, $3)',
            [actionType, target, description]
        );
    } catch (error) {
        console.error('Failed to create log:', error);
    }
}

export async function getLogs(req, res) {
    try {
        const { rows } = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export async function clearLogs(req, res) {
    try {
        await pool.query('DELETE FROM activity_logs');
        res.json({ success: true, message: 'Logs cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
