// Basic error logger for debugging
window.onerror = function (msg, url, line, col, error) {
    console.error('GLOBAL ERROR:', msg, 'at', line, ':', col, error);
    if (document.body) {
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
    }
    return false;
};

import './style.css'
import './modal.css'
import { loadDosenData } from './loadDosenData.js'
import { loadFacultyData } from './loadFacultyData.js'

// Import from new modular structure
import {
    MOCK_DATA,
    appState,
    ROOMS,
    TIMES,
    DATES,
    MAX_EXAMINER_ASSIGNMENTS,
    saveExcludedDosenToStorage,
    loadExcludedDosenFromStorage,
    saveLiburToStorage,
    loadLiburFromStorage,
    saveMahasiswaToStorage,
    loadMahasiswaFromStorage,
    saveFacultyDataToStorage,
    loadFacultyDataFromStorage
} from './data/store.js'

import {
    getAllDosen,
    sortData,
    filterData,
    normalizeName,
    getSimilarity
} from './utils/helpers.js'

import { processMatching } from './logic/matching.js'
import { isDosenAvailable } from './logic/availability.js'
import { INITIAL_MAHASISWA } from './data/initialMahasiswa.js'
import { INITIAL_LIBUR } from './data/initialLibur.js'

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

// Create aliases for backward compatibility
let currentView = appState.currentView;
let selectedDate = appState.selectedDate;
let currentDosenTab = appState.currentDosenTab;
let sortColumn = appState.sortColumn;
let sortDirection = appState.sortDirection;
let searchTerm = appState.searchTerm;
let selectedProdiFilter = appState.selectedProdiFilter;
let selectedStatusFilter = appState.selectedStatusFilter || 'all';

// Note: MOCK_DATA, appState, ROOMS, TIMES, DATES, MAX_EXAMINER_ASSIGNMENTS
// and helper functions are now imported from modules above

// All helper functions (isDosenAvailable, normalizeName, getSimilarity, 
// processMatching, sortData, filterData) are now imported from modules




// Import SDM master (kolom: No;Nik;Status (Dosen/Tendik);Nama;Kategori Dosen/Karyawan;NIDN;Jenis Kelamin)
function importSDM(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length <= 1) return [];

    // Deteksi separator (semicolon atau comma)
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    const parseLine = (line) => {
        if (!line) return [];
        return line.split(separator).map(s => s.trim());
    };

    const headers = parseLine(lines[0]);

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const v = parseLine(lines[i]);
        if (v.length < headers.length) continue;

        result.push({
            no: v[0],
            nik: v[1],
            status: v[2],
            nama: v[3],
            kategori: v[4],
            nidn: v[5],
            jenisKelamin: v[6]
        });
    }

    return result;
}



// Application initialization
async function initializeApp() {
    console.log('🚀 Initializing application...');

    try {
        // Reveal app content nicely (Anti-FOUC)
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
            document.body.style.pointerEvents = 'auto';
        });

        // Render halaman pertama - ensure views is defined or wait
        if (typeof views !== 'undefined' && views.home) {
            navigate('home');
        } else {
            console.error('Views not available yet during init');
        }

        // Load SDM master data
        console.log('📥 Loading SDM master data...');
        MOCK_DATA.masterDosen = await loadDosenData();
        console.log(`✅ Loaded ${MOCK_DATA.masterDosen.length} SDM records`);

        // Load faculty data
        // Priority: LocalStorage -> CSV
        if (typeof loadFacultyDataFromStorage === 'function' && localStorage.getItem('faculty_data_v1')) {
            loadFacultyDataFromStorage();
        } else {
            // Load faculty data from new CSV (Dosen Prodi.csv)
            console.log('📥 Loading faculty data from Dosen Prodi.csv...');
            const facultyDataRaw = await loadFacultyData();

            // Assign raw data first
            MOCK_DATA.facultyData = facultyDataRaw;

            // Run sophisticated matching (Logic Centralized)
            console.log('🔍 Running advanced matching algorithm...');
            processMatching();

            console.log('✅ Faculty data loaded from CSV and matched.');
            // Save initial CSV state to storage
            if (typeof saveFacultyDataToStorage === 'function') saveFacultyDataToStorage();
        }

        // Load Mahasiswa Data
        if (typeof loadMahasiswaFromStorage === 'function') {
            loadMahasiswaFromStorage(); // Loads array from storage (e.g. 92 items)

            // DATABASE INTEGRITY CHECK: Remove Duplicate Records
            // (Fixes potential data duplication from previous seeding)
            if (MOCK_DATA.mahasiswa && MOCK_DATA.mahasiswa.length > 0) {
                const uniqueStudents = [];
                const seenNim = new Set();
                let duplicatesFound = 0;

                MOCK_DATA.mahasiswa.forEach(m => {
                    if (!seenNim.has(m.nim)) {
                        seenNim.add(m.nim);
                        uniqueStudents.push(m);
                    } else {
                        duplicatesFound++;
                    }
                });

                if (duplicatesFound > 0) {
                    console.log(`🧹 Database Integrity Check: Removed ${duplicatesFound} duplicate records.`);
                    MOCK_DATA.mahasiswa = uniqueStudents; // Updates it to ~80
                    if (typeof saveMahasiswaToStorage === 'function') saveMahasiswaToStorage();
                }
            }
        }

        // --- DATABASE SEEDING (First Run) ---
        // If database is empty, seed with initial data
        if (!MOCK_DATA.mahasiswa || MOCK_DATA.mahasiswa.length === 0) {
            console.log('📦 Initializing Database with Seed Data...');
            MOCK_DATA.mahasiswa = INITIAL_MAHASISWA;
            if (typeof saveMahasiswaToStorage === 'function') {
                saveMahasiswaToStorage();
            }
        }

        // Load persistensi status Dosen (OFF/ON) dari LocalStorage
        if (typeof loadExcludedDosenFromStorage === 'function') {
            loadExcludedDosenFromStorage();
        }

        // Load persistensi data Dosen Libur dari LocalStorage
        if (typeof loadLiburFromStorage === 'function') {
            loadLiburFromStorage();
        }

        // --- DATABASE SEEDING (Libur) ---
        if (!MOCK_DATA.libur || MOCK_DATA.libur.length === 0) {
            console.log('📅 Initializing Libur Data with Seed Data...');
            MOCK_DATA.libur = INITIAL_LIBUR;
            if (typeof saveLiburToStorage === 'function') {
                saveLiburToStorage();
            }
        }

        // Refresh view jika user sedang di tab dosen
        if (currentView === 'dosen') {
            mainContent.innerHTML = views.dosen();
        }

        console.log('✅ Application initialized successfully!');

    } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Still show the UI even if data loading fails
        document.body.style.opacity = '1';
        document.body.style.pointerEvents = 'auto';
    }
}

// triggerImport and handleImportFile legacy
window.triggerImport = (tab) => {
    console.log('Use auto-load instead.');
};

window.handleImportFile = (event) => {
    console.log('Use auto-load instead.');
};

