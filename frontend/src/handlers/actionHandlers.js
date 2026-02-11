import { APP_DATA, appState, saveMahasiswaToStorage, saveLiburToStorage, saveExcludedDosenToStorage, loadLiburFromAPI } from '../data/store.js';

// ...

// Fetch fresh data from server and use store logic for grouping
await loadLiburFromAPI();
import { INITIAL_LIBUR } from '../data/initialLibur.js';
import * as views from '../ui/pages/index.js';
import { navigate } from '../ui/core/router.js';
import { getAllDosen } from '../utils/helpers.js';
import { showConfirm } from '../ui/components/ConfirmationModal.js';

const getContainer = () => document.getElementById('main-content');
const refreshView = (viewName) => {
    if (appState.currentView === viewName) {
        // Simpan posisi cursor dan elemen yang sedang fokus
        const activeId = document.activeElement ? document.activeElement.id : null;
        const selectionStart = document.activeElement ? document.activeElement.selectionStart : null;

        getContainer().innerHTML = views[viewName]();

        // Kembalikan fokus jika sebelumnya sedang mengetik di input
        if (activeId) {
            const el = document.getElementById(activeId);
            if (el) {
                el.focus();
                if (selectionStart !== null && (el.type === 'text' || el.type === 'search')) {
                    el.setSelectionRange(selectionStart, selectionStart);
                }
            }
        }
    }
};

export async function deleteMahasiswa(nim) {
    if (!(await showConfirm('Hapus mahasiswa ini?'))) return;
    try {
        const { mahasiswaAPI } = await import('../services/api.js');
        const response = await mahasiswaAPI.delete(nim);
        if (response.success) {
            APP_DATA.mahasiswa = APP_DATA.mahasiswa.filter(m => m.nim !== nim);
            refreshView('mahasiswa');
        }
    } catch (error) {
        showToast('Gagal menghapus mahasiswa: ' + error.message, 'error');
    }
}

export async function deleteSlot(id) {
    if (await showConfirm('Hapus jadwal ini?')) {
        try {
            const { slotsAPI } = await import('../services/api.js');
            const response = await slotsAPI.delete(id);
            if (response.success) {
                APP_DATA.slots = APP_DATA.slots.filter(s => s.id !== id);
                refreshView('home');
            }
        } catch (error) {
            showToast('Gagal menghapus jadwal: ' + error.message, 'error');
        }
    }
}

export async function clearAllSchedule() {
    if (await showConfirm('Yakin ingin MENGHAPUS SEMUA jadwal ujian? Data jadwal akan hilang permanen.', 'Konfirmasi Hapus Semua')) {
        try {
            const { slotsAPI } = await import('../services/api.js');
            const response = await slotsAPI.deleteAll();
            if (response.success) {
                APP_DATA.slots = [];
                refreshView('home');
                showToast('Semua jadwal berhasil dihapus.', 'success');
            }
        } catch (error) {
            showToast('Gagal membersihkan jadwal: ' + error.message, 'error');
        }
    }
}

export function switchDosenTab(tabId) {
    appState.currentDosenTab = tabId;
    refreshView('dosen');
}

export function sortTable(column) {
    if (appState.sortColumn === column) {
        appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        appState.sortColumn = column;
        appState.sortDirection = 'asc';
    }
    refreshView(appState.currentView);
}

export function handleSearchInput(e) {
    appState.searchTerm = e.target.value;
    refreshView(appState.currentView);
}

export function handleProdiFilterChange(e) {
    appState.selectedProdiFilter = e.target.value;
    refreshView(appState.currentView);
}

export function handleStatusFilterChange(e) {
    appState.selectedStatusFilter = e.target.value;
    refreshView(appState.currentView);
}

