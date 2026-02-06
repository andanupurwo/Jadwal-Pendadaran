import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_in_production_please';

export async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = rows[0];

        if (!user) {
            // Use generic error message for security
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

export async function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

export async function me(req, res) {
    // If middleware passed, req.user is available
    res.json({ success: true, user: req.user });
}

export async function updateAccount(req, res) {
    try {
        const { currentPassword, newUsername, newPassword } = req.body;
        const userId = req.user.id; // From verifyToken middleware

        if (!currentPassword) {
            return res.status(400).json({ success: false, error: 'Password lama diperlukan untuk konfirmasi' });
        }

        // Get user from DB to verify old password
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, error: 'Password lama salah' });
        }

        let query = 'UPDATE users SET ';
        const params = [];
        let paramIndex = 1;
        const updates = [];

        // Handle Username Update
        if (newUsername && newUsername !== user.username) {
            // Check uniqueness
            const existing = await pool.query('SELECT id FROM users WHERE username = $1', [newUsername]);
            if (existing.rows.length > 0) {
                return res.status(400).json({ success: false, error: 'Username sudah digunakan' });
            }
            updates.push(`username = $${paramIndex++}`);
            params.push(newUsername);
        }

        // Handle Password Update
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.push(`password = $${paramIndex++}`);
            params.push(hashedPassword);
        }

        if (updates.length > 0) {
            query += updates.join(', ');
            query += ` WHERE id = $${paramIndex}`;
            params.push(userId);
            await pool.query(query, params);
            res.json({ success: true, message: 'Akun berhasil diperbarui' });
        } else {
            res.json({ success: true, message: 'Tidak ada perubahan disimpan' });
        }

    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
