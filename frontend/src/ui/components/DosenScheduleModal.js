import { APP_DATA } from '../../data/store.js';
import { compareNames } from '../../utils/helpers.js';
import { showDetailedLecturerSchedule } from './DosenDetailedScheduleModal.js';

export function showLecturerSchedule(lecturerName) {
    const modalId = 'lecturerScheduleModal';
    let modal = document.getElementById(modalId);
    if (modal) modal.remove();

    const slots = APP_DATA.slots || [];

    // Filter slots for this lecturer using compareNames
    const mySchedule = slots.filter(slot =>
        slot.examiners && slot.examiners.some(ex => compareNames(ex, lecturerName))
    ).map(slot => {
        const myIndex = slot.examiners.findIndex(ex => compareNames(ex, lecturerName));
        const role = myIndex === slot.examiners.length - 1 ? 'Pembimbing' : `Penguji ${myIndex + 1}`;
        return { ...slot, role };
    }).sort((a, b) => {
        // Sort by date then time
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    const modalOverlay = document.createElement('div');
    modalOverlay.id = modalId;
    modalOverlay.className = 'modal-overlay active';

    let tableHtml = '';
    if (mySchedule.length === 0) {
        tableHtml = `
            <div style="text-align:center; padding:3rem; color:var(--text-muted);">
                <div style="font-size:3rem; margin-bottom:1rem;">📅</div>
                <p>Belum ada jadwal pendadaran untuk dosen ini.</p>
            </div>
        `;
    } else {
        tableHtml = `
            <div style="max-height: 700px; overflow-y: auto; border: 1px solid var(--border-subtle); border-radius: 12px; margin-top:1rem;">
                <table style="width:100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead style="background:var(--bg-subtle); position: sticky; top:0; z-index:1;">
                        <tr>
                            <th style="padding:12px; text-align:left; border-bottom:2px solid var(--border-subtle); width:120px;">Waktu</th>
                            <th style="padding:12px; text-align:left; border-bottom:2px solid var(--border-subtle); width:100px;">Ruang</th>
                            <th style="padding:12px; text-align:left; border-bottom:2px solid var(--border-subtle);">Mahasiswa</th>
                            <th style="padding:12px; text-align:center; border-bottom:2px solid var(--border-subtle); width:120px;">Peran</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mySchedule.map(s => `
                            <tr>
                                <td style="padding:12px; border-bottom:1px solid var(--border-subtle);">
                                    <div style="font-weight:700;">${s.date}</div>
                                    <div style="font-size:0.8rem; color:var(--text-muted);">${s.time}</div>
                                </td>
                                <td style="padding:12px; border-bottom:1px solid var(--border-subtle);">
                                    <span class="badge badge-secondary">${s.room}</span>
                                </td>
                                <td style="padding:12px; border-bottom:1px solid var(--border-subtle);">
                                    <div style="font-weight:600;">${s.student}</div>
                                </td>
                                <td style="padding:12px; border-bottom:1px solid var(--border-subtle); text-align:center;">
                                    <span class="badge ${s.role === 'Pembimbing' ? 'badge-primary' : 'badge-success'}" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">
                                        ${s.role}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    modalOverlay.innerHTML = `
        <div class="modal-content" style="max-width: 900px; animation: modalSlideIn 0.3s ease;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
                <div>
                    <h2 style="margin:0; font-size:1.5rem;">Rincian Jadwal Dosen</h2>
                    <p class="subtitle" style="margin-top:4px; font-weight:600; color:var(--primary); font-size:1.1rem;">${lecturerName}</p>
                </div>
                <button type="button" class="btn-icon" style="font-size:1.5rem;" onclick="window.closeLecturerScheduleModal()">✕</button>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:1.5rem;">
                <div style="background:var(--primary-subtle); color:var(--primary); padding:10px 15px; border-radius:10px; flex:1; text-align:center;">
                    <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Total Bimbingan</div>
                    <div style="font-size:1.25rem; font-weight:800;">${mySchedule.filter(s => s.role === 'Pembimbing').length}</div>
                </div>
                <div style="background:var(--success-subtle); color:var(--success); padding:10px 15px; border-radius:10px; flex:1; text-align:center;">
                    <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700;">Total Menguji</div>
                    <div style="font-size:1.25rem; font-weight:800;">${mySchedule.filter(s => s.role !== 'Pembimbing').length}</div>
                </div>
            </div>

            ${tableHtml}

            <div class="modal-footer" style="margin-top:2rem; justify-content: space-between;">
                <button type="button" class="btn-secondary" onclick="window.showDetailedLecturerSchedule('${lecturerName}')">📋 Lihat Detail Lengkap</button>
                <button type="button" class="btn-primary" style="min-width:100px;" onclick="window.closeLecturerScheduleModal()">Tutup</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // Global Close handler
    window.closeLecturerScheduleModal = () => {
        modalOverlay.classList.remove('active');
        setTimeout(() => modalOverlay.remove(), 300);
    };

    // Global show detailed handler
    window.showDetailedLecturerSchedule = showDetailedLecturerSchedule;
}
