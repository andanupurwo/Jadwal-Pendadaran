import pool from '../config/database.js';

// Get all settings
export const getSettings = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM app_settings');
        
        // Convert array of {setting_key, setting_value} to object
        const settings = result.rows.reduce((acc, row) => {
            try {
                // Try to parse JSON if possible, otherwise string
                acc[row.setting_key] = JSON.parse(row.setting_value);
            } catch (e) {
                acc[row.setting_key] = row.setting_value;
            }
            return acc;
        }, {});

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update settings (bulk or single)
export const updateSettings = async (req, res) => {
    const settings = req.body; // Expect object { key: value, key2: value2 }
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const keys = Object.keys(settings);
        const results = [];

        for (const key of keys) {
            let value = settings[key];
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            // Check if exists
            const checkRes = await client.query(
                'SELECT 1 FROM app_settings WHERE setting_key = $1',
                [key]
            );

            if (checkRes.rowCount > 0) {
                // Update
                const updateRes = await client.query(
                    'UPDATE app_settings SET setting_value = $1, updated_at = CURRENT_TIMESTAMP WHERE setting_key = $2 RETURNING *',
                    [value, key]
                );
                results.push(updateRes.rows[0]);
            } else {
                // Insert
                const insertRes = await client.query(
                    'INSERT INTO app_settings (setting_key, setting_value) VALUES ($1, $2) RETURNING *',
                    [key, value]
                );
                results.push(insertRes.rows[0]);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: results
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        client.release();
    }
};
