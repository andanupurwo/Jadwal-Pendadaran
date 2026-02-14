const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'admin123',
  database: 'jadwal_pendadaran',
  port: 5432
});

const statements = [
  // Phase 1: Add missing columns to dosen
  "ALTER TABLE dosen ADD COLUMN IF NOT EXISTS exclude BOOLEAN DEFAULT FALSE",
  "ALTER TABLE dosen ADD COLUMN IF NOT EXISTS pref_gender VARCHAR(10) DEFAULT NULL",
  "ALTER TABLE dosen ADD COLUMN IF NOT EXISTS max_slots INT DEFAULT NULL",
  
  // Phase 2: Add missing columns to mahasiswa
  "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penguji_1 VARCHAR(255) DEFAULT NULL",
  "ALTER TABLE mahasiswa ADD COLUMN IF NOT EXISTS penguji_2 VARCHAR(255) DEFAULT NULL",
  
  // Phase 3: Improve libur table
  "ALTER TABLE libur ADD COLUMN IF NOT EXISTS dosen_name VARCHAR(255) DEFAULT NULL",
  "ALTER TABLE libur ADD COLUMN IF NOT EXISTS nik VARCHAR(50) DEFAULT NULL",
  
  // Phase 4: Add indexes
  "CREATE INDEX IF NOT EXISTS idx_libur_nik ON libur(nik)",
  "CREATE INDEX IF NOT EXISTS idx_libur_date ON libur(date)",
  "CREATE INDEX IF NOT EXISTS idx_libur_dosen_name ON libur(dosen_name)",
  "CREATE INDEX IF NOT EXISTS idx_mahasiswa_nim ON mahasiswa(nim)",
  "CREATE INDEX IF NOT EXISTS idx_dosen_exclude ON dosen(exclude)",
  "CREATE INDEX IF NOT EXISTS idx_slots_date_time ON slots(date, time)"
];

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...\n');
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await pool.query(stmt);
        console.log(`✅ [${i + 1}/${statements.length}] ${stmt.substring(0, 60)}...`);
      } catch (err) {
        console.error(`❌ [${i + 1}/${statements.length}] Failed: ${stmt.substring(0, 60)}`);
        console.error(`   Error: ${err.message}`);
      }
    }
    
    console.log('\n✅ Database migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
