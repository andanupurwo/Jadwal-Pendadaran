import { APP_DATA, DATES, TIMES, ROOMS } from '../data/store.js';
import { navigate } from '../ui/core/router.js';
import { scheduleAPI, slotsAPI } from '../services/api.js';
import { showConfirm } from '../ui/components/ConfirmationModal.js';

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
    let isIncremental = incrementalEl ? incrementalEl.checked : false;

    // Override options (from checkbox handler)
    if (options.overrideIncremental !== undefined) {
        isIncremental = options.overrideIncremental;
    }
    // SAFETY CHECK: If triggered from outside Logic page (no checkbox) and data exists AND no override provided
    else if (!incrementalEl && APP_DATA.slots && APP_DATA.slots.length > 0) {
        // ... (keep existing prompt logic as fallback if needed) ...
        const wantIncremental = await showConfirm(
            'Terdapat jadwal yang sudah tersimpan. Apakah Anda ingin melanjutkan penjadwalan hanya untuk mahasiswa yang belum dapat jadwal (Incremental)?\n\nPilih "Batal" jika tidak ingin melakukan perubahan.',
            'Lanjutkan Penjadwalan?',
            { text: 'Ya, Lanjutkan (Aman)', variant: 'primary' }
        );

        if (wantIncremental) {
            isIncremental = true;
        } else {
            return;
        }
    }

    logToLogic("🚀 MEMULAI PROSES PENJADWALAN OTOMATIS...");
    logToLogic(`⚙️ Mode: ${isIncremental ? 'INCREMENTAL' : 'RESET FULL'}`);
    logToLogic(`🎯 Target: ${targetProdi}`);
    logToLogic("📡 Mengirim request ke backend...");

    try {
        // Call backend API to generate schedule
        const response = await scheduleAPI.generate(targetProdi, isIncremental, options.targetStudent);

        if (response.success) {
            // Display logs from backend
            if (response.logs && response.logs.length > 0) {
                response.logs.forEach(log => logToLogic(log));
            }

            logToLogic(`✅ Penjadwalan selesai!`);
            logToLogic(`📊 Berhasil: ${response.scheduled}/${response.total} mahasiswa`);

            // Reload slots from API to update UI
            const slotsResponse = await slotsAPI.getAll();
            if (slotsResponse.success) {
                APP_DATA.slots = slotsResponse.data;
            }

            if (!options.silent) {
                setTimeout(async () => {
                    if (await showConfirm(`Selesai! Terjadwal: ${response.scheduled}/${response.total}\n\nLihat hasil?`, 'Hasil Penjadwalan', { text: 'Lihat Hasil', variant: 'primary' })) {
                        navigate('home');
                    }
                }, 300);
            }
        } else {
            logToLogic(`❌ Error: ${response.error}`);
            showToast('Gagal generate jadwal: ' + response.error, 'error');
        }

    } catch (error) {
        logToLogic(`❌ Error: ${error.message}`);
        console.error('Error generating schedule:', error);
        showToast('Gagal terhubung ke backend: ' + error.message, 'error');
    }
}
