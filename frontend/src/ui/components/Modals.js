import { APP_DATA, appState, DATES, TIMES, saveMahasiswaToStorage, saveLiburToStorage } from '../../data/store.js';
import { getAllDosen } from '../../utils/helpers.js';
import * as views from '../pages/index.js';
import { showConfirm } from './ConfirmationModal.js';

// Consolidated Add/Edit Mahasiswa Modal
export function toggleAddMahasiswaModal(show, studentData = null) {
    const modalId = 'addMahasiswaModal';
    let modal = document.getElementById(modalId);

    if (!show) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
        return;
    }

    if (modal) modal.remove();
    const modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    modalContainer.className = 'modal-overlay';

    const isEdit = !!studentData;
    const title = isEdit ? '✏️ Edit Data Mahasiswa' : '➕ Tambah Data Mahasiswa';
    const subtitle = isEdit ? 'Perbaharui informasi mahasiswa & dosen pembimbing.' : 'Tambahkan mahasiswa peserta pendadaran.';
    const submitText = isEdit ? 'Simpan Perubahan' : 'Simpan';

    // Default values
    const data = studentData || { nim: '', nama: '', prodi: '', pembimbing: '' };

    // Dosen Options
    const allDosen = getAllDosen();
    const dosenOptions = allDosen.map(d =>
        `<option value="${d.nama}" ${d.nama === data.pembimbing ? 'selected' : ''}>${d.nama}</option>`
    ).join('');

    // Logic to show CSV tab only if creating new
    const tabsHtml = !isEdit ? `
        <div style="margin-bottom:1.5rem;">
            <div style="display:flex; gap:10px; background:rgba(0,0,0,0.03); padding:4px; border-radius:12px;">
                <button type="button" class="tab-btn-mhs active" onclick="window.switchMahasiswaInputMode('csv')" data-mode="csv" style="flex:1; padding:10px; border:none; background:white; border-radius:10px; cursor:pointer; font-weight:700;">Import CSV</button>
                <button type="button" class="tab-btn-mhs" onclick="window.switchMahasiswaInputMode('manual')" data-mode="manual" style="flex:1; padding:10px; border:none; background:transparent; border-radius:10px; cursor:pointer; font-weight:700;">Input Manual</button>
            </div>
        </div>
        <!-- SECTION CSV -->
        <div id="mhsCsvSection">
             <div style="text-align:center; padding:2rem; background:rgba(0,0,0,0.02); border-radius:12px; border:2px dashed var(--border);">
                 <div style="font-size:3rem; margin-bottom:1rem;">📂</div>
                 <p style="margin-bottom:1rem; font-weight:600;">Upload file CSV Mahasiswa</p>
                 <code style="display:block; background:white; padding:10px; border-radius:8px; margin-bottom:1rem; font-size:0.85rem;">No,NIM,Nama,Prodi,Pembimbing</code>
                 <button type="button" onclick="document.getElementById('csvMahasiswaInput').click()" class="btn-primary">Pilih File CSV</button>
                 <input type="file" id="csvMahasiswaInput" accept=".csv" style="display:none;" onchange="window.handleMahasiswaCSVUpload(event)">
             </div>
        </div>
    ` : '';

    modalContainer.innerHTML = `
        <div class="modal-content" style="max-width:600px;">
            <h2>${title}</h2>
            <p class="subtitle" style="margin-bottom:1.5rem;">${subtitle}</p>

            ${tabsHtml}

            <!-- SECTION MANUAL (Default for Edit) -->
            <div id="mhsManualSection" style="${!isEdit ? 'display:none;' : 'display:block;'}">
                <form onsubmit="window.saveMahasiswa(event, ${isEdit})">
                    <div class="form-group">
                        <label>NIM</label>
                        <input type="text" name="nim" class="form-input" required value="${data.nim}" ${isEdit ? 'readonly style="background-color:#f5f5f5; color:#888;"' : 'placeholder="Contoh: A11.2020.12345"'}>
                        ${isEdit ? '<small style="color:var(--text-muted);">NIM tidak dapat diubah (Primary Key).</small>' : ''}
                    </div>
                    <div class="form-group">
                        <label>Nama Lengkap</label>
                        <input type="text" name="nama" class="form-input" required value="${data.nama}" placeholder="Nama Mahasiswa">
                    </div>
                    <div class="form-group">
                        <label>Program Studi</label>
                        <select name="prodi" class="form-input" required onchange="window.updateDosenDropdown(this.value)">
                            <option value="">-- Pilih Program Studi --</option>
                            ${(() => {
            const validProdis = {
                'FIK': ['S1 Informatika', 'S1 Sistem Informasi', 'S1 Teknologi Informasi', 'S1 Teknik Komputer', 'D3 Teknik Informatika', 'D3 Manajemen Informatika', 'S2 Informatika', 'S2 PJJ Informatika', 'S3 Informatika'],
                'FES': ['S1 Ilmu Komunikasi', 'S1 Ekonomi', 'S1 Akuntansi', 'S1 Hubungan Internasional', 'S1 Ilmu Pemerintahan', 'S1 Kewirausahaan'],
                'FST': ['S1 Arsitektur', 'S1 Perencanaan Wilayah Kota', 'S1 Geografi']
            };
            const allProdis = [...validProdis.FIK, ...validProdis.FES, ...validProdis.FST].sort();
            return allProdis.map(p => `<option value="${p}" ${p === data.prodi ? 'selected' : ''}>${p}</option>`).join('');
        })()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dosen Pembimbing</label>
                        <select name="pembimbing" class="form-input">
                            <option value="">-- Pilih Pembimbing --</option>
                            ${dosenOptions}
                        </select>
                        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:5px;">
                            Pilih dosen dari daftar untuk memastikan kesesuaian data.
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="window.toggleAddMahasiswaModal(false)">Batal</button>
                        <button type="submit" class="btn-primary">${submitText}</button>
                    </div>
                </form>
            </div>

            <div style="text-align:center; margin-top:1rem;">
                <button type="button" class="btn-secondary" onclick="window.toggleAddMahasiswaModal(false)">Tutup</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
    setTimeout(() => modalContainer.classList.add('active'), 10);
}

export function switchMahasiswaInputMode(mode) {
    const csvSection = document.getElementById('mhsCsvSection');
    const manualSection = document.getElementById('mhsManualSection');
    const tabs = document.querySelectorAll('.tab-btn-mhs');

    tabs.forEach(tab => {
        if (tab.dataset.mode === mode) {
            tab.classList.add('active');
            tab.style.background = 'white';
        } else {
            tab.classList.remove('active');
            tab.style.background = 'transparent';
        }
    });

    if (mode === 'csv') {
        csvSection.style.display = 'block';
        manualSection.style.display = 'none';
    } else {
        csvSection.style.display = 'none';
        manualSection.style.display = 'block';
    }
}

export function handleMahasiswaCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (event) {
        const csvText = event.target.result;
        const lines = csvText.split('\n');
        let dataToUpload = [];

        // Parse CSV (Skip header)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle CSV fields logic
            const fields = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));

            if (fields.length < 3) continue;

            const nim = fields[1];
            const nama = fields[2];
            const prodi = fields[3] || 'Informatika';
            const pembimbing = fields[4] || '';

            if (nim && nama) {
                dataToUpload.push({ nim, nama, prodi, pembimbing });
            }
        }

        if (dataToUpload.length === 0) {
            showToast('Tidak ada data valid yang ditemukan di file CSV.', 'warning');
            return;
        }

        try {
            const { mahasiswaAPI } = await import('../../services/api.js');
            const response = await mahasiswaAPI.bulkCreate(dataToUpload);

            if (response.success) {
                const freshData = await mahasiswaAPI.getAll();
                APP_DATA.mahasiswa = freshData.data;

                if (appState.currentView === 'mahasiswa') {
                    document.getElementById('main-content').innerHTML = views.mahasiswa();
                }
                toggleAddMahasiswaModal(false);
                showToast(`Berhasil import ${response.inserted} mahasiswa!`, 'success');
            }
        } catch (error) {
            showToast('Gagal mengimpor CSV Mahasiswa: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

export async function saveMahasiswa(e, isEdit) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nim = formData.get('nim');
    const nama = formData.get('nama');
    const prodi = formData.get('prodi');
    const pembimbing = formData.get('pembimbing');

    // Validation (Create only)
    if (!isEdit && APP_DATA.mahasiswa.some(m => m.nim === nim)) return showToast('NIM sudah terdaftar!', 'warning');

    try {
        const { mahasiswaAPI } = await import('../../services/api.js');

        let response;
        if (isEdit) {
            response = await mahasiswaAPI.update(nim, { nama, prodi, pembimbing });
        } else {
            response = await mahasiswaAPI.create({ nim, nama, prodi, pembimbing });
        }

        if (response.success) {
            // Update local state is cumbersome, better to refresh or simple update
            if (isEdit) {
                const idx = APP_DATA.mahasiswa.findIndex(m => m.nim === nim);
                if (idx !== -1) APP_DATA.mahasiswa[idx] = response.data; // might differ slightly structure-wise
                // Actually helper API returns simplified or full row. 
                // Let's assume re-fetching or manually updating is fine.
                // Re-fetch all to be safe? Or just update.
                APP_DATA.mahasiswa[idx] = { ...APP_DATA.mahasiswa[idx], nama, prodi, pembimbing };
            } else {
                APP_DATA.mahasiswa.push(response.data);
            }

            if (appState.currentView === 'mahasiswa') document.getElementById('main-content').innerHTML = views.mahasiswa();

            toggleAddMahasiswaModal(false);
            showToast(`Data mahasiswa berhasil ${isEdit ? 'diperbarui' : 'disimpan'}! ✅`, 'success');
        }
    } catch (error) {
        showToast(`Gagal ${isEdit ? 'update' : 'simpan'} mahasiswa: ` + error.message, 'error');
    }
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
    const data = isEdit ? APP_DATA.libur[editIndex] : { type: 'date', days: [], times: [] };
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

    const timeChecklist = TIMES.map(t => `
        <label style="display:flex; align-items:center; gap:10px; background:white; padding:10px 14px; border-radius:12px; border:1px solid var(--border); cursor:pointer; transition: all 0.2s;" class="time-checkbox-item">
            <input type="checkbox" name="times" value="${t}" ${data.times?.includes(t) ? 'checked' : ''} style="width:18px; height:18px;">
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:700; font-size:0.95rem;">⏰ ${t}</span>
            </div>
        </label>
    `).join('');

    modalContainer.innerHTML = `
        <div class="modal-content" style="max-width:700px; max-height:90vh; overflow-y:auto;">
            <div style="margin-bottom:1.5rem; text-align:center;">
                <h2 style="margin-bottom:0.5rem;">${isEdit ? '✏️ Edit Jadwal Blokir' : '🚫 Blokir Jadwal Dosen'}</h2>
                <p style="color:var(--text-secondary); font-size:0.9rem;">Pilih tanggal dan/atau jam di mana dosen <b>tidak bisa</b> dijadwalkan.</p>
            </div>
            
            <form onsubmit="window.saveNewLibur(event)">
                <input type="hidden" name="editIndex" value="${isEdit ? editIndex : -1}">
                
                <div class="form-group">
                    <label style="font-weight:700;">1. Pilih Nama Dosen</label>
                    <select name="dosenId" class="form-input" style="font-size:1rem; padding:12px; border-radius:12px; font-weight:600; background:#f8f9fa;" required>${dosenOpts}</select>
                </div>

                <div class="form-group">
                    <label style="font-weight:700;">2. Centang Tanggal Libur/Berhalangan (Opsional)</label>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:12px; padding:15px; background:rgba(0,0,0,0.02); border-radius:16px; border:1px dashed var(--border);">
                        ${dateChecklist}
                    </div>
                    <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">
                        💡 <b>Kosongkan semua tanggal</b> jika ingin blokir jam tertentu di <b>SEMUA tanggal</b><br>
                        📌 Centang tanggal tertentu untuk blokir hanya di tanggal tersebut
                    </p>
                </div>

                <div class="form-group">
                    <label style="font-weight:700;">3. Centang Jam yang Diblokir (Opsional)</label>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:12px; padding:15px; background:rgba(0,0,0,0.02); border-radius:16px; border:1px dashed var(--border);">
                        ${timeChecklist}
                    </div>
                    <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">
                        💡 <b>Kosongkan semua jam</b> untuk blokir seharian penuh<br>
                        📌 Centang jam tertentu untuk blokir hanya di jam tersebut
                    </p>
                </div>

                <div class="form-group">
                    <label style="font-weight:700;">4. Alasan (Opsional)</label>
                    <input type="text" name="reason" class="form-input" placeholder="Misal: Umroh, Sakit, atau Ada Kelas" value="${data.reason || ''}" style="padding:12px; border-radius:12px;">
                </div>

                <div style="background:#e6f7ff; border:1px solid #91d5ff; border-radius:12px; padding:12px; margin-bottom:1rem;">
                    <p style="font-size:0.85rem; color:#0050b3; margin:0; line-height:1.6;">
                        <b>💡 Contoh Penggunaan:</b><br>
                        • <b>Blokir jam pagi di semua hari:</b> Kosongkan tanggal, centang jam 10:00, 11:30, 13:30<br>
                        • <b>Blokir tanggal tertentu seharian:</b> Centang tanggal, kosongkan jam<br>
                        • <b>Blokir jam tertentu di tanggal tertentu:</b> Centang keduanya
                    </p>
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

