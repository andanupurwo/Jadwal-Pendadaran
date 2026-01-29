import { MOCK_DATA, appState, saveMahasiswaToStorage, saveLiburToStorage, saveExcludedDosenToStorage } from '../data/store.js';
import { INITIAL_LIBUR } from '../data/initialLibur.js';
import * as views from '../ui/pages/index.js';
import { navigate } from '../ui/router.js';
import { getAllDosen } from '../utils/helpers.js';

const getContainer = () => document.getElementById('main-content');
const refreshView = (viewName) => { if (appState.currentView === viewName) getContainer().innerHTML = views[viewName](); };

export function deleteMahasiswa(nim) {
    MOCK_DATA.mahasiswa = MOCK_DATA.mahasiswa.filter(m => m.nim !== nim);
    saveMahasiswaToStorage();
    refreshView('mahasiswa');
}

export function deleteSlot(date, time, room) {
    if (confirm('Hapus jadwal ini?')) {
        MOCK_DATA.slots = MOCK_DATA.slots.filter(s => !(s.date === date && s.time === time && s.room === room));
        saveMahasiswaToStorage();
        refreshView('home');
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
    refreshView('dosen');
}

export function handleStatusFilterChange(e) {
    appState.selectedStatusFilter = e.target.value;
    refreshView('dosen');
}

export function toggleDosenScheduling(faculty, nik) {
    const d = MOCK_DATA.facultyData[faculty]?.find(x => x.nik === nik);
    if (d) {
        d.exclude = !d.exclude;
        saveExcludedDosenToStorage();
        refreshView('dosen');
    }
}

export function wipeLiburData() {
    requestAnimationFrame(() => {
        if (confirm('Hapus SEMUA aturan ketersediaan dosen?')) {
            MOCK_DATA.libur = [];
            saveLiburToStorage();
            refreshView('libur');
        }
    });
}

export function resetLiburData() {
    if (confirm('Reset data libur ke Default?')) {
        MOCK_DATA.libur = [...INITIAL_LIBUR];
        saveLiburToStorage();
        refreshView('libur');
    }
}

export function deleteLibur(idx) {
    MOCK_DATA.libur.splice(idx, 1);
    saveLiburToStorage();
    refreshView('libur');
}

export function wipeMahasiswaData() {
    // Gunakan requestAnimationFrame agar browser selesai memproses klik sebelum popup muncul
    requestAnimationFrame(() => {
        if (confirm('Hapus SEMUA data mahasiswa?')) {
            MOCK_DATA.mahasiswa = [];
            MOCK_DATA.slots = [];
            saveMahasiswaToStorage();
            refreshView('mahasiswa');
        }
    });
}

export function selectScheduleDate(val) {
    appState.selectedDate = val;
    refreshView('home');
}
export function moveSlotToClipboard(name) {
    if (!name) MOCK_DATA.clipboard = null;
    else {
        const s = MOCK_DATA.slots.find(x => x.student === name);
        if (s) { MOCK_DATA.clipboard = { ...s }; MOCK_DATA.slots = MOCK_DATA.slots.filter(x => x.student !== name); }
    }
    refreshView('home');
}
export function pasteSlotFromClipboard(date, time, room) {
    if (MOCK_DATA.clipboard) {
        MOCK_DATA.slots.push({ ...MOCK_DATA.clipboard, date, time, room });
        MOCK_DATA.clipboard = null;
        refreshView('home');
    }
}

export function viewAndHighlightSchedule(studentName) {
    const slot = MOCK_DATA.slots.find(s => s.student === studentName);
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

export function onDrop(e, date, time, room) {
    e.preventDefault();
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));

        // 1. Cek apakah target sudah terisi
        const targetOccupied = MOCK_DATA.slots.find(s => s.date === date && s.time === time && s.room === room);
        if (targetOccupied) {
            alert('Ruangan pada jam tersebut sudah terisi!');
            refreshView('home');
            return;
        }

        // 2. Cari dan pindahkan slot
        const slotIdx = MOCK_DATA.slots.findIndex(s => s.student === data.name);
        if (slotIdx !== -1) {
            MOCK_DATA.slots[slotIdx].date = date;
            MOCK_DATA.slots[slotIdx].time = time;
            MOCK_DATA.slots[slotIdx].room = room;
            saveMahasiswaToStorage();
            refreshView('home');
        }
    } catch (err) {
        console.error('Drop error:', err);
        refreshView('home');
    }
}

export async function runStressTest() {
    if (!confirm('STRESS TEST akan menghapus data saat ini dan membuat 500 mahasiswa acak. Lanjutkan?')) return;

    // Pastikan kita bisa import helper di dalam fungsi ini atau pastikan dia global
    const logEl = document.getElementById('logicLog');
    if (logEl) logEl.innerHTML = '<div style="color:var(--warning);">[SYSTEM] Memulai Stress Test...</div>';

    // Ambil data dosen
    const allDosen = getAllDosen();
    if (allDosen.length === 0) {
        alert('Data dosen kosong, tidak bisa melakukan stress test.');
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

    MOCK_DATA.mahasiswa = newMahasiswa;
    MOCK_DATA.slots = [];
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
