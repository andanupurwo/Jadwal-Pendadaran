import { appState, APP_DATA, initializeData } from './data/store.js';
import { processMatching } from './logic/matching.js';
import { navigate } from './ui/core/router.js';
import * as modals from './ui/components/Modals.js';
import * as actions from './handlers/actionHandlers.js';
import * as scheduleHandlers from './handlers/scheduleHandlers.js';
import { generateSchedule } from './logic/schedulingEngine.js';
import { getAllDosen } from './utils/helpers.js';
import { healthCheck } from './services/api.js';

import './styles/style.css';
import './styles/modal.css';
import './ui/components/Toast.js';
import { isAuthenticated } from './services/auth.js';
import './services/auth.js'; // Initialize auth handlers

import { generateScheduleWithOptions } from './handlers/scheduleOptionsHandler.js';

// Export to window for HTML access
Object.assign(window, modals, actions, scheduleHandlers, { generateSchedule, navigate, getAllDosen, generateScheduleWithOptions });
// Ensure new modal methods are available globally
window.switchMahasiswaInputMode = modals.switchMahasiswaInputMode;
window.handleMahasiswaCSVUpload = modals.handleMahasiswaCSVUpload;
// SDM
window.triggerImportSDM = modals.triggerImportSDM;
window.handleImportSDM = modals.handleImportSDM;
window.exportSDMData = modals.exportSDMData;
window.toggleAddMasterDosenModal = modals.toggleAddMasterDosenModal;
window.saveNewMasterDosen = modals.saveNewMasterDosen;
window.deleteMasterDosen = modals.deleteMasterDosen;
window.clearAllSchedule = actions.clearAllSchedule;
window.exportScheduleToCSV = actions.exportScheduleToCSV;

async function initializeApp() {
    // Check authentication first
    if (!isAuthenticated()) {
        document.body.style.opacity = '1';
        // Hide sidebar and show login page
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.display = 'none';

        const { LoginView } = await import('./ui/pages/Login.js');
        document.getElementById('main-content').innerHTML = LoginView();
        return;
    }

    console.log('🚀 Initializing App (Database Only Mode)...');
    try {
        // Check API health first
        try {
            const health = await healthCheck();
            console.log('✅ Backend API connected:', health);
        } catch (error) {
            console.error('⚠️ Cannot connect to backend API:', error);
            alert('Tidak dapat terhubung ke server backend. Pastikan backend sudah berjalan di http://localhost:3000');
            document.body.style.opacity = '1';
            return;
        }

        // Load ALL data from Database API
        await initializeData();

        // Perform Matching Logic between Faculty Dosen and Master SDM
        processMatching();

        // Show UI with smooth fade-in
        document.body.style.opacity = '1';
        navigate(appState.currentView || 'home');

    } catch (err) {
        console.error('Init Error:', err);
        alert('Terjadi kesalahan saat inisialisasi aplikasi: ' + err.message);
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
