import { APP_DATA, appState } from '../../data/store.js';
import { sortData, filterData } from '../../utils/helpers.js';
import { renderTable, renderTabItem } from '../components/Common.js';
import { PRODI_SHORTNAMES } from '../../utils/constants.js';

export const DosenView = () => {
    const currentDosenTab = appState.currentDosenTab;
    const searchTerm = appState.searchTerm;
    let content = '';

    if (currentDosenTab === 'sdm') {
        const data = APP_DATA.masterDosen || [];
        const filtered = filterData(data, searchTerm);
        const sorted = sortData(filtered, appState.sortColumn || 'nama', appState.sortDirection);

        const rows = sorted.map(d => [
            d.nik,
            `<div class="text-truncate" title="Klik untuk lihat jadwal" style="cursor:pointer; color:var(--primary);" onclick="window.showLecturerSchedule('${d.nama.replace(/'/g, "\\'")}')"><strong>${d.nama}</strong> <span style="font-size:0.8rem;">📅</span></div>`,
            `<div style="text-align:center;"><span class="badge ${d.status === 'DOSEN' ? 'badge-primary' : 'badge-secondary'}" style="display:inline-block; min-width:60px;">${d.status}</span></div>`,
            `<div class="text-truncate">${d.kategori || '-'}</div>`,
            `<div style="font-family: monospace; font-size: 0.8rem; text-align:center;">${d.nidn || '-'}</div>`,
            `<div style="display:flex; justify-content:center;"><div style="text-align: center; width: 24px; height: 24px; line-height: 24px; background: rgba(0,0,0,0.03); border-radius: 6px; font-weight: 700;">${d.jenis_kelamin || d.jenisKelamin || '-'}</div></div>`,
            `<div style="text-align:center;"><button type="button" onclick="window.deleteMasterDosen('${d.nik}')" class="btn-icon" style="color:var(--danger);">🗑️</button></div>`
        ]);

        const headers = [
            { label: 'NIK', key: 'nik', width: '15%' },
            { label: 'Nama', key: 'nama', width: '30%' },
            { label: 'Status', key: 'status', width: '12%', align: 'center' },
            { label: 'Kategori', key: 'kategori', width: '13%' },
            { label: 'NIDN', key: 'nidn', width: '10%', align: 'center' },
            { label: 'JK', key: 'jenisKelamin', width: '7%', align: 'center' },
            { label: 'Aksi', width: '13%', align: 'center' }
        ];

        content = `
            <div class="controls-bar">
                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="mainSearchInput" class="search-input" placeholder="Cari dosen..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="badge badge-primary">Total: ${filtered.length}</div>
                    <button onclick="window.triggerImportSDM()" class="btn-secondary">Import CSV</button>
                    <button onclick="window.exportSDMData()" class="btn-primary">Export CSV</button>
                    <button onclick="window.toggleAddMasterDosenModal(true)" class="btn-primary">+ Tambah Dosen</button>
                    <input type="file" id="importSDMInput" accept=".csv" style="display:none;" onchange="window.handleImportSDM(event)">
                </div>
            </div>
            ${renderTable({ headers, rows, sortColumn: appState.sortColumn, sortDirection: appState.sortDirection })}
        `;
    } else {
        const faculty = currentDosenTab.toUpperCase();
        let data = (APP_DATA.facultyData[faculty] || []).map(d => ({
            ...d,
            isMatched: d.matchResult?.matched ? 1 : 0
        }));
        if (appState.selectedProdiFilter) data = data.filter(d => d.prodi === appState.selectedProdiFilter);
        if (appState.selectedStatusFilter === 'active') data = data.filter(d => !d.exclude);
        else if (appState.selectedStatusFilter === 'off') data = data.filter(d => d.exclude);

        const filtered = filterData(data, searchTerm);
        const sorted = sortData(filtered, appState.sortColumn || 'nomor', appState.sortDirection);

        const rows = sorted.map(d => {
            const isIncluded = !d.exclude;
            const prefLabel = d.pref_gender === 'L' ? '<span class="badge" style="background:#e6f7ff; color:#1890ff; border:1px solid #91d5ff;">L Only</span>'
                : d.pref_gender === 'P' ? '<span class="badge" style="background:#fff0f6; color:#eb2f96; border:1px solid #ffadd2;">P Only</span>'
                    : '<span style="color:#d9d9d9;">-</span>';

            return {
                content: [
                    d.nik,
                    `<div class="text-truncate" title="Klik untuk lihat jadwal" style="cursor:pointer; color:var(--primary);" onclick="window.showLecturerSchedule('${d.nama.replace(/'/g, "\\'")}')"><strong>${d.nama}</strong> <span style="font-size:0.8rem;">📅</span></div>`,
                    `<span style="cursor:help;" title="${d.prodi}">${PRODI_SHORTNAMES[d.prodi] || d.prodi}</span>`,
                    prefLabel,
                    d.max_slots ? `<span style="font-weight:700; color:var(--success);">${d.max_slots} Slot</span>` : '<span style="color:#d9d9d9;">-</span>',
                    `${d.matchResult?.matched
                        ? `<span class="badge badge-success" style="background:#e6f9f1; color:#00a854; border:1px solid #b7eb8f;">✓ Valid</span>`
                        : `<span class="badge badge-danger" style="background:#fff1f0; color:#f5222d; border:1px solid #ffa39e;">Unmatched</span>`}`,
                    `<div style="display:inline-flex; align-items:center; gap:8px;">
                        <label class="switch">
                            <input type="checkbox" ${isIncluded ? 'checked' : ''} onchange="window.toggleDosenScheduling('${faculty}', '${d.nik}')">
                            <span class="slider"></span>
                        </label>
                        <span style="font-size:0.75rem; font-weight:700; color:${isIncluded ? 'var(--success)' : 'var(--danger)'}">${isIncluded ? 'ON' : 'OFF'}</span>
                    </div>`,
                    `<div style="display:flex; justify-content:center; gap:8px;">
                        <button type="button" onclick="window.editDosen('${d.nik}')" class="btn-icon" style="color:var(--primary); font-size:1.1rem;">✏️</button>
                        <button type="button" onclick="window.deleteDosen('${faculty}', '${d.nik}')" class="btn-icon" style="color:var(--danger); font-size:1.1rem;">🗑️</button>
                     </div>`
                ],
                className: isIncluded ? '' : 'excluded-row'
            };
        });

        const headers = [
            { label: 'NIK', key: 'nik', width: '12%' },
            { label: 'Nama Dosen', key: 'nama', width: '25%' },
            { label: 'Prodi', key: 'prodi', width: '15%' },
            { label: 'Pref', key: 'pref_gender', width: '8%', align: 'center' },
            { label: 'Quota', key: 'max_slots', width: '8%', align: 'center' },
            { label: 'Status Data', key: 'isMatched', width: '10%', align: 'center' },
            { label: 'Active', key: 'exclude', width: '9%', align: 'center' },
            { label: 'Aksi', align: 'center', width: '13%' }
        ];

        const prodis = [...new Set((APP_DATA.facultyData[faculty] || []).map(d => d.prodi))].sort();

        content = `
            <div class="controls-bar">
                <select onchange="window.handleProdiFilterChange(event)" class="form-select" style="width: 250px;">
                    <option value="">Semua Prodi</option>
                    ${prodis.map(p => `<option value="${p}" ${appState.selectedProdiFilter === p ? 'selected' : ''}>${PRODI_SHORTNAMES[p] || p} - ${p}</option>`).join('')}
                </select>
                <select onchange="window.handleStatusFilterChange(event)" class="form-select" style="width: 170px;">
                    <option value="all">Semua Status</option>
                    <option value="active" ${appState.selectedStatusFilter === 'active' ? 'selected' : ''}>Active (ON)</option>
                    <option value="off" ${appState.selectedStatusFilter === 'off' ? 'selected' : ''}>OFF</option>
                </select>
                <div class="search-container" style="flex:1;">
                    <input type="text" id="mainSearchInput" class="search-input" placeholder="Cari nama dosen..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
                </div>
                <button type="button" onclick="window.toggleAddDosenModal(true)" class="btn-primary">+ Tambah Dosen</button>
            </div>
            ${renderTable({ headers, rows, sortColumn: appState.sortColumn, sortDirection: appState.sortDirection })}
        `;
    }

    return `
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Dosen & Tenaga Pengajar</h1>
                    <p class="subtitle">Kelola ketersediaan dan sinkronisasi data dosen.</p>
                </div>
            </header>
            <div class="tabs" style="margin-bottom:2rem; background:rgba(0,0,0,0.03); padding:4px; border-radius:12px; display:inline-flex;">
                ${renderTabItem('fik', 'Dosen FIK', currentDosenTab, 'window.switchDosenTab')}
                ${renderTabItem('fes', 'Dosen FES', currentDosenTab, 'window.switchDosenTab')}
                ${renderTabItem('fst', 'Dosen FST', currentDosenTab, 'window.switchDosenTab')}
                <div style="width:1px; height:20px; background:var(--border); margin:auto 8px;"></div>
                ${renderTabItem('sdm', 'Data SDM (Master)', currentDosenTab, 'window.switchDosenTab')}
            </div>
            <div class="card">${content}</div>
        </div>
    `;
};
