// ===== UTILITY HELPERS =====
// Common utility functions used across the application

import { appState, APP_DATA } from '../data/store.js';

// Get all unique dosen from all faculties
// Get all unique dosen from all faculties, optionally filter active only
export function getAllDosen(onlyActive = false) {
    const combined = [
        ...(APP_DATA.facultyData.FIK || []),
        ...(APP_DATA.facultyData.FES || []),
        ...(APP_DATA.facultyData.FST || [])
    ];

    // Deduplicate by NIK (preferred) or Nama
    const unique = [];
    const seen = new Set();

    for (const d of combined) {
        const key = d.nik || d.nama;
        if (!seen.has(key)) {
            // Filter if onlyActive is requested
            if (onlyActive && d.exclude) {
                continue;
            }

            seen.add(key);
            unique.push(d);
        }
    }

    return unique.sort((a, b) => {
        const nameA = a.nama || "";
        const nameB = b.nama || "";
        return nameA.localeCompare(nameB);
    });
}

// Sorting function with support for different data types
export function sortData(data, column, direction = null) {
    const dir = direction || appState.sortDirection || 'asc';

    const sorted = [...data].sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Handle nulls/undefined always last (or first)
        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === '') return 1; // Empty values at bottom
        if (valB === null || valB === undefined || valB === '') return -1;

        // Handle boolean sorting for exclude (OFF/ON)
        if (column === 'exclude') {
            valA = valA ? 1 : 0;
            valB = valB ? 1 : 0;
            // If direction is asc: 0 (ON) comes first, 1 (OFF) comes later
            // If direction is desc: 1 (OFF) comes first, 0 (ON) comes later
        } else {
            // Convert to string for comparison if needed
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            // Handle numbers
            if (valA !== null && valB !== null && !isNaN(valA) && !isNaN(valB) && typeof valA !== 'boolean') {
                valA = Number(valA);
                valB = Number(valB);
            }
        }

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
}

// Filter/search function
export function filterData(data, term) {
    if (!term || term.trim() === '') {
        return data;
    }

    const lowerTerm = term.toLowerCase().trim();

    return data.filter(item => {
        return (
            (item.no && item.no.toString().toLowerCase().includes(lowerTerm)) ||
            (item.nomor && item.nomor.toString().toLowerCase().includes(lowerTerm)) ||
            (item.nama && item.nama.toLowerCase().includes(lowerTerm)) ||
            (item.nik && item.nik.toLowerCase().includes(lowerTerm)) ||
            (item.nidn && item.nidn.toLowerCase().includes(lowerTerm)) ||
            (item.status && item.status.toLowerCase().includes(lowerTerm)) ||
            (item.kategori && item.kategori.toLowerCase().includes(lowerTerm)) ||
            (item.prodi && item.prodi.toLowerCase().includes(lowerTerm)) ||
            (item.nim && item.nim.toLowerCase().includes(lowerTerm)) ||
            (item.pembimbing && item.pembimbing.toLowerCase().includes(lowerTerm))
        );
    });
}

// Normalize name for matching (remove titles, extra spaces)
export function normalizeName(name) {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,]/g, '')
        .replace(/\b(dr|drs|prof|s\.?si|s\.?kom|s\.?t|s\.?e|s\.?ip|s\.?sos|m\.?kom|m\.?t|m\.?eng|m\.?si|m\.?ak|m\.?ba|m\.?m|m\.?a|m\.?i\.kom|ph\.?d|ak|ca|ll\.?m)\b/gi, '')
        .trim();
}

// Calculate string similarity (Levenshtein distance-based)
export function getSimilarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;

    if (!s1 || !s2) return 0;

    const costs = [];
    for (let i = 0; i <= longer.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= shorter.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[shorter.length] = lastValue;
    }

    return (longer.length - costs[shorter.length]) / longer.length;
}

// Simple CSV parser with quote support
export function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else if (char !== '\r') {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}
