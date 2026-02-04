import { settingsAPI } from '../../services/api.js';
import { ROOMS, TIMES, DATES } from '../../data/store.js';

export const SettingsView = () => {
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
                    
                    <div class="form-group" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg); border-radius: 8px;">
                        <label style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Generator Tanggal Otomatis</label>
                        <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                            <div>
                                <label style="font-size: 0.8rem;">Tanggal Mulai</label>
                                <input type="date" id="gen-start-date" class="form-input">
                            </div>
                            <div>
                                <label style="font-size: 0.8rem;">Jumlah Hari</label>
                                <input type="number" id="gen-days" class="form-input" value="10" min="1" max="30" style="width: 80px;">
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <input type="checkbox" id="gen-skip-weekend" checked>
                                <label for="gen-skip-weekend" style="margin-left: 8px;">Lewati Sabtu/Minggu</label>
                            </div>
                            <button type="button" id="btn-generate-dates" class="btn-secondary" onclick="window.generateDateList()">
                                Generate List
                            </button>
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

// Global handlers
window.generateDateList = () => {
    const startDateInput = document.getElementById('gen-start-date').value;
    const daysCount = parseInt(document.getElementById('gen-days').value) || 5;
    const skipWeekend = document.getElementById('gen-skip-weekend').checked;

    if (!startDateInput) {
        alert('Pilih tanggal mulai terlebih dahulu');
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

    if (!confirm('Simpan perubahan? Aplikasi akan dimuat ulang.')) return;

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
            alert('Format JSON Tanggal tidak valid!');
            return;
        }

        // Send to API
        const response = await settingsAPI.update({
            schedule_rooms,
            schedule_times,
            schedule_dates
        });

        if (response.success) {
            alert('Pengaturan berhasil disimpan!');
            window.location.reload();
        }

    } catch (error) {
        console.error('Save failed:', error);
        alert('Gagal menyimpan pengaturan: ' + error.message);
    }
}