export async function toggleDosenScheduling(faculty, nik) {
    const d = APP_DATA.facultyData[faculty]?.find(x => x.nik === nik);
    if (d) {
        try {
            const { dosenAPI } = await import('../services/api.js');
            const newStatus = !d.exclude;
            const response = await dosenAPI.toggleExclude(nik, newStatus);
            if (response.success) {
                d.exclude = newStatus;
                refreshView('dosen');
            }
        } catch (error) {
            showToast('Gagal mengubah status dosen: ' + error.message, 'error');
        }
    }
}

export async function wipeLiburData() {
    if (await showConfirm('Hapus SEMUA aturan ketersediaan dosen dari DATABASE?', 'Konfirmasi Bahaya!')) {
        try {
            const { liburAPI } = await import('../services/api.js');

            const response = await liburAPI.deleteAll();

            if (response.success) {
                APP_DATA.libur = [];
                refreshView('libur');
                showToast('Semua data libur telah dihapus.', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Gagal menghapus data libur: ' + error.message, 'error');
        }
    }
}


export async function resetLiburData() {
    if (await showConfirm('Reset data libur ke Default?')) {
        APP_DATA.libur = [...INITIAL_LIBUR];
        saveLiburToStorage();
        refreshView('libur');
    }
}

export async function deleteLiburGroup(idsString) {
    if (!idsString) return;
    if (!(await showConfirm('Hapus aturan ini?'))) return;

    try {
        const { liburAPI } = await import('../services/api.js');
        const ids = idsString.split(',').filter(id => id);

        // Delete each ID individually
        const deletePromises = ids.map(id => liburAPI.delete(id));
        await Promise.all(deletePromises);

        // Fetch fresh data from server and use store logic for grouping
        await loadLiburFromAPI();

        refreshView('libur');
        showToast('Aturan berhasil dihapus', 'success');

    } catch (error) {
        showToast('Gagal menghapus data libur: ' + error.message, 'error');
    }
}

export async function wipeMahasiswaData() {
    if (await showConfirm('Hapus SEMUA data mahasiswa dan jadwal dari DATABASE?', 'Konfirmasi Bahaya!')) {
        try {
            const { mahasiswaAPI } = await import('../services/api.js');

            // Use the atomic delete all endpoint
            const response = await mahasiswaAPI.deleteAll();

            if (response.success) {
                APP_DATA.mahasiswa = [];
                APP_DATA.slots = [];
                refreshView('mahasiswa');
                showToast('Semua data mahasiswa dan jadwal telah dihapus.', 'success');
            }
        } catch (error) {
            showToast('Gagal menghapus data: ' + error.message, 'error');
        }
    }
}

export function selectScheduleDate(val) {
    appState.selectedDate = val;
    refreshView('home');
}
export function moveSlotToClipboard(name) {
    if (!name) APP_DATA.clipboard = null;
    else {
        const s = APP_DATA.slots.find(x => x.student === name);
        if (s) { APP_DATA.clipboard = { ...s }; APP_DATA.slots = APP_DATA.slots.filter(x => x.student !== name); }
    }
    refreshView('home');
}
export async function pasteSlotFromClipboard(date, time, room) {
    if (APP_DATA.clipboard) {
        try {
            const { scheduleAPI, slotsAPI } = await import('../services/api.js');
            const movingSlot = APP_DATA.clipboard;

            const loadingToast = showToast('Memindahkan jadwal...', 'info', 20000);

            const response = await scheduleAPI.moveSlot(movingSlot.id, date, time, room);

            const toastEl = document.querySelector('.toast-info');
            if (toastEl) toastEl.remove();

            if (response.success) {
                showToast('Jadwal berhasil dipindahkan ✅', 'success');
                // Refresh data
                const freshSlots = await slotsAPI.getAll();
                APP_DATA.slots = freshSlots.data;
                APP_DATA.clipboard = null; // Clear clipboard on success
            } else {
                showToast('Gagal: ' + response.error, 'error');
                // Do NOT clear clipboard so user can try another slot
            }
        } catch (error) {
            console.error('Paste error:', error);
            showToast('Terjadi kesalahan saat menempel jadwal: ' + error.message, 'error');
        }
        refreshView('home');
    }
}

export function viewAndHighlightSchedule(studentName) {
    const slot = APP_DATA.slots.find(s => s.student === studentName);
    if (!slot) return;

    // 1. Set tanggal yang sesuai
    appState.selectedDate = slot.date;

    // 2. Navigasi ke Dashboard
    navigate('home');

    // 3. Cari elemen dan beri animasi (gunakan timeout agar render selesai dulu)
    setTimeout(() => {
        const slotsElements = document.querySelectorAll('.room-slot');
        slotsElements.forEach(el => {
            const nameEl = el.querySelector('div[style*="font-weight: 700"]');
            if (nameEl && nameEl.textContent.trim() === studentName) {
                el.classList.add('slot-highlight');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Hapus class setelah animasi selesai agar bisa diulang
                setTimeout(() => el.classList.remove('slot-highlight'), 3000);
            }
        });
    }, 300);
}


export async function exportScheduleToCSV() {
    if (!APP_DATA.slots || APP_DATA.slots.length === 0) {
        showToast('Belum ada jadwal untuk di-export.', 'warning');
        return;
    }

    try {
        // Dynamically import xlsx library
        const XLSX = await import('xlsx');

        // 1. Prepare data in array format
        const data = [
            // Header row
            ['No', 'NIM', 'Mahasiswa', 'Tanggal', 'Jam', 'Ruangan', 'Penguji 1', 'Penguji 2', 'Pembimbing']
        ];

        // 2. Add data rows
        APP_DATA.slots.forEach((slot, index) => {
            const p1 = slot.examiners && slot.examiners[0] ? slot.examiners[0] : '-';
            const p2 = slot.examiners && slot.examiners[1] ? slot.examiners[1] : '-';
            const p3 = slot.examiners && slot.examiners[2] ? slot.examiners[2] : '-';

            // Find mahasiswa data to get NIM
            const mahasiswa = APP_DATA.mahasiswa.find(m => m.nama === slot.student);
            const nim = mahasiswa ? mahasiswa.nim : '-';

            data.push([
                index + 1,
                nim,
                slot.student,
                slot.date,
                slot.time,
                slot.room,
                p1,
                p2,
                p3
            ]);
        });

        // 3. Create worksheet from data
        const ws = XLSX.utils.aoa_to_sheet(data);

        // 4. Set column widths for better readability
        ws['!cols'] = [
            { wch: 5 },   // No
            { wch: 18 },  // NIM
            { wch: 30 },  // Mahasiswa
            { wch: 12 },  // Tanggal
            { wch: 8 },   // Jam
            { wch: 10 },  // Ruangan
            { wch: 30 },  // Penguji 1
            { wch: 30 },  // Penguji 2
            { wch: 30 }   // Pembimbing
        ];

        // 5. Create workbook and add worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Jadwal Pendadaran');

        // 6. Generate filename with timestamp
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        const filename = `Jadwal_Pendadaran_${timestamp}.xlsx`;

        // 7. Write and download
        XLSX.writeFile(wb, filename);

        showToast('Jadwal berhasil di-export ke Excel (.xlsx)', 'success');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        showToast('Gagal export Excel: ' + error.message, 'error');
    }
}

export function handleRuleTypeChange(val) {
    document.querySelectorAll('.rule-input').forEach(el => el.style.display = 'none');
    if (val === 'date') document.getElementById('inputDate').style.display = 'block';
    if (val === 'multi-date') document.getElementById('inputMultiDate').style.display = 'block';
    if (val === 'range') document.getElementById('inputRange').style.display = 'flex';
    if (val === 'recurring') document.getElementById('inputRecurring').style.display = 'block';
}

// Drag and Drop Handlers
export function onDragStart(e, name, date, time, room) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ name, date, time, room }));
    e.currentTarget.style.opacity = '0.4';
}

