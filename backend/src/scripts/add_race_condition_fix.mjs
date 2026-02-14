import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: 'admin123',
  database: 'jadwal_pendadaran',
  port: 5432
});

async function addRaceConditionFix() {
  try {
    console.log('🔒 Adding race condition protection...\n');
    
    // Task 1: Add unique constraint pada slot_examiners
    // Ini mencegah dosen sama jadi penguji 2x untuk slot yang sama
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'slot_examiners' 
          AND constraint_name = 'unique_slot_examiner'
        ) THEN
          ALTER TABLE slot_examiners 
          ADD CONSTRAINT unique_slot_examiner UNIQUE (slot_id, examiner_name);
          RAISE NOTICE 'Added unique constraint on slot_examiners';
        END IF;
      END $$;
    `);
    console.log('✅ Added UNIQUE constraint on slot_examiners');
    
    // Task 2: Add unique constraint pada slots
    // Ini mencegah berapa mahasiswa untuk slot yang sama (date, time, room)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'slots' 
          AND constraint_name = 'unique_slot_date_time_room'
        ) THEN
          ALTER TABLE slots 
          ADD CONSTRAINT unique_slot_date_time_room UNIQUE (date, time, room);
          RAISE NOTICE 'Added unique constraint on slots date/time/room';
        END IF;
      END $$;
    `);
    console.log('✅ Added UNIQUE constraint on slots (date, time, room combo)');
    
    // Task 3: Add dosen examiner count trigger
    // Ini memastikan dosen tidak melebihi max_slots
    await pool.query(`
      CREATE OR REPLACE FUNCTION check_examiner_quota()
      RETURNS TRIGGER AS $$
      DECLARE
        examiner_count INT;
        max_slots INT;
      BEGIN
        -- Count existing slots where this examiner is assigned
        SELECT COUNT(*) INTO examiner_count
        FROM slot_examiners se
        WHERE se.examiner_name = NEW.examiner_name;
        
        -- Get max_slots dari dosen table
        SELECT d.max_slots INTO max_slots
        FROM dosen d
        WHERE LOWER(d.nama) = LOWER(NEW.examiner_name);
        
        -- Jika max_slots ditentukan, cek quota
        IF max_slots IS NOT NULL AND examiner_count >= max_slots THEN
          RAISE EXCEPTION 'Examiner % sudah mencapai batas maksimal % slot', 
                          NEW.examiner_name, max_slots;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Created examiner quota checking function');
    
    // Task 4: Add trigger untuk check_examiner_quota
    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_check_examiner_quota ON slot_examiners;
      
      CREATE TRIGGER trigger_check_examiner_quota
      BEFORE INSERT ON slot_examiners
      FOR EACH ROW
      EXECUTE FUNCTION check_examiner_quota();
    `);
    console.log('✅ Created trigger for examiner quota checking');
    
    console.log('\n✅ Race condition protection activated!');
    console.log('   - Dosen tidak bisa menjadi penguji 2x untuk slot sama');
    console.log('   - Slot tidak bisa booked 2x dengan date/time/room sama');
    console.log('   - Dosen tidak bisa melebihi max_slots');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addRaceConditionFix();