const views = {
    home: () => {

        const rooms = ['6.3.A', '6.3.B', '6.3.C', '6.3.D', '6.3.E', '6.3.F', '6.3.G', '6.3.H'];

        // Current selection state
        const currentDate = selectedDate || '2026-02-16';
        const dateObj = DATES.find(d => d.value === currentDate);
        const selectedDay = dateObj.label;

        // Filter waktu: Jumat tidak ada jam 11:30
        const times = selectedDay === 'Jumat'
            ? TIMES.filter(t => t !== '11:30')
            : TIMES;

        return `
            <div class="container">
                <header class="page-header">
                    <div class="header-info">
                        <h1>Dashboard</h1>
                        <p class="subtitle">Monitoring slot dan ketersediaan ruangan.</p>
                    </div>
                    <div class="header-actions">
                        ${MOCK_DATA.clipboard ? `
                            <div class="card" style="margin: 0; padding: 0.6rem 1.25rem; background: var(--primary-subtle); border: 1px dashed var(--primary); display: flex; align-items: center; gap: 12px; border-radius: 12px;">
                                <span style="font-size: 0.9rem; font-weight: 600; color: var(--primary);">📋 Clipboard: ${MOCK_DATA.clipboard.student}</span>
                                <button onclick="window.moveSlotToClipboard(null)" class="btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;">Batal</button>
                            </div>
                        ` : ''}
                        <button onclick="window.generateSchedule()" class="btn-primary">
                            ⚡ Proses Jadwal Otomatis
                        </button>
                    </div>
                </header>
                
                <!-- Date Selector Tabs -->
                <div class="tabs-container" style="margin-bottom: 2rem;">
                    <div class="tabs" style="display: flex; gap: 4px; padding: 4px; background: rgba(118, 118, 128, 0.08); border-radius: 14px;">
                        ${DATES.map((item, index) => {
            const hasSchedule = MOCK_DATA.slots.some(s => s.date === item.value);
            const isActive = currentDate === item.value;

            // Separator logic: Add line between Friday and Monday
            let separator = '';
            if (index > 0 && item.label === 'Senin' && DATES[index - 1].label === 'Jumat') {
                separator = `<div style="width: 1px; height: 24px; background: var(--border); margin: auto 4px;"></div>`;
            }

            return `
                            ${separator}
                            <div class="tab-item ${isActive ? 'active' : ''}" 
                                 onclick="window.selectScheduleDate('${item.value}')"
                                 style="padding: 8px 16px; min-width: 100px;">
                                <div style="font-weight: 700; font-size: 1rem;">${item.display}</div>
                                <div style="font-size: 0.75rem; opacity: 0.6;">${item.label}</div>
                                ${hasSchedule ? `<div style="margin-top: 4px; width: 4px; height: 4px; background: var(--success); border-radius: 50%; display: inline-block;"></div>` : ''}
                            </div>
                        `;
        }).join('')}
                    </div>
                </div>

            <div class="card">
                <div class="schedule-info" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0.75rem; background: var(--bg); border-radius: 8px;">
                    <div>
                        <strong>${dateObj.display} (${selectedDay})</strong>
                        <span style="margin-left: 1.5rem; color: var(--text-muted);">
                            ${ROOMS.length} Ruangan × ${times.length} Sesi
                        </span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        <span style="display: inline-block; width: 12px; height: 12px; background: var(--success); border-radius: 2px; margin-right: 4px;"></span> Terisi
                        <span style="display: inline-block; width: 12px; height: 12px; background: var(--border); border-radius: 2px; margin: 0 4px 0 12px;"></span> Kosong
                    </div>
                </div>

                <!-- Room-based Grid (Times as columns, Rooms as rows) -->
                <div class="room-schedule-grid" style="display: grid; grid-template-columns: 80px repeat(${times.length}, 1fr); gap: 6px; width: 100%;">
                    <!-- Header Row -->
                    <div style="font-weight: 600; padding: 0.75rem 0.5rem; text-align: center; background: var(--card-bg); border-radius: 6px;">Ruangan</div>
                    ${times.map(time => `
                        <div style="font-weight: 600; padding: 0.75rem 0.5rem; text-align: center; background: var(--card-bg); border-radius: 6px; font-size: 0.9rem;">
                            ${time}
                        </div>
                    `).join('')}
                    
                    <!-- Room Rows -->
                    ${rooms.map(room => `
                        <div style="font-weight: 600; padding: 0.75rem 0.5rem; display: flex; align-items: center; justify-content: center; background: var(--card-bg); border-radius: 6px;">
                            ${room}
                        </div>
                        ${times.map(time => {
            const slot = MOCK_DATA.slots.find(s =>
                s.date === currentDate &&
                s.time === time &&
                s.room === room
            );

            return `
                                <div class="room-slot ${slot ? 'slot-filled' : 'slot-empty'}" 
                                     draggable="${slot ? 'true' : 'false'}"
                                     ondragstart="window.onDragStart(event, '${slot?.student || ''}', '${currentDate}', '${time}', '${room}')"
                                     ondragover="window.onDragOver(event)"
                                     ondragleave="window.onDragLeave(event)"
                                     ondrop="window.onDrop(event, '${currentDate}', '${time}', '${room}')"
                                     style="padding: 0.6rem; border-radius: 8px; min-height: 100px; 
                                            background: ${slot ? '#ffffff' : 'var(--card-bg)'};
                                            border: 1px solid ${slot ? 'var(--border)' : 'transparent'};
                                            ${slot ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-left: 4px solid var(--success);' : 'background: var(--bg-subtle);'}
                                            transition: all 0.2s; cursor: ${slot ? 'pointer' : 'default'}; position: relative;"
                                     ${slot ? `onclick="window.viewSlotDetails('${currentDate}', '${time}', '${room}')"` : ''}
                                     onmouseover="if(this.classList.contains('slot-filled')) { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1)'; }"
                                     onmouseout="if(this.classList.contains('slot-filled')) { this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; }">
                                    ${slot ? `
                                        <div style="display: flex; flex-direction: column; height: 100%;">
                                            <div style="position: absolute; top: 4px; right: 4px; display: flex; gap: 4px; z-index: 10;">
                                                <button onclick="event.stopPropagation(); window.moveSlotToClipboard('${slot.student}')" 
                                                        style="background: rgba(0,113,227,0.1); border: none; width: 18px; height: 18px; border-radius: 50%; color: var(--primary); font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;"
                                                        class="delete-slot-btn" title="Pindah Jadwal (Antar Hari)">📍</button>
                                                <button onclick="event.stopPropagation(); window.deleteSlot('${currentDate}', '${time}', '${room}')" 
                                                        style="background: rgba(255,59,48,0.1); border: none; width: 18px; height: 18px; border-radius: 50%; color: var(--danger); font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;"
                                                        class="delete-slot-btn" title="Hapus Jadwal">✕</button>
                                            </div>
                                            <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed var(--border);">
                                                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); line-height: 1.3;">${slot.student || 'Mahasiswa'}</div>
                                            </div>
                                            
                                            <div style="font-size: 0.75rem; flex-grow: 1; display: flex; flex-direction: column; gap: 3px;">
                                                ${slot.examiners && slot.examiners.length >= 3 ? `
                                                    <div style="display: flex; gap: 6px; align-items: baseline;">
                                                        <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: 600; min-width: 14px;">P1</span>
                                                        <span style="color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slot.examiners[0]}</span>
                                                    </div>
                                                    <div style="display: flex; gap: 6px; align-items: baseline;">
                                                        <span style="color: var(--text-muted); font-size: 0.65rem; font-weight: 600; min-width: 14px;">P2</span>
                                                        <span style="color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slot.examiners[1]}</span>
                                                    </div>
                                                    <div style="margin-top: 2px; display: flex; gap: 6px; align-items: baseline; color: var(--primary);">
                                                        <span style="font-size: 0.65rem; font-weight: 700; min-width: 14px;">Pb</span>
                                                        <span style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${slot.examiners[2]}</span>
                                                    </div>
                                                ` : '<div style="color: var(--text-muted); font-style: italic;">Data dosen tidak lengkap</div>'}
                                            </div>
                                        </div>
                                    ` : `
                                        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border: 2px dashed ${MOCK_DATA.clipboard ? 'var(--primary)' : 'var(--border)'}; border-radius: 6px; background: ${MOCK_DATA.clipboard ? 'var(--primary-subtle)' : 'rgba(255,255,255,0.4)'}; color: ${MOCK_DATA.clipboard ? 'var(--primary)' : 'var(--text-muted)'}; transition: all 0.2s; cursor: ${MOCK_DATA.clipboard ? 'pointer' : 'default'};"
                                             ${MOCK_DATA.clipboard ? `onclick="window.pasteSlotFromClipboard('${currentDate}', '${time}', '${room}')"` : ''}>
                                             <span style="font-size: 1.2rem; opacity: 0.8;">${MOCK_DATA.clipboard ? '📋' : '+'}</span>
                                             <span style="font-size: 0.75rem; font-weight: 500; opacity: 1;">${MOCK_DATA.clipboard ? 'Tempel Di Sini' : 'Tersedia'}</span>
                                        </div>
                                    `}
                                </div>
                            `;
        }).join('')}
                    `).join('')}
                </div>
            </div>
        `;
    },
    dosen: () => {
        // Tab Navigation Helper
        const renderTab = (tabId, label) => `
            <div class="tab-item ${currentDosenTab === tabId ? 'active' : ''}" onclick="window.switchDosenTab('${tabId}')">
                ${label}
            </div>
        `;

        // Table Helper dengan Sorting
        // headersDef: Array of { label: 'Header', key: 'propertyKey' } or string 'Header'
        const renderTable = (headersDef, rows) => `
            <div class="dosen-list-container">
                <table>
                    <thead>
                        <tr>
                            ${headersDef.map(h => {
            const label = typeof h === 'object' ? h.label : h;
            const key = typeof h === 'object' ? h.key : null;
            const sortIcon = sortColumn === key ? (sortDirection === 'asc' ? '↑' : '↓') : '';
            const cursorStyle = key ? 'cursor:pointer; user-select:none;' : '';
            const clickAttr = key ? `onclick="window.sortTable('${key}')"` : '';
            const widthStyle = typeof h === 'object' && h.width ? `width: ${h.width};` : '';
            return `<th style="${cursorStyle} ${widthStyle}" ${clickAttr} title="${key ? 'Klik untuk urutkan' : ''}">${label} ${sortIcon}</th>`;
        }).join('')}
        </tr>
                    </thead>
                    <tbody>
                        ${rows.length > 0 ? rows.map(rowData => {
            // Support for complex row with custom style
            // Format: { content: [...], style: '...' } OR just [...]
            const isComplex = !Array.isArray(rowData) && rowData.content;
            const cells = isComplex ? rowData.content : rowData;
            const rowStyle = isComplex && rowData.style ? `style="${rowData.style}"` : '';
            const rowClass = isComplex && rowData.className ? `class="${rowData.className}"` : '';

            return `
                            <tr ${rowClass} ${rowStyle}>
                                ${cells.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                            `;
        }).join('') : `<tr><td colspan="${headersDef.length}" style="text-align:center; color:var(--text-muted); padding:2rem;">Tidak ada data yang cocok</td></tr>`}
                    </tbody>
                </table>
            </div>
        `;

        let content = '';

        if (currentDosenTab === 'sdm') {
            const data = MOCK_DATA.masterDosen || [];
            if (data.length > 0) {
                const filtered = filterData(data, searchTerm);
                // Default sort by nama if null
                const sorted = sortData(filtered, sortColumn || 'nama', sortDirection);

                const rows = sorted.map(d => [
                    d.nik, d.status, `<strong>${d.nama}</strong>`, d.kategori, d.nidn, d.jenisKelamin
                ]);

                const headers = [
                    // No column removed

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
                            <input type="text" 
                                class="search-input" 
                                placeholder="Cari data SDM..." 
                                value="${searchTerm}" 
                                oninput="window.handleSearchInput(event)">
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="badge badge-primary" style="padding: 10px 16px;">Total: ${filtered.length} Data</div>
                            <button onclick="window.triggerImportSDM()" class="btn-secondary" style="padding: 10px 16px;">Import CSV</button>
                            <button onclick="window.exportSDMData()" class="btn-primary" style="padding: 10px 16px;">Export CSV</button>
                            <input type="file" id="importSDMInput" accept=".csv" style="display:none;" onchange="window.handleImportSDM(event)">
                        </div>
                    </div>
                    <div style="min-height: 500px;">
                        ${renderTable(headers, rows)}
                    </div>
                `;
            } else {
                content = `<div class="empty-state"><h3>Memuat Data SDM...</h3></div>`;
            }
        } else {
            const faculty = currentDosenTab.toUpperCase();
            const allFacultyData = MOCK_DATA.facultyData[faculty] || [];

            if (allFacultyData.length > 0) {
                // Filter by selected Prodi
                let data = allFacultyData;
                if (selectedProdiFilter) {
                    data = data.filter(d => d.prodi === selectedProdiFilter);
                }

                // Filter by Status Jadwal
                if (selectedStatusFilter === 'active') {
                    data = data.filter(d => !d.exclude);
                } else if (selectedStatusFilter === 'off') {
                    data = data.filter(d => d.exclude);
                }

                const filtered = filterData(data, searchTerm);
                const sorted = sortData(filtered, sortColumn || 'nomor', sortDirection);

                const rows = sorted.map(d => {
                    const m = d.matchResult || { matched: false };
                    let statusBadge = '<span class="badge badge-danger">Unmatched</span>';
                    // Use text-truncate with title for full name on hover
                    let nameDisplay = `<div class="text-truncate" title="${d.nama}"><strong>${d.nama}</strong></div>`;

                    if (m.matched) {
                        statusBadge = `<span class="badge badge-success">✓ Valid SDM</span>`;
                        // if (d.originalNama && d.originalNama !== d.nama) {
                        //     // User request: Don't show original name details
                        // }
                    }

                    // Logic Toggle Jadwal
                    // Default: include (exclude = false/undefined) -> Switch ON
                    const isIncluded = !d.exclude;

                    const toggleSwitch = `
                        <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                            <label class="switch">
                                <input type="checkbox" ${isIncluded ? 'checked' : ''} 
                                    onchange="window.toggleDosenScheduling('${faculty}', '${d.nik}')">
                                <span class="slider"></span>
                            </label>
                            <span style="font-size:0.7rem; color:${isIncluded ? 'var(--success)' : 'var(--text-muted)'}; font-weight:700; letter-spacing:0.02em;">
                                ${isIncluded ? 'ACTIVE' : 'OFF'}
                            </span>
                        </div>
                    `;

                    const rowCells = [
                        // d.nomor removed
                        `<div>${d.nik}</div>`,
                        nameDisplay,
                        d.prodi,
                        `<div>${statusBadge}</div>`,
                        toggleSwitch,
                        `<div style="text-align:center;">
                            <button onclick="window.deleteDosen('${faculty}', '${d.nik}')" style="background:none; border:none; cursor:pointer; font-size:1rem;" title="Hapus Dosen">🗑️</button>
                         </div>`
                    ];

                    // Jika OFF (isIncluded == false), beri class khusus
                    if (!isIncluded) {
                        return {
                            content: rowCells,
                            className: 'excluded-row'
                        };
                    }

                    return rowCells;
                });

                const headers = [
                    // { label: 'No', key: 'nomor', width: '60px' },

                    { label: 'NIK', key: 'nik', width: '120px' },
                    { label: 'Nama Dosen', key: 'nama', width: '30%' },
                    { label: 'Prodi', key: 'prodi', width: '20%' },
                    { label: 'Status Validasi', key: null, width: '150px' },
                    { label: 'Jadwalkan', width: '80px', key: 'exclude' },
                    { label: 'Aksi', width: '60px', key: null, align: 'center' }
                ];

                // Get unique Prodis for selector
                const prodis = [...new Set(allFacultyData.map(d => d.prodi).filter(p => p && p !== '-'))].sort();

                content = `
                    <div class="controls-bar">
                        <div style="display: flex; gap: 12px; flex: 1; align-items: center;">
                             <select onchange="window.handleProdiFilterChange(event)" class="form-select">
                                 <option value="">Semua Program Studi</option>
                                 ${prodis.map(p => `<option value="${p}" ${selectedProdiFilter === p ? 'selected' : ''}>${p}</option>`).join('')}
                             </select>
                             <select onchange="window.handleStatusFilterChange(event)" class="form-select" style="max-width: 150px;">
                                 <option value="all" ${selectedStatusFilter === 'all' ? 'selected' : ''}>Semua Status</option>
                                 <option value="active" ${selectedStatusFilter === 'active' ? 'selected' : ''}>Hanya Active</option>
                                 <option value="off" ${selectedStatusFilter === 'off' ? 'selected' : ''}>Hanya OFF</option>
                             </select>
                             <div class="search-container" style="max-width: 350px;">
                                <span class="search-icon">🔍</span>
                                <input type="text" 
                                    class="search-input" 
                                    placeholder="Cari NIK, Nama..." 
                                    value="${searchTerm}" 
                                    oninput="window.handleSearchInput(event)">
                             </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                           <div class="badge badge-primary" style="padding: 10px 16px; font-size: 0.85rem;">Total: ${filtered.length} Dosen</div>
                           ${currentDosenTab === 'sdm' ? `
                                <button onclick="window.triggerImportSDM()" class="btn-secondary" style="padding: 10px 16px;">Import CSV</button>
                                <button onclick="window.exportSDMData()" class="btn-primary" style="padding: 10px 16px;">Export CSV</button>
                           ` : `
                                <button onclick="window.toggleAddDosenModal(true)" class="btn-primary" style="padding: 10px 18px;">+ Tambah Dosen</button>
                                <button onclick="window.processMatching(); window.switchDosenTab('${currentDosenTab}')" class="btn-secondary" style="padding: 10px 14px;" title="Refresh Sinkronisasi Data">🔄</button>
                           `}
                        </div>
                    </div>
                    <div style="min-height: 500px;">
                        ${renderTable(headers, rows)}
                    </div>
                `;
            } else {
                content = `
                    <div class="empty-state">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                        <h3>Memuat Data ${faculty}...</h3>
                        <p style="color: var(--text-muted);">Sedang sinkronisasi file CSV.</p>
                    </div>
                `;
            }
        }

        return `
            <div class="container">
                <header class="page-header">
                    <div class="header-info">
                        <h1>Dosen</h1>
                        <p class="subtitle">Database dan validasi data SDM.</p>
                    </div>
                </header>

                <div class="tabs" style="margin-bottom: 2rem;">
                    ${renderTab('fik', 'Dosen FIK')}
                    ${renderTab('fes', 'Dosen FES')}
                    ${renderTab('fst', 'Dosen FST')}
                    <div style="width: 1px; height: 20px; background: rgba(0,0,0,0.1); margin: auto 12px;"></div>
                    ${renderTab('sdm', 'Data SDM')}
                </div>

                <div class="card" style="padding: 1.5rem; background: white;">
                    ${content}
                </div>
            </div>
        `;
    },
    mahasiswa: () => {
        let data = MOCK_DATA.mahasiswa;
        if (searchTerm) {
            data = filterData(data, searchTerm);
        }
        const sortedMahasiswa = [...data].sort((a, b) => a.nim.localeCompare(b.nim));

        return `
            <div class="container">
                <header class="page-header">
                    <div class="header-info">
                        <h1>Mahasiswa</h1>
                        <p class="subtitle">Manajemen peserta sidang pendadaran.</p>
                    </div>
                    <div class="header-actions">
                        <button onclick="window.wipeMahasiswaData()" class="btn-secondary" style="background: rgba(255, 59, 48, 0.1); color: var(--danger); border: 1px solid rgba(255, 59, 48, 0.2); margin-right: 8px;">
                            🗑️ Hapus Semua
                        </button>
                        <button onclick="window.generateSchedule()" class="btn-primary">⚡ Proses Semua Jadwal</button>
                        <button onclick="window.toggleAddMahasiswaModal(true)" class="btn-secondary">+ Tambah Mahasiswa</button>
                    </div>
                </header>

                <div class="controls-bar">
                    <div class="search-container">
                        <span class="search-icon">🔍</span>
                        <input type="text" 
                            class="search-input"
                            placeholder="Cari NIM, Nama, atau Pembimbing..." 
                            value="${searchTerm}" 
                            oninput="window.handleSearchInput(event)">
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="badge badge-primary" style="padding: 10px 16px;">Total: ${sortedMahasiswa.length} Peserta</div>
                    </div>
                </div>

                <div class="table-container">
                    ${sortedMahasiswa.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 140px;">NIM</th>
                                <th>Mahasiswa</th>
                                <th>Program Studi</th>
                                <th>Dosen Pembimbing</th>
                                <th style="width: 220px;">Jadwal Terdaftar</th>
                                <th style="width: 80px; text-align: center;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tbody>
                            ${(() => {
                    const allDosen = getAllDosen();
                    return sortedMahasiswa.map(m => {
                        const schedule = MOCK_DATA.slots.find(s => s.student === m.nama);

                        // Validation Pembimbing
                        let pembimbingDisplay = m.pembimbing || '-';
                        if (m.pembimbing) {
                            const pbData = allDosen.find(d => d.nama === m.pembimbing);
                            if (!pbData) {
                                pembimbingDisplay = `<div style="color:var(--text-main);">${m.pembimbing} <span title="Data dosen tidak ditemukan! Mohon cek data dosen." style="color:var(--danger); cursor:help; font-size:0.8rem;">⚠️ (Hilang)</span></div>`;
                            } else if (pbData.exclude) {
                                pembimbingDisplay = `<div style="color:var(--text-main);">${m.pembimbing} <span title="Status Dosen OFF (Tidak bisa dijadwalkan)" class="badge badge-danger" style="font-size:0.6rem; vertical-align:middle; margin-left:4px;">OFF</span></div>`;
                            } else {
                                pembimbingDisplay = `<div style="font-weight: 500;">${m.pembimbing}</div>`;
                            }
                        }

                        return `
                                <tr>
                                    <td><div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-muted);">${m.nim}</div></td>
                                    <td><div style="font-weight: 700; color: var(--text-main);">${m.nama}</div></td>
                                    <td><span class="badge" style="background: #f0f0f5; color: #555;">${m.prodi}</span></td>
                                    <td>${pembimbingDisplay}</td>
                                    <td>
                                        ${schedule ? `
                                            <div onclick="window.viewAndHighlightSchedule('${m.nama}')" 
                                                 style="cursor: pointer; padding: 10px 14px; border-radius: 12px; background: #e8f5e9; border: 1px solid #c8e6c9; transition: all 0.2s;"
                                                 onmouseover="this.style.background='#def2e1'" onmouseout="this.style.background='#e8f5e9'">
                                                <div style="font-weight: 700; font-size: 0.85rem; color: #2e7d32; display: flex; align-items: center; gap: 6px;">
                                                    📅 ${DATES.find(d => d.value === schedule.date)?.display || schedule.date}
                                                </div>
                                                <div style="font-size: 0.75rem; color: #666; margin-top: 4px; font-weight: 500;">${schedule.time} • Room ${schedule.room}</div>
                                            </div>
                                        ` : `
                                            <button onclick="window.scheduleIndividualStudent('${m.nim}')" 
                                                    class="btn-secondary" style="font-size: 0.8rem; width: 100%; border: 1px dashed var(--primary); color: var(--primary); background: transparent;">
                                                ⚡ Jadwal Otomatis
                                            </button>
                                        `}
                                    </td>
                                    <td style="text-align: center;">
                                        <button onclick="window.deleteMahasiswa('${m.nim}')" style="background: transparent; color: var(--danger); font-size: 1.1rem; padding: 4px;">🗑️</button>
                                    </td>
                                </tr>
                            `}).join('');
                })()}
                        </tbody>
                    </table>
                    ` : `
                    <div style="padding: 6rem 2rem; text-align: center; background: white;">
                        <div style="font-size: 4rem; margin-bottom: 2rem; opacity: 0.2;">🎓</div>
                        <h3 style="color: var(--text-muted); font-weight: 500;">Belum ada data mahasiswa terdaftar</h3>
                        <button onclick="window.toggleAddMahasiswaModal(true)" style="margin-top: 1.5rem;" class="btn-primary">+ Tambah Mahasiswa</button>
                    </div>
                    `}
                </div>
            </div>
        `;
    },
    libur: () => {
        const renderConstraint = (l) => {
            if (!l.type || l.type === 'date') {
                const dObj = DATES.find(d => d.value === l.date);
                return `<span class="badge badge-warning">Tanggal</span> ${dObj ? dObj.display : l.date}`;
            }
            if (l.type === 'range') {
                const sObj = DATES.find(d => d.value === l.start);
                const eObj = DATES.find(d => d.value === l.end);
                return `<span class="badge badge-danger">Rentang</span> ${sObj?.display || l.start} s/d ${eObj?.display || l.end}`;
            }
            if (l.type === 'recurring') {
                const daysStr = l.days ? l.days.join(', ') : 'Semua Hari';
                const timesStr = l.times && l.times.length > 0 ? l.times.join(', ') : '<b>FULL DAY</b>';
                return `<span class="badge badge-primary">Rutin</span> Hari <b>${daysStr}</b> jam ${timesStr}`;
            }
            return '-';
        };

        return `
            <div class="container">
                <header class="page-header">
                    <div class="header-info">
                        <h1>Ketersediaan</h1>
                        <p class="subtitle">Pengaturan absensi dan waktu libur.</p>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="window.resetLiburData()" class="btn-secondary" style="background:rgba(255, 59, 48, 0.1); color:var(--danger); border:1px solid rgba(255,59,48,0.2);">
                            🗑️ Reset Default
                        </button>
                        <button onclick="window.toggleAddLiburModal(true)" class="btn-primary">+ Tambah Aturan Baru</button>
                    </div>
                </header>

                <div class="card" style="background: #fffdf2; border: 1px solid #ffe082; padding: 1.5rem 2rem; border-radius: 20px;">
                    <div style="display: flex; gap: 1.25rem; align-items: center;">
                        <div style="font-size: 2rem;">💡</div>
                        <div style="font-size: 1rem; line-height: 1.6; color: #795548; font-weight: 500;">
                            <strong>Tips Penjadwalan:</strong> Gunakan <b>Aturan Rutin</b> untuk memblokir hari tertentu setiap minggu. 
                            Dosen dengan status <span class="badge badge-danger" style="font-size:0.7rem;">OFF</span> di Data Dosen otomatis tidak akan diberikan jadwal.
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    ${MOCK_DATA.libur.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama Dosen</th>
                                    <th>Jenis Aturan</th>
                                    <th>Keterangan / Alasan</th>
                                    <th style="text-align:center;">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${MOCK_DATA.libur.map((l, index) => {
            // Logic Lookup Dosen (Support ID atau Nama)
            // Prioritas: 1. Lookup by ID, 2. Lookup by Name, 3. Fallback name
            let dosen = null;
            let displayNama = '';

            if (l.dosenId) {
                // Legacy: Lookup by NIK/ID
                dosen = getAllDosen().find(d => d.nik === l.dosenId);
                displayNama = dosen ? dosen.nama : `<span style="color:red;">Unknown ID (${l.dosenId})</span>`;
            } else if (l.nama) {
                // New: Lookup by Name string
                // Normalisasi nama (trim) untuk pencarian
                const searchName = l.nama.trim();
                dosen = getAllDosen().find(d => d.nama.trim() === searchName);
                displayNama = dosen ? dosen.nama : l.nama; // Fallback ke nama text jika tidak ketemu object dosennya
            }

            const htmlNama = dosen
                ? `<strong>${dosen.nama}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${dosen.prodi}</span>`
                : `<strong>${displayNama}</strong><br><span style="font-size:0.8rem; color: #f59e0b;">(Data Dosen Tidak Ditemukan)</span>`;

            return `
                                        <tr>
                                            <td>${htmlNama}</td>
                                            <td>${renderConstraint(l)}</td>
                                            <td>${l.reason}</td>
                                            <td style="text-align: center;">
                                                <button onclick="window.toggleAddLiburModal(true, ${index})" style="color: var(--primary); background: none; border: none; cursor: pointer; margin-right: 8px;" title="Edit Aturan">✏️</button>
                                                <button onclick="window.deleteLibur(${index})" style="color: var(--danger); background: none; border: none; cursor: pointer;" title="Hapus Aturan">🗑️</button>
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    ` : `
                        <div class="empty-state" style="padding: 4rem 2rem; text-align: center;">
                            <div style="font-size: 5rem; margin-bottom: 1.5rem; opacity: 0.15; filter: grayscale(100%);">
                                📅
                            </div>
                            <h3 style="margin-bottom: 0.75rem; color: var(--text-main); font-size: 1.5rem; font-weight: 700;">
                                Belum Ada Aturan Ketersediaan
                            </h3>
                            <p style="color: var(--text-muted); margin-bottom: 2rem; max-width: 550px; margin-left: auto; margin-right: auto; line-height: 1.6; font-size: 0.95rem;">
                                Semua dosen dianggap <strong style="color: var(--success);">TERSEDIA</strong> setiap saat kecuali jika ada jadwal bentrok.<br>
                                Tambahkan aturan ketersediaan untuk mengatur waktu libur atau ketidaktersediaan dosen.
                            </p>
                            <button onclick="window.toggleAddLiburModal(true)" class="btn-primary">
                                <span style="font-size: 1.2rem;">+</span>
                                <span>Tambah Aturan Pertama</span>
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },
    logic: () => `
        <div class="container" style="max-width: 100%; padding: 0 1.5rem 1.5rem 1.5rem; height: calc(100vh - 100px); display: flex; flex-direction: column;">
            
            <!-- 1. UNIFIED COMMAND BAR (Top) -->
            <div style="
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                background: rgba(255, 255, 255, 0.8); 
                backdrop-filter: blur(20px); 
                -webkit-backdrop-filter: blur(20px);
                padding: 0.75rem 1rem; 
                border-radius: 16px; 
                border: 1px solid rgba(255,255,255,0.4);
                box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                margin-bottom: 1rem;
                flex-shrink: 0;
            ">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2rem;">⚙️</span>
                        <h2 style="font-size: 1rem; margin: 0; font-weight: 700; color: var(--text-main);">Logic Control</h2>
                    </div>
                    
                    <div style="width: 1px; height: 24px; background: var(--border); margin: 0 4px;"></div>

                    <!-- Scope Filter -->
                    <select id="scheduleScope" style="
                        background: rgba(0,0,0,0.04); 
                        border: none; 
                        padding: 8px 12px; 
                        border-radius: 8px; 
                        font-family: inherit; 
                        font-size: 0.85rem; 
                        color: var(--text-main); 
                        font-weight: 500;
                        outline: none;
                        cursor: pointer;
                        min-width: 180px;
                    ">
                        <option value="all">Semua Mahasiswa (${MOCK_DATA.mahasiswa.length})</option>
                        ${[...new Set(MOCK_DATA.mahasiswa.map(m => m.prodi))].sort().map(p =>
        `<option value="${p}">${p}</option>`
    ).join('')}
                    </select>

                    <!-- Incremental Toggle Pill -->
                    <label style="
                        display: flex; 
                        align-items: center; 
                        gap: 8px; 
                        background: rgba(0,0,0,0.04); 
                        padding: 6px 12px; 
                        border-radius: 20px; 
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(0,0,0,0.08)'" onmouseout="this.style.background='rgba(0,0,0,0.04)'">
                        <input type="checkbox" id="incrementalMode" style="accent-color: var(--primary); transform: scale(1.1);">
                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Incremental Mode</span>
                    </label>
                </div>

                <!-- Run Button -->
                <button onclick="window.generateSchedule()" 
                        class="btn-primary"
                        style="
                            padding: 0.6rem 1.5rem; 
                            font-size: 0.9rem; 
                            display: flex; 
                            align-items: center; 
                            gap: 8px; 
                            border-radius: 10px;
                            box-shadow: 0 4px 12px var(--primary-subtle);
                        ">
                    <span style="font-size: 1rem;">▶</span> JALANKAN ENGINE
                </button>
            </div>

            <!-- 2. DASHBOARD GRID (Main Content) -->
            <div style="display: grid; grid-template-columns: 3fr 1fr; gap: 1rem; flex: 1; overflow: hidden;">
                
                <!-- LEFT COLUMN: Terminal (Takes most space) -->
                <div class="card" style="
                    background: #1e1e1e; 
                    padding: 0; 
                    border: 1px solid #333; 
                    display: flex; 
                    flex-direction: column; 
                    overflow: hidden;
                    box-shadow: var(--shadow-md);
                ">
                    <!-- Terminal Header -->
                    <div style="
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                        padding: 0.6rem 1rem; 
                        background: #252526; 
                        border-bottom: 1px solid #333;
                    ">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #ccc; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">root@scheduler:~/runtime_logs</span>
                        </div>
                        <button onclick="document.getElementById('logicLog').innerHTML = ''" 
                                style="background: transparent; border: 1px solid #444; color: #888; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; cursor: pointer;">
                            CLEAR
                        </button>
                    </div>

                    <!-- Terminal Body -->
                    <div id="logicLog" style="
                        flex: 1; 
                        overflow-y: auto; 
                        padding: 1rem; 
                        font-family: 'JetBrains Mono', 'Consolas', monospace; 
                        font-size: 0.85rem; 
                        line-height: 1.6; 
                        color: #d4d4d4;
                    ">
                        <div style="opacity: 0.5;">Waiting for command...</div>
                    </div>
                </div>

                <!-- RIGHT COLUMN: Inspector Sidebar -->
                <div style="display: flex; flex-direction: column; gap: 1rem; overflow-y: auto;">
                    
                    <!-- Status Card -->
                    <div class="card" style="padding: 1.25rem;">
                        <h3 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">System Status</h3>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 12px; height: 12px; background: var(--success); border-radius: 50%; box-shadow: 0 0 8px var(--success);"></div>
                            <span style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">ENGINE IDLE</span>
                        </div>
                    </div>

                    <!-- Constraints -->
                    <div class="card" style="padding: 1.25rem; flex: 1;">
                        <h3 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 1rem;">Active Constraints</h3>
                        
                            <!-- Section: Hard Constraints (Wajib) -->
                            <div style="margin-bottom: 0.5rem;">
                                <div style="font-size: 0.7rem; font-weight: 800; color: var(--danger); text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                                    <span style="display: block; width: 6px; height: 6px; background: var(--danger); border-radius: 50%;"></span>
                                    ATURAN WAJIB (HARD)
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 10px; border-left: 2px solid rgba(255, 59, 48, 0.1);">
                                    
                                    <div style="display: flex; gap: 8px; align-items: start;">
                                        <div style="color: var(--success); font-size: 0.8rem;">✓</div>
                                        <div>
                                            <div style="font-size: 0.8rem; font-weight: 600;">Anti-Double Booking</div>
                                            <div style="font-size: 0.7rem; opacity: 0.7;">Dosen tidak boleh menguji ditempat lain di waktu yang sama.</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; gap: 8px; align-items: start;">
                                        <div style="color: var(--success); font-size: 0.8rem;">✓</div>
                                        <div>
                                            <div style="font-size: 0.8rem; font-weight: 600;">Dosen Availability</div>
                                            <div style="font-size: 0.7rem; opacity: 0.7;">Cek ketersediaan hari dosen (Libur/Off).</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; gap: 8px; align-items: start;">
                                        <div style="color: var(--success); font-size: 0.8rem;">✓</div>
                                        <div>
                                            <div style="font-size: 0.8rem; font-weight: 600;">Prodi Matching</div>
                                            <div style="font-size: 0.7rem; opacity: 0.7;">Penguji FES vs FST harus sesuai prodi mahasiswa.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section: Soft Constraints (Opsional/Optimasi) -->
                            <div style="margin-top: 1rem;">
                                <div style="font-size: 0.7rem; font-weight: 800; color: var(--warning); text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                                    <span style="display: block; width: 6px; height: 6px; background: var(--warning); border-radius: 50%;"></span>
                                    OPTIMASI (SOFT)
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 10px; border-left: 2px solid rgba(255, 159, 10, 0.1);">
                                    
                                    <div style="display: flex; gap: 8px; align-items: start;">
                                        <div style="color: var(--warning); font-size: 0.8rem;">⚖️</div>
                                        <div>
                                            <div style="font-size: 0.8rem; font-weight: 600;">Fair Load Balancing</div>
                                            <div style="font-size: 0.7rem; opacity: 0.7;">Prioritas dosen dengan beban terendah (Least-Loaded First) agar rata.</div>
                                        </div>
                                    </div>

                                    <div style="display: flex; gap: 8px; align-items: start;">
                                        <div style="color: var(--warning); font-size: 0.8rem;">⚡</div>
                                        <div>
                                            <div style="font-size: 0.8rem; font-weight: 600;">Sequential Filling</div>
                                            <div style="font-size: 0.7rem; opacity: 0.7;">Mengisi slot pagi terlebih dahulu sebelum sore.</div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                            <h3 style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 0.5rem;">Algorithm</h3>
                            <div style="font-family: monospace; font-size: 0.8rem; background: var(--bg); padding: 8px; border-radius: 6px;">
                                fair_greedy_allocator_v3
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
`,

};

function navigate(page) {
    currentView = page;
    appState.currentView = page;
    // Reset searching and sorting when navigating away from dosen page
    if (page !== 'dosen') {
        sortColumn = null;
        appState.sortColumn = null;
        sortDirection = 'asc';
        appState.sortDirection = 'asc';
        searchTerm = '';
        appState.searchTerm = '';
    }

    // Update Active Link
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Render Content
    if (views && views[page]) {
        try {
            const html = views[page]();
            if (mainContent) {
                mainContent.innerHTML = html;
            } else {
                console.error('mainContent element not found!');
            }
        } catch (err) {
            console.error('Error rendering view:', page, err);
            if (mainContent) mainContent.innerHTML = `<div class="container"><div class="card"><h2>Error Rendering Page</h2><p>${err.message}</p></div></div>`;
        }
    } else {
        console.error('View not found or views not defined:', page);
    }
}

// Global function for tab switching
window.switchDosenTab = (tabId) => {
    currentDosenTab = tabId;
    appState.currentDosenTab = tabId;
    sortColumn = null;  // Reset sorting when switching tabs
    appState.sortColumn = null;
    sortDirection = 'asc';
    appState.sortDirection = 'asc';
    searchTerm = ''; // Reset search when switching tabs
    appState.searchTerm = '';
    if (currentView === 'dosen') {
        mainContent.innerHTML = views.dosen();
    }
};

// Global function for sorting table
window.sortTable = (column) => {
    if (sortColumn === column) {
        // Toggle direction if same column
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        // New column, default to ascending
        sortColumn = column;
        sortDirection = 'asc';
    }

    // Sync to appState for helpers
    appState.sortColumn = sortColumn;
    appState.sortDirection = sortDirection;

    // Re-render the dosen view with sorted data
    if (currentView === 'dosen') {
        mainContent.innerHTML = views.dosen();
    } else if (currentView === 'mahasiswa') {
        mainContent.innerHTML = views.mahasiswa();
    }
};

// Global search function
window.performSearch = () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchTerm = searchInput.value;
        if (currentView === 'dosen') {
            mainContent.innerHTML = views.dosen();
        }
    }
};

// Real-time search saat mengetik
window.handleSearchInput = (e) => {
    searchTerm = e.target.value;
    appState.searchTerm = searchTerm; // Sync
    // Debounce untuk performa lebih baik
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        if (currentView === 'dosen') {
            mainContent.innerHTML = views.dosen();
        } else if (currentView === 'mahasiswa') {
            mainContent.innerHTML = views.mahasiswa();
        }
    }, 300); // Wait 300ms after user stops typing
};

