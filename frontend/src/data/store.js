// ===== DATA STORE & STATE MANAGEMENT =====
// Centralized data storage and state management
// Now using API backend instead of LocalStorage

import {
    ROOMS as DEFAULT_ROOMS,
    TIMES as DEFAULT_TIMES,
    DATES as DEFAULT_DATES
} from '../config/constants.js';
import { mahasiswaAPI, dosenAPI, liburAPI, slotsAPI, settingsAPI } from '../services/api.js';

// Export mutable variables for settings
export let ROOMS = DEFAULT_ROOMS;
export let TIMES = DEFAULT_TIMES;
export let DATES = DEFAULT_DATES;

export let APP_DATA = {
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

// ===== API-BASED DATA LOADING =====

export async function loadMahasiswaFromAPI() {
    try {
        const response = await mahasiswaAPI.getAll();
        if (response.success) {
            APP_DATA.mahasiswa = response.data;
            console.log('✅ Loaded mahasiswa from API:', response.data.length);
        }
    } catch (error) {
        console.error('Failed to load mahasiswa from API:', error);
        APP_DATA.mahasiswa = [];
    }
}

export async function saveMahasiswaToAPI() {
    try {
        // This function is now handled by individual API calls
        // No need to bulk save as each operation saves immediately
        console.log('✅ Mahasiswa saved via API');
    } catch (error) {
        console.error('Failed to save mahasiswa:', error);
    }
}

export async function loadDosenFromAPI() {
    try {
        const response = await dosenAPI.getAll();
        if (response.success) {
            APP_DATA.facultyData = response.data;
            console.log('✅ Loaded dosen from API');
        }
    } catch (error) {
        console.error('Failed to load dosen from API:', error);
        APP_DATA.facultyData = { FIK: [], FES: [], FST: [] };
    }
}

export async function loadMasterDosenFromAPI() {
    try {
        const response = await dosenAPI.getMaster();
        if (response.success) {
            APP_DATA.masterDosen = response.data;
            console.log('✅ Loaded master dosen from API:', response.data.length);
        }
    } catch (error) {
        console.error('Failed to load master dosen from API:', error);
        APP_DATA.masterDosen = [];
    }
}

export async function loadLiburFromAPI() {
    try {
        const response = await liburAPI.getAll();
        if (response.success) {
            // Group libur entries by NIK
            const grouped = {};
            response.data.forEach(entry => {
                const nik = entry.nik;
                if (!nik) return; // Skip entries without NIK

                if (!grouped[nik]) {
                    grouped[nik] = {
                        dosenId: nik,
                        dates: [],
                        times: [],
                        reason: entry.reason || ''
                    };
                }

                if (entry.date && !grouped[nik].dates.includes(entry.date)) {
                    grouped[nik].dates.push(entry.date);
                }

                if (entry.time && !grouped[nik].times.includes(entry.time)) {
                    grouped[nik].times.push(entry.time);
                }
            });

            // Convert to array
            APP_DATA.libur = Object.values(grouped);
            console.log('✅ Loaded libur from API:', APP_DATA.libur.length, 'grouped entries');
        }
    } catch (error) {
        console.error('Failed to load libur from API:', error);
        APP_DATA.libur = [];
    }
}

export async function loadSlotsFromAPI() {
    try {
        const response = await slotsAPI.getAll();
        if (response.success) {
            APP_DATA.slots = response.data;
            console.log('✅ Loaded slots from API:', response.data.length);
        }
    } catch (error) {
        console.error('Failed to load slots from API:', error);
        APP_DATA.slots = [];
    }
}

export async function loadSettingsFromAPI() {
    try {
        const response = await settingsAPI.get();
        if (response.success) {
            const settings = response.data;

            if (settings.schedule_rooms && Array.isArray(settings.schedule_rooms)) {
                ROOMS = settings.schedule_rooms;
            }

            if (settings.schedule_times && Array.isArray(settings.schedule_times)) {
                TIMES = settings.schedule_times;
            }

            if (settings.schedule_dates && Array.isArray(settings.schedule_dates) && settings.schedule_dates.length > 0) {
                DATES = settings.schedule_dates;

                // Validate appState.selectedDate against new DATES
                const dateExists = DATES.find(d => d.value === appState.selectedDate);
                if (!dateExists) {
                    console.log(`⚠️ Selected date ${appState.selectedDate} invalid for new settings. Resetting to ${DATES[0].value}`);
                    appState.selectedDate = DATES[0].value;
                }
            }

            console.log('✅ Loaded settings from API');
        }
    } catch (error) {
        console.error('Failed to load settings from API:', error);
    }
}

// ===== BACKWARD COMPATIBILITY FUNCTIONS =====
// These are kept for compatibility with existing code

export function saveExcludedDosenToStorage() {
    // Now handled automatically by API when toggling exclude
    console.log('Excluded dosen saved via API');
}

export function loadExcludedDosenFromStorage() {
    // Already loaded when loading dosen from API
    console.log('Excluded dosen already loaded from API');
}

export function saveLiburToStorage() {
    // Now handled by API
    console.log('Libur saved via API');
}

export function loadLiburFromStorage() {
    // Use loadLiburFromAPI instead
    loadLiburFromAPI();
}

export function saveMahasiswaToStorage() {
    // Use API calls instead
    saveMahasiswaToAPI();
}

export function loadMahasiswaFromStorage() {
    // Use loadMahasiswaFromAPI instead
    loadMahasiswaFromAPI();
}

export function saveFacultyDataToStorage() {
    // Now handled by API
    console.log('Faculty data saved via API');
}

export function loadFacultyDataFromStorage() {
    // Use loadDosenFromAPI instead
    loadDosenFromAPI();
}

// ===== INITIALIZATION FUNCTION =====

export async function initializeData() {
    console.log('🔄 Initializing data from API...');

    await Promise.all([
        loadMahasiswaFromAPI(),
        loadDosenFromAPI(),
        loadMasterDosenFromAPI(),
        loadLiburFromAPI(),
        loadSlotsFromAPI(),
        loadSettingsFromAPI()
    ]);

    console.log('✅ All data loaded from API');
}