export async function saveNewLibur(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const idx = parseInt(f.get('editIndex'));

    const dates = f.getAll('dates');
    const times = f.getAll('times');

    // Validation: at least one date or one time must be selected
    if (dates.length === 0 && times.length === 0) {
        return showToast('Pilih minimal satu tanggal atau satu jam!', 'warning');
    }

    const dosenId = f.get('dosenId');
    const reason = f.get('reason') || '';

    try {
        const { liburAPI } = await import('../../services/api.js');

        // Save entries to database
        const savedEntries = [];

        if (dates.length > 0 && times.length > 0) {
            // Specific dates with specific times
            for (const date of dates) {
                for (const time of times) {
                    const entry = {
                        date: date,
                        time: time,
                        reason: reason,
                        nik: dosenId
                    };
                    const response = await liburAPI.create(entry);
                    if (response.success) savedEntries.push(response.data);
                }
            }
        } else if (dates.length > 0) {
            // Specific dates, all day (no time specified)
            for (const date of dates) {
                const entry = {
                    date: date,
                    time: null,
                    reason: reason,
                    nik: dosenId
                };
                const response = await liburAPI.create(entry);
                if (response.success) savedEntries.push(response.data);
            }
        } else if (times.length > 0) {
            // All dates, specific times
            for (const time of times) {
                const entry = {
                    date: null,
                    time: time,
                    reason: reason,
                    nik: dosenId
                };
                const response = await liburAPI.create(entry);
                if (response.success) savedEntries.push(response.data);
            }
        }

        // Update local state - group by dosenId
        const existingIndex = APP_DATA.libur.findIndex(l => l.dosenId === dosenId);

        if (existingIndex >= 0) {
            // Merge with existing
            const existingDates = APP_DATA.libur[existingIndex].dates || [];
            const existingTimes = APP_DATA.libur[existingIndex].times || [];
            APP_DATA.libur[existingIndex].dates = [...new Set([...existingDates, ...dates])];
            APP_DATA.libur[existingIndex].times = [...new Set([...existingTimes, ...times])];
            APP_DATA.libur[existingIndex].reason = reason;
        } else {
            // Create new grouped entry
            APP_DATA.libur.push({
                dosenId: dosenId,
                dates: dates,
                times: times,
                reason: reason
            });
        }

        if (appState.currentView === 'libur') {
            document.getElementById('main-content').innerHTML = views.libur();
        }

        toggleAddLiburModal(false);
        showToast(`Berhasil menyimpan ${savedEntries.length} jadwal blokir`, 'success');
        console.log('✅ Libur data saved to PostgreSQL');
    } catch (error) {
        console.error('Error saving libur:', error);
        showToast('Gagal menyimpan data libur: ' + error.message, 'error');
    }
}

