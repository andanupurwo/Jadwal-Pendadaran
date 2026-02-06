import { APP_DATA, DATES, TIMES } from '../../data/store.js';
import { PRODI_SHORTNAMES, FACULTY_MAP } from '../../utils/constants.js';

export const ReportView = () => {

    // 1. Setup Context (Total Capacity)
    const totalDays = DATES.length;
    const totalTimes = TIMES.length;
    const maxCapacity = totalDays * totalTimes;

    // 2. Build Maps
    const nameToNik = {}; // Name -> NIK
    const examinerCounts = {}; // Name -> Count
    const blockedCounts = {}; // NIK -> Count

    // Map Names to NIKs from Faculty Data
    if (APP_DATA.facultyData) {
        Object.values(APP_DATA.facultyData).forEach(list => {
            if (Array.isArray(list)) {
                list.forEach(d => {
                    nameToNik[d.nama] = d.nik;
                });
            }
        });
    }

    // Calculate Workload (from Slots)
    APP_DATA.slots.forEach(slot => {
        if (slot.examiners && Array.isArray(slot.examiners)) {
            slot.examiners.forEach(name => {
                if (!name) return;
                examinerCounts[name] = (examinerCounts[name] || 0) + 1;
            });
        }
    });

    // Calculate Blocked/Unavailable Slots (from Libur)
    // Note: This is an approximation. Overlaps between multiple libur entries are not deduplicated perfectly here 
    // without a full grid, but usually sufficient for "Availability" estimates.
    if (APP_DATA.libur) {
        APP_DATA.libur.forEach(l => {
            if (!l.dosenId) return;
            const daysBlocked = (l.dates && l.dates.length > 0) ? l.dates.length : totalDays;
            const timesBlocked = (l.times && l.times.length > 0) ? l.times.length : totalTimes;
            const totalBlocked = daysBlocked * timesBlocked;

            blockedCounts[l.dosenId] = (blockedCounts[l.dosenId] || 0) + totalBlocked;
        });
    }

    // 3. Sort examiners by count (descending)
    const sortedExaminers = Object.entries(examinerCounts)
        .sort(([, a], [, b]) => b - a);

    // 4. Prepare visual bars
    const maxCount = sortedExaminers.length > 0 ? sortedExaminers[0][1] : 0;

    const rows = sortedExaminers.map(([name, count], index) => {
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
        const nik = nameToNik[name];

        // Availability Logic
        const blocked = blockedCounts[nik] || 0;
        const available = Math.max(0, maxCapacity - blocked);
        const utilization = available > 0 ? Math.round((count / available) * 100) : 100;

        // Color & Status Logic
        let statusBadge = '';
        let rowOpacity = '1';

        if (available <= count) {
            statusBadge = `<span class="badge" style="background:#e3f2fd; color:#0d47a1; font-size:0.7rem;">🔒 Full (${available}/${maxCapacity} Avail)</span>`;
        } else if (utilization < 30) {
            statusBadge = `<span class="badge" style="background:#f6ffed; color:#389e0d; font-size:0.7rem;">🌱 Longgar (Sisa ${available - count})</span>`;
        } else {
            statusBadge = `<span class="badge" style="background:#fff7e6; color:#d46b08; font-size:0.7rem;">⚖️ Sisa ${available - count}</span>`;
        }

        // Validation Colors
        const barColor = count > 10 ? 'var(--danger)' // Overload
            : count < 3 && available > 5 ? 'var(--warning)' // Underload BUT was available (Issue!)
                : count < 3 && available <= 3 ? '#a0d911' // Underload BUT constrained (Justified)
                    : 'var(--success)';

        return `
            <div style="display:flex; align-items:center; margin-bottom:12px; opacity:${rowOpacity};">
                <div style="min-width:45px; font-weight:700; color:var(--text-muted); font-size:0.9rem;">#${index + 1}</div>
                <div style="flex:1; margin-right:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <div>
                            <span style="font-weight:600; color:var(--text-main); font-size:0.95rem;">${name}</span>
                            ${statusBadge}
                        </div>
                        <div style="text-align:right;">
                            <span style="font-weight:700; color:${barColor};">${count} Slot</span>
                            <span style="font-size:0.7rem; color:var(--text-muted); display:block;">dari ${available} opsi</span>
                        </div>
                    </div>
                    <div style="height:8px; background:rgba(0,0,0,0.05); border-radius:4px; overflow:hidden;">
                        <div style="width:${percentage}%; height:100%; background:${barColor}; border-radius:4px;"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Summary Stats
    const totalSlots = APP_DATA.slots.length;
    const totalExaminers = sortedExaminers.length;
    const avgLoad = totalExaminers > 0 ? (totalSlots * 3 / totalExaminers).toFixed(1) : 0; // *3 because 3 examiners per slot

    // 5. Faculty & Prodi Stats
    const prodiCounts = {};
    const facultyCounts = { 'FIK': 0, 'FES': 0, 'FST': 0, 'Lainnya': 0 };

    APP_DATA.mahasiswa.forEach(m => {
        const prodi = m.prodi || 'Tidak Diketahui';
        prodiCounts[prodi] = (prodiCounts[prodi] || 0) + 1;

        const fak = FACULTY_MAP[prodi] || 'Lainnya';
        facultyCounts[fak] = (facultyCounts[fak] || 0) + 1;
    });

    const totalMhs = APP_DATA.mahasiswa.length;

    // --- PIE CHART (FAKULTAS) ---
    // Colors: FIK (Tekhelet), FES (Orange), FST (Black), Other (Grey)
    const fColors = { 'FIK': '#4A1B9D', 'FES': '#FFAC00', 'FST': '#000000', 'Lainnya': '#a4b0be' };

    let currentAngle = 0;
    const gradientParts = [];
    Object.entries(facultyCounts).forEach(([fak, count]) => {
        if (count === 0) return;
        const sliceAngle = (count / totalMhs) * 360;
        const endAngle = currentAngle + sliceAngle;
        gradientParts.push(`${fColors[fak]} ${currentAngle}deg ${endAngle}deg`);
        currentAngle = endAngle;
    });

    const pieGradient = currentAngle > 0 ? `conic-gradient(${gradientParts.join(', ')})` : 'gray';

    // --- BAR CHART (PRODI) ---
    const sortedProdi = Object.entries(prodiCounts).sort(([, a], [, b]) => b - a);
    const maxProdiVal = sortedProdi.length > 0 ? sortedProdi[0][1] : 0;

    return `
        <style>
            .bar-group { position: relative; transition: transform 0.2s; cursor: default; }
            .bar-group:hover { transform: translateY(-5px); }
            .bar-group:hover .bar-fill { opacity: 0.8; }
            .chart-tooltip {
                visibility: hidden;
                background-color: #1f2937;
                color: #fff;
                text-align: center;
                padding: 6px 10px;
                border-radius: 6px;
                position: absolute;
                z-index: 10;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                opacity: 0;
                transition: opacity 0.3s;
                white-space: nowrap;
                font-size: 0.75rem;
                pointer-events: none;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                margin-bottom: 8px;
            }
            .chart-tooltip::after {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -5px;
                border-width: 5px;
                border-style: solid;
                border-color: #1f2937 transparent transparent transparent;
            }
            .bar-group:hover .chart-tooltip {
                visibility: visible;
                opacity: 1;
            }
        </style>
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Laporan & Statistik</h1>
                    <p class="subtitle">Analisis distribusi beban kerja dosen penguji.</p>
                </div>
                <div class="header-actions">
                    <!-- Actions can go here if needed later -->
                </div>
            </header>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:15px; margin-bottom:2rem;">
                <div class="card" style="text-align:center; padding:1.5rem;">
                    <div style="font-size:2rem; font-weight:800; color:var(--primary);">${totalSlots}</div>
                    <div style="color:var(--text-muted); font-size:0.9rem;">Total Jadwal</div>
                </div>
                <div class="card" style="text-align:center; padding:1.5rem;">
                    <div style="font-size:2rem; font-weight:800; color:var(--success);">${totalExaminers}</div>
                    <div style="color:var(--text-muted); font-size:0.9rem;">Dosen Terlibat</div>
                </div>
                <div class="card" style="text-align:center; padding:1.5rem;">
                    <div style="font-size:2rem; font-weight:800; color:var(--text-main);">${avgLoad}</div>
                    <div style="color:var(--text-muted); font-size:0.9rem;">Rerata Beban Uji</div>
                </div>
            </div>

            <!-- CHARTS SECTION -->
            <div class="card" style="margin-bottom:2rem;">
                <h3 style="margin-bottom:1.5rem; display:flex; align-items:center; gap:10px;">
                    📊 Statistik Mahasiswa
                </h3>
                
                <div style="display:grid; grid-template-columns: 300px 1fr; gap:2rem; align-items:start;">
                    
                    <!-- LEFT: PIE CHART FAKULTAS -->
                    <div style="display:flex; flex-direction:column; align-items:center; border-right:1px dashed var(--border); padding-right:2rem;">
                        <h4 style="margin-bottom:1rem; font-size:0.9rem; color:var(--text-muted);">Distribusi Fakultas</h4>
                        <div style="width:180px; height:180px; border-radius:50%; background:${pieGradient}; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-bottom:1.5rem; position:relative;">
                             <div style="position:absolute; inset:60px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-direction:column; box-shadow:inset 0 2px 5px rgba(0,0,0,0.05);">
                                <span style="font-size:1.5rem; font-weight:800;">${totalMhs}</span>
                                <span style="font-size:0.7rem; color:var(--text-muted);">Total</span>
                             </div>
                        </div>
                        
                        <div style="width:100%; display:flex; flex-wrap:wrap; justify-content:center; gap:15px;">
                            ${Object.entries(facultyCounts).map(([fak, c]) => c > 0 ? `
                                <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem;">
                                    <span style="width:10px; height:10px; background:${fColors[fak]}; border-radius:2px;"></span>
                                    <span>${fak}: <b>${c}</b></span>
                                </div>
                            ` : '').join('')}
                        </div>
                    </div>

                    <!-- RIGHT: BAR CHART PRODI -->
                    <div style="overflow-x:auto; padding-bottom:12px; padding-top:20px;">
                        <h4 style="margin-bottom:1rem; font-size:0.9rem; color:var(--text-muted); display:flex; justify-content:space-between;">
                            <span>Detail Program Studi</span>
                            <span style="font-size:0.75rem; color:var(--primary); background:rgba(0,113,227,0.1); padding:2px 8px; border-radius:4px;">Hover batang untuk detail</span>
                        </h4>
                        <div style="display:flex; align-items:flex-end; gap:12px; min-width:100%; padding-bottom:10px;">
                            ${sortedProdi.map(([prodi, count]) => {
        const heightPct = maxProdiVal > 0 ? (count / maxProdiVal) * 100 : 0;
        const fak = FACULTY_MAP[prodi] || 'Lainnya';
        const baseColor = fColors[fak] || '#999';
        const label = PRODI_SHORTNAMES[prodi] || prodi.substring(0, 5);

        return `
                                    <div class="bar-group" style="display:flex; flex-direction:column; align-items:center; gap:6px; min-width:40px; flex:1;">
                                        <div class="chart-tooltip">
                                            <strong>${prodi}</strong><br>
                                            ${count} Mahasiswa
                                        </div>
                                        <div style="font-size:0.75rem; font-weight:700; color:var(--text-main);">${count}</div>
                                        <div style="width:100%; height:150px; display:flex; align-items:flex-end; background:rgba(0,0,0,0.03); border-radius:8px; padding:0 4px;">
                                            <div class="bar-fill" style="width:100%; height:${heightPct}%; background:${baseColor}; border-radius:4px 4px 0 0; transition:height 1s; box-shadow:0 2px 4px rgba(0,0,0,0.1);"></div>
                                        </div>
                                        <div style="font-size:0.75rem; font-weight:600; color:var(--text-muted); text-align:center;">${label}</div>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    </div>
                
                </div>
            </div>

            <div class="card">
                <h3 style="margin-bottom:1.5rem; display:flex; align-items:center; gap:10px;">
                    📈 Beban Kerja Penguji
                </h3>
                <div style="max-height:600px; overflow-y:auto; padding-right:10px;">
                    ${rows || '<p style="text-align:center; color:var(--text-muted);">Belum ada jadwal yang terbentuk.</p>'}
                </div>
            </div>
        </div>
    `;
};
