import { MOCK_DATA, appState, DATES, saveMahasiswaToStorage, saveLiburToStorage } from '../data/store.js';
import { getAllDosen } from '../utils/helpers.js';
import * as views from './pages/index.js';

export function toggleAddMahasiswaModal(show) {
    const modalId = 'addMahasiswaModal';
    let modal = document.getElementById(modalId);
    if (show) {
        if (modal) modal.remove();
        const modalContainer = document.createElement('div');
        modalContainer.id = modalId;
        modalContainer.className = 'modal-overlay';
        const dosenOptions = getAllDosen().map(d => `<option value="${d.nama}">${d.nama}</option>`).join('');

        modalContainer.innerHTML = `
            <div class="modal-content">
                <h2>Tambah Mahasiswa</h2>
                <form onsubmit="window.saveNewMahasiswa(event)">
                    <div class="form-group"><label>NIM</label><input type="text" name="nim" class="form-input" required></div>
                    <div class="form-group"><label>Nama</label><input type="text" name="nama" class="form-input" required></div>
                    <div class="form-group"><label>Prodi</label><select name="prodi" class="form-input" required><option value="Informatika">Informatika</option><option value="Sistem Informasi">Sistem Informasi</option><option value="Teknologi Informasi">Teknologi Informasi</option><option value="Ilmu Komunikasi">Ilmu Komunikasi</option><option value="Geografi">Geografi</option></select></div>
                    <div class="form-group"><label>Pembimbing</label><select name="pembimbing" class="form-input"><option value="">-- Pilih --</option>${dosenOptions}</select></div>
                    <div class="modal-footer"><button type="button" class="btn-secondary" onclick="window.toggleAddMahasiswaModal(false)">Batal</button><button type="submit">Simpan</button></div>
                </form>
            </div>
        `;
        document.body.appendChild(modalContainer);
        setTimeout(() => modalContainer.classList.add('active'), 10);
    } else if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

export function saveNewMahasiswa(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nim = formData.get('nim');
    if (MOCK_DATA.mahasiswa.some(m => m.nim === nim)) return alert('NIM sudah terdaftar!');

    MOCK_DATA.mahasiswa.push({ nim, nama: formData.get('nama'), prodi: formData.get('prodi'), pembimbing: formData.get('pembimbing') });
    saveMahasiswaToStorage();
    if (appState.currentView === 'mahasiswa') document.getElementById('main-content').innerHTML = views.mahasiswa();
    toggleAddMahasiswaModal(false);
}

export function toggleAddLiburModal(show, editIndex = null) {
    const modalId = 'addLiburModal';
    let modal = document.getElementById(modalId);
    if (!show) {
        if (modal) { modal.classList.remove('active'); setTimeout(() => modal.remove(), 300); }
        return;
    }

    if (modal) modal.remove();
    const isEdit = editIndex !== null;
    const data = isEdit ? MOCK_DATA.libur[editIndex] : { type: 'date', days: [], times: [] };
    const modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    modalContainer.className = 'modal-overlay';

    const dosenOpts = getAllDosen().map(d => `<option value="${d.nik}" ${d.nik === data.dosenId ? 'selected' : ''}>${d.nama}</option>`).join('');

    const dateChecklist = DATES.map(d => `
        <label style="display:flex; align-items:center; gap:10px; background:white; padding:10px 14px; border-radius:12px; border:1px solid var(--border); cursor:pointer; transition: all 0.2s;" class="date-checkbox-item">
            <input type="checkbox" name="dates" value="${d.value}" ${data.dates?.includes(d.value) ? 'checked' : ''} style="width:18px; height:18px;">
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:700; font-size:0.95rem;">${d.display}</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${d.label}</span>
            </div>
        </label>
    `).join('');

    modalContainer.innerHTML = `
        <div class="modal-content" style="max-width:650px;">
            <div style="margin-bottom:1.5rem; text-align:center;">
                <h2 style="margin-bottom:0.5rem;">${isEdit ? '✏️ Edit Jadwal Blokir' : '🚫 Blokir Jadwal Dosen'}</h2>
                <p style="color:var(--text-secondary); font-size:0.9rem;">Pilih tanggal-tanggal di mana dosen <b>tidak bisa</b> dijadwalkan.</p>
            </div>
            
            <form onsubmit="window.saveNewLibur(event)">
                <input type="hidden" name="editIndex" value="${isEdit ? editIndex : -1}">
                
                <div class="form-group">
                    <label style="font-weight:700;">1. Pilih Nama Dosen</label>
                    <select name="dosenId" class="form-input" style="font-size:1rem; padding:12px; border-radius:12px; font-weight:600; background:#f8f9fa;" required>${dosenOpts}</select>
                </div>

                <div class="form-group">
                    <label style="font-weight:700;">2. Centang Tanggal Libur/Berhalangan</label>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:12px; padding:15px; background:rgba(0,0,0,0.02); border-radius:16px; border:1px dashed var(--border);">
                        ${dateChecklist}
                    </div>
                </div>

                <div class="form-group">
                    <label style="font-weight:700;">3. Alasan (Opsional)</label>
                    <input type="text" name="reason" class="form-input" placeholder="Misal: Umroh, Sakit, atau Ada Kelas" value="${data.reason || ''}" style="padding:12px; border-radius:12px;">
                </div>

                <div class="modal-footer" style="margin-top:2rem; gap:12px;">
                    <button type="button" class="btn-secondary" onclick="window.toggleAddLiburModal(false)" style="flex:1; padding:12px;">Batal</button>
                    <button type="submit" class="btn-primary" style="flex:2; padding:12px; font-weight:800; background:var(--danger); box-shadow:0 4px 12px rgba(255,59,48,0.2);">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modalContainer);
    setTimeout(() => modalContainer.classList.add('active'), 10);
}

export function saveNewLibur(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const idx = parseInt(f.get('editIndex'));

    const entry = {
        dosenId: f.get('dosenId'),
        dates: f.getAll('dates'), // Collects all checked date values
        reason: f.get('reason')
    };

    if (idx >= 0) MOCK_DATA.libur[idx] = entry;
    else MOCK_DATA.libur.push(entry);

    saveLiburToStorage();
    if (appState.currentView === 'libur') document.getElementById('main-content').innerHTML = views.libur();
    toggleAddLiburModal(false);
}
