import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'admin123',
  database: 'jadwal_pendadaran',
  port: 5432
});

async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema changes...\n');
    
    // Check dosen table columns
    const dosenCols = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'dosen' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 DOSEN Table Columns:');
    const criticalCols = ['exclude', 'pref_gender', 'max_slots'];
    const dosenHasCritical = [];
    for (const col of dosenCols.rows) {
      const isCritical = criticalCols.includes(col.column_name);
      const marker = isCritical ? '⭐' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.data_type})`);
      if (isCritical) dosenHasCritical.push(col.column_name);
    }
    
    // Check mahasiswa table columns
    const mahasiswaCols = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'mahasiswa' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 MAHASISWA Table Columns:');
    const mahasiswaCritical = ['penguji_1', 'penguji_2'];
    const mahasiswaHasCritical = [];
    for (const col of mahasiswaCols.rows) {
      const isCritical = mahasiswaCritical.includes(col.column_name);
      const marker = isCritical ? '⭐' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.data_type})`);
      if (isCritical) mahasiswaHasCritical.push(col.column_name);
    }
    
    // Check libur table columns
    const liburCols = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'libur' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 LIBUR Table Columns:');
    const liburCritical = ['dosen_name', 'nik'];
    const liburHasCritical = [];
    for (const col of liburCols.rows) {
      const isCritical = liburCritical.includes(col.column_name);
      const marker = isCritical ? '⭐' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.data_type})`);
      if (isCritical) liburHasCritical.push(col.column_name);
    }
    
    // Check indexes
    const indexes = await pool.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename IN ('libur', 'slots', 'mahasiswa', 'dosen')
      ORDER BY indexname
    `);
    
    console.log('\n📊 Created Indexes:');
    const createdIndexes = [];
    for (const idx of indexes.rows) {
      if (idx.indexname.startsWith('idx_')) {
        console.log(`  ✅ ${idx.indexname}`);
        createdIndexes.push(idx.indexname);
      }
    }
    
    // Summary
    console.log('\n✅ Schema Verification Summary:');
    console.log(`  ✅ DOSEN critical columns: ${dosenHasCritical.length}/3 (${dosenHasCritical.join(', ')})`);
    console.log(`  ✅ MAHASISWA critical columns: ${mahasiswaHasCritical.length}/2 (${mahasiswaHasCritical.join(', ')})`);
    console.log(`  ✅ LIBUR critical columns: ${liburHasCritical.length}/2 (${liburHasCritical.join(', ')})`);
    console.log(`  ✅ Indexes created: ${createdIndexes.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Verification error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifySchema();
