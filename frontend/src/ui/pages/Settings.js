import { settingsAPI } from '../../services/api.js';
import { ROOMS, DISABLED_ROOMS, TIMES, DATES, appState } from '../../data/store.js';
import { showConfirm } from '../components/ConfirmationModal.js';
import { LogicView } from './Logic.js';
import { navigate } from '../core/router.js';

export const SettingsView = () => {
    // Default tab state if not set
    if (!appState.settingsTab) appState.settingsTab = 'config';

    const renderTabs = () => `
        <div class="tabs-container" style="margin-bottom: 2rem;">
             <div class="tabs" style="display: flex; gap: 4px; padding: 4px; background: rgba(118, 118, 128, 0.08); border-radius: 14px; width: fit-content;">
                <div class="tab-item ${appState.settingsTab === 'config' ? 'active' : ''}"
                     onclick="window.switchSettingsTab('config')"
                     style="padding: 8px 24px; min-width: 120px; text-align: center; cursor: pointer; border-radius: 10px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s, color 0.2s; background: ${appState.settingsTab === 'config' ? 'var(--bg)' : 'transparent'}; box-shadow: ${appState.settingsTab === 'config' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};">
                    ⚙️ Konfigurasi
                </div>
                <div class="tab-item ${appState.settingsTab === 'logic' ? 'active' : ''}"
                     onclick="window.switchSettingsTab('logic')"
                     style="padding: 8px 24px; min-width: 120px; text-align: center; cursor: pointer; border-radius: 10px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s, color 0.2s; background: ${appState.settingsTab === 'logic' ? 'var(--bg)' : 'transparent'}; box-shadow: ${appState.settingsTab === 'logic' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};">
                    🧠 Logika
                </div>
                <div class="tab-item ${appState.settingsTab === 'about' ? 'active' : ''}"
                     onclick="window.switchSettingsTab('about')"
                     style="padding: 8px 24px; min-width: 120px; text-align: center; cursor: pointer; border-radius: 10px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s, color 0.2s; background: ${appState.settingsTab === 'about' ? 'var(--bg)' : 'transparent'}; box-shadow: ${appState.settingsTab === 'about' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};">
                    ℹ️ About
                </div>
             </div>
        </div>
    `;

    // Render logic content if tab is logic
    if (appState.settingsTab === 'logic') {
        return `
            <div class="container">
                <header class="page-header">
                     <div class="header-info">
                        <h1>Pengaturan</h1>
                        <p class="subtitle">Konfigurasi jadwal dan logika sistem.</p>
                    </div>
                </header>
                ${renderTabs()}
                <div style="margin-top: -2rem;">
                    ${LogicView().replace('class="container"', 'class="inner-container"').replace(/padding: 3rem 2rem 6rem;/, 'padding: 1rem 0;')}
                </div>
            </div>
        `;
    }

    // Render About content
    if (appState.settingsTab === 'about') {
        return `
            <div class="container">
                <header class="page-header">
                     <div class="header-info">
                        <h1>Tentang Aplikasi</h1>
                        <p class="subtitle">Informasi pengembang dan teknologi yang digunakan.</p>
                    </div>
                </header>
                ${renderTabs()}
                
                <div class="card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--primary);">Jadwal Pendadaran AI</h2>
                        <p style="color: var(--text-muted);">Sistem Penjadwalan Cerdas Berbasis Web v1.0</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                        <div>
                            <h3 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-subtle); padding-bottom: 0.5rem;">💻 Tech Stack</h3>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 8px;"><strong>Frontend:</strong> Javascript (Vanilla + Vite)</li>
                                <li style="margin-bottom: 8px;"><strong>Backend:</strong> Node.js + Express</li>
                                <li style="margin-bottom: 8px;"><strong>Database:</strong> PostgreSQL</li>
                                <li style="margin-bottom: 8px;"><strong>Library:</strong> XLSX (Excel Processing)</li>
                                <li style="margin-bottom: 8px;"><strong>Infrastructure:</strong> Debian (Proxmox Virtualization)</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-subtle); padding-bottom: 0.5rem;">👥 Credits</h3>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px;">
                                    <strong>Diproduksi Oleh:</strong><br>
                                    Staf DAAK (Direktorat Administrasi Akademik & Kemahasiswaan)
                                </li>
                                <li style="margin-bottom: 12px;">
                                    <strong>Developed by:</strong><br>
                                    <a href="#" style="color: var(--primary); text-decoration: none;">Agus_Intelligence</a>
                                </li>
                                <li style="margin-bottom: 12px;">
                                    <strong>Supported by:</strong><br>
                                    ilhamstu() & meansrev
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div style="text-align: center; padding-top: 1rem; border-top: 1px solid var(--border-subtle); font-size: 0.85rem; color: var(--text-muted);">
                        &copy; 2026 Jadwal Pendadaran AI. All rights reserved.
                    </div>
                </div>
            </div>
        `;
    }

    // Helper to format array to newline separated string
    const formatList = (arr) => arr.join('\n');

    // Helper to parse dates for display
    const currentDates = DATES;

    // Attach event handlers
    setTimeout(() => {
        const form = document.getElementById('settings-form');
        if (form) {
            form.addEventListener('submit', handleSettingsSubmit);
        }
    }, 0);

    return `
        <div class="container">
            <header class="page-header">
                <div class="header-info">
                    <h1>Pengaturan</h1>
                    <p class="subtitle">Konfigurasi jadwal, ruangan, dan waktu pelaksanaan.</p>
                </div>
            </header>
            
            ${renderTabs()}

            <form id="settings-form">
                
                <!-- Rooms Configuration -->
                <div class="card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <h3>🏫 Ruangan</h3>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Daftar Ruangan (Satu per baris)</label>
                        <textarea id="setting-rooms" class="form-input" rows="8" style="font-family: monospace;">${ROOMS.join('\n')}</textarea>
                        <p class="form-hint">Masukkan nama ruangan, satu per baris. Contoh: 6.3.A</p>
                    </div>

                    <div class="form-group" style="padding: 1rem; background: var(--bg); border-radius: 8px; margin-top: 1rem;">
                        <label class="form-label" style="margin-bottom: 0.5rem;">Status Ruangan (Penjadwalan Otomatis)</label>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
                            Centang ruangan yang ingin <strong>DINONAKTIFKAN</strong> (tidak dipakai saat generate jadwal).
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; max-height: 200px; overflow-y: auto;">
                            ${ROOMS.map(room => `
                                <label style="display: flex; align-items: center; gap: 8px; padding: 6px; background: #fff; border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                                    <input type="checkbox" name="disabled_room" value="${room}" ${DISABLED_ROOMS.includes(room) ? 'checked' : ''}>
                                    ${room}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Times Configuration -->
                <div class="card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <h3>⏰ Sesi Waktu</h3>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Daftar Sesi (Satu per baris)</label>
                        <textarea id="setting-times" class="form-input" rows="5" style="font-family: monospace;">${TIMES.join('\n')}</textarea>
                        <p class="form-hint">Masukkan jam mulai sesi. Contoh: 08:30</p>
                    </div>
                </div>

                <!-- Dates Configuration -->
                <div class="card" style="margin-bottom: 2rem;">
                    <div class="card-header">
                        <h3>📅 Tanggal Pelaksanaan</h3>
                    </div>
                    
                    <div class="form-group" style="margin-bottom: 1.5rem; padding: 1.5rem; background: var(--bg); border: 1px solid var(--border-subtle); border-radius: 12px;">
                        <label style="font-weight: 600; font-size: 0.95rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; color: var(--primary);">
                            ✨ Generator Tanggal Otomatis
                        </label>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
                            <!-- Tanggal Mulai -->
                            <div style="width: 180px;">
                                <label class="form-label" style="font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Tanggal Mulai</label>
                                <input type="date" id="gen-start-date" class="form-input" style="width: 100%;">
                            </div>

                            <!-- Jumlah Hari -->
                            <div style="width: 100px;">
                                <label class="form-label" style="font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Jumlah Hari</label>
                                <input type="number" id="gen-days" class="form-input" value="10" min="1" max="30" style="width: 100%;">
                            </div>

                            <!-- Opsi Weekend -->
                            <div style="display: flex; align-items: center; height: 42px; padding-left: 0.5rem;">
                                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.9rem; user-select: none;">
                                    <input type="checkbox" id="gen-skip-weekend" checked style="width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer;">
                                    <span>Lewati Sabtu/Minggu</span>
                                </label>
                            </div>

                            <!-- Tombol Action -->
                            <div style="flex: 0 0 auto; margin-left: auto;">
                                <button type="button" id="btn-generate-dates" class="btn-primary" onclick="window.generateDateList()" style="height: 42px; padding: 0 20px; font-size: 0.85rem;">
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Konfigurasi JSON Tanggal</label>
                        <textarea id="setting-dates" class="form-input" rows="12" style="font-family: monospace;">${JSON.stringify(DATES, null, 4)}</textarea>
                        <p class="form-hint">Format JSON: { value: 'YYYY-MM-DD', label: 'Hari', display: 'Tgl Bulan' }</p>
                    </div>
                </div>

                <div class="form-actions" style="position: sticky; bottom: 20px; background: var(--card-bg); padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; justify-content: flex-end; z-index: 100;">
                    <button type="submit" class="btn-primary" style="min-width: 150px;">
                        Simpan Perubahan
                    </button>
                </div>

            </form>
        </div>
    `;
};

// Handle tab switching
window.switchSettingsTab = (tab) => {
    appState.settingsTab = tab;
    navigate('settings');
};

// Global handlers
window.generateDateList = () => {
    const startDateInput = document.getElementById('gen-start-date').value;
    const daysCount = parseInt(document.getElementById('gen-days').value) || 5;
    const skipWeekend = document.getElementById('gen-skip-weekend').checked;

    if (!startDateInput) {
        showToast('Pilih tanggal mulai terlebih dahulu', 'warning');
        return;
    }

    const result = [];
    let currentDate = new Date(startDateInput);
    let added = 0;

    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sep', 'Okt', 'Nov', 'Des'];

    while (added < daysCount) {
        const dayIdx = currentDate.getDay();

        // Skip weekend if requested (0 = Sun, 6 = Sat)
        if (skipWeekend && (dayIdx === 0 || dayIdx === 6)) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const label = indonesianDays[dayIdx];
        const display = `${currentDate.getDate()} ${indonesianMonths[currentDate.getMonth()]}`;

        result.push({
            value: dateStr,
            label: label,
            display: display
        });

        added++;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const textarea = document.getElementById('setting-dates');
    textarea.value = JSON.stringify(result, null, 4);
};

async function handleSettingsSubmit(e) {
    e.preventDefault();

    if (!(await showConfirm('Simpan perubahan? Aplikasi akan dimuat ulang.', 'Simpan Pengaturan', { text: 'Simpan', variant: 'primary' }))) return;

    try {
        const roomsText = document.getElementById('setting-rooms').value;
        const timesText = document.getElementById('setting-times').value;
        const datesText = document.getElementById('setting-dates').value;

        // Parse inputs
        const schedule_rooms = roomsText.split('\n').map(s => s.trim()).filter(s => s);
        const schedule_times = timesText.split('\n').map(s => s.trim()).filter(s => s);
        let schedule_dates;

        try {
            schedule_dates = JSON.parse(datesText);
        } catch (jsonErr) {
            showToast('Format JSON Tanggal tidak valid!', 'error');
            return;
        }

        // Send to API
        const response = await settingsAPI.update({
            schedule_rooms,
            schedule_disabled_rooms: Array.from(document.querySelectorAll('input[name="disabled_room"]:checked')).map(cb => cb.value),
            schedule_times,
            schedule_dates
        });

        if (response.success) {
            showToast('Pengaturan berhasil disimpan!', 'success');
            window.location.reload();
        }

    } catch (error) {
        console.error('Save failed:', error);
        showToast('Gagal menyimpan pengaturan: ' + error.message, 'error');
    }
}
