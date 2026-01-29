// ===== DATA STORE & STATE MANAGEMENT =====
// Centralized data storage and state management

// Import constants from config
import { ROOMS, TIMES, DATES } from '../config/constants.js';

// Re-export constants for backward compatibility
export { ROOMS, TIMES, DATES };

export let MOCK_DATA = {
    masterDosen: [],
    facultyData: {
        FIK: [],
        FES: [],
        FST: []
    },
    mahasiswa: [],
    libur: [],
    slots: [],
    clipboard: null
};

// Application State
export let appState = {
    currentView: 'home',
    selectedDate: '2026-02-16',
    currentDosenTab: 'fik',
    sortColumn: null,
    sortDirection: 'asc',
    searchTerm: '',
    selectedProdiFilter: ''
};

// ===== PERSISTENCE HELPERS =====


export function saveExcludedDosenToStorage() {
    const excludedList = [];
    ['FIK', 'FES', 'FST'].forEach(fak => {
        const data = MOCK_DATA.facultyData[fak] || [];
        data.forEach(d => {
            if (d.exclude) {
                excludedList.push({ nik: d.nik, fak: fak });
            }
        });
    });
    localStorage.setItem('excluded_dosen_v1', JSON.stringify(excludedList));
    console.log('Saved excluded dosen settings to LocalStorage.');
}

export function loadExcludedDosenFromStorage() {
    const raw = localStorage.getItem('excluded_dosen_v1');
    if (!raw) return;
    try {
        const excludedList = JSON.parse(raw);
        excludedList.forEach(item => {
            const arr = MOCK_DATA.facultyData[item.fak];
            if (arr) {
                const d = arr.find(x => x.nik === item.nik);
                if (d) d.exclude = true;
            }
        });
        console.log('Loaded excluded dosen settings.');
    } catch (e) {
        console.error('Failed to load excluded dosen settings', e);
    }
}

export function saveLiburToStorage() {
    localStorage.setItem('libur_data_v1', JSON.stringify(MOCK_DATA.libur));
    console.log('Saved libur data to LocalStorage.');
}

export function loadLiburFromStorage() {
    const raw = localStorage.getItem('libur_data_v1');
    if (!raw) return;
    try {
        MOCK_DATA.libur = JSON.parse(raw);
        console.log('Loaded libur data from LocalStorage.');
    } catch (e) {
        console.error('Failed to load libur data', e);
    }
}

export function saveMahasiswaToStorage() {
    localStorage.setItem('mahasiswa_data_v1', JSON.stringify(MOCK_DATA.mahasiswa));
    localStorage.setItem('slots_data_v1', JSON.stringify(MOCK_DATA.slots));
}

export function loadMahasiswaFromStorage() {
    const rawM = localStorage.getItem('mahasiswa_data_v1');
    const rawS = localStorage.getItem('slots_data_v1');

    if (rawM) {
        try {
            const data = JSON.parse(rawM);
            if (Array.isArray(data)) MOCK_DATA.mahasiswa = data;
        } catch (e) { console.error(e); }
    }

    if (rawS) {
        try {
            const data = JSON.parse(rawS);
            if (Array.isArray(data)) MOCK_DATA.slots = data;
        } catch (e) { console.error(e); }
    }
}

export function saveFacultyDataToStorage() {
    localStorage.setItem('faculty_data_v1', JSON.stringify(MOCK_DATA.facultyData));
}

export function loadFacultyDataFromStorage() {
    const raw = localStorage.getItem('faculty_data_v1');
    if (!raw) return;
    try {
        const loadedData = JSON.parse(raw);
        if (loadedData && (loadedData.FIK || loadedData.FES || loadedData.FST)) {
            MOCK_DATA.facultyData = loadedData;
            console.log('Loaded faculty data from LocalStorage.');
        }
    } catch (e) {
        console.error('Failed to load faculty data', e);
    }
}
