import { APP_DATA, appState, DATES, TIMES, ROOMS } from '../../data/store.js';

export const HomeView = () => {
    // Ensure we have a valid date selected, fallback to first available if needed
    if ((!appState.selectedDate || !DATES.find(d => d.value === appState.selectedDate)) && DATES.length > 0) {
        appState.selectedDate = DATES[0].value;
    }

    const currentDate = appState.selectedDate;
    const dateObj = DATES.find(d => d.value === currentDate);

    // Safety check if no dates configured or invalid date
    if (!dateObj) {
        return `
            <div class="container">
                <header class="page-header">
                    <h1>Dashboard</h1>
                </header>
                <div class="card" style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                    <h3>Konfigurasi Tanggal Belum Tersedia</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                        Belum ada tanggal pelaksanaan yang diatur. Silakan atur di menu Pengaturan.
                    </p>
                    <button onclick="window.navigate('settings')" class="btn-primary">
                        Buka Pengaturan
                    </button>
                </div>
            </div>
        `;
    }

    const selectedDay = dateObj.label;

    return `
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Dashboard</h1>
                    <p class="subtitle">Monitoring slot dan ketersediaan ruangan.</p>
                </div>
                <div class="header-actions">
                    ${APP_DATA.clipboard ? `
                        <div class="card" style="margin: 0; padding: 0.4rem 1rem; background: var(--primary-subtle); border: 1px dashed var(--primary); display: inline-flex; align-items: center; gap: 8px; border-radius: 8px; margin-right: 8px;">
                            <span style="font-size: 0.8rem; font-weight: 600; color: var(--primary);">📋 ${APP_DATA.clipboard.student}</span>
                            <button type="button" onclick="window.moveSlotToClipboard(null)" class="btn-icon" style="font-size: 0.8rem;">✕</button>
                        </div>
                    ` : ''}
                    <button onclick="window.clearAllSchedule()" class="btn-secondary" style="color:var(--danger);">🗑️ Bersihkan Jadwal</button>
                    <button onclick="window.exportScheduleToCSV()" class="btn-secondary" style="color:var(--success);">💾 Export Excel</button>
                </div >
            </header >
            
            <div class="tabs-container" style="margin-bottom: 2rem;">
                <div class="tabs" style="display: flex; gap: 4px; padding: 4px; background: rgba(118, 118, 128, 0.08); border-radius: 14px;">
                    ${DATES.map((item, index) => {
        const hasSchedule = APP_DATA.slots.some(s => s.date === item.value);
        const isActive = currentDate === item.value;
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
                            ${ROOMS.length} Ruangan × ${TIMES.length} Sesi
                        </span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">
                        <span style="display: inline-block; width: 12px; height: 12px; background: var(--success); border-radius: 2px; margin-right: 4px;"></span> Terisi
                        <span style="display: inline-block; width: 12px; height: 12px; background: var(--border); border-radius: 2px; margin: 0 4px 0 12px;"></span> Kosong
                        <span style="display: inline-block; width: 12px; height: 12px; background: #e0e0e0; border: 1px dashed #bbb; border-radius: 2px; margin: 0 4px 0 12px;"></span> Istirahat
                    </div>
                </div>

                <div class="room-schedule-grid" style="display: grid; grid-template-columns: 80px repeat(${TIMES.length}, 1fr); gap: 6px; width: 100%;">
                    <div style="font-weight: 600; padding: 0.75rem 0.5rem; text-align: center; background: var(--card-bg); border-radius: 6px;">Ruangan</div>
                    ${TIMES.map(time => {
        const isJumatBreak = selectedDay === 'Jumat' && time === '11:30';
        return `<div style="font-weight: 600; padding: 0.75rem 0.5rem; text-align: center; background: ${isJumatBreak ? '#f0f0f0' : 'var(--card-bg)'}; color: ${isJumatBreak ? '#999' : 'inherit'}; border-radius: 6px; font-size: 0.9rem;">${time}</div>`;
    }).join('')}
                    ${ROOMS.map(room => `
                        <div style="font-weight: 600; padding: 0.75rem 0.5rem; display: flex; align-items: center; justify-content: center; background: var(--card-bg); border-radius: 6px;">${room}</div>
                        ${TIMES.map(time => {
        const isJumatBreak = selectedDay === 'Jumat' && time === '11:30';

        if (isJumatBreak) {
            return `
                                    <div style="padding: 0.6rem; border-radius: 8px; min-height: 100px; background: #f5f5f7; border: 1px dashed #d1d1d6; display: flex; align-items: center; justify-content: center; color: #a1a1a6; font-size: 0.75rem; font-style: italic;">
                                        ⛔ Istirahat
                                    </div>
                                `;
        }

        const slot = APP_DATA.slots.find(s => s.date === currentDate && s.time === time && s.room === room);
        return `
                                <div class="room-slot ${slot ? 'slot-filled' : 'slot-empty'}" 
                                     ${slot ? `draggable="true" ondragstart="window.onDragStart(event, '${slot.student}', '${currentDate}', '${time}', '${room}')" onclick="window.viewSlotDetails('${currentDate}', '${time}', '${room}')"` : `draggable="false"`}
                                     ondragover="window.onDragOver(event)" ondrop="window.onDrop(event, '${currentDate}', '${time}', '${room}')"
                                     style="padding: 0.6rem; border-radius: 8px; min-height: 100px; background: ${slot ? '#ffffff' : 'var(--card-bg)'}; border: 1px solid ${slot ? 'var(--border)' : 'transparent'}; ${slot ? 'border-left: 4px solid var(--success);' : ''} transition: all 0.2s; cursor: ${slot ? 'pointer' : 'default'}; position: relative;">
                                    ${slot ? `
                                        <div style="display: flex; flex-direction: column; height: 100%;">
                                            <div style="position: absolute; top: 4px; right: 4px; display: flex; gap: 4px; z-index: 10;">
                                                <button onclick="event.stopPropagation(); window.moveSlotToClipboard('${slot.student}')" class="delete-slot-btn" title="Pindah" style="background:rgba(0,113,227,0.1); border:none; width:18px; height:18px; border-radius:50%; color:var(--primary); font-size:10px; cursor:pointer; opacity:0; transition:opacity 0.2s;">📍</button>
                                                <button onclick="event.stopPropagation(); window.deleteSlot(${slot.id})" class="delete-slot-btn" title="Hapus" style="background:rgba(255,59,48,0.1); border:none; width:18px; height:18px; border-radius:50%; color:var(--danger); font-size:10px; cursor:pointer; opacity:0; transition:opacity 0.2s;">✕</button>
                                            </div>
                                            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); line-height: 1.3; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed var(--border);">${slot.student}</div>
                                            <div style="font-size: 0.75rem; flex-grow: 1; display: flex; flex-direction: column; gap: 3px;">
                                                ${slot.examiners ? `
                                                    <div style="display:flex; gap:6px; align-items:baseline;"><span style="color:var(--text-muted); font-size:0.65rem; font-weight:600;">P1</span><span class="text-truncate">${slot.examiners[0]}</span></div>
                                                    <div style="display:flex; gap:6px; align-items:baseline;"><span style="color:var(--text-muted); font-size:0.65rem; font-weight:600;">P2</span><span class="text-truncate">${slot.examiners[1]}</span></div>
                                                    <div style="margin-top:2px; display:flex; gap:6px; align-items:baseline; color:var(--primary);"><span style="font-size:0.65rem; font-weight:700;">Pb</span><span class="text-truncate" style="font-weight:600;">${slot.examiners[2]}</span></div>
                                                ` : '<div style="font-style:italic; opacity:0.5;">Data tidak lengkap</div>'}
                                            </div>
                                        </div>
                                    ` : `
                                        <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; border:2px dashed ${APP_DATA.clipboard ? 'var(--primary)' : 'var(--border)'}; border-radius:6px; color: ${APP_DATA.clipboard ? 'var(--primary)' : 'var(--text-muted)'};"
                                             ${APP_DATA.clipboard ? `onclick="window.pasteSlotFromClipboard('${currentDate}', '${time}', '${room}')"` : ''}>
                                             <span>${APP_DATA.clipboard ? '📋' : '+'}</span><span style="font-size:0.75rem;">${APP_DATA.clipboard ? 'Tempel' : 'Kosong'}</span>
                                        </div>
                                    `}
                                </div>
                            `;
    }).join('')}
                    `).join('')}
                </div>
            </div>
        </div >
    `;
};