export function toggleAddDosenModal(show) {
    const modalId = 'addDosenModal';
    let modal = document.getElementById(modalId);

    if (show) {
        if (modal) modal.remove();

        const currentFaculty = appState.currentDosenTab.toUpperCase();
        const modalContainer = document.createElement('div');
        modalContainer.id = modalId;
        modalContainer.className = 'modal-overlay';

        const validProdis = {
            'FIK': [
                'S1 Informatika', 'S1 Sistem Informasi', 'S1 Teknologi Informasi', 'S1 Teknik Komputer',
                'D3 Teknik Informatika', 'D3 Manajemen Informatika',
                'S2 Informatika', 'S2 PJJ Informatika', 'S3 Informatika'
            ],
            'FES': [
                'S1 Ilmu Komunikasi', 'S1 Ekonomi', 'S1 Akuntansi', 'S1 Hubungan Internasional',
                'S1 Ilmu Pemerintahan', 'S1 Kewirausahaan'
            ],
            'FST': [
                'S1 Arsitektur', 'S1 Perencanaan Wilayah Kota', 'S1 Geografi'
            ]
        };

        // Gabungkan semua prodi untuk fallback jika fakultas tidak dikenal
        const allProdis = [...validProdis.FIK, ...validProdis.FES, ...validProdis.FST].sort();

        // Filter sesuai fakultas aktif
        let targetProdis = validProdis[currentFaculty];
        if (!targetProdis || targetProdis.length === 0) {
            console.warn(`[Modal] Fakultas '${currentFaculty}' tidak ditemukan di validProdis. Menggunakan semua prodi.`);
            targetProdis = allProdis;
        }

        const prodiOptions = targetProdis.map(p => `<option value="${p}">${p}</option>`).join('');

        modalContainer.innerHTML = `
            <div class="modal-content" style="max-width:600px;">
                <h2>➕ Tambah Dosen ${currentFaculty}</h2>
                <p class="subtitle" style="margin-bottom:1.5rem;">Tambahkan dosen baru ke fakultas ${currentFaculty}</p>
                
                <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; gap:10px; background:rgba(0,0,0,0.03); padding:4px; border-radius:12px;">
                        <button type="button" class="tab-btn active" onclick="window.switchDosenInputMode('csv')" data-mode="csv" style="flex:1; padding:10px; border:none; background:white; border-radius:10px; cursor:pointer; font-weight:700;">Import CSV</button>
                        <button type="button" class="tab-btn" onclick="window.switchDosenInputMode('manual')" data-mode="manual" style="flex:1; padding:10px; border:none; background:transparent; border-radius:10px; cursor:pointer; font-weight:700;">Input Manual</button>
                    </div>
                </div>

                <div id="csvInputSection">
                    <div style="text-align:center; padding:2rem; background:rgba(0,0,0,0.02); border-radius:12px; border:2px dashed var(--border);">
                        <div style="font-size:3rem; margin-bottom:1rem;">📄</div>
                        <p style="margin-bottom:1rem; font-weight:600;">Upload file CSV dengan format:</p>
                        <code style="display:block; background:white; padding:10px; border-radius:8px; margin-bottom:1rem; font-size:0.85rem;">No,Nama,NIK,Prodi,Fakultas</code>
                        <button type="button" onclick="document.getElementById('csvDosenInput').click()" class="btn-primary">Pilih File CSV</button>
                        <input type="file" id="csvDosenInput" accept=".csv" style="display:none;" onchange="window.handleDosenCSVUpload(event)">
                    </div>
                </div>

                <div id="manualInputSection" style="display:none;">
                    <form onsubmit="window.saveNewDosen(event)">
                        <input type="hidden" name="fakultas" value="${currentFaculty}">
                        <div class="form-group">
                            <label>NIK</label>
                            <input type="text" name="nik" class="form-input" required placeholder="Contoh: 12345678">
                        </div>
                        <div class="form-group">
                            <label>Nama Lengkap</label>
                            <input type="text" name="nama" class="form-input" required placeholder="Contoh: Dr. John Doe, M.Kom">
                        </div>
                        <div class="form-group">
                            <label>Program Studi</label>
                            <select name="prodi" class="form-input" required>
                                <option value="">-- Pilih Program Studi --</option>
                                ${prodiOptions}
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="window.toggleAddDosenModal(false)">Batal</button>
                            <button type="submit" class="btn-primary">Simpan Dosen</button>
                        </div>
                    </form>
                </div>

                <div style="text-align:center; margin-top:1rem;">
                    <button type="button" class="btn-secondary" onclick="window.toggleAddDosenModal(false)">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);
        setTimeout(() => modalContainer.classList.add('active'), 10);
    } else if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

export function switchDosenInputMode(mode) {
    const csvSection = document.getElementById('csvInputSection');
    const manualSection = document.getElementById('manualInputSection');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        if (tab.dataset.mode === mode) {
            tab.classList.add('active');
            tab.style.background = 'white';
        } else {
            tab.classList.remove('active');
            tab.style.background = 'transparent';
        }
    });

    if (mode === 'csv') {
        csvSection.style.display = 'block';
        manualSection.style.display = 'none';
    } else {
        csvSection.style.display = 'none';
        manualSection.style.display = 'block';
    }
}

export async function saveNewDosen(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fakultas = formData.get('fakultas');
    const nik = formData.get('nik').trim();
    const nama = formData.get('nama').trim();
    const prodi = formData.get('prodi').trim();

    if (APP_DATA.facultyData[fakultas]?.some(d => d.nik === nik)) {
        showToast('NIK sudah terdaftar di fakultas ini!', 'warning');
        return;
    }

    try {
        const { dosenAPI } = await import('../../services/api.js');
        const response = await dosenAPI.bulkInsert([{ nik, nama, prodi, fakultas }]);

        if (response.success) {
            const newDosen = {
                nik, nama, prodi, fakultas,
                exclude: false
            };

            if (!APP_DATA.facultyData[fakultas]) APP_DATA.facultyData[fakultas] = [];
            APP_DATA.facultyData[fakultas].push(newDosen);

            if (appState.currentView === 'dosen') document.getElementById('main-content').innerHTML = views.dosen();
            toggleAddDosenModal(false);
            showToast(`Dosen "${nama}" berhasil disimpan!`, 'success');
        }
    } catch (error) {
        showToast('Gagal menyimpan dosen: ' + error.message, 'error');
    }
}

export function handleDosenCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (event) {
        const csvText = event.target.result;
        const lines = csvText.split('\n');
        const currentFaculty = appState.currentDosenTab.toUpperCase();

        let dataToUpload = [];

        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const fields = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));
            if (fields.length < 4) continue;
            const [no, nama, nik, prodi, fakultas] = fields;
            const cleanNik = nik.replace(/^NIK\s+/, '').trim();

            dataToUpload.push({
                nik: cleanNik,
                nama: nama.trim(),
                prodi: prodi.trim(),
                fakultas: fakultas ? fakultas.toUpperCase() : currentFaculty
            });
        }

        try {
            const { dosenAPI } = await import('../../services/api.js');
            const response = await dosenAPI.bulkInsert(dataToUpload);

            if (response.success) {
                // Refresh data dari database untuk memastikan sinkron
                const freshData = await dosenAPI.getAll();
                APP_DATA.facultyData = freshData.data;

                if (appState.currentView === 'dosen') {
                    document.getElementById('main-content').innerHTML = views.dosen();
                }
                toggleAddDosenModal(false);
                showToast(`Berhasil mengimpor ${response.inserted} dosen!`, 'success');
            }
        } catch (error) {
            showToast('Gagal mengimpor CSV: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

export async function deleteDosen(faculty, nik) {
    if (!(await showConfirm('Hapus dosen ini secara PERMANEN dari Database?', 'Hapus Dosen', { text: 'Ya, Hapus', variant: 'danger' }))) return;

    try {
        const { dosenAPI } = await import('../../services/api.js');

        const response = await dosenAPI.delete(nik);
        if (response.success) {
            // Update local state
            if (APP_DATA.facultyData[faculty]) {
                APP_DATA.facultyData[faculty] = APP_DATA.facultyData[faculty].filter(d => d.nik !== nik);
            }

            // Refresh view
            if (appState.currentView === 'dosen') {
                document.getElementById('main-content').innerHTML = views.dosen();
            }

            showToast('Dosen berhasil dihapus permanen.', 'success');
        }
    } catch (error) {
        showToast('Gagal hapus dosen: ' + error.message, 'error');
    }
}


// SDM Master Data Functions

export function triggerImportSDM() {
    document.getElementById('importSDMInput').click();
}

export function exportSDMData() {
    const data = APP_DATA.masterDosen || [];
    if (data.length === 0) return showToast('Tidak ada data Master SDM untuk diexport.', 'warning');

    let csvContent = "No,NIK,Nama,Status,Kategori,NIDN,Jenis Kelamin\n";

    data.forEach((d, index) => {
        // Escape comma if handled properly, but simple version for now
        const row = [
            index + 1,
            `'${d.nik}`, // prevent Excel scientific notation
            `"${d.nama}"`,
            d.status || '',
            d.kategori || '',
            d.nidn || '',
            d.jenisKelamin || ''
        ].join(",");
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Master_SDM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function handleImportSDM(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (event) {
        const csvText = event.target.result;
        const lines = csvText.split('\n');
        let dataToUpload = [];

        // Skip header (i=1)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Expected format: No, NIK, Nama, Status, Kategori, NIDN, JK
            // Use regex or smart split if fields contain commas
            const fields = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));

            if (fields.length < 3) continue;

            // Handle potential offset if columns differ
            let nik = fields[1].replace(/'/g, ''); // removed quote from export
            let nama = fields[2];
            let status = fields[3] || '';
            let kategori = fields[4] || '';
            let nidn = fields[5] || '';
            let jenisKelamin = fields[6] || '';

            if (nik && nama) {
                dataToUpload.push({ nik, nama, status, kategori, nidn, jenisKelamin });
            }
        }

        if (dataToUpload.length === 0) return showToast('File CSV kosong atau format salah.', 'warning');

        try {
            const { dosenAPI } = await import('../../services/api.js');
            // Show loading
            showToast('Sedang mengunggah data ke server...', 'info');

            const response = await dosenAPI.bulkInsertMaster(dataToUpload);

            if (response.success) {
                // Refresh data
                const freshData = await dosenAPI.getMaster();
                APP_DATA.masterDosen = freshData.data;

                if (appState.currentView === 'dosen') {
                    // Re-render view
                    const container = document.getElementById('main-content');
                    if (container) {
                        // We need to re-import views to avoid circular dep issues in some bundlers, but it's fine here
                        import('../pages/index.js').then(v => {
                            container.innerHTML = v.dosen();
                        });
                    }
                }
                showToast(`Berhasil import Master SDM: ${response.inserted} data.`, 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Gagal import Master SDM: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

export function toggleAddMasterDosenModal(show) {
    const modalId = 'addMasterDosenModal';
    let modal = document.getElementById(modalId);

    if (!show) {
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
        return;
    }

    if (modal) modal.remove();
    const modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    modalContainer.className = 'modal-overlay';

    modalContainer.innerHTML = `
        <div class="modal-content" style="max-width:600px;">
            <h2>➕ Tambah Master Dosen (SDM)</h2>
            <p class="subtitle" style="margin-bottom:1.5rem;">Tambahkan data dosen ke database master SDM.</p>

            <form onsubmit="window.saveNewMasterDosen(event)">
                <div class="form-group">
                    <label>NIK</label>
                    <input type="text" name="nik" class="form-input" required placeholder="NIK Dosen">
                </div>
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" name="nama" class="form-input" required placeholder="Nama Lengkap dengan Gelar">
                </div>
                <div class="form-group">
                    <label>NIDN (Opsional)</label>
                    <input type="text" name="nidn" class="form-input" placeholder="NIDN Dosen">
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                    <div class="form-group">
                        <label>Jenis Kelamin</label>
                        <select name="jenisKelamin" class="form-input">
                            <option value="L">Laki-laki</option>
                            <option value="P">Perempuan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kategori</label>
                        <input type="text" name="kategori" class="form-input" placeholder="Contoh: Dosen Tetap">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="window.toggleAddMasterDosenModal(false)">Batal</button>
                    <button type="submit" class="btn-primary">Simpan ke Master</button>
                </div>
            </form>
            <div style="text-align:center; margin-top:1rem;">
                <button type="button" class="btn-secondary" onclick="window.toggleAddMasterDosenModal(false)">Tutup</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
    setTimeout(() => modalContainer.classList.add('active'), 10);
}

export async function saveNewMasterDosen(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = Object.fromEntries(f.entries());

    try {
        const { dosenAPI } = await import('../../services/api.js');
        const response = await dosenAPI.bulkInsertMaster([data]);

        if (response.success) {
            const freshData = await dosenAPI.getMaster();
            APP_DATA.masterDosen = freshData.data;

            if (appState.currentView === 'dosen') {
                import('../pages/index.js').then(v => {
                    document.getElementById('main-content').innerHTML = v.dosen();
                });
            }
            toggleAddMasterDosenModal(false);
            showToast(`Berhasil menambah data master SDM: ${data.nama}`, 'success');
        }
    } catch (error) {
        showToast('Gagal: ' + error.message, 'error');
    }
}

// Helper to open edit modal directly
export function openEditMahasiswa(nim) {
    const mhs = APP_DATA.mahasiswa.find(m => m.nim === nim);
    if (!mhs) return showToast('Data mahasiswa tidak ditemukan', 'error');
    toggleAddMahasiswaModal(true, mhs);
}

export async function deleteMasterDosen(nik) {
    if (!confirm('Hapus data ini dari Master SDM? Data yang sudah terhubung dengan dosen fakultas tidak akan ikut terhapus, namun status pencocokan akan hilang.')) return;

    try {
        const { dosenAPI } = await import('../../services/api.js');
        const response = await dosenAPI.deleteMaster(nik);

        if (response.success) {
            // Update local state
            APP_DATA.masterDosen = APP_DATA.masterDosen.filter(d => d.nik !== nik);

            if (appState.currentView === 'dosen' && appState.currentDosenTab === 'sdm') {
                document.getElementById('main-content').innerHTML = views.dosen();
            }

            showToast('Data Master SDM berhasil dihapus.', 'success');
        }
    } catch (error) {
        showToast('Gagal menghapus data master: ' + error.message, 'error');
    }
}