export function onDragOver(e) {
    e.preventDefault();
}

export async function onDrop(e, date, time, room) {
    e.preventDefault();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));

        // 1. Cek apakah target sudah terisi
        const targetOccupied = APP_DATA.slots.find(s => s.date === date && s.time === time && s.room === room);
        if (targetOccupied) {
            showToast('Ruangan pada jam tersebut sudah terisi!', 'warning');
            refreshView('home');
            return;
        }

        // 2. Cari slot asli
        const movingSlot = APP_DATA.slots.find(s => s.student === data.name);
        if (!movingSlot) return;

        // 3. Panggil API Backend untuk Validasi & Update
        const { scheduleAPI, slotsAPI } = await import('../services/api.js');

        const loadingToast = showToast('Memindahkan jadwal...', 'info', 20000); // Long duration until finished

        const response = await scheduleAPI.moveSlot(movingSlot.id, date, time, room);

        // Hapus loading
        const toastEl = document.querySelector('.toast-info');
        if (toastEl) toastEl.remove();

        if (response.success) {
            showToast('Jadwal berhasil dipindahkan ✅', 'success');
            // Refresh slot data from server to ensure consistency
            const freshSlots = await slotsAPI.getAll();
            APP_DATA.slots = freshSlots.data;
        } else {
            showToast('Gagal: ' + response.error, 'error');
        }

        refreshView('home');

    } catch (err) {
        console.error('Drop error:', err);
        showToast('Terjadi kesalahan saat memindahkan jadwal.', 'error');
        refreshView('home');
    }
}