// Schedule day selection
// Schedule composite selection (Week + Day)
// Schedule date selection
window.selectScheduleDate = (date) => {
    selectedDate = date;
    if (currentView === 'home') {
        mainContent.innerHTML = views.home();
    }
};

/* DEPRECATED: Old handlers, kept to avoid immediate breakage if clicked before refresh */
window.selectScheduleDay = () => { };
window.selectScheduleWeek = () => { };

// View slot details
window.viewSlotDetails = (day, time, room) => {
    const slot = MOCK_DATA.slots.find(s =>
        s.day === day &&
        s.time === time &&
        s.room === room
    );

    if (!slot) {
        alert('Slot tidak ditemukan');
        return;
    }

    const details = `
📅 Hari: ${day}
⏰ Waktu: ${time}
🏢 Ruangan: ${room}
👤 Mahasiswa: ${slot.student || '-'}
👨‍🏫 Penguji: ${slot.examiners ? slot.examiners.join(', ') : '-'}
    `.trim();

    alert(details);
};

// Clear search function
window.clearSearch = () => {
    searchTerm = '';
    if (currentView === 'dosen') {
        mainContent.innerHTML = views.dosen();
    }
};

// --- Fitur Tambah Dosen ---

// --- Fitur Tambah Dosen (Hybrid: SDM & Manual) ---

