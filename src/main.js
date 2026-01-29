import { appState, MOCK_DATA, loadMahasiswaFromStorage, loadExcludedDosenFromStorage, loadLiburFromStorage, saveMahasiswaToStorage, saveLiburToStorage } from './data/store.js';
import { loadDosenData } from './services/loadDosenData.js';
import { loadFacultyData } from './services/loadFacultyData.js';
import { processMatching } from './logic/matching.js';
import { INITIAL_MAHASISWA } from './data/initialMahasiswa.js';
import { INITIAL_LIBUR } from './data/initialLibur.js';
import { navigate } from './ui/router.js';
import * as modals from './ui/modals.js';
import * as actions from './handlers/actionHandlers.js';
import { generateSchedule } from './logic/schedulingEngine.js';
import { getAllDosen } from './utils/helpers.js';

import './styles/style.css';
import './styles/modal.css';

// Export to window for HTML access
Object.assign(window, modals, actions, { generateSchedule, navigate, getAllDosen });

async function initializeApp() {
    console.log('🚀 Initializing App...');
    try {
        // Load persistences
        loadMahasiswaFromStorage();
        loadExcludedDosenFromStorage();
        loadLiburFromStorage();

        // Load CSV Data
        MOCK_DATA.masterDosen = await loadDosenData();
        MOCK_DATA.facultyData = await loadFacultyData();
        processMatching();

        // Seed only if no data exists in LocalStorage at all (First time run)
        if (localStorage.getItem('mahasiswa_data_v1') === null) {
            MOCK_DATA.mahasiswa = [...INITIAL_MAHASISWA];
            saveMahasiswaToStorage();
        }
        if (localStorage.getItem('slots_data_v1') === null) {
            MOCK_DATA.slots = [];
        }
        if (localStorage.getItem('libur_data_v1') === null) { // Matching the key in store.js
            MOCK_DATA.libur = [...INITIAL_LIBUR];
            saveLiburToStorage();
        }

        // Show UI
        document.body.style.opacity = '1';
        navigate(appState.currentView || 'home');

    } catch (err) {
        console.error('Init Error:', err);
        document.body.style.opacity = '1';
    }
}

// Navigation event listeners
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.getAttribute('data-page'));
    });
});

initializeApp();
