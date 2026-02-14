import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin123',
    database: 'jadwal_pendadaran',
    port: 5432
});

try {
    const sql = fs.readFileSync('src/database/backup_latest.sql', 'utf8');
    
    // Remove comment lines better
    const lines = sql.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('--');
    }).join('\n');
    
    // Split by semicolon followed by newline
    const rawStatements = lines.split(';\n');
    const statements = rawStatements
        .map(s => s.trim())
        .filter(s => s && s.length > 5);
    
    console.log(`📍 Found ${statements.length} SQL statements to execute`);
    
    let executed = 0;
    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim() + ';';
        try {
            await pool.query(stmt);
            executed++;
            if (executed % 10 === 0) console.log(`  ✓ Executed ${executed}/${statements.length}`);
        } catch (err) {
            // Continue on some errors like "already exists"
            const msg = err.message.toLowerCase();
            if (!msg.includes('already exists') && !msg.includes('duplicate') && !msg.includes('constraint')) {
                if (executed < 50) { // Only log first few errors
                    console.error(`  ⚠️ At statement ${executed}:`, err.message.substring(0, 80));
                }
            }
        }
    }
    
    console.log(`✅ Restore complete! Executed ${executed} statements`);
    
    // Verify data was restored
    const countRes = await pool.query('SELECT COUNT(*) as count FROM slots');
    console.log(`📊 Total slots in database: ${countRes.rows[0].count}`);
    
} catch (err) {
    console.error('❌ Fatal error:', err.message);
} finally {
    await pool.end();
}
