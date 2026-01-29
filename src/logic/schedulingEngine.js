import { MOCK_DATA, DATES, TIMES, ROOMS, saveMahasiswaToStorage } from '../data/store.js';
import { getAllDosen } from '../utils/helpers.js';
import { isDosenAvailable } from './availability.js';
import { navigate } from '../ui/router.js';

export function logToLogic(message) {
    const logEl = document.getElementById('logicLog');
    if (logEl) {
        const time = new Date().toLocaleTimeString();
        logEl.innerHTML += `[${time}] ${message}\n`;
        logEl.scrollTop = logEl.scrollHeight;
    }
    console.log(message);
}

export async function generateSchedule(options = { silent: false }) {
    const logEl = document.getElementById('logicLog');
    if (logEl) logEl.innerHTML = '';

    const scopeEl = document.getElementById('scheduleScope');
    const incrementalEl = document.getElementById('incrementalMode');
    const targetProdi = scopeEl ? scopeEl.value : 'all';
    const isIncremental = incrementalEl ? incrementalEl.checked : false;

    logToLogic("🚀 MEMULAI PROSES PENJADWALAN OTOMATIS...");
    logToLogic(`⚙️ Mode: ${isIncremental ? 'INCREMENTAL' : 'RESET FULL'}`);
    logToLogic(`🎯 Target: ${targetProdi}`);

    let mahasiswaList = [...MOCK_DATA.mahasiswa];
    if (targetProdi !== 'all') {
        mahasiswaList = mahasiswaList.filter(m => m.prodi === targetProdi);
    }
    mahasiswaList.sort((a, b) => a.nim.localeCompare(b.nim));

    if (mahasiswaList.length === 0) {
        logToLogic("⚠️ Tidak ada mahasiswa yang sesuai filter.");
        return;
    }

    const scheduledMahasiswaIds = new Set();
    if (isIncremental) {
        MOCK_DATA.slots.forEach(s => {
            const m = MOCK_DATA.mahasiswa.find(x => x.nama === s.student);
            if (m) scheduledMahasiswaIds.add(m.nim);
        });
    } else {
        MOCK_DATA.slots = [];
    }

    const allDosen = getAllDosen();
    const examinerCounts = {};
    if (isIncremental) {
        MOCK_DATA.slots.forEach(slot => {
            slot.examiners.forEach(ex => { examinerCounts[ex] = (examinerCounts[ex] || 0) + 1; });
        });
    }

    const findExaminers = (pembimbing, date, time, studentProdi) => {
        let candidates = [];
        const STRICT_FIK_GROUP = ['teknologi informasi', 's1 teknik komputer', 's2 informatika', 's2 pjj informatika', 's3 informatika', 'd3 teknik informatika', 'd3 manajemen informatika'];
        const sProdiNorm = studentProdi?.toLowerCase().trim();
        const pembimbingNorm = pembimbing?.toLowerCase().trim();

        const candidatePool = [...allDosen].sort((a, b) => (examinerCounts[a.nama] || 0) - (examinerCounts[b.nama] || 0));

        for (const d of candidatePool) {
            if (candidates.length >= 2) break;

            const candidateNameNorm = d.nama.toLowerCase().trim();

            // 1. Bukan pembimbing mahasiswa tersebut
            if (candidateNameNorm === pembimbingNorm) continue;

            // 2. Belum terpilih sebagai kandidat pertama (P1)
            if (candidates.some(c => c.toLowerCase().trim() === candidateNameNorm)) continue;

            const dProdiNorm = d.prodi?.toLowerCase().trim();
            const FIK_PRODIS = ['informatika', 'sistem informasi', 'teknologi informasi', 's2 informatika', 's3 informatika'];
            const isStudentFIK = FIK_PRODIS.includes(sProdiNorm);

            if (isStudentFIK) {
                // Aturan FIK: Dosen harus dari FIK
                if (d.fakultas !== 'FIK') continue;

                if (STRICT_FIK_GROUP.includes(sProdiNorm)) {
                    // TI, S2, S3 harus sesama prodi-nya
                    if (dProdiNorm !== sProdiNorm) continue;
                } else {
                    // Informatika & SI bisa saling silang, tapi tidak boleh ambil dosen TI/S2/S3
                    if (STRICT_FIK_GROUP.includes(dProdiNorm)) continue;
                }
            } else {
                // FES & FST: WAJIB prodi yang sama persis
                if (dProdiNorm !== sProdiNorm) continue;
            }

            // 3. Cek Ketersediaan (Libur & Jadwal Lain)
            if (!isDosenAvailable(d.nama, date, time)) continue;

            candidates.push(d.nama);
        }
        return candidates.length < 2 ? null : candidates;
    };

    let successCount = 0;
    for (const dateObj of DATES) {
        for (const time of TIMES) {
            if (dateObj.label === 'Jumat' && time === '11:30') continue;
            for (const room of ROOMS) {
                if (MOCK_DATA.slots.some(s => s.date === dateObj.value && s.time === time && s.room === room)) continue;

                for (const mhs of mahasiswaList) {
                    if (scheduledMahasiswaIds.has(mhs.nim)) continue;
                    if (!mhs.pembimbing || !isDosenAvailable(mhs.pembimbing, dateObj.value, time, null, true)) continue;

                    const examiners = findExaminers(mhs.pembimbing, dateObj.value, time, mhs.prodi);
                    if (!examiners) continue;

                    const final = [...examiners, mhs.pembimbing];
                    MOCK_DATA.slots.push({ date: dateObj.value, time, room, student: mhs.nama, examiners: final });
                    scheduledMahasiswaIds.add(mhs.nim);
                    successCount++;
                    final.forEach(ex => { examinerCounts[ex] = (examinerCounts[ex] || 0) + 1; });
                    logToLogic(`✅ [${dateObj.value} ${time}] ${mhs.nama}`);
                    await new Promise(r => setTimeout(r, 5));
                    break;
                }
            }
        }
    }

    logToLogic(`🏁 Selesai. Terjadwal: ${successCount}/${mahasiswaList.length}`);
    saveMahasiswaToStorage();
    if (!options.silent) {
        setTimeout(() => { if (confirm("Selesai! Lihat hasil?")) navigate('home'); }, 300);
    }
}
