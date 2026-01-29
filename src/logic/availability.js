// ===== AVAILABILITY CHECKING LOGIC =====
// Checks if a lecturer is available at a specific date and time

import { MOCK_DATA, DATES } from '../data/store.js';
import { getAllDosen } from '../utils/helpers.js';

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
    const dosenData = allDosen.find(d => d.nama === namaDosen);

    // 1. Check if lecturer is toggled OFF (Unless forced)
    if (!ignoreGlobalExclude && dosenData && dosenData.exclude) return false;

    // 2. Check availability rules (Advanced Constraints)
    let dayName = '';
    const dateRef = DATES.find(d => d.value === date);
    if (dateRef) dayName = dateRef.label;

    const isLibur = MOCK_DATA.libur.some(l => {
        if (l.dosenId !== dosenData?.nik) return false;

        // Type 1: Specific Date (Legacy default)
        if (!l.type || l.type === 'date') {
            return l.date === date;
        }

        // Type 2: Date Range
        if (l.type === 'range') {
            return date >= l.start && date <= l.end;
        }

        // Type 3: Recurring Days / Times
        if (l.type === 'recurring') {
            if (l.days && l.days.includes(dayName)) {
                // If no specific times, entire day is blocked
                if (!l.times || l.times.length === 0) return true;

                // If specific times, check if this time is blocked
                if (l.times.includes(time)) return true;
            }
        }

        return false;
    });

    if (isLibur) return false;

    // 3. Check for scheduling conflicts
    const bentrok = MOCK_DATA.slots.some(slot => {
        if (excludeSlotStudent && slot.student === excludeSlotStudent) return false;
        return slot.date === date && slot.time === time && slot.examiners.includes(namaDosen);
    });

    return !bentrok;
}
