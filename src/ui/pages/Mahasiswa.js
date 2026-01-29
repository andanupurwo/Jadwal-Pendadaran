import { MOCK_DATA, appState } from '../../data/store.js';
import { filterData } from '../../utils/helpers.js';

export const MahasiswaView = () => {
    const searchTerm = appState.searchTerm;
    let data = filterData(MOCK_DATA.mahasiswa, searchTerm);
    const sorted = [...data].sort((a, b) => a.nim.localeCompare(b.nim));

    return `
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Mahasiswa Pendadaran</h1>
                    <p class="subtitle">Daftar mahasiswa yang akan dijadwalkan.</p>
                </div>
                <div class="header-actions">
                    <button type="button" onclick="event.preventDefault(); window.wipeMahasiswaData()" class="btn-secondary" style="color:var(--danger);">🗑️ Bersihkan Semua</button>
                    <button type="button" onclick="window.toggleAddMahasiswaModal(true)" class="btn-secondary">+ Input Manual</button>
                </div>
            </header>

            <div class="controls-bar" style="margin-bottom:1.5rem;">
                <div class="search-container" style="max-width:400px;">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" placeholder="Cari NIM atau Nama..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
                </div>
                <div class="badge badge-primary">Total Mahasiswa: ${MOCK_DATA.mahasiswa.length}</div>
            </div>

            <div class="card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>NIM</th>
                                <th>Nama Mahasiswa</th>
                                <th>Program Studi</th>
                                <th>Pembimbing Utama</th>
                                <th>Status Jadwal</th>
                                <th style="text-align:center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sorted.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">Data tidak ditemukan.</td></tr>` :
            sorted.map(m => {
                const sched = MOCK_DATA.slots.find(s => s.student === m.nama);
                return `<tr>
                                    <td style="font-family:monospace; font-weight:600;">${m.nim}</td>
                                    <td><strong>${m.nama}</strong></td>
                                    <td><span class="badge" style="background:rgba(0,0,0,0.05); color:var(--text-main); font-weight:600;">${m.prodi}</span></td>
                                    <td>${m.pembimbing || '<span style="color:var(--danger); font-style:italic;">Belum Ada</span>'}</td>
                                    <td>
                                        ${sched
                        ? `<div onclick="window.viewAndHighlightSchedule('${m.nama}')" class="badge-success" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                                                <span style="font-size:12px;">📅</span> ${sched.date} (${sched.time})
                                              </div>`
                        : `<button type="button" onclick="window.scheduleIndividualStudent('${m.nim}')" class="btn-secondary" style="padding:4px 12px; font-size:0.75rem;">⚡ Jadwalkan</button>`}
                                    </td>
                                    <td style="text-align:center;">
                                        <button type="button" onclick="window.deleteMahasiswa('${m.nim}')" class="btn-icon" style="color:var(--danger);">🗑️</button>
                                    </td>
                                </tr>`;
            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};
