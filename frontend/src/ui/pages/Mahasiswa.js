import { APP_DATA, appState } from '../../data/store.js';
import { filterData, sortData } from '../../utils/helpers.js';
import { renderTable } from '../components/Common.js';

export const MahasiswaView = () => {
    const searchTerm = appState.searchTerm;

    // 1. Filter Logic
    let data = APP_DATA.mahasiswa || [];

    // Filter by Search
    data = filterData(data, searchTerm);

    // Filter by Prodi
    const prodis = [...new Set(APP_DATA.mahasiswa.map(m => m.prodi))].sort();
    if (appState.selectedProdiFilter) {
        data = data.filter(m => m.prodi === appState.selectedProdiFilter);
    }

    // Filter by Status (Sudah Terjadwal / Belum)
    if (appState.selectedStatusFilter) {
        data = data.filter(m => {
            const hasSchedule = APP_DATA.slots.some(s => s.student === m.nama);
            if (appState.selectedStatusFilter === 'scheduled') return hasSchedule;
            if (appState.selectedStatusFilter === 'unscheduled') return !hasSchedule;
            return true;
        });
    }

    // 2. Sorting Logic
    const sorted = sortData(data, appState.sortColumn || 'nim', appState.sortDirection);

    // Prepare validator for Dosen Names
    const validDosenNames = new Set();
    if (APP_DATA.facultyData) {
        Object.values(APP_DATA.facultyData).forEach(list => {
            if (Array.isArray(list)) list.forEach(d => validDosenNames.add(d.nama));
        });
    }

    // Calculate stats for current view
    const scheduledCount = data.reduce((acc, m) => {
        return acc + (APP_DATA.slots.some(s => s.student === m.nama) ? 1 : 0);
    }, 0);
    const unscheduledCount = data.length - scheduledCount;

    // 3. Prepare Table Rows
    const rows = sorted.map(m => {
        const sched = APP_DATA.slots.find(s => s.student === m.nama);

        // Validate Pembimbing
        // If pembimbing exists but is NOT in our valid list, mark it red
        const isUnknown = m.pembimbing && !validDosenNames.has(m.pembimbing);

        let pembimbingDisplay = '';
        if (!m.pembimbing) {
            pembimbingDisplay = `<div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--danger); font-style:italic;">Belum Ada</span>
                <button onclick="window.openEditMahasiswa('${m.nim}')" class="btn-icon" style="width:24px; height:24px; font-size:12px; background:var(--bg-secondary); border-radius:4px;" title="Tambah Pembimbing">➕</button>
            </div>`;
        } else {
            pembimbingDisplay = `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <span style="color:${isUnknown ? 'var(--danger)' : 'inherit'}; font-weight:${isUnknown ? '800' : '500'}; ${isUnknown ? 'border-bottom:1px dashed var(--danger);' : ''}" title="${isUnknown ? 'Data tidak valid!' : ''}">
                        ${m.pembimbing}${isUnknown ? ' (?)' : ''}
                    </span>
                    <button onclick="window.openEditMahasiswa('${m.nim}')" class="btn-icon" style="color:var(--text-secondary); padding:4px; font-size:14px;" title="Edit Data Mahasiswa">✏️</button>
                </div>
            `;
        }

        return [
            `<div style="font-family:monospace; font-weight:600;">${m.nim}</div>`,
            `<strong>${m.nama}</strong>`,
            `<div style="text-align:center;">${m.gender || '-'}</div>`,
            `<span class="badge" style="background:rgba(0,0,0,0.05); color:var(--text-main); font-weight:600;">${m.prodi}</span>`,
            pembimbingDisplay,
            sched
                ? `<div onclick="window.viewAndHighlightSchedule('${m.nama}')" class="badge-success" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                        <span style="font-size:12px;">📅</span> ${sched.date} (${sched.time})
                   </div>`
                : `<button type="button" onclick="window.scheduleIndividualStudent('${m.nim}')" class="btn-secondary" style="padding:4px 12px; font-size:0.75rem;">⚡ Jadwalkan</button>`,
            `<div style="text-align:center;">
                <button type="button" onclick="window.deleteMahasiswa('${m.nim}')" class="btn-icon" style="color:var(--danger);">🗑️</button>
             </div>`
        ];
    });

    const headers = [
        { label: 'NIM', key: 'nim', width: '12%' },
        { label: 'Nama Mahasiswa', key: 'nama', width: '20%' },
        { label: 'L/P', key: 'gender', width: '5%', align: 'center' },
        { label: 'Program Studi', key: 'prodi', width: '15%' },
        { label: 'Pembimbing Utama', key: 'pembimbing', width: '20%' },
        { label: 'Status Jadwal', width: '15%', align: 'center' }, // Status is dynamic, hard to sort by column unless we process it first. keeping it unsortable for now or simple.
        { label: 'Aksi', width: '13%', align: 'center' }
    ];

    return `
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Mahasiswa Pendadaran</h1>
                    <p class="subtitle">Daftar mahasiswa yang akan dijadwalkan.</p>
                </div>
                <div class="header-actions">
                    <button type="button" onclick="event.preventDefault(); window.wipeMahasiswaData()" class="btn-secondary" style="color:var(--danger);">🗑️ Bersihkan Semua</button>
                    <button type="button" onclick="window.toggleAddMahasiswaModal(true)" class="btn-secondary">+ Tambah Mahasiswa</button>
                </div>
            </header>

            <div class="controls-bar" style="margin-bottom:1.5rem; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
                
                <select onchange="window.handleProdiFilterChange(event)" class="form-select" style="width: 200px;">
                    <option value="">Semua Prodi</option>
                    ${prodis.map(p => `<option value="${p}" ${appState.selectedProdiFilter === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>

                <select onchange="window.handleStatusFilterChange(event)" class="form-select" style="width: 180px;">
                    <option value="">Semua Status</option>
                    <option value="scheduled" ${appState.selectedStatusFilter === 'scheduled' ? 'selected' : ''}>Sudah Terjadwal</option>
                    <option value="unscheduled" ${appState.selectedStatusFilter === 'unscheduled' ? 'selected' : ''}>Belum Terjadwal</option>
                </select>

                <div style="display: flex; gap: 12px; align-items: center; flex: 1; min-width: 300px;">
                    <div class="search-container">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="mainSearchInput" class="search-input" placeholder="Cari NIM atau Nama..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
                    </div>
                    <div style="display:flex; gap:8px;">
                        <div class="badge badge-primary">Total: ${data.length}</div>
                        <div class="badge badge-success" title="Sudah Terjadwal">✅ ${scheduledCount}</div>
                        <div class="badge badge-warning" title="Belum Terjadwal">⏳ ${unscheduledCount}</div>
                    </div>
                
                <div style="display: flex; gap: 16px; align-items: center;">
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; cursor: pointer; user-select: none; color: var(--text-secondary); font-weight: 500;">
                        <input type="checkbox" id="forceResetSchedule" style="accent-color: var(--danger); width: 16px; height: 16px;">
                        <span>Reset Semua</span>
                    </label>

                    <button onclick="window.generateScheduleWithOptions()" style="padding: 8px 16px; background: var(--text-main); color: var(--bg); border: none; border-radius: 50px; font-weight: 600; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <span>▶</span> Jadwalkan
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="table-container">
                    ${renderTable({ headers, rows, sortColumn: appState.sortColumn, sortDirection: appState.sortDirection })}
                </div>
            </div>
        </div>
    `;
};