export async function runStressTest() {
    if (!(await showConfirm('STRESS TEST akan menghapus data saat ini dan membuat 500 mahasiswa acak. Lanjutkan?', 'Warning: Stress Test'))) return;

    // Pastikan kita bisa import helper di dalam fungsi ini atau pastikan dia global
    const logEl = document.getElementById('logicLog');
    if (logEl) logEl.innerHTML = '<div style="color:var(--warning);">[SYSTEM] Memulai Stress Test...</div>';

    // Ambil data dosen
    const allDosen = getAllDosen();
    if (allDosen.length === 0) {
        showToast('Data dosen kosong, tidak bisa melakukan stress test.', 'error');
        return;
    }

    const prodis = [...new Set(allDosen.map(d => d.prodi))].filter(p => p);
    const newMahasiswa = [];

    for (let i = 1; i <= 500; i++) {
        const prodi = prodis[Math.floor(Math.random() * prodis.length)];
        const lecturersFromProdi = allDosen.filter(d => d.prodi === prodi);
        const pembimbing = lecturersFromProdi.length > 0
            ? lecturersFromProdi[Math.floor(Math.random() * lecturersFromProdi.length)].nama
            : allDosen[Math.floor(Math.random() * allDosen.length)].nama;

        newMahasiswa.push({
            nim: `TEST.${22000 + i}`,
            nama: `Student StressTest ${i}`,
            prodi: prodi,
            pembimbing: pembimbing
        });
    }

    APP_DATA.mahasiswa = newMahasiswa;
    APP_DATA.slots = [];
    saveMahasiswaToStorage();

    if (logEl) logEl.innerHTML += `<div style="color:var(--success);">[DATA] Berhasil membuat 500 mahasiswa simulasi.</div>`;

    // 2. Run Engine & Measure Time
    setTimeout(async () => {
        const startTime = performance.now();
        await window.generateSchedule({ silent: true });
        const endTime = performance.now();

        const duration = ((endTime - startTime) / 1000).toFixed(2);
        if (logEl) {
            logEl.innerHTML += `<div style="color:var(--primary); font-weight:800; margin-top:10px;">[STRESS TEST RESULT]</div>`;
            logEl.innerHTML += `<div>Total Prosedur: 500 Mahasiswa</div>`;
            logEl.innerHTML += `<div>Waktu Eksekusi: ${duration} detik</div>`;
            logEl.innerHTML += `<div>Kecepatan Rata-rata: ${(500 / duration).toFixed(1)} mhs/detik</div>`;
        }
    }, 500);
}
