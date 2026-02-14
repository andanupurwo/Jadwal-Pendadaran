import { APP_DATA } from '../data/store.js';
import { generateSchedule } from '../logic/schedulingEngine.js';
import { showConfirm } from '../ui/components/ConfirmationModal.js';
import { scheduleAPI, slotsAPI } from '../services/api.js';

/**
 * Schedule individual student by NIM
 * This will trigger the scheduling engine to schedule only this specific student
 */
export async function scheduleIndividualStudent(nim) {
    const student = APP_DATA.mahasiswa.find(m => m.nim === nim);

    if (!student) {
        showToast('Mahasiswa tidak ditemukan!', 'error');
        return;
    }

    if (!(await showConfirm(`Jadwalkan pendadaran untuk ${student.nama}?`, 'Konfirmasi Penjadwalan', { text: 'Ya, Jadwalkan', variant: 'primary' }))) {
        return;
    }

    try {
        // Call scheduling engine with specific student
        await generateSchedule({
            silent: true,  // Suppress success modal, because we handle navigation manually here
            targetStudent: nim
        });

        showToast(`Berhasil menjadwalkan ${student.nama}`, 'success');

        // Refresh view to show updated status (stay on mahasiswa page)
        setTimeout(() => {
            window.navigate('mahasiswa');
        }, 500);

    } catch (error) {
        console.error('Error scheduling student:', error);
        showToast('Gagal menjadwalkan mahasiswa: ' + error.message, 'error');
    }
}