// Helper: Get SDM candidates that are not yet in current faculty
function getSDMCandidates(searchTerm = '') {
    const sdmData = MOCK_DATA.masterDosen || [];
    const currentFaculty = currentDosenTab.toUpperCase();
    const existingDosen = MOCK_DATA.facultyData[currentFaculty] || [];

    // Get NIKs that already exist in current faculty
    const existingNIKs = new Set(existingDosen.map(d => d.nik));

    // Filter SDM data: only Dosen status, not already in faculty
    let candidates = sdmData.filter(sdm =>
        sdm.status && sdm.status.toLowerCase().includes('dosen') &&
        !existingNIKs.has(sdm.nik)
    );

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        candidates = candidates.filter(sdm =>
            (sdm.nama && sdm.nama.toLowerCase().includes(term)) ||
            (sdm.nik && sdm.nik.toLowerCase().includes(term)) ||
            (sdm.nidn && sdm.nidn.toLowerCase().includes(term))
        );
    }

    return candidates;
}

// Helper: Render candidate rows for SDM search
function renderCandidateRows(candidates) {
    if (!candidates || candidates.length === 0) {
        return '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Tidak ada kandidat ditemukan</div>';
    }

    return candidates.map(sdm => `
        <div class="candidate-row" style="padding: 0.75rem; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: background 0.2s;" 
             onmouseover="this.style.background='var(--hover-bg)'" 
             onmouseout="this.style.background='transparent'"
             onclick="window.addDosenFromSDM('${sdm.nik}')">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${sdm.nama}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        NIK: ${sdm.nik} ${sdm.nidn ? '| NIDN: ' + sdm.nidn : ''}
                    </div>
                </div>
                <button type="button" style="padding: 4px 12px; font-size: 0.75rem; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    + Tambah
                </button>
            </div>
        </div>
    `).join('');
}

