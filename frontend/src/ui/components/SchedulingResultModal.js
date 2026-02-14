
export function showSchedulingResult(data) {
    return new Promise((resolve) => {
        const modalId = 'scheduling-result-modal';
        const existing = document.getElementById(modalId);
        if (existing) existing.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.id = modalId;
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.zIndex = '9999';

        const { scheduled, total, failures = [] } = data;
        const hasFailures = failures.length > 0;

        let failureHtml = '';
        if (hasFailures) {
            failureHtml = `
                <div style="margin-top: 1.5rem; text-align: left;">
                    <div style="font-weight: 700; color: var(--danger); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                        <span>⚠️</span> ${failures.length} Mahasiswa Gagal Terjadwal
                    </div>
                    <div style="max-height: 250px; overflow-y: auto; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; padding: 4px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                            <thead style="background: rgba(255,163,158, 0.2); position: sticky; top: 0;">
                                <tr>
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ffa39e;">Mahasiswa</th>
                                    <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ffa39e;">Kendala / Alasan</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${failures.map(f => `
                                    <tr>
                                        <td style="padding: 8px; border-bottom: 1px solid rgba(255,163,158, 0.3); vertical-align: top;">
                                            <strong>${f.nama}</strong><br>
                                            <span style="font-size: 0.75rem; color: #8c8c8c;">${f.nim}</span>
                                        </td>
                                        <td style="padding: 8px; border-bottom: 1px solid rgba(255,163,158, 0.3); color: #cf1322; line-height: 1.4;">
                                            ${f.reason}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <p style="font-size: 0.75rem; color: #595959; margin-top: 8px; font-style: italic;">
                        Saran: Coba tambah kuota ruangan atau cek ketersediaan dosen pembimbing tersebut.
                    </p>
                </div>
            `;
        }

        modalOverlay.innerHTML = `
            <div class="modal-content" style="max-width: 550px; text-align: center; animation: modalSlideIn 0.3s ease; padding: 2rem;">
                <div style="font-size: 3.5rem; margin-bottom: 1rem;">${hasFailures ? '📊' : '🎉'}</div>
                <h2 style="margin-bottom: 0.5rem;">${hasFailures ? 'Hasil Berhasil Sebagian' : 'Penjadwalan Selesai!'}</h2>
                
                <div style="display: flex; gap: 12px; justify-content: center; margin: 1.5rem 0;">
                    <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 10px 20px; border-radius: 12px;">
                        <div style="font-size: 0.75rem; color: #52c41a; font-weight: 700; text-transform: uppercase;">Berhasil</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #237804;">${scheduled}</div>
                    </div>
                    <div style="background: #f5f5f5; border: 1px solid #d9d9d9; padding: 10px 20px; border-radius: 12px;">
                        <div style="font-size: 0.75rem; color: #8c8c8c; font-weight: 700; text-transform: uppercase;">Total</div>
                        <div style="font-size: 1.5rem; font-weight: 800; color: #262626;">${total}</div>
                    </div>
                </div>

                ${failureHtml}

                <div class="modal-footer" style="justify-content: center; gap: 12px; margin-top: 2rem; border-top: 1px solid #f0f0f0; pt-1.5rem;">
                    <button id="btn-done" class="btn-secondary" style="min-width: 120px;">Tutup</button>
                    <button id="btn-view" class="btn-primary" style="min-width: 150px;">Lihat Dashboard</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const btnDone = modalOverlay.querySelector('#btn-done');
        const btnView = modalOverlay.querySelector('#btn-view');

        const close = (result) => {
            modalOverlay.classList.remove('active');
            setTimeout(() => { if (modalOverlay.parentElement) modalOverlay.remove(); }, 300);
            resolve(result);
        };

        btnDone.addEventListener('click', () => close(false));
        btnView.addEventListener('click', () => close(true));
        btnView.focus();
    });
}
