import { MOCK_DATA, appState } from '../../data/store.js';
import { sortData, filterData } from '../../utils/helpers.js';
import { renderTable, renderTabItem } from '../components.js';

export const DosenView = () => {
    const currentDosenTab = appState.currentDosenTab;
    const searchTerm = appState.searchTerm;
    let content = '';

    if (currentDosenTab === 'sdm') {
        const data = MOCK_DATA.masterDosen || [];
        const filtered = filterData(data, searchTerm);
        const sorted = sortData(filtered, appState.sortColumn || 'nama', appState.sortDirection);

        const rows = sorted.map(d => [
            d.nik,
            `<span class="badge ${d.status === 'DOSEN' ? 'badge-primary' : 'badge-secondary'}">${d.status}</span>`,
            `<strong>${d.nama}</strong>`,
            d.kategori,
            d.nidn,
            d.jenisKelamin
        ]);

        const headers = [
            { label: 'NIK', key: 'nik' },
            { label: 'Status', key: 'status' },
            { label: 'Nama', key: 'nama' },
            { label: 'Kategori', key: 'kategori' },
            { label: 'NIDN', key: 'nidn' },
            { label: 'JK', key: 'jenisKelamin' }
        ];

        content = `
            <div class="controls-bar">
                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" placeholder="Cari dosen..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="badge badge-primary">Total: ${filtered.length}</div>
                    <button onclick="window.triggerImportSDM()" class="btn-secondary">Import CSV</button>
                    <button onclick="window.exportSDMData()" class="btn-primary">Export CSV</button>
                    <input type="file" id="importSDMInput" accept=".csv" style="display:none;" onchange="window.handleImportSDM(event)">
                </div>
            </div>
            ${renderTable({ headers, rows, sortColumn: appState.sortColumn, sortDirection: appState.sortDirection })}
        `;
    } else {
        const faculty = currentDosenTab.toUpperCase();
        let data = MOCK_DATA.facultyData[faculty] || [];
        if (appState.selectedProdiFilter) data = data.filter(d => d.prodi === appState.selectedProdiFilter);
        if (appState.selectedStatusFilter === 'active') data = data.filter(d => !d.exclude);
        else if (appState.selectedStatusFilter === 'off') data = data.filter(d => d.exclude);

        const filtered = filterData(data, searchTerm);
        const sorted = sortData(filtered, appState.sortColumn || 'nomor', appState.sortDirection);

        const rows = sorted.map(d => {
            const isIncluded = !d.exclude;
            return {
                content: [
                    d.nik,
                    `<div class="text-truncate" title="${d.nama}"><strong>${d.nama}</strong></div>`,
                    d.prodi,
                    `<div>${d.matchResult?.matched
                        ? `<span class="badge badge-success" style="background:#e6f9f1; color:#00a854; border:1px solid #b7eb8f;">✓ Valid</span>`
                        : `<span class="badge badge-danger" style="background:#fff1f0; color:#f5222d; border:1px solid #ffa39e;">Unmatched</span>`}</div>`,
                    `<div style="display:flex; align-items:center; gap:8px;">
                        <label class="switch">
                            <input type="checkbox" ${isIncluded ? 'checked' : ''} onchange="window.toggleDosenScheduling('${faculty}', '${d.nik}')">
                            <span class="slider"></span>
                        </label>
                        <span style="font-size:0.75rem; font-weight:700; color:${isIncluded ? 'var(--success)' : 'var(--danger)'}">${isIncluded ? 'ON' : 'OFF'}</span>
                    </div>`,
                    `<button type="button" onclick="window.deleteDosen('${faculty}', '${d.nik}')" class="btn-icon">🗑️</button>`
                ],
                className: isIncluded ? '' : 'excluded-row'
            };
        });

        const headers = [
            { label: 'NIK', key: 'nik' },
            { label: 'Nama Dosen', key: 'nama' },
            { label: 'Prodi', key: 'prodi' },
            { label: 'Status Data', key: null },
            { label: 'Active', key: 'exclude' },
            { label: 'Aksi', align: 'center' }
        ];

        const prodis = [...new Set((MOCK_DATA.facultyData[faculty] || []).map(d => d.prodi))].sort();

        content = `
            <div class="controls-bar">
                <select onchange="window.handleProdiFilterChange(event)" class="form-select">
                    <option value="">Semua Prodi</option>
                    ${prodis.map(p => `<option value="${p}" ${appState.selectedProdiFilter === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
                <select onchange="window.handleStatusFilterChange(event)" class="form-select">
                    <option value="all">Semua Status</option>
                    <option value="active" ${appState.selectedStatusFilter === 'active' ? 'selected' : ''}>Active (ON)</option>
                    <option value="off" ${appState.selectedStatusFilter === 'off' ? 'selected' : ''}>OFF</option>
                </select>
                <div class="search-container" style="flex:1;">
                    <input type="text" class="search-input" placeholder="Cari nama dosen..." value="${searchTerm}" oninput="window.handleSearchInput(event)">
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
