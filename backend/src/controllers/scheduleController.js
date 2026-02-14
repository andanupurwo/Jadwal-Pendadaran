import pool from '../config/database.js';
import { createLog } from './logsController.js';



// Helper functions
function normalizeName(nama) {
    if (!nama) return '';
    // 1. Ambil nama depan sebelum gelar (koma)
    let base = nama.split(',')[0];
    // 2. Hapus gelar depan umum
    base = base.replace(/^(dr|drs|prof|apt|irk)\.?\s+/gi, '');
    // 3. Bersihkan tanda baca dan spasi ganda
    return base.toLowerCase()
        .replace(/[.,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Compare two names by matching minimum 2 words
 * Handles variations like "Yusuf Amri Amrullah" vs "Yusuf Amri Amri Amrullah"
 * Returns true if both names share at least 2 common words (after normalization)
 */
function compareNames(name1, name2) {
    if (!name1 || !name2) return false;
    
    // Normalize and split into words
    const normalize = (n) => {
        let base = n.split(',')[0]; // Take before comma (remove titles)
        base = base.replace(/^(dr|drs|prof|apt|irk)\.?\s+/gi, ''); // Remove prefixes
        return base.toLowerCase()
            .replace(/[.,]/g, ' ')
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(w => w.length > 0); // Common words only
    };
    
    const words1 = normalize(name1);
    const words2 = normalize(name2);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    // Count common words
    const commonWords = words1.filter(w => words2.includes(w));
    
    // At least 2 words must match
    return commonWords.length >= 2;
}

async function getAllDosen() {
    // Select lecturers who are NOT excluded (ON)
    const { rows } = await pool.query('SELECT * FROM dosen WHERE exclude = FALSE');
    return rows.map(d => ({
        id: d.id,
        nik: d.nik,
        nama: d.nama,
        prodi: d.prodi,
        fakultas: d.fakultas,
        exclude: false,
        pref_gender: d.pref_gender || null,
        max_slots: d.max_slots
    }));
}

async function isDosenAvailable(namaDosen, date, time, allDosen, liburData, slotsData, excludeSlotStudent = null, ignoreGlobalExclude = false) {
    const dosenData = allDosen.find(d => compareNames(d.nama, namaDosen));

    // DEBUG KHUSUS UNTUK AMIR
    const searchNameNorm = normalizeName(namaDosen);
    const isAmir = searchNameNorm.includes('amir');
    if (isAmir) {
        // console.log(`[DEBUG AMIR] Checking ${namaDosen} for ${date} ${time}`);
        if (!dosenData) console.log(`[DEBUG AMIR] ⚠️ Dosen data NOT FOUND for ${namaDosen}`);
        else console.log(`[DEBUG AMIR] Found NIK: ${dosenData.nik}`);
    }

    if (!dosenData) {
        // console.warn(`[Availability] Data dosen tidak ditemukan untuk nama: ${namaDosen}`);
    }

    // 1. Check manual 'OFF' toggle
    if (!ignoreGlobalExclude && dosenData && dosenData.exclude) return false;

    // 2. Check Libur/Unavailability Rules
    const isLibur = liburData.some(l => {
        // Match by NIK (Best)
        if (dosenData && l.nik && String(l.nik) === String(dosenData.nik)) {
            // Match found by NIK
        } else {
            // Fallback to name match if NIK in libur is missing
            if (!compareNames(l.dosen_name || l.nama || "", namaDosen)) return false;
        }

        // DEBUG AMIR
        if (isAmir) {
            console.log(`[DEBUG AMIR] Rule found: Date=${l.date}, Time=${l.time}. MatchId=${matchId}, MatchNama=${matchNama}`);
        }

        // Condition A: Block specific date AND specific time
        if (l.date && l.time) {
            const hit = String(l.date) === String(date) && String(l.time) === String(time);
            if (isAmir && hit) console.log(`[DEBUG AMIR] 🛑 BLOCKED by Condition A (Specific D&T)`);
            return hit;
        }

        // Condition B: Block specific date (all times)
        if (l.date && !l.time) {
            const hit = String(l.date) === String(date);
            if (isAmir && hit) console.log(`[DEBUG AMIR] 🛑 BLOCKED by Condition B (Date Only)`);
            return hit;
        }

        // Condition C: Block specific time (all dates)
        if (!l.date && l.time) {
            const hit = l.time === time;
            if (isAmir && hit) console.log(`[DEBUG AMIR] 🛑 BLOCKED by Condition C (Time Only, All Dates)`);
            return hit;
        }

        // Condition D: Block absolutely everything (no date, no time specified)
        if (!l.date && !l.time) {
            if (isAmir) console.log(`[DEBUG AMIR] 🛑 BLOCKED by Condition D (Total Block)`);
            return true;
        }

        return false;
    });

    if (isLibur) return false;

    // 3. Check for busy conflicts (already scheduled)
    const busy = slotsData.some(slot => {
        if (excludeSlotStudent && slot.student === excludeSlotStudent) return false;
        if (slot.date !== date || slot.time !== time) return false;

        // Check Pembimbing (student's supervisor) being busy
        // IMPORTANT: We need check if 'namaDosen' IS the supervisor of 'slot.student'
        // But slotsData structure doesn't keep supervisor NIK, only 'examiners' array.
        // Wait, the current check is checks if 'namaDosen' is in 'examiners'.
        // But if 'namaDosen' is the SUPERVISOR of a scheduled slot, they are effectively busy too!

        // HOWEVER, in generateSchedule, we put supervisor into 'examiners' array (at the end).
        // See: const final = [...examiners, mhs.pembimbing]; 
        // So checking slot.examiners IS enough.

        const isBusy = slot.examiners && slot.examiners.some(ex => compareNames(ex, namaDosen));
        if (isAmir && isBusy) console.log(`[DEBUG AMIR] 📅 BUSY at ${slot.date} ${slot.time} with ${slot.student}`);
        return isBusy;
    });

    return !busy;
}

/**
 * Generate schedule endpoint
 * This is the core scheduling engine that allocates exam slots
 */
export async function generateSchedule(req, res) {
    const client = await pool.connect();

    try {
        let { targetProdi = 'all', isIncremental = false } = req.body;

        const logs = [];
        const log = (message) => {
            const time = new Date().toLocaleTimeString();
            logs.push(`[${time}] ${message}`);
            console.log(message);
        };

        log("🚀 MEMULAI PROSES PENJADWALAN OTOMATIS (POSTGRES)...");
        log(`⚙️ Mode: ${isIncremental ? 'INCREMENTAL' : 'RESET FULL'}`);
        log(`🎯 Target: ${targetProdi}`);

        await client.query('BEGIN');

        // 1. Fetch Dynamic Settings
        const settingsRes = await client.query('SELECT * FROM app_settings');
        const settings = settingsRes.rows.reduce((acc, row) => {
            try { acc[row.setting_key] = JSON.parse(row.setting_value); } catch { acc[row.setting_key] = row.setting_value; }
            return acc;
        }, {});

        // Fallback defaults if DB is empty
        const ROOMS = settings.schedule_rooms || ['6.3.A'];
        const DISABLED_ROOMS = settings.schedule_disabled_rooms || [];
        const ACTIVE_ROOMS = ROOMS.filter(r => !DISABLED_ROOMS.includes(r));

        const TIMES = settings.schedule_times || ['08:30'];
        const DATES = settings.schedule_dates || [];

        if (DATES.length === 0) {
            log("⚠️ EROR: Tidak ada konfigurasi tanggal di database.");
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: 'Konfigurasi tanggal belum diatur.' });
        }

        // Load data
        let { rows: mahasiswaList } = await client.query('SELECT * FROM mahasiswa ORDER BY nim');

        // Filter by target student if specified (Single Student Scheduling Mode)
        const { targetStudent } = req.body;
        if (targetStudent) {
            mahasiswaList = mahasiswaList.filter(m => m.nim === targetStudent);
            isIncremental = true; // Force incremental so existing slots are not wiped
            log(`🎯 ONLY SCHEDULING: ${mahasiswaList[0]?.nama || targetStudent}`);
        } else if (targetProdi !== 'all') {
            mahasiswaList = mahasiswaList.filter(m => m.prodi === targetProdi);
        }

        if (mahasiswaList.length === 0) {
            log("⚠️ Tidak ada mahasiswa yang sesuai filter.");
            await client.query('COMMIT');
            return res.json({ success: true, logs, scheduled: 0, total: 0 });
        }

        // Get current slots
        let { rows: currentSlots } = await client.query('SELECT * FROM slots');
        const { rows: examinerRows } = await client.query('SELECT slot_id, examiner_name FROM slot_examiners ORDER BY slot_id, examiner_order');

        // Map examiners to slots
        const slotExaminersMap = {};
        examinerRows.forEach(row => {
            if (!slotExaminersMap[row.slot_id]) {
                slotExaminersMap[row.slot_id] = [];
            }
            slotExaminersMap[row.slot_id].push(row.examiner_name);
        });

        let slotsData = currentSlots.map(slot => ({
            ...slot,
            examiners: slotExaminersMap[slot.id] || []
        }));

        const scheduledMahasiswaIds = new Set();
        if (isIncremental) {
            slotsData.forEach(s => {
                const m = mahasiswaList.find(x => x.nama === s.student);
                if (m) scheduledMahasiswaIds.add(m.nim);
            });
        } else {
            // Reset mode: delete all slots
            await client.query('DELETE FROM slot_examiners');
            await client.query('DELETE FROM slots');
            slotsData = [];
        }

        const allDosen = await getAllDosen();
        const { rows: liburData } = await client.query('SELECT * FROM libur');

        // STRATEGY: Prioritize students with high-constraint supervisors (Busiest First)
        // Use IMPROVED normalization to ensure Novita with titles matches Novita in Libur table.
        const busyScores = {};
        liburData.forEach(l => {
            if (l.dosen_name) {
                const normName = normalizeName(l.dosen_name);
                busyScores[normName] = (busyScores[normName] || 0) + 1;
            }
        });

        mahasiswaList.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            for (const [normName, score] of Object.entries(busyScores)) {
                if (compareNames(a.pembimbing, normName)) scoreA = score;
                if (compareNames(b.pembimbing, normName)) scoreB = score;
            }

            // Primary sort: Busy score (desc)
            if (scoreB !== scoreA) return scoreB - scoreA;

            // Secondary sort: NIM (asc) for consistency
            return (a.nim || '').localeCompare(b.nim || '');
        });

        const examinerCounts = {};
        if (isIncremental || !isIncremental) { // counts for fairness
            slotsData.forEach(slot => {
                slot.examiners.forEach(ex => {
                    examinerCounts[ex] = (examinerCounts[ex] || 0) + 1;
                });
            });
        }

        // Scheduling algorithm
        const findExaminers = async (pembimbing, date, time, studentProdi, studentGender, forceSearch = false) => {
            let candidates = [];
            const sProdiNorm = studentProdi?.toLowerCase().trim();
            const studentGenderNorm = studentGender?.toUpperCase().trim() || null;

            // Sort by workload (fairness). If forceSearch = true, we allow higher workloads to ensure scheduling.
            const candidatePool = [...allDosen].sort((a, b) => {
                const countA = examinerCounts[a.nama] || 0;
                const countB = examinerCounts[b.nama] || 0;
                return countA - countB;
            });

            for (const d of candidatePool) {
                if (candidates.length >= 2) break;

                // 1. Not the student's supervisor
                if (compareNames(d.nama, pembimbing)) continue;

                // 2. Not already selected as P1
                if (candidates.some(c => compareNames(c, d.nama))) continue;

                // 3. STRICT RULE: Same prodi
                const dProdiNorm = d.prodi?.toLowerCase().trim();
                if (dProdiNorm !== sProdiNorm) continue;

                // 4. QUOTA CHECK: Respect max_slots if set
                const currentCount = examinerCounts[d.nama] || 0;
                if (d.max_slots !== null && d.max_slots !== undefined && currentCount >= d.max_slots) {
                    continue; // Skip if quota reached
                }

                // SUPERVISOR PROTECTION RULE:
                // Don't take this lecturer as an examiner IF they still have their own supervisees to schedule.
                // This ensures their availability is preserved for their own students first.
                const hasUnscheduledBimbingan = mahasiswaList.some(m =>
                    compareNames(m.pembimbing, d.nama) &&
                    !scheduledMahasiswaIds.has(m.nim)
                );

                if (hasUnscheduledBimbingan) {
                    // Skip picking this lecturer as an examiner for now, 
                    // because they must prioritize their own students first.
                    continue;
                }

                // 4. Gender Constraint
                if (d.pref_gender && studentGenderNorm) {
                    if (d.pref_gender !== studentGenderNorm) continue;
                }

                // 5. Availability
                const available = await isDosenAvailable(d.nama, date, time, allDosen, liburData, slotsData);
                if (!available) continue;

                candidates.push(d.nama);
            }
            return candidates.length < 2 ? null : candidates;
        };

        let successCount = 0;
        const newSlotsCreated = [];
        const failureReasons = []; // Track why students were skipped

        // ==========================================
        // HYBRID SCHEDULING LOGIC - 3 SCENARIOS
        // ==========================================

        // Group students by assignment type for priority processing
        const fullyAssigned = [];     // Has Penguji1 AND Penguji2
        const partiallyAssigned = []; // Has ONLY Penguji1 OR Penguji2
        const autoAssign = [];         // No pre-assigned examiners

        for (const mhs of mahasiswaList) {
            if (scheduledMahasiswaIds.has(mhs.nim)) continue;
            if (!mhs.pembimbing || !mhs.prodi) continue;

            if (mhs.penguji_1 && mhs.penguji_2) {
                fullyAssigned.push(mhs);
            } else if (mhs.penguji_1 || mhs.penguji_2) {
                partiallyAssigned.push(mhs);
            } else {
                autoAssign.push(mhs);
            }
        }

        log(`📊 Mahasiswa Categories: ${fullyAssigned.length} fully assigned, ${partiallyAssigned.length} partially, ${autoAssign.length} auto`);

        // ==============================================
        // SCENARIO A: FULLY PRE-ASSIGNED (P1 + P2)
        // ==============================================
        log(`\n🎯 SCENARIO A: Processing ${fullyAssigned.length} fully pre-assigned students...`);

        for (const mhs of fullyAssigned) {
            const allThree = [mhs.pembimbing, mhs.penguji_1, mhs.penguji_2];

            // Validate uniqueness
            const uniqueNames = new Set(allThree.map(normalizeName));
            if (uniqueNames.size !== 3) {
                const msg = `❌ ${mhs.nama}: Penguji duplikat (${mhs.pembimbing}, ${mhs.penguji_1}, ${mhs.penguji_2})`;
                log(msg);
                failureReasons.push({ student: mhs.nama, reason: 'Duplicate examiners' });
                continue;
            }

            let scheduled = false;

            searchFullyAssigned: for (const dateObj of DATES) {
                for (const time of TIMES) {
                    if (dateObj.label === 'Jumat' && time === '11:30') continue;

                    for (const room of ACTIVE_ROOMS) {
                        const slotExists = slotsData.find(s => s.date === dateObj.value && s.time === time && s.room === room);
                        if (slotExists) continue;

                        // Check availability of ALL 3
                        const availChecks = await Promise.all(
                            allThree.map(name =>
                                isDosenAvailable(name, dateObj.value, time, allDosen, liburData, slotsData, null, name === mhs.pembimbing)
                            )
                        );

                        if (availChecks.every(a => a)) {
                            // Create slot
                            const { rows: insertedSlot } = await client.query(
                                'INSERT INTO slots (date, time, room, student, mahasiswa_nim) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                                [dateObj.value, time, room, mhs.nama, mhs.nim]
                            );
                            const slotId = insertedSlot[0].id;

                            const finalExaminers = [mhs.penguji_1, mhs.penguji_2, mhs.pembimbing];
                            for (let i = 0; i < finalExaminers.length; i++) {
                                await client.query(
                                    'INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order) VALUES ($1, $2, $3)',
                                    [slotId, finalExaminers[i], i]
                                );
                            }

                            const newSlotObj = { id: slotId, date: dateObj.value, time, room, student: mhs.nama, examiners: finalExaminers };
                            newSlotsCreated.push(newSlotObj);
                            slotsData.push(newSlotObj);
                            scheduledMahasiswaIds.add(mhs.nim);
                            successCount++;
                            finalExaminers.forEach(ex => { examinerCounts[ex] = (examinerCounts[ex] || 0) + 1; });
                            log(`✅ [${dateObj.value} ${time}] ${mhs.nama} (${room}) - Pre-assigned: ${mhs.penguji_1}, ${mhs.penguji_2}`);
                            scheduled = true;
                            break searchFullyAssigned;
                        }
                    }
                }
            }

            if (!scheduled) {
                const msg = `❌ ${mhs.nama}: No available slot for all 3 examiners`;
                log(msg);
                failureReasons.push({ student: mhs.nama, reason: msg });
            }
        }

        // ==============================================
        // SCENARIO B: PARTIALLY PRE-ASSIGNED (P1 OR P2)
        // ==============================================
        log(`\n🔍 SCENARIO B: Processing ${partiallyAssigned.length} partially pre-assigned students...`);

        for (const mhs of partiallyAssigned) {
            const preAssigned = mhs.penguji_1 || mhs.penguji_2;
            const needToFind = mhs.penguji_1 ? 'Penguji 2' : 'Penguji  1';

            log(`🔍 ${mhs.nama}: Finding ${needToFind} (${preAssigned} pre-assigned)`);

            let scheduled = false;

            searchPartial: for (const dateObj of DATES) {
                for (const time of TIMES) {
                    if (dateObj.label === 'Jumat' && time === '11:30') continue;

                    for (const room of ACTIVE_ROOMS) {
                        const slotExists = slotsData.find(s => s.date === dateObj.value && s.time === time && s.room === room);
                        if (slotExists) continue;

                        // Check availability of pembimbing + pre-assigned examiner
                        const pembimbingAvail = await isDosenAvailable(mhs.pembimbing, dateObj.value, time, allDosen, liburData, slotsData, null, true);
                        const preAssignedAvail = await isDosenAvailable(preAssigned, dateObj.value, time, allDosen, liburData, slotsData, null, false);

                        if (!pembimbingAvail || !preAssignedAvail) continue;

                        // AUTO-FIND the missing examiner with FULL VALIDATION
                        const autoExaminers = await findExaminers(mhs.pembimbing, dateObj.value, time, mhs.prodi, mhs.gender, false);

                        if (autoExaminers && autoExaminers.length >= 2) {
                            // Filter out the pre-assigned examiner
                            const preNorm = normalizeName(preAssigned);
                            const pembNorm = normalizeName(mhs.pembimbing);
                            const available = autoExaminers.filter(ex => {
                                const exNorm = normalizeName(ex);
                                return exNorm !== preNorm && exNorm !== pembNorm;
                            });

                            if (available.length >= 1) {
                                const autoExaminer = available[0];

                                // Create slot
                                const { rows: insertedSlot } = await client.query(
                                    'INSERT INTO slots (date, time, room, student, mahasiswa_nim) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                                    [dateObj.value, time, room, mhs.nama, mhs.nim]
                                );
                                const slotId = insertedSlot[0].id;

                                const finalExaminers = mhs.penguji_1
                                    ? [mhs.penguji_1, autoExaminer, mhs.pembimbing]
                                    : [autoExaminer, mhs.penguji_2, mhs.pembimbing];

                                for (let i = 0; i < finalExaminers.length; i++) {
                                    await client.query(
                                        'INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order) VALUES ($1, $2, $3)',
                                        [slotId, finalExaminers[i], i]
                                    );
                                }

                                const newSlotObj = { id: slotId, date: dateObj.value, time, room, student: mhs.nama, examiners: finalExaminers };
                                newSlotsCreated.push(newSlotObj);
                                slotsData.push(newSlotObj);
                                scheduledMahasiswaIds.add(mhs.nim);
                                successCount++;
                                finalExaminers.forEach(ex => { examinerCounts[ex] = (examinerCounts[ex] || 0) + 1; });
                                log(`✅ [${dateObj.value} ${time}] ${mhs.nama} (${room}) - Hybrid: ${preAssigned} + ${autoExaminer}`);
                                scheduled = true;
                                break searchPartial;
                            }
                        }
                    }
                }
            }

            if (!scheduled) {
                const msg = `❌ ${mhs.nama}: Cannot find ${needToFind}`;
                log(msg);
                failureReasons.push({ student: mhs.nama, reason: msg });
            }
        }

        // ==============================================
        // SCENARIO C: AUTO-ASSIGN (Existing Logic)
        // ==============================================
        log(`\n⚙️ SCENARIO C: Processing ${autoAssign.length} auto-assignment students...`);

        for (const mhs of autoAssign) {
            let scheduled = false;

            // Search for an available slot for THIS student
            searchLoop:
            for (const dateObj of DATES) {
                for (const time of TIMES) {
                    if (dateObj.label === 'Jumat' && time === '11:30') continue;

                    for (const room of ACTIVE_ROOMS) {
                        const slotExists = slotsData.some(s => s.date === dateObj.value && s.time === time && s.room === room);
                        if (slotExists) continue;

                        const supervisorAvailable = await isDosenAvailable(mhs.pembimbing, dateObj.value, time, allDosen, liburData, slotsData, null, true);
                        if (!supervisorAvailable) continue;

                        const isHighPriority = (busyScores[normalizeName(mhs.pembimbing)] || 0) > 0;
                        const examiners = await findExaminers(mhs.pembimbing, dateObj.value, time, mhs.prodi, mhs.gender, isHighPriority);

                        if (examiners) {
                            const final = [...examiners, mhs.pembimbing];
                            const { rows: insertedSlot } = await client.query(
                                'INSERT INTO slots (date, time, room, student, mahasiswa_nim) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                                [dateObj.value, time, room, mhs.nama, mhs.nim]
                            );

                            const slotId = insertedSlot[0].id;
                            for (let i = 0; i < final.length; i++) {
                                await client.query('INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order) VALUES ($1, $2, $3)', [slotId, final[i], i]);
                            }

                            const newSlotObj = { id: slotId, date: dateObj.value, time, room, student: mhs.nama, examiners: final };
                            newSlotsCreated.push(newSlotObj);
                            slotsData.push(newSlotObj);
                            scheduledMahasiswaIds.add(mhs.nim);
                            successCount++;
                            final.forEach(ex => { examinerCounts[ex] = (examinerCounts[ex] || 0) + 1; });
                            log(`✅ [${dateObj.value} ${time}] ${mhs.nama} (${room})`);
                            scheduled = true;
                            break searchLoop;
                        }
                    }
                }
            }

            if (!scheduled) {
                // Diagnostic check for more specific failure reason
                let reason = "Tidak ada slot yang cocok (Cek libur atau kuota penguji)";

                const supervisorAvailCount = await (async () => {
                    let count = 0;
                    for (const d of DATES) {
                        for (const t of TIMES) {
                            if (await isDosenAvailable(mhs.pembimbing, d.value, t, allDosen, liburData, slotsData, null, true)) count++;
                        }
                    }
                    return count;
                })();

                if (supervisorAvailCount === 0) {
                    reason = `Dosen Pembimbing (${mhs.pembimbing}) tidak memiliki jam kosong di seluruh jadwal.`;
                } else {
                    const sameProdiDosen = allDosen.filter(d => d.prodi?.toLowerCase().trim() === mhs.prodi?.toLowerCase().trim());
                    if (sameProdiDosen.length < 3) {
                        reason = `Jumlah dosen di prodi ${mhs.prodi} kurang dari minimum 3 untuk membentuk tim (1 Pembimbing + 2 Penguji).`;
                    } else {
                        reason = "Bentrok Penguji: Semua dosen penguji di prodi ini sudah terisi atau libur di jam yang pembimbing bisa.";
                    }
                }

                failureReasons.push({ nim: mhs.nim, nama: mhs.nama, reason });
                log(`❌ GAGAL: ${mhs.nama} - ${reason}`);
            }
        }

        log(`🏁 Selesai. Terjadwal: ${successCount}/${mahasiswaList.length}`);

        await client.query('COMMIT');

        res.json({
            success: true,
            logs,
            scheduled: successCount,
            total: mahasiswaList.length,
            slots: newSlotsCreated,
            failures: failureReasons
        });

        await createLog('GENERATE', 'Jadwal', `Generate jadwal (${isIncremental ? 'Incremental' : 'Full Reset'}). Target: ${targetProdi}. Berhasil: ${successCount}.`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error generating schedule:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

export async function moveSlot(req, res) {
    const client = await pool.connect();
    try {
        const { slotId, newDate, newTime, newRoom } = req.body;

        // 1. Get Target Slot
        const { rows: slotRows } = await client.query('SELECT * FROM slots WHERE id = $1', [slotId]);
        if (slotRows.length === 0) return res.status(404).json({ success: false, error: 'Slot not found' });
        const slot = slotRows[0];

        // 2. Check if new position is occupied
        const { rows: collision } = await client.query(
            'SELECT * FROM slots WHERE date = $1 AND time = $2 AND room = $3 AND id != $4',
            [newDate, newTime, newRoom, slotId]
        );
        if (collision.length > 0) {
            return res.json({ success: false, error: `Ruangan ${newRoom} sudah terisi pada ${newDate} ${newTime}` });
        }

        // 3. Get Data for Validation
        const allDosen = await getAllDosen();
        const { rows: liburData } = await client.query('SELECT * FROM libur');
        const { rows: currentSlots } = await client.query('SELECT * FROM slots');
        const { rows: examinerRows } = await client.query('SELECT slot_id, examiner_name FROM slot_examiners ORDER BY slot_id, examiner_order');

        const slotExaminersMap = {};
        examinerRows.forEach(row => {
            if (!slotExaminersMap[row.slot_id]) slotExaminersMap[row.slot_id] = [];
            slotExaminersMap[row.slot_id].push(row.examiner_name);
        });

        const slotsData = currentSlots.map(s => ({
            ...s,
            examiners: slotExaminersMap[s.id] || []
        }));

        // 4. Validate All Examiners (including Supervisor)
        const myExaminers = slotExaminersMap[slot.id] || [];

        for (const dosenName of myExaminers) {
            const available = await isDosenAvailable(
                dosenName,
                newDate,
                newTime,
                allDosen,
                liburData,
                slotsData,
                slot.student // Exclude this slot from busy check
            );

            if (!available) {
                return res.json({ success: false, error: `Gagal: ${dosenName} tidak tersedia/bentrok.` });
            }
        }

        // 5. Update Slot
        await client.query(
            'UPDATE slots SET date = $1, time = $2, room = $3 WHERE id = $4',
            [newDate, newTime, newRoom, slotId]
        );

        res.json({ success: true, message: 'Jadwal berhasil dipindahkan' });

        await createLog('MOVE', 'Jadwal', `Memindahkan jadwal ${slot.student} ke ${newDate} ${newTime} (${newRoom})`);

    } catch (error) {
        console.error('Move Slot Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

/**
 * Create slot manually with full validation
 * Allows manual assignment of student and examiners to a specific slot
 */
export async function createSlotManual(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { mahasiswaNim, penguji1, penguji2, pembimbing, date, time, room } = req.body;

        // 1. Validate Input
        if (!mahasiswaNim || !penguji1 || !penguji2 || !pembimbing || !date || !time || !room) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                error: 'Data tidak lengkap. Semua field harus diisi.'
            });
        }

        // 2. Get Mahasiswa Data
        const { rows: mahasiswaRows } = await client.query(
            'SELECT * FROM mahasiswa WHERE nim = $1',
            [mahasiswaNim]
        );
        if (mahasiswaRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Mahasiswa tidak ditemukan' });
        }
        const mahasiswa = mahasiswaRows[0];

        // 3. Check if slot position is already occupied
        const { rows: existingSlot } = await client.query(
            'SELECT * FROM slots WHERE date = $1 AND time = $2 AND room = $3',
            [date, time, room]
        );
        if (existingSlot.length > 0) {
            await client.query('ROLLBACK');
            return res.json({
                success: false,
                error: `Ruangan ${room} sudah terisi pada ${date} ${time}`
            });
        }

        // 4. Check if student is already scheduled
        const { rows: studentScheduled } = await client.query(
            'SELECT * FROM slots WHERE mahasiswa_nim = $1',
            [mahasiswaNim]
        );
        if (studentScheduled.length > 0) {
            await client.query('ROLLBACK');
            return res.json({
                success: false,
                error: `Mahasiswa ${mahasiswa.nama} sudah terjadwal pada ${studentScheduled[0].date} ${studentScheduled[0].time}`
            });
        }

        // 5. Validate Examiners (Penguji1, Penguji2, Pembimbing must be different)
        const examiners = [penguji1, penguji2, pembimbing];
        const uniqueExaminers = new Set(examiners.map(e => normalizeName(e)));
        if (uniqueExaminers.size !== 3) {
            await client.query('ROLLBACK');
            return res.json({
                success: false,
                error: 'Penguji 1, Penguji 2, dan Pembimbing harus berbeda'
            });
        }

        // 6. Get Data for Availability Validation
        const allDosen = await getAllDosen();
        const { rows: liburData } = await client.query('SELECT * FROM libur');
        const { rows: currentSlots } = await client.query('SELECT * FROM slots');
        const { rows: examinerRows } = await client.query('SELECT slot_id, examiner_name FROM slot_examiners ORDER BY slot_id, examiner_order');

        const slotExaminersMap = {};
        examinerRows.forEach(row => {
            if (!slotExaminersMap[row.slot_id]) slotExaminersMap[row.slot_id] = [];
            slotExaminersMap[row.slot_id].push(row.examiner_name);
        });

        const slotsData = currentSlots.map(s => ({
            ...s,
            examiners: slotExaminersMap[s.id] || []
        }));

        // 7. Validate Each Examiner's Availability
        const dosenToCheck = [
            { name: penguji1, role: 'Penguji 1' },
            { name: penguji2, role: 'Penguji 2' },
            { name: pembimbing, role: 'Pembimbing' }
        ];

        for (const dosen of dosenToCheck) {
            const available = await isDosenAvailable(
                dosen.name,
                date,
                time,
                allDosen,
                liburData,
                slotsData,
                null, // No slot to exclude (this is new slot)
                dosen.role === 'Pembimbing' // Ignore global exclude for supervisor
            );

            if (!available) {
                await client.query('ROLLBACK');
                return res.json({
                    success: false,
                    error: `${dosen.role} (${dosen.name}) tidak tersedia pada ${date} ${time}. Dosen mungkin sedang OFF, libur, atau bentrok dengan jadwal lain.`
                });
            }
        }

        // 8. Validate Faculty/Prodi Rules (same as scheduling engine)
        const studentProdi = mahasiswa.prodi?.toLowerCase().trim();

        for (const dosenName of [penguji1, penguji2]) {
            const dosenData = allDosen.find(d => compareNames(d.nama, dosenName));

            if (!dosenData) {
                await client.query('ROLLBACK');
                return res.json({
                    success: false,
                    error: `Data dosen ${dosenName} tidak ditemukan di sistem`
                });
            }

            const dosenProdi = dosenData.prodi?.toLowerCase().trim();

            // STRICT RULE: Examiner must be from the EXACT SAME PRODI as the student
            if (dosenProdi !== studentProdi) {
                await client.query('ROLLBACK');
                return res.json({
                    success: false,
                    error: `${dosenName} (${dosenData.prodi}) tidak dapat menguji mahasiswa dari prodi ${mahasiswa.prodi}. Penguji harus dari prodi yang sama.`
                });
            }
        }

        // 9. All validations passed, create the slot
        const { rows: insertedSlot } = await client.query(
            'INSERT INTO slots (date, time, room, student, mahasiswa_nim) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [date, time, room, mahasiswa.nama, mahasiswaNim]
        );

        const slotId = insertedSlot[0].id;

        // 10. Insert examiners in order: Penguji1, Penguji2, Pembimbing
        const finalExaminers = [penguji1, penguji2, pembimbing];
        for (let i = 0; i < finalExaminers.length; i++) {
            await client.query(
                'INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order) VALUES ($1, $2, $3)',
                [slotId, finalExaminers[i], i]
            );
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Berhasil menjadwalkan ${mahasiswa.nama} pada ${date} ${time} di ruang ${room}`,
            slot: {
                id: slotId,
                date,
                time,
                room,
                student: mahasiswa.nama,
                examiners: finalExaminers
            }
        });

        await createLog('CREATE MANUAL', 'Jadwal', `Manual schedule: ${mahasiswa.nama} di ${date} ${time} (${room})`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create Slot Manual Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}

// Update Examiners in Existing Slot
export async function updateSlotExaminers(req, res) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { slotId, penguji1, penguji2 } = req.body;

        if (!slotId || !penguji1 || !penguji2) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, error: 'Data tidak lengkap.' });
        }

        // 1. Get Slot Data
        const { rows: slotRows } = await client.query('SELECT * FROM slots WHERE id = $1', [slotId]);
        if (slotRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Slot tidak ditemukan' });
        }
        const slot = slotRows[0];

        // 2. Get Mahasiswa Data
        const { rows: mahasiswaRows } = await client.query(
            'SELECT * FROM mahasiswa WHERE nim = $1',
            [slot.mahasiswa_nim]
        );
        if (mahasiswaRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, error: 'Data mahasiswa invalid' });
        }
        const mahasiswa = mahasiswaRows[0];
        const pembimbing = mahasiswa.pembimbing;

        // 3. Validate Unique Examiners
        const examiners = [penguji1, penguji2, pembimbing];
        const uniqueExaminers = new Set(examiners.map(e => normalizeName(e)));
        if (uniqueExaminers.size !== 3) {
            await client.query('ROLLBACK');
            return res.json({ success: false, error: 'Penguji 1, Penguji 2, dan Pembimbing harus berbeda' });
        }

        // 4. Get Data for Availability Validation
        const allDosen = await getAllDosen();
        const { rows: liburData } = await client.query('SELECT * FROM libur');
        const { rows: currentSlots } = await client.query('SELECT * FROM slots');
        const { rows: examinerRows } = await client.query('SELECT slot_id, examiner_name FROM slot_examiners ORDER BY slot_id, examiner_order');

        const slotExaminersMap = {};
        examinerRows.forEach(row => {
            if (!slotExaminersMap[row.slot_id]) slotExaminersMap[row.slot_id] = [];
            slotExaminersMap[row.slot_id].push(row.examiner_name);
        });

        const slotsData = currentSlots.map(s => ({
            ...s,
            examiners: slotExaminersMap[s.id] || []
        }));

        // 5. Check Availability (Only for NEW examiners)
        // We only check Penguji 1 and Penguji 2 because Pembimbing usually stays same or is checked elsewhere.
        // Also simpler to check everyone passed in request
        const dosenToCheck = [
            { name: penguji1, role: 'Penguji 1' },
            { name: penguji2, role: 'Penguji 2' }
        ];

        for (const dosen of dosenToCheck) {
            const available = await isDosenAvailable(
                dosen.name,
                slot.date,
                slot.time,
                allDosen,
                liburData,
                slotsData,
                slot.student, // Exclude CURRENT slot from busy check
                false
            );

            if (!available) {
                await client.query('ROLLBACK');
                return res.json({
                    success: false,
                    error: `${dosen.role} (${dosen.name}) tidak tersedia pada ${slot.date} ${slot.time}.`
                });
            }
        }

        // 6. Validate Faculty/Prodi Rules
        const studentProdi = mahasiswa.prodi?.toLowerCase().trim();
        for (const dosenName of [penguji1, penguji2]) {
            const dosenData = allDosen.find(d => compareNames(d.nama, dosenName));
            if (!dosenData) {
                await client.query('ROLLBACK');
                return res.json({ success: false, error: `Data dosen ${dosenName} tidak ditemukan` });
            }
            const dosenProdi = dosenData.prodi?.toLowerCase().trim();
            if (dosenProdi !== studentProdi) {
                await client.query('ROLLBACK');
                return res.json({
                    success: false,
                    error: `${dosenName} beda prodi dengan mahasiswa.`
                });
            }
        }


        // 7. Update Database
        await client.query('DELETE FROM slot_examiners WHERE slot_id = $1', [slotId]);

        const finalExaminers = [penguji1, penguji2, pembimbing];
        for (let i = 0; i < finalExaminers.length; i++) {
            await client.query(
                'INSERT INTO slot_examiners (slot_id, examiner_name, examiner_order) VALUES ($1, $2, $3)',
                [slotId, finalExaminers[i], i]
            );
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Penguji berhasil diperbarui',
            examiners: finalExaminers
        });

        await createLog('UPDATE EXAMINER', 'Jadwal', `Update penguji ${slot.student}: ${penguji1}, ${penguji2}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update Examiner Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
}
