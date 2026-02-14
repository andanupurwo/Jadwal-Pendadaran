import { APP_DATA } from '../../data/store.js';
import { compareNames, getAllDosen } from '../../utils/helpers.js';
import { PRODI_SHORTNAMES } from '../../utils/constants.js';

/**
 * Show detailed lecturer schedule with comprehensive information
 * Focused on student cards with complete examiner information
 */
export function showDetailedLecturerSchedule(lecturerName) {
    const modalId = 'detailedLecturerScheduleModal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const slots = APP_DATA.slots || [];
    const allDosen = getAllDosen();
    const dosenData = allDosen.find(d => compareNames(d.nama, lecturerName));

    // Filter slots for this lecturer
    const mySchedule = slots.filter(slot =>
        slot.examiners && slot.examiners.some(ex => compareNames(ex, lecturerName))
    ).map(slot => {
        const myIndex = slot.examiners.findIndex(ex => compareNames(ex, lecturerName));
        const role = myIndex === slot.examiners.length - 1 ? 'Pembimbing' : `Penguji ${myIndex + 1}`;
        
        // Find mahasiswa details
        const mahasiswa = APP_DATA.mahasiswa?.find(m => compareNames(m.nama, slot.student)) || {};
        
        return { 
            ...slot, 
            role,
            mahasiswaProdi: mahasiswa.prodi || '-',
            mahasiswaNIM: mahasiswa.nim || '-',
            mahasiswaPembimbing: mahasiswa.pembimbing || '-'
        };
    }).sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    // Calculate statistics
    const totalSlots = mySchedule.length;
    const totalBimbingan = mySchedule.filter(s => s.role === 'Pembimbing').length;
    const totalMenguji = mySchedule.filter(s => s.role !== 'Pembimbing').length;

    // Group by date
    const scheduleByDate = {};
    mySchedule.forEach(slot => {
        if (!scheduleByDate[slot.date]) {
            scheduleByDate[slot.date] = [];
        }
        scheduleByDate[slot.date].push(slot);
    });

    const modalOverlay = document.createElement('div');
    modalOverlay.id = modalId;
    modalOverlay.className = 'modal-overlay active';

    let contentHtml = '';

    if (mySchedule.length === 0) {
        contentHtml = `
            <div style="text-align:center; padding:3rem; color:var(--text-muted);">
                <div style="font-size:3rem; margin-bottom:1rem;">📅</div>
                <p>Belum ada jadwal pendadaran untuk dosen ini.</p>
            </div>
        `;
    } else {
        // Build student cards grouped by date
        const dateGroupsHtml = Object.entries(scheduleByDate).map(([date, daySlots]) => `
            <div style="margin-bottom:1rem;">
                <h4 style="margin:0 0 0.8rem 0; display:flex; align-items:center; gap:6px; color:var(--primary); font-size:0.9rem; padding-bottom:6px; border-bottom:1px solid var(--primary);">
                    📅 ${formatDate(date)}
                    <span style="font-size:0.7rem; background:var(--primary); color:white; padding:2px 6px; border-radius:3px; margin-left:auto;">
                        ${daySlots.length}
                    </span>
                </h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(480px, 1fr)); gap:10px;">
                    ${daySlots.map(slot => `
                        <div style="background:white; border:1px solid #e8e8e8; border-radius:8px; padding:10px; transition:all 0.2s ease;">
                            <!-- Header Row: Waktu, Ruang, Peran -->
                            <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:8px; margin-bottom:8px; align-items:center; padding-bottom:8px; border-bottom:1px solid #f5f5f5;">
                                <div style="font-weight:700; color:var(--primary); font-size:0.9rem;">🕐 ${slot.time}</div>
                                <div style="font-weight:600; color:#666; font-size:0.85rem;">🏫 ${slot.room}</div>
                                <span class="badge badge-${slot.role === 'Pembimbing' ? 'primary' : 'success'}" style="font-size:0.65rem; white-space:nowrap; padding:3px 7px;">
                                    ${slot.role}
                                </span>
                            </div>

                            <!-- Mahasiswa Section -->
                            <div style="margin-bottom:8px;">
                                <div style="font-size:0.6rem; text-transform:uppercase; color:#aaa; font-weight:700; letter-spacing:0.2px; margin-bottom:3px;">📚 Mahasiswa</div>
                                <div style="font-weight:700; color:#333; font-size:0.9rem; margin-bottom:3px;">${slot.student}</div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.75rem;">
                                    <div><span style="color:#999;">NIM:</span> <span style="font-weight:600; color:#333;">${slot.mahasiswaNIM !== '-' ? slot.mahasiswaNIM : '-'}</span></div>
                                    <div><span style="color:#999;">Prodi:</span> <span style="font-weight:600; color:#333;">${PRODI_SHORTNAMES[slot.mahasiswaProdi] || slot.mahasiswaProdi}</span></div>
                                </div>
                            </div>

                            <!-- Pembimbing Section -->
                            <div style="margin-bottom:8px; background:#f0f9ff; padding:6px; border-radius:5px; border-left:2px solid var(--primary);">
                                <div style="font-size:0.6rem; text-transform:uppercase; color:#0050b3; font-weight:700; letter-spacing:0.2px; margin-bottom:2px;">👨‍🏫 Pembimbing</div>
                                <div style="font-weight:600; color:#333; font-size:0.8rem;">${slot.mahasiswaPembimbing}</div>
                            </div>

                            <!-- Penguji Lain Section -->
                            <div>
                                <div style="font-size:0.6rem; text-transform:uppercase; color:#999; font-weight:700; letter-spacing:0.2px; margin-bottom:3px;">👥 Penguji Lain</div>
                                <div style="display:flex; flex-direction:column; gap:4px;">
                                    ${slot.examiners && slot.examiners.length > 1 ? 
                                        slot.examiners.map((ex, idx) => {
                                            if (compareNames(ex, lecturerName)) return ''; // Skip current lecturer
                                            const position = idx === slot.examiners.length - 1 ? 'Pembimbing' : 
                                                             idx === 0 ? 'Penguji 1' : 'Penguji 2';
                                            return `
                                                <div style="background:#fff7e6; padding:4px 6px; border-radius:4px; border-left:2px solid #d46b08; font-size:0.75rem;">
                                                    <div style="font-weight:600; color:#333;">${ex}</div>
                                                    <div style="font-size:0.65rem; color:#999; margin-top:0.5px;">${position}</div>
                                                </div>
                                            `;
                                        }).join('')
                                        : '<div style="color:#999; font-size:0.75rem; font-style:italic;">-</div>'
                                    }
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        contentHtml = dateGroupsHtml;
    }

    const statsHtml = `
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:1.5rem;">
            <div style="background:var(--primary-subtle); color:var(--primary); padding:12px; border-radius:8px; text-align:center; border:2px solid var(--primary);">
                <div style="font-size:0.65rem; text-transform:uppercase; font-weight:700; letter-spacing:0.3px; margin-bottom:6px;">Total Jadwal</div>
                <div style="font-size:1.6rem; font-weight:800;">${totalSlots}</div>
            </div>
            <div style="background:#f6ffed; color:var(--success); padding:12px; border-radius:8px; text-align:center; border:2px solid var(--success);">
                <div style="font-size:0.65rem; text-transform:uppercase; font-weight:700; letter-spacing:0.3px; margin-bottom:6px;">Bimbingan</div>
                <div style="font-size:1.6rem; font-weight:800;">${totalBimbingan}</div>
            </div>
            <div style="background:#fff1f0; color:#cf1322; padding:12px; border-radius:8px; text-align:center; border:2px solid #cf1322;">
                <div style="font-size:0.65rem; text-transform:uppercase; font-weight:700; letter-spacing:0.3px; margin-bottom:6px;">Menguji</div>
                <div style="font-size:1.6rem; font-weight:800;">${totalMenguji}</div>
            </div>
        </div>
    `;

    modalOverlay.innerHTML = `
        <div class="modal-content" style="max-width:1200px; max-height:90vh; overflow-y:auto; animation: modalSlideIn 0.3s ease;">
            <!-- Sticky Header -->
            <div style="position:sticky; top:0; background:white; padding-bottom:0.8rem; border-bottom:1px solid var(--border-subtle); z-index:10; margin-bottom:1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                    <div>
                        <h2 style="margin:0; font-size:1.4rem;">📋 Jadwal Pendadaran ${dosenData?.status === 'OFF' ? '(OFF)' : ''}</h2>
                        <p class="subtitle" style="margin:4px 0 0 0; font-weight:600; color:var(--primary); font-size:0.95rem;">${lecturerName}</p>
                    </div>
                    <button type="button" class="btn-icon" style="font-size:1.5rem;" onclick="window.closeDetailedLecturerScheduleModal()">✕</button>
                </div>
                ${statsHtml}
            </div>

            <!-- Content -->
            <div style="padding-bottom:1.2rem;">
                ${contentHtml}
            </div>

            <!-- Footer Actions -->
            <div style="position:sticky; bottom:0; background:white; padding:1rem 0; border-top:1px solid var(--border-subtle); display:flex; gap:12px; justify-content:flex-end;">
                <button type="button" class="btn-secondary" onclick="window.printDetailedSchedule('${lecturerName}')">
                    🖨️ Cetak
                </button>
                <button type="button" class="btn-primary" onclick="window.closeDetailedLecturerScheduleModal()">
                    Tutup
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // Global Close handler
    window.closeDetailedLecturerScheduleModal = () => {
        modalOverlay.classList.remove('active');
        setTimeout(() => modalOverlay.remove(), 300);
    };

    // Print handler
    window.printDetailedSchedule = (name) => {
        const printContent = modalOverlay.querySelector('.modal-content').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Jadwal Pendadaran - ${name}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: white; color: #333; }
                        .modal-content { max-width: 1200px; margin: 0 auto; padding: 20px; }
                        h2 { color: #0050b3; margin: 20px 0 10px 0; font-size: 1.8rem; }
                        h4 { color: #0050b3; margin: 20px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #0050b3; font-size: 1.1rem; }
                        p.subtitle { color: #666; margin: 5px 0 20px 0; }
                        .badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; margin: 5px 0; }
                        .badge-primary { background: #e6f7ff; color: #0050b3; }
                        .badge-success { background: #f6ffed; color: #52c41a; }
                        div[style*="grid-template-columns"] { display: grid; }
                        div[style*="background:#f0f9ff"] { background: #f0f9ff; padding: 12px; border-radius: 8px; border-left: 4px solid #0050b3; margin: 10px 0; }
                        div[style*="background:#fff7e6"] { background: #fff7e6; padding: 10px; border-radius: 6px; border-left: 3px solid #d46b08; margin: 8px 0; }
                        .modal-content > div:first-child { margin-bottom: 30px; }
                        @media print { 
                            body { margin: 0; padding: 0; }
                            .modal-content { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="modal-content">
                        <h2>📋 Jadwal Pendadaran</h2>
                        <p class="subtitle"><strong>Nama Dosen:</strong> ${name}</p>
                        <p class="subtitle"><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                        ${printContent}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    };
}

/**
 * Helper function to format date
 */
function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', options);
}
