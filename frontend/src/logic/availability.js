// ===== AVAILABILITY CHECKING LOGIC =====
// Checks if a lecturer is available at a specific date and time

import { APP_DATA, DATES } from '../data/store.js';
import { getAllDosen, compareNames } from '../utils/helpers.js';

/**
 * Check if a lecturer is available at a specific date and time
 * @param {string} namaDosen - Lecturer name
 * @param {string} date - Date in format 'YYYY-MM-DD'
 * @param {string} time - Time in format 'HH:MM'
 * @param {string|null} excludeSlotStudent - Student NIM to exclude from conflict check
 * @param {boolean} ignoreGlobalExclude - If true, ignores the manual 'OFF' toggle (e.g. for Supervisors)
 * @returns {boolean} - True if available, false otherwise
 */
export function isDosenAvailable(namaDosen, date, time, excludeSlotStudent = null, ignoreGlobalExclude = false) {
    const allDosen = getAllDosen();

    // Cari data dosen
    const dosenData = allDosen.find(d => compareNames(d.nama, namaDosen));

    if (!dosenData) {
        console.warn(`[Availability] Data dosen tidak ditemukan untuk nama: ${namaDosen}`);
        // Jika tidak ada data dosen di master, kita anggap tersedia saja daripada error, 
        // tapi tetap cek libur secara manual lewat nama
    }

    // 1. Check manual 'OFF' toggle
    if (!ignoreGlobalExclude && dosenData && dosenData.exclude) return false;

    // 2. Check Libur/Unavailability Rules
    const isLibur = APP_DATA.libur.some(l => {
        // Cek ID (NIK) jika ada data dosen, atau cek nama langsung
        const matchId = (dosenData && l.dosenId && l.dosenId === dosenData.nik);
        const matchNama = compareNames(l.nama || "", namaDosen);

        if (!matchId && !matchNama) return false;
        return l.dates && l.dates.includes(date);
    });

    if (isLibur) return false;

    // 3. Check for busy conflicts (prajadwal di slot lain)
    const busy = APP_DATA.slots.some(slot => {
        if (excludeSlotStudent && slot.student === excludeSlotStudent) return false;
        if (slot.date !== date || slot.time !== time) return false;

        // Cek apakah dia jadi P1, P2, atau Pembimbing di slot tersebut
        return slot.examiners && slot.examiners.some(ex => compareNames(ex, namaDosen));
    });

    return !busy;
}