// Handle search in modal
window.handleSDMSearchInModal = (event) => {
    const searchTerm = event.target.value;
    const candidates = getSDMCandidates(searchTerm).slice(0, 10);
    const listContainer = document.getElementById('sdmCandidatesList');
    if (listContainer) {
        listContainer.innerHTML = renderCandidateRows(candidates);
    }
};

// Add dosen from SDM database
window.addDosenFromSDM = (nik) => {
    const sdmData = MOCK_DATA.masterDosen || [];
    const selectedDosen = sdmData.find(s => s.nik === nik);

    if (!selectedDosen) {
        alert('Dosen tidak ditemukan di database SDM');
        return;
    }

    const currentFaculty = currentDosenTab.toUpperCase();
    const newDosen = {
        nomor: MOCK_DATA.facultyData[currentFaculty].length + 1,
        nama: selectedDosen.nama,
        nik: selectedDosen.nik,
        prodi: '-', // User can edit this later
        fakultas: currentFaculty,
        matchResult: {
            matched: true,
            type: 'manual_sdm',
            score: 100,
            sdm: selectedDosen
        }
    };

    // Add to data
    MOCK_DATA.facultyData[currentFaculty].unshift(newDosen);

    // Refresh view
    mainContent.innerHTML = views.dosen();

    // Close modal
    window.toggleAddDosenModal(false);

    // Show feedback
    // Show feedback
    // alert(`Dosen ${newDosen.nama} berhasil ditambahkan ke ${currentFaculty}!`);
    saveFacultyDataToStorage(); // Save persistence
};

window.toggleAddDosenModal = (show) => {
    const modal = document.getElementById('addDosenModal');
    if (show) {
        // Reset modal content
        if (modal) modal.remove();

        const modalContainer = document.createElement('div');
        modalContainer.id = 'addDosenModal';
        modalContainer.className = 'modal-overlay';
        modalContainer.onclick = (e) => {
            if (e.target.id === 'addDosenModal') window.toggleAddDosenModal(false);
        };

        // Initial View: Search SDM
        renderModalContent(modalContainer, 'search');

        document.body.appendChild(modalContainer);
        setTimeout(() => modalContainer.classList.add('active'), 10);
    } else {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
};

function renderModalContent(container, mode) {
    if (mode === 'search') {
        const candidates = getSDMCandidates().slice(0, 10);
        container.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h2 style="margin-bottom: 1rem;">Tambah Dosen ke ${currentDosenTab.toUpperCase()}</h2>
                <div style="margin-bottom: 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                    <p class="subtitle" style="margin:0;">Cari dari Database SDM (Disarankan)</p>
                    <button class="btn-secondary" style="font-size:0.75rem; padding:4px 8px;" onclick="window.switchModalMode('manual')">Input Manual ➝</button>
                </div>
                
                <div class="form-group">
                    <input type="text" id="sdmSearchInput" class="form-input" placeholder="Cari nama atau NIK..." oninput="window.handleSDMSearchInModal(event)">
                </div>

                <div id="sdmCandidatesList" style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-subtle); border-radius: 8px;">
                    ${renderCandidateRows(candidates)}
                </div>

                <div class="modal-footer">
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-right:auto;">
                        Dosen tidak ditemukan? Gunakan <b>Input Manual</b>.
                    </div>
                    <button type="button" class="btn-secondary" onclick="window.toggleAddDosenModal(false)">Batal</button>
                </div>
            </div>`;
    } else if (mode === 'manual') {
        container.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h2 style="margin-bottom: 1rem;">Input Manual Dosen (${currentDosenTab.toUpperCase()})</h2>
                <div style="margin-bottom: 1.5rem; background: var(--bg); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border);">
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin:0;">
                        ⚠️ <b>Perhatian:</b> Data yang diinput manual akan berstatus <span style="color:#ef4444;">Unmatched</span> sampai data SDM diperbarui oleh admin.
                    </p>
                </div>

                <form onsubmit="window.saveNewDosen(event)">
                    <div class="form-group">
                        <label class="form-label">Nama Lengkap (Termasuk Gelar)</label>
                        <input type="text" name="nama" class="form-input" required placeholder="Contoh: Dr. Budi Santoso, M.Kom">
                    </div>
                    <div class="form-group">
                        <label class="form-label">NIK (Nomor Induk Karyawan)</label>
                        <input type="text" name="nik" class="form-input" required placeholder="Contoh: 190.12.3456">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Program Studi</label>
                        <select name="prodi" class="form-input" required>
                             <option value="" disabled selected>Pilih Prodi...</option>
                             <option value="Informatika">Informatika</option>
                             <option value="Sistem Informasi">Sistem Informasi</option>
                             <option value="Teknologi Informasi">Teknologi Informasi</option>
                             <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                             <option value="Geografi">Geografi</option>
                             <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="window.switchModalMode('search')">⬅ Kembali ke Cari</button>
                        <button type="button" class="btn-secondary" onclick="window.toggleAddDosenModal(false)">Batal</button>
                        <button type="submit">Simpan Manual</button>
                    </div>
                </form>
            </div>`;
    }
}

window.switchModalMode = (mode) => {
    const container = document.getElementById('addDosenModal');
    renderModalContent(container, mode);
};


window.saveNewDosen = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newDosen = {
        nomor: MOCK_DATA.facultyData[currentDosenTab.toUpperCase()].length + 1,
        nama: formData.get('nama'),
        nik: formData.get('nik'),
        prodi: formData.get('prodi'),
        fakultas: currentDosenTab.toUpperCase(),
        matchResult: { matched: false } // Default state
    };

    // Add to data
    MOCK_DATA.facultyData[currentDosenTab.toUpperCase()].unshift(newDosen); // Add to top

    // Re-run matching for this new guy (in case he matches existing SDM data)
    processMatching();

    // Refresh view
    mainContent.innerHTML = views.dosen();

    // Close modal
    window.toggleAddDosenModal(false);

    // Show quick feedback
    // alert(`Dosen ${newDosen.nama} berhasil ditambahkan!`);

    saveFacultyDataToStorage(); // Save persistence
};

window.deleteDosen = (faculty, nik) => {
    // if (confirm('Yakin ingin menghapus dosen ini?')) { // Remove confirm for faster action or keep if desired
    MOCK_DATA.facultyData[faculty] = MOCK_DATA.facultyData[faculty].filter(d => d.nik !== nik);

    // Refresh view
    if (currentView === 'dosen') {
        mainContent.innerHTML = views.dosen();
    }

    saveFacultyDataToStorage(); // Save persistence
    // }
};

window.wipeMahasiswaData = () => {
    if (confirm('⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data mahasiswa?\n\n(Database akan di-reset ke data awal mahasiswa)')) {
        MOCK_DATA.mahasiswa = [];
        MOCK_DATA.slots = []; // Clear schedules too
        saveMahasiswaToStorage();
        alert('✅ Database mahasiswa berhasil dibersihkan. Halaman akan dimuat ulang.');
        window.location.reload();
    }
};

// --- Fitur Data Mahasiswa ---

