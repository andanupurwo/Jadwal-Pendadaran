import { APP_DATA, appState } from '../../data/store.js';
import { getAllDosen, sortData } from '../../utils/helpers.js';
import { renderTable } from '../components/Common.js';
import { PRODI_SHORTNAMES } from '../../utils/constants.js';

export const LiburView = () => {
    const searchTerm = appState.searchTerm || '';

    // 1. Prepare Data
    let data = APP_DATA.libur.map(l => {
        const dosen = getAllDosen().find(d => d.nik === l.dosenId || d.nama === l.nama);
        return {
            ...l,
            dosenObj: dosen, // Keep reference for sorting/filtering
            dosenNama: dosen ? dosen.nama : (l.nama || l.dosenId),
            prodi: dosen ? dosen.prodi : '-'
        };
    });

    // 2. Filter Logic
    // Filter by Prodi
    const prodis = [...new Set(data.map(d => d.prodi).filter(p => p !== '-'))].sort();
    if (appState.selectedProdiFilter) {
        data = data.filter(l => l.prodi === appState.selectedProdiFilter);
    }

    // Filter by Search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        data = data.filter(l => {
            const searchSource = `${l.dosenNama} ${l.dosenId || ''} ${l.reason || ''}`.toLowerCase();
            return searchSource.includes(term);
        });
    }

    // 3. Sorting Logic
    const sorted = sortData(data, appState.sortColumn || 'dosenNama', appState.sortDirection);

    // 4. Render Table Rows
    const renderConstraint = (l) => {
        const hasDates = l.dates && l.dates.length > 0;
        const hasTimes = l.times && l.times.length > 0;

        if (!hasDates && !hasTimes) {
            return `<span style="color:var(--text-muted); font-style:italic;">Tidak ada tanggal/jam terpilih</span>`;
        }

        let html = '<div style="display:flex; flex-direction:column; gap:8px;">';
        if (hasDates) {
            html += `<div style="display:flex; flex-wrap:wrap; gap:4px;">${l.dates.map(d => `<span class="badge" style="background:#fff1f0; color:#cf1322; border:1px solid #ffa39e; font-size:10px; font-weight:700;">📅 ${d}</span>`).join('')}</div>`;
        }
        if (hasTimes) {
            html += `<div style="display:flex; flex-wrap:wrap; gap:4px;">${l.times.map(t => `<span class="badge" style="background:#e6f7ff; color:#0050b3; border:1px solid #91d5ff; font-size:10px; font-weight:700;">⏰ ${t}</span>`).join('')}</div>`;
        }
        html += '</div>';
        return html;
    };

    const rows = sorted.map(l => {
        const dosen = l.dosenObj;
        let htmlNama = '';
        if (dosen) {
            htmlNama = `<strong>${dosen.nama}</strong><br><span style="font-size:0.75rem; color:var(--text-muted); cursor:help;" title="${dosen.prodi}">${PRODI_SHORTNAMES[dosen.prodi] || dosen.prodi}</span>`;
        } else {
            htmlNama = `<strong>${l.nama || l.dosenId}</strong><br><span style="font-size:0.75rem; color:var(--danger);">(Data Dosen Tidak Ditemukan)</span>`;
        }

        // Find actual index in APP_DATA.libur for edit action (using original object refernece might be risky if we map, but 'l' comes from map so it's a copy. 
        // We need original index or ID. 
        // Best way: find by object quality or assign ID. 
        // For now, let's find index in original array.
        const actualIdx = APP_DATA.libur.findIndex(item => item.dosenId === l.dosenId && item.reason === l.reason);

        return [
            htmlNama,
            renderConstraint(l),
            `<span style="color:var(--text-muted); font-size:0.9rem;">${l.reason || '-'}</span>`,
            `<div style="text-align:center;">
                <button onclick="window.editLiburGroup('${l.ids ? l.ids.join(',') : ''}')" class="btn-icon" style="color:var(--primary); margin-right:8px;">✏️</button>
                <button onclick="window.deleteLiburGroup('${l.ids ? l.ids.join(',') : ''}')" class="btn-icon" style="color:var(--danger);">🗑️</button>
             </div>`
        ];
    });

    const headers = [
        { label: 'Dosen', key: 'dosenNama', width: '30%' },
        { label: 'Jadwal Blokir', width: '30%' },
        { label: 'Keterangan', key: 'reason', width: '30%' },
        { label: 'Aksi', width: '10%', align: 'center' }
    ];

    return `
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Ketersediaan Dosen</h1>
                    <p class="subtitle">Atur blokir waktu, cuti, atau jadwal rutin dosen agar tidak bentrok.</p>
                </div>
                <div style="display:flex; gap:10px;">
                    <button type="button" onclick="event.preventDefault(); window.wipeLiburData()" class="btn-secondary" style="color:var(--danger);">🗑️ Bersihkan Semua</button>
                    <button type="button" onclick="window.toggleAddLiburModal(true)" class="btn-primary">+ Aturan Baru</button>
                </div>
            </header>

            <div class="controls-bar" style="margin-bottom:1.5rem; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
                <select onchange="window.handleProdiFilterChange(event)" class="form-select" style="width: 200px;">
                    <option value="">Semua Prodi</option>
                    ${prodis.map(p => `<option value="${p}" ${appState.selectedProdiFilter === p ? 'selected' : ''}>${PRODI_SHORTNAMES[p] || p} - ${p}</option>`).join('')}
                </select>

                <div style="display: flex; gap: 12px; align-items: center; flex: 1;">
                    <div class="search-container" style="max-width:400px; flex: 1;">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="mainSearchInput" class="search-input" placeholder="Cari nama dosen atau alasan..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
                    </div>
                    <div class="badge badge-primary">Total: ${data.length}</div>
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