window.toggleAddMahasiswaModal = (show) => {
    const modalId = 'addMahasiswaModal';
    let modal = document.getElementById(modalId);

    if (show) {
        if (modal) modal.remove();

        const modalContainer = document.createElement('div');
        modalContainer.id = modalId;
        modalContainer.className = 'modal-overlay';

        // Ambil daftar dosen dari semua fakultas untuk opsi pembimbing
        const allDosen = [
            ...(MOCK_DATA.facultyData.FIK || []),
            ...(MOCK_DATA.facultyData.FES || []),
            ...(MOCK_DATA.facultyData.FST || [])
        ].sort((a, b) => {
            const nameA = a.nama || "";
            const nameB = b.nama || "";
            return nameA.localeCompare(nameB);
        });

        const dosenOptions = allDosen.map(d => `<option value="${d.nama}">${d.nama}</option>`).join('');

        modalContainer.innerHTML = `
            <div class="modal-content">
                <h2 style="margin-bottom: 1rem;">Tambah Data Mahasiswa</h2>
                <form onsubmit="window.saveNewMahasiswa(event)">
                    <div class="form-group">
                        <label class="form-label">NIM</label>
                        <input type="text" name="nim" class="form-input" required placeholder="Contoh: 22.11.1234">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nama Mahasiswa</label>
                        <input type="text" name="nama" class="form-input" required placeholder="Nama Lengkap">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Program Studi</label>
                        <select name="prodi" class="form-input" required style="width:100%; padding: 0.75rem; border:1px solid var(--border); border-radius:10px;">
                             <option value="" disabled selected>Pilih Prodi...</option>
                             <option value="Informatika">Informatika</option>
                             <option value="Sistem Informasi">Sistem Informasi</option>
                             <option value="Teknologi Informasi">Teknologi Informasi</option>
                             <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                             <option value="Geografi">Geografi</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dosen Pembimbing</label>
                         <select name="pembimbing" class="form-input" style="width:100%; padding: 0.75rem; border:1px solid var(--border); border-radius:10px;">
                             <option value="">-- Pilih Pembimbing (Opsional) --</option>
                             ${dosenOptions}
                        </select>
                        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Pastikan data dosen sudah diinput di menu Data Dosen.</p>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="window.toggleAddMahasiswaModal(false)">Batal</button>
                        <button type="submit">Simpan</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modalContainer);
        setTimeout(() => modalContainer.classList.add('active'), 10);
    } else {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
};

window.saveNewMahasiswa = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validasi NIM unik
    const newNim = formData.get('nim');
    if (MOCK_DATA.mahasiswa.some(m => m.nim === newNim)) {
        alert('NIM sudah terdaftar!');
        return;
    }

    const newMahasiswa = {
        nim: newNim,
        nama: formData.get('nama'),
        prodi: formData.get('prodi'),
        pembimbing: formData.get('pembimbing')
    };

    MOCK_DATA.mahasiswa.push(newMahasiswa);

    // Refresh view
    if (currentView === 'mahasiswa') {
        mainContent.innerHTML = views.mahasiswa();
    }

    window.toggleAddMahasiswaModal(false);
    // Optional: alert('Mahasiswa berhasil ditambahkan');
    saveMahasiswaToStorage();
};

window.deleteMahasiswa = (nim) => {
    // if (confirm('Yakin ingin menghapus data mahasiswa ini?')) { // Remove confirm
    MOCK_DATA.mahasiswa = MOCK_DATA.mahasiswa.filter(m => m.nim !== nim);
    if (currentView === 'mahasiswa') {
        mainContent.innerHTML = views.mahasiswa();
    }
    saveMahasiswaToStorage();
    // }
};

window.toggleDosenScheduling = (faculty, nik) => {
    const data = MOCK_DATA.facultyData[faculty];
    if (!data) return;

    const dosen = data.find(d => d.nik === nik);
    if (dosen) {
        // Toggle status exclude
        // Jika exclude undefined/false -> jadi true (OFF)
        // Jika exclude true -> jadi false (ON)
        dosen.exclude = !dosen.exclude;

        // Save persistence
        if (typeof saveExcludedDosenToStorage === 'function') {
            saveExcludedDosenToStorage();
        }

        // Refresh view without full reload context
        // Kita hanya perlu update tabel, tapi re-render full view paling aman
        if (currentView === 'dosen') {
            mainContent.innerHTML = views.dosen();
        }
    }
};

window.clearSearch = () => {
    searchTerm = '';
    if (currentView === 'dosen') {
        mainContent.innerHTML = views.dosen();
    }
};

window.deleteSlot = (date, time, room) => {
    if (confirm('Hapus jadwal ini?')) {
        MOCK_DATA.slots = MOCK_DATA.slots.filter(s =>
            !(s.date === date && s.time === time && s.room === room)
        );
        if (currentView === 'home') {
            mainContent.innerHTML = views.home();
        }
    }
};

window.viewAndHighlightSchedule = (studentName) => {
    const slot = MOCK_DATA.slots.find(s => s.student === studentName);
    if (!slot) {
        alert('Jadwal belum tersedia untuk mahasiswa ini.');
        return;
    }

    // Navigate to the date
    selectedDate = slot.date;
    navigate('home');

    // Wait for render, then highlight the specific slot
    setTimeout(() => {
        // Find all room slots
        const allSlots = document.querySelectorAll('.room-slot');

        allSlots.forEach(slotEl => {
            // Check if this is the matching slot by examining the onclick attribute
            const onclickAttr = slotEl.getAttribute('onclick');
            if (onclickAttr &&
                onclickAttr.includes(slot.date) &&
                onclickAttr.includes(slot.time) &&
                onclickAttr.includes(slot.room)) {

                // Add highlight animation
                slotEl.classList.add('highlight-blink');

                // Scroll into view
                slotEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });

                // Remove highlight after animation completes
                setTimeout(() => {
                    slotEl.classList.remove('highlight-blink');
                }, 3000);
            }
        });
    }, 400);
};

window.moveSlotToClipboard = (studentName) => {
    if (!studentName) {
        MOCK_DATA.clipboard = null;
    } else {
        const slot = MOCK_DATA.slots.find(s => s.student === studentName);
        if (slot) {
            MOCK_DATA.clipboard = { ...slot };
            // Jangan hapus rujukan lama dulu, hapus saat paste berhasil atau biarkan jika ingin 'copy'
            // Tapi untuk 'move', kita hapus yang lama
            MOCK_DATA.slots = MOCK_DATA.slots.filter(s => s.student !== studentName);
        }
    }
    mainContent.innerHTML = views.home();
};

// Individual Student Scheduling Function
window.scheduleIndividualStudent = async (nim) => {
    const mahasiswa = MOCK_DATA.mahasiswa.find(m => m.nim === nim);
    if (!mahasiswa) {
        alert('Data mahasiswa tidak ditemukan!');
        return;
    }

    // Check if already scheduled
    if (MOCK_DATA.slots.some(s => s.student === mahasiswa.nama)) {
        alert(`${mahasiswa.nama} sudah memiliki jadwal!`);
        return;
    }

    // Use the same scheduling logic
    const allDosen = getAllDosen();
    const examinerCounts = {}; // Fresh counter for this individual

    // Count existing assignments
    MOCK_DATA.slots.forEach(slot => {
        slot.examiners.forEach(examiner => {
            examinerCounts[examiner] = (examinerCounts[examiner] || 0) + 1;
        });
    });

    // Helper function to find examiners
    const findExaminers = (pembimbing, date, time) => {
        let candidates = [];
        for (const d of allDosen) {
            if (candidates.length >= 2) break;
            if (d.nama !== pembimbing) {
                if (!isDosenAvailable(d.nama, date, time)) continue;
                const currentCount = examinerCounts[d.nama] || 0;
                if (currentCount >= MAX_EXAMINER_ASSIGNMENTS) continue;
                candidates.push(d.nama);
            }
        }
        return candidates.length < 2 ? null : candidates;
    };

    // Try to find a suitable slot
    for (const dateObj of DATES) {
        const date = dateObj.value;
        const day = dateObj.label;

        for (const time of TIMES) {
            if (day === 'Jumat' && time === '11:30') continue;

            for (const room of ROOMS) {
                // Check if slot is occupied
                if (MOCK_DATA.slots.some(s => s.date === date && s.time === time && s.room === room)) {
                    continue;
                }

                // Check pembimbing availability
                if (!mahasiswa.pembimbing) continue;
                const pbData = allDosen.find(d => d.nama === mahasiswa.pembimbing);
                if (!pbData || pbData.exclude) continue;
                if (!isDosenAvailable(mahasiswa.pembimbing, date, time)) continue;

                // Find examiners
                const examiners = findExaminers(mahasiswa.pembimbing, date, time, mahasiswa.prodi);
                if (!examiners) continue;

                // SUCCESS! Book the slot
                const finalExaminers = [...examiners, mahasiswa.pembimbing];
                MOCK_DATA.slots.push({
                    date: date,
                    time: time,
                    room: room,
                    student: mahasiswa.nama,
                    examiners: finalExaminers
                });

                alert(`✅ Berhasil!\n\n${mahasiswa.nama} dijadwalkan di:\n📅 ${dateObj.display} (${day})\n⏰ ${time}\n🏢 ${room}`);

                // Refresh view
                if (currentView === 'mahasiswa') {
                    mainContent.innerHTML = views.mahasiswa();
                }
                return;
            }
        }
    }

    // Failed to schedule
    alert(`❌ Gagal menjadwalkan ${mahasiswa.nama}\n\nTidak ada slot yang tersedia atau bentrok jadwal dosen.`);
};


window.pasteSlotFromClipboard = (toDate, toTime, toRoom) => {
    if (!MOCK_DATA.clipboard) return;

    const studentName = MOCK_DATA.clipboard.student;
    const oldSlot = MOCK_DATA.clipboard;

    // VALIDASI
    const conflicts = [];
    oldSlot.examiners.forEach(dosen => {
        if (!isDosenAvailable(dosen, toDate, toTime)) {
            conflicts.push(dosen);
        }
    });

    if (conflicts.length > 0) {
        alert(`Gagal Tempel: Bentrok Jadwal!\n\nDosen berikut tidak tersedia di slot ini:\n- ${conflicts.join('\n- ')}`);
        return;
    }

    // Eksekusi
    MOCK_DATA.slots.push({
        ...oldSlot,
        date: toDate,
        time: toTime,
        room: toRoom
    });

    MOCK_DATA.clipboard = null;
    logToLogic(`📋 Clipboard Paste: ${studentName} dipindah ke [${toDate} ${toTime} ${toRoom}]`);
    mainContent.innerHTML = views.home();
};

// --- DRAG AND DROP HANDLERS ---
window.onDragStart = (e, studentName, fromDate, fromTime, fromRoom) => {
    e.dataTransfer.setData('studentName', studentName);
    e.dataTransfer.setData('fromDate', fromDate);
    e.dataTransfer.setData('fromTime', fromTime);
    e.dataTransfer.setData('fromRoom', fromRoom);
    e.target.style.opacity = '0.5';
};

window.onDragOver = (e) => {
    e.preventDefault();
    const target = e.currentTarget;
    if (target.classList.contains('slot-empty')) {
        target.style.background = 'var(--primary-subtle)';
        target.style.border = '2px dashed var(--primary)';
    }
};

window.onDragLeave = (e) => {
    const target = e.currentTarget;
    if (target.classList.contains('slot-empty')) {
        target.style.background = 'var(--bg-subtle)';
        target.style.border = '2px dashed var(--border)';
    }
};

window.onDrop = (e, toDate, toTime, toRoom) => {
    e.preventDefault();
    const studentName = e.dataTransfer.getData('studentName');
    const fromDate = e.dataTransfer.getData('fromDate');
    const fromTime = e.dataTransfer.getData('fromTime');
    const fromRoom = e.dataTransfer.getData('fromRoom');

    // 1. Cari data slot lama
    const oldSlotIndex = MOCK_DATA.slots.findIndex(s =>
        s.student === studentName && s.date === fromDate && s.time === fromTime && s.room === fromRoom
    );

    if (oldSlotIndex === -1) return;
    const oldSlot = MOCK_DATA.slots[oldSlotIndex];

    // 2. VALIDASI ATURAN
    // A. Cek apakah target sudah terisi
    const targetOccupied = MOCK_DATA.slots.some(s =>
        s.date === toDate && s.time === toTime && s.room === toRoom
    );
    if (targetOccupied) {
        alert('Gagal: Slot tujuan sudah terisi mahasiswa lain!');
        navigate('home');
        return;
    }

    // B. Cek ketersediaan semua tim (Pb + Penguji) di slot baru
    const conflicts = [];
    oldSlot.examiners.forEach(dosen => {
        if (!isDosenAvailable(dosen, toDate, toTime, studentName)) {
            conflicts.push(dosen);
        }
    });

    if (conflicts.length > 0) {
        alert(`Gagal: Bentrok Jadwal!\n\nDosen berikut tidak tersedia di slot baru:\n- ${conflicts.join('\n- ')}`);
        navigate('home');
        return;
    }

    // 3. Eksekusi Perpindahan
    MOCK_DATA.slots[oldSlotIndex] = {
        ...oldSlot,
        date: toDate,
        time: toTime,
        room: toRoom
    };

    logToLogic(`📍 Manual Move: ${studentName} pindah ke [${toDate} ${toTime} ${toRoom}]`);
    navigate('home');
};

// Event Listeners
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        navigate(page);
    });
});

// --- SDM Import/Export Implementation ---

window.triggerImportSDM = () => {
    const input = document.getElementById('importSDMInput');
    if (input) input.click();
};

window.handleImportSDM = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = importSDM(text); // Using the local helper

        if (data && data.length > 0) {
            MOCK_DATA.masterDosen = data;
            console.log(`✅ Imported ${data.length} SDM records manually.`);
            alert(`Berhasil mengimpor ${data.length} data SDM.`);

            // Re-run matching logic with new SDM data
            processMatching();

            // Refresh view if needed
            if (currentView === 'dosen') {
                const mainContent = document.getElementById('main-content');
                if (mainContent) mainContent.innerHTML = views.dosen();
            }
        } else {
            alert('Gagal membaca data CSV. Pastikan format sesuai (delimiter ; atau ,).');
        }
    } catch (err) {
        console.error('Import Error:', err);
        alert('Terjadi kesalahan saat membaca file.');
    }
    // Reset input
    event.target.value = '';
};

window.exportSDMData = () => {
    const data = MOCK_DATA.masterDosen;
    if (!data || data.length === 0) {
        alert('Belum ada data SDM untuk diekspor.');
        return;
    }

    // Header matching importSDM expectation
    const headers = ['No', 'Nik', 'Status', 'Nama', 'Kategori', 'NIDN', 'Jenis Kelamin'];

    const csvContent = [
        headers.join(';'),
        ...data.map(d => [
            d.no || '',
            d.nik || '',
            d.status || 'DOSEN',
            d.nama || '',
            d.kategori || '',
            d.nidn || '',
            d.jenisKelamin || ''
        ].join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Data_SDM_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Ensure processMatching is attached/exposed
window.processMatching = processMatching;




// --- Fitur Dosen Libur ---

window.toggleAddLiburModal = (show, editIndex = null) => {
    const modalId = 'addLiburModal';
    let modal = document.getElementById(modalId);

    if (show) {
        if (modal) modal.remove();

        // --- PREPARE EDIT DATA ---
        const isEdit = (editIndex !== null && editIndex !== undefined);
        const editData = isEdit ? MOCK_DATA.libur[editIndex] : {};
        const Defaults = {
            dosenId: '',
            type: 'date',
            date: '',
            start: '',
            end: '',
            days: [],
            times: [],
            reason: ''
        };
        const Data = { ...Defaults, ...editData };

        // Resolve Dosen ID from Name if needed (Migration support for initialLibur.js which uses names)
        if (!Data.dosenId && Data.nama) {
            const d = getAllDosen().find(x => x.nama.trim() === Data.nama.trim());
            if (d) Data.dosenId = d.nik;
        }

        const modalContainer = document.createElement('div');
        modalContainer.id = modalId;
        modalContainer.className = 'modal-overlay';

        const allDosen = getAllDosen();
        // Remove duplicates based on NIK
        const uniqueDosen = [];
        const map = new Map();
        for (const item of allDosen) {
            if (!map.has(item.nik)) {
                map.set(item.nik, true);
                uniqueDosen.push(item);
            }
        }

        const dosenOptions = uniqueDosen.map(d =>
            `<option value="${d.nik}" ${d.nik === Data.dosenId ? 'selected' : ''}>${d.nama}</option>`
        ).join('');

        // Date Options (Helper)
        const renderDateOpts = (selected) => DATES.map(d =>
            `<option value="${d.value}" ${d.value === selected ? 'selected' : ''}>${d.display} (${d.label})</option>`
        ).join('');

        modalContainer.innerHTML = `
            <div class="modal-content" style="max-width: 550px;">
                <h2 style="margin-bottom: 1rem;">${isEdit ? 'Edit Aturan' : 'Tambah Aturan Ketersediaan'}</h2>
                <form onsubmit="window.saveNewLibur(event)">
                    <input type="hidden" name="editIndex" value="${isEdit ? editIndex : -1}">
                    
                    <div class="form-group">
                        <label class="form-label">Dosen</label>
                        <select name="dosenId" class="form-input" required>
                             <option value="" disabled ${!Data.dosenId ? 'selected' : ''}>Pilih Dosen...</option>
                             ${dosenOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tipe Aturan</label>
                        <select id="ruleType" name="type" class="form-input" onchange="window.handleRuleTypeChange(this.value)">
                             <option value="date" ${Data.type === 'date' ? 'selected' : ''}>📅 Tanggal Spesifik (Cuti Sehari)</option>
                             <option value="range" ${Data.type === 'range' ? 'selected' : ''}>📆 Rentang Tanggal (Cuti Panjang)</option>
                             <option value="recurring" ${Data.type === 'recurring' ? 'selected' : ''}>🔄 Aturan Rutin (Hari/Jam Tertentu)</option>
                        </select>
                    </div>

                    <!-- Input: Single Date -->
                    <div id="inputDate" class="form-group rule-input">
                        <label class="form-label">Pilih Tanggal</label>
                        <select name="date" class="form-input">
                             ${renderDateOpts(Data.date)}
                        </select>
                    </div>

                    <!-- Input: Date Range -->
                    <div id="inputRange" class="form-group rule-input" style="display:none; gap: 10px;">
                        <div style="flex:1;">
                            <label class="form-label">Dari Tanggal</label>
                            <select name="start" class="form-input">${renderDateOpts(Data.start)}</select>
                        </div>
                        <div style="flex:1;">
                            <label class="form-label">Sampai Tanggal</label>
                            <select name="end" class="form-input">${renderDateOpts(Data.end)}</select>
                        </div>
                    </div>

                    <!-- Input: Recurring -->
                    <div id="inputRecurring" class="form-group rule-input" style="display:none;">
                        <label class="form-label">Pilih Hari yang DIBLOKIR:</label>
                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:10px;">
                            ${['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => `
                                <label style="display:flex; align-items:center; gap:4px; font-size:0.85rem; cursor:pointer; background:var(--bg); padding:4px 8px; border-radius:4px; border:1px solid var(--border);">
                                    <input type="checkbox" name="days" value="${day}" ${(Data.days && Data.days.includes(day)) ? 'checked' : ''}> ${day}
                                </label>
                            `).join('')}
                        </div>

                        <label class="form-label">Pilih Jam yang DIBLOKIR:</label>
                        <div style="display:flex; gap:10px; flex-wrap:wrap;">
                            ${['08:30', '10:00', '11:30', '13:30'].map(time => `
                                <label style="display:flex; align-items:center; gap:4px; font-size:0.85rem; cursor:pointer; background:var(--bg); padding:4px 8px; border-radius:4px; border:1px solid var(--border);">
                                    <input type="checkbox" name="times" value="${time}" ${(Data.times && Data.times.includes(time)) ? 'checked' : ''}> ${time}
                                </label>
                            `).join('')}
                        </div>
                    </div>

                     <div class="form-group">
                        <label class="form-label">Keterangan / Alasan</label>
                        <input type="text" name="reason" class="form-input" required placeholder="Contoh: Mengajar..." value="${Data.reason || ''}">
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="window.toggleAddLiburModal(false)">Batal</button>
                        <button type="submit">${isEdit ? 'Update Aturan' : 'Simpan Aturan'}</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modalContainer);
        setTimeout(() => {
            modalContainer.classList.add('active');
            window.handleRuleTypeChange(Data.type || 'date'); // Initialize visibility
        }, 10);
    } else {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }
};

// Handle Rule Type Change Logic
window.handleRuleTypeChange = (type) => {
    document.getElementById('inputDate').style.display = type === 'date' ? 'block' : 'none';
    document.getElementById('inputRange').style.display = type === 'range' ? 'flex' : 'none';
    document.getElementById('inputRecurring').style.display = type === 'recurring' ? 'block' : 'none';
};

window.saveNewLibur = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = formData.get('type');
    const editIndex = parseInt(formData.get('editIndex'));

    let newLibur = {
        dosenId: formData.get('dosenId'),
        reason: formData.get('reason'),
        type: type
    };

    if (type === 'date') {
        newLibur.date = formData.get('date');
    } else if (type === 'range') {
        newLibur.start = formData.get('start');
        newLibur.end = formData.get('end');
        // Basic validation: swap if start > end? Naah, user responsibility for now
        if (newLibur.start > newLibur.end) {
            alert('Tanggal awal tidak boleh lebih akhir dari tanggal akhir.');
            return;
        }
    } else if (type === 'recurring') {
        newLibur.days = formData.getAll('days');
        newLibur.times = formData.getAll('times');

        if (newLibur.days.length === 0) {
            alert('Pilih minimal satu hari untuk aturan rutin.');
            return;
        }
    }

    if (!isNaN(editIndex) && editIndex >= 0) {
        // Edit Mode
        MOCK_DATA.libur[editIndex] = newLibur;
    } else {
        // Add Mode
        MOCK_DATA.libur.push(newLibur);
    }

    saveLiburToStorage();

    if (currentView === 'libur') {
        mainContent.innerHTML = views.libur();
    }

    window.toggleAddLiburModal(false);
    saveLiburToStorage();
};

window.deleteLibur = (index) => {
    // if (confirm('Hapus jadwal libur ini?')) { // Removed confirm to ensure it works
    MOCK_DATA.libur.splice(index, 1);
    if (currentView === 'libur') {
        mainContent.innerHTML = views.libur();
    }
    // }
    saveLiburToStorage();
};

window.resetLiburData = () => {
    if (confirm('⚠️ Yakin ingin MERESET data libur ke Default?\nData custom yang Anda buat akan hilang.')) {
        MOCK_DATA.libur = [...INITIAL_LIBUR]; // Copy fresh seed data
        saveLiburToStorage();
        if (currentView === 'libur') {
            mainContent.innerHTML = views.libur();
        }
        alert('✅ Data libur berhasil di-reset ke default.');
    }
};



// --- LOGIKA PENJADWALAN OTOMATIS (ALGORITMA LOOPING KETAT) ---

// Log helper
function logToLogic(message) {
    const logEl = document.getElementById('logicLog');
    const card = document.getElementById('logCard');
    if (logEl && card) {
        card.style.display = 'block';
        const time = new Date().toLocaleTimeString();
        logEl.innerHTML += `[${time}] ${message}\n`;
        logEl.scrollTop = logEl.scrollHeight;
    }
    console.log(message);
}

window.generateSchedule = async () => {
    // 1. Preparation & Configuration
    const logEl = document.getElementById('logicLog');
    if (logEl) logEl.innerHTML = '';

    // Read UI Controls
    const scopeEl = document.getElementById('scheduleScope');
    const incrementalEl = document.getElementById('incrementalMode');
    const targetProdi = scopeEl ? scopeEl.value : 'all';
    const isIncremental = incrementalEl ? incrementalEl.checked : false;

    logToLogic("🚀 MEMULAI PROSES PENJADWALAN OTOMATIS...");
    logToLogic(`⚙️ Mode: ${isIncremental ? 'INCREMENTAL (Lanjutkan)' : 'RESET FULL'}`);
    logToLogic(`🎯 Target: ${targetProdi === 'all' ? 'Semua Mahasiswa' : targetProdi}`);
    logToLogic("----------------------------------------");

    // Filter Mahasiswa based on Config
    let mahasiswaList = [...MOCK_DATA.mahasiswa];

    // Apply Prodi Filter
    if (targetProdi !== 'all') {
        mahasiswaList = mahasiswaList.filter(m => m.prodi === targetProdi);
    }

    // Sort deterministik
    mahasiswaList.sort((a, b) => a.nim.localeCompare(b.nim));

    if (mahasiswaList.length === 0) {
        logToLogic("⚠️ Tidak ada mahasiswa yang sesuai dengan filter Prodi ini.");
        return;
    }

    logToLogic(`📦 Memproses ${mahasiswaList.length} mahasiswa.`);

    // Handle Incremental vs Reset
    const scheduledMahasiswaIds = new Set();

    if (isIncremental) {
        logToLogic("🔄 Membaca jadwal yang ada...");
        // Load existing scheduled IDs (global, not just filtered ones, to avoid double booking)
        MOCK_DATA.slots.forEach(s => {
            // Find student by name (assuming name is unique, better use NIM if stored)
            // In real app better store NIM in slot. For now map name back to NIM if needed.
            // Simplified: We assume slot.student is the name.
            if (s.student) {
                // Find matching student data to get NIM
                const m = MOCK_DATA.mahasiswa.find(x => x.nama === s.student);
                if (m) scheduledMahasiswaIds.add(m.nim);
            }
        });
        logToLogic(`   -> ${scheduledMahasiswaIds.size} mahasiswa sudah terjadwal sebelumnya.`);
    } else {
        logToLogic("🧹 Membersihkan semua slot jadwal (RESET)...");
        MOCK_DATA.slots = [];
    }

    // Resource Constraint
    const allDosen = getAllDosen();
    logToLogic(`👥 Mengindeks ${allDosen.length} data dosen...`);

    // Tracking beban penguji (Load Balancing) - Load existing counts if incremental
    const examinerCounts = {};
    if (isIncremental) {
        MOCK_DATA.slots.forEach(slot => {
            if (slot.examiners) {
                slot.examiners.forEach(ex => {
                    examinerCounts[ex] = (examinerCounts[ex] || 0) + 1;
                });
            }
        });
    }

    logToLogic(`⚖️ Soft Constraint Aktif: Maksimal ${MAX_EXAMINER_ASSIGNMENTS} tugas per dosen.`);

    // ... (Keep findExaminers helper same as before) ...
    // Helper: Cari Penguji Pendamping (STRATEGI: SEQUENTIAL / FIRST-FIT + LOAD BALANCING + PRODI MATCHING)
    const findExaminers = (pembimbing, date, time, studentProdi) => {
        let candidates = [];

        // Logic Prodi Matching: FIK Cross-Prodi (Kecuali TI, S2, S3)

        // 1. Definisi Grup Strict di FIK (Tidak boleh lintas)
        const STRICT_FIK_GROUP = [
            'teknologi informasi', 's1 teknologi informasi',
            's2 informatika', 's2 pjj informatika',
            's3 informatika'
        ];

        const sProdiNorm = studentProdi?.trim().toLowerCase();

        // Cek Fakultas Mahasiswa (Assumption: Based on Prodi Name match in Faculty Data)
        let studentFakultas = 'UNKNOWN';
        if (MOCK_DATA.facultyData.FIK.some(d => d.prodi.toLowerCase() === sProdiNorm)) studentFakultas = 'FIK';
        else if (MOCK_DATA.facultyData.FES.some(d => d.prodi.toLowerCase() === sProdiNorm)) studentFakultas = 'FES';
        else if (MOCK_DATA.facultyData.FST.some(d => d.prodi.toLowerCase() === sProdiNorm)) studentFakultas = 'FST';

        // Logic Penentu: Apakah ini kasus Cross-Prodi FIK?
        // Syarat: Mhs FIK DAN BUKAN anak TI/S2/S3
        const isFikCrossAllowedCase = (studentFakultas === 'FIK') && (!STRICT_FIK_GROUP.includes(sProdiNorm));

        // 3. STRATEGI LOAD BALANCING (FAIRNESS)
        // Sort dosen by current workload (least busy first)
        // Agar tidak terjadi ketimpangan (Dosen A=5, Dosen B=1), kita prioritaskan yg beban kerjanya masih sedikit.

        // Clone array to avoid mutating original order if it matters elsewhere
        const candidatePool = [...allDosen].sort((a, b) => {
            const loadA = examinerCounts[a.nama] || 0;
            const loadB = examinerCounts[b.nama] || 0;
            return loadA - loadB; // Ascending: 0, 1, 2...
        });

        for (const d of candidatePool) {
            if (candidates.length >= 2) break;
            if (d.nama !== pembimbing) {

                // Cek Constraint Prodi
                const dProdiNorm = d.prodi?.trim().toLowerCase();

                if (isFikCrossAllowedCase) {
                    // KASUS FIK LINTAS PRODI:
                    // Syarat:
                    // 1. Dosen harus dari FIK
                    // 2. Dosen TIDAK boleh dari prodi Strict (TI/S2/S3)

                    if (d.fakultas !== 'FIK') continue;
                    if (STRICT_FIK_GROUP.includes(dProdiNorm)) continue;

                    // Jika lolos, berarti dosen ini eligible (Informatika, SI, TekKom, D3, dll)

                } else {
                    // KASUS STRICT (TI, S2, S3, FES, FST):
                    // Syarat: Prodi harus sama persis
                    if (dProdiNorm !== sProdiNorm) continue;
                }

                // Check availability
                if (!isDosenAvailable(d.nama, date, time)) continue;

                // Check assignment limit (soft constraint)
                const currentCount = examinerCounts[d.nama] || 0;
                if (currentCount >= MAX_EXAMINER_ASSIGNMENTS) continue;

                candidates.push(d.nama);
            }
        }
        if (candidates.length < 2) return null;
        return candidates;
    };

    // --- CORE LOOP (SLOT-CENTRIC APPROACH) ---
    // 1. Generate Slots
    const allPossibleSlots = [];
    for (const dateObj of DATES) {
        const date = dateObj.value;
        const day = dateObj.label;
        for (const time of TIMES) {
            if (day === 'Jumat' && time === '11:30') continue;
            for (const room of ROOMS) {
                allPossibleSlots.push({ date, day, time, room });
            }
        }
    }

    logToLogic(`⚙️ Memindai ${allPossibleSlots.length} slot waktu...`);

    let successCount = 0;

    // 2. Loop Slot
    slotLoop:
    for (const slot of allPossibleSlots) {
        const { date, day, time, room } = slot;

        // CRITICAL CHECK: Strict Slot Collision Detection
        // If incremental, skip this slot if it's already taken in MOCK_DATA.slots
        const isOccupied = MOCK_DATA.slots.some(s => s.date === date && s.time === time && s.room === room);
        if (isOccupied) {
            continue; // Smart Skip
        }

        // Check completion within SCOPE
        // Only count valid if ALL target students are done
        // But since we iterate slots, we just stop if we run out of eligible students.

        let candidateFound = null;
        let finalExaminers = null;

        for (const mhs of mahasiswaList) {
            // Skip jika sudah dijadwalkan (Global Check)
            if (scheduledMahasiswaIds.has(mhs.nim)) continue;

            // 1. Cek Pembimbing Available di (date, time)
            // 1. Cek Pembimbing Available di (date, time)
            if (!mhs.pembimbing) {
                // logToLogic(`   [!] Mahasiswa ${mhs.nama} tidak memiliki pembimbing.`);
                continue;
            }
            // Logic Update: Pembimbing WAJIB hadir meskipun statusnya OFF (ignoreGlobalExclude = true)
            // Kita hapus pengecekan pbData.exclude di sini.

            // Cek ketersediaan pembimbing (Force Available jika Exclude)
            if (!isDosenAvailable(mhs.pembimbing, date, time, null, true)) continue;

            // 2. Cek Penguji Pendamping
            const examiners = findExaminers(mhs.pembimbing, date, time, mhs.prodi);
            if (!examiners) continue;

            candidateFound = mhs;
            finalExaminers = [...examiners, mhs.pembimbing];
            break;
        }

        if (candidateFound) {
            // Booking Slot
            MOCK_DATA.slots.push({
                date: date,
                time: time,
                room: room,
                student: candidateFound.nama,
                examiners: finalExaminers
            });

            scheduledMahasiswaIds.add(candidateFound.nim);
            successCount++;

            // Update examiner counts untuk load balancing
            finalExaminers.forEach(examiner => {
                examinerCounts[examiner] = (examinerCounts[examiner] || 0) + 1;
            });

            logToLogic(`   [${date} ${time} ${room}] ✅ Terisi: ${candidateFound.nama}`);

            // Simulasi delay visual
            await new Promise(r => setTimeout(r, 10));
        }
    }

    logToLogic("\n----------------------------------------");

    // Log distribusi beban penguji
    logToLogic("📊 DISTRIBUSI BEBAN PENGUJI:");
    const sortedExaminers = Object.entries(examinerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10

    sortedExaminers.forEach(([name, count]) => {
        const warning = count > MAX_EXAMINER_ASSIGNMENTS ? ' ⚠️ (Melebihi limit - kemungkinan pembimbing)' : '';
        logToLogic(`   ${name}: ${count} tugas${warning}`);
    });

    const sisa = mahasiswaList.length - successCount;
    if (sisa > 0) {
        logToLogic(`\n⚠️ PERINGATAN: Ada ${sisa} mahasiswa yang TIDAK BISA dijadwalkan (Konflik/Kehabisan Slot).`);
    }
    logToLogic(`🏁 SELESAI. Berhasil menjadwalkan ${successCount} dari ${mahasiswaList.length} mahasiswa.`);

    // Auto switch to Home after short delay
    setTimeout(() => {
        if (confirm("Penjadwalan Selesai! Lihat hasil di Beranda?")) {
            navigate('home');
        }
    }, 500);
};

window.handleProdiFilterChange = (event) => {
    selectedProdiFilter = event.target.value;
    appState.selectedProdiFilter = selectedProdiFilter; // Sync
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = views.dosen();
};

window.handleStatusFilterChange = (event) => {
    selectedStatusFilter = event.target.value;
    appState.selectedStatusFilter = selectedStatusFilter; // Sync
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = views.dosen();
};

// All persistence helpers are now imported from store.js

// Initial execution
initializeApp();
