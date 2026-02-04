import { APP_DATA } from '../../data/store.js';

export const LogicView = () => `
    <div class="container" style="max-width: 900px; margin: 0 auto; padding: 3rem 2rem 6rem; font-family: 'Inter', sans-serif; color: var(--text-main);">
        
        <!-- HEADER & ACTION -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 2rem;">
            <div>
                <h1 style="font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.5rem; color: var(--text-main);">Logika Penjadwalan</h1>
                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.6;">Dokumentasi teknis alur kerja algoritma dan aturan batasan sistem.</p>
            </div>
            
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                <button onclick="window.generateSchedule()" style="padding: 12px 24px; background: var(--text-main); color: var(--bg); border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: opacity 0.2s;">
                    ▶ Jadwalkan Otomatis
                </button>
                 <div style="display: flex; align-items: center; gap: 8px;">
                    <label style="font-size: 0.8rem; color: var(--text-secondary); cursor: pointer;" title="Centang untuk menjadwalkan mahasiswa yang belum dapat jadwal saja, tanpa menghapus jadwal yang sudah ada.">
                        <input type="checkbox" id="incrementalMode" style="vertical-align: middle;"> Lanjutkan jadwal sisa (Tanpa Hapus)
                    </label>
                </div>
            </div>
        </div>

        <!-- DOCUMENTATION CONTENT -->
        <div style="display: flex; gap: 4rem;">
            
            <!-- MAIN CONTENT -->
            <div style="flex: 1;">
                
                <!-- SECTION 1: CORE WORKFLOW -->
                <section style="margin-bottom: 3.5rem;">
                    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        <span style="background: #f3f4f6; color: #1f2937; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem;">1</span>
                        Alur Kerja Utama
                    </h2>
                    <div style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">
                        <p style="margin-bottom: 1rem;">Algoritma bekerja secara sekuensial mencoba menempatkan mahasiswa satu per satu ke dalam slot waktu yang tersedia ("Greedy Algorithm").</p>
                        <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
                            <li style="display: flex; gap: 1rem;">
                                <div style="min-width: 4px; background: var(--border-subtle);"></div>
                                <div>
                                    <strong style="color: var(--text-main);">Langkah 1: Iterasi Slot</strong>
                                    <div style="font-size: 0.9rem;">Sistem menyisir setiap Tanggal > Jam > Ruangan yang tersedia.</div>
                                </div>
                            </li>
                            <li style="display: flex; gap: 1rem;">
                                <div style="min-width: 4px; background: var(--border-subtle);"></div>
                                <div>
                                    <strong style="color: var(--text-main);">Langkah 2: Ambil Mahasiswa</strong>
                                    <div style="font-size: 0.9rem;">Mengambil mahasiswa dari antrian (urut berdasarkan NIM).</div>
                                </div>
                            </li>
                            <li style="display: flex; gap: 1rem;">
                                <div style="min-width: 4px; background: var(--border-subtle);"></div>
                                <div>
                                    <strong style="color: var(--text-main);">Langkah 3: Cari Dosen Penguji</strong>
                                    <div style="font-size: 0.9rem;">Mencari 2 orang dosen yang memenuhi syarat ketersediaan dan prodi.</div>
                                </div>
                            </li>
                            <li style="display: flex; gap: 1rem;">
                                <div style="min-width: 4px; background: var(--primary);"></div>
                                <div>
                                    <strong style="color: var(--text-main);">Langkah 4: Tetapkan Jadwal</strong>
                                    <div style="font-size: 0.9rem;">Jika kandidat valid ditemukan, jadwal dikunci dan disimpan ke database.</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                <!-- SECTION 2: CONSTRAINTS -->
                 <section style="margin-bottom: 3.5rem;">
                    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                        <span style="background: #f3f4f6; color: #1f2937; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem;">2</span>
                        Aturan & Batasan Wajib
                    </h2>
                    <div style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">
                        <p style="margin-bottom: 1.5rem;">Agar jadwal valid, sistem mematuhi aturan keras (hard constraints) berikut:</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                            <!-- Constraint Item -->
                            <div style="border-left: 2px solid #ef4444; padding-left: 1rem;">
                                <strong style="display: block; color: var(--text-main); margin-bottom: 4px;">⛔ Anti-Bentrok</strong>
                                <span>Dosen tidak boleh dijadwalkan di 2 tempat pada waktu yang sama. Sistem mengecek database real-time sebelum memilih dosen.</span>
                            </div>
                            <!-- Constraint Item -->
                            <div style="border-left: 2px solid #ef4444; padding-left: 1rem;">
                                <strong style="display: block; color: var(--text-main); margin-bottom: 4px;">📅 Cek Libur & Ketersediaan</strong>
                                <span>Dosen yang ditandai "Libur" pada Tanggal atau Jam tertentu secara otomatis dilewati oleh algoritma.</span>
                            </div>
                            <!-- Constraint Item -->
                            <div style="border-left: 2px solid #ef4444; padding-left: 1rem;">
                                <strong style="display: block; color: var(--text-main); margin-bottom: 4px;">🎓 Kesesuaian Prodi Murni</strong>
                                <span>Penguji HARUS berasal dari prodi yang sama persis dengan mahasiswa. Tidak ada lintas prodi.</span>
                            </div>
                            <!-- Constraint Item -->
                            <div style="border-left: 2px solid #f59e0b; padding-left: 1rem;">
                                <strong style="display: block; color: var(--text-main); margin-bottom: 4px;">🔒 Peran Pembimbing</strong>
                                <span>Pembimbing mahasiswa otomatis menjadi Ketua Sidang. Pembimbing TIDAK BOLEH menjadi Penguji 1 atau 2 untuk mahasiswanya sendiri.</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- SECTION 3: FAIRNESS -->
                 <section>
                    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
                         <span style="background: #f3f4f6; color: #1f2937; width: 24px; height: 24px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.8rem;">3</span>
                        Pemerataan Pembagian Jadwal
                    </h2>
                    <div style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">
                         <p style="margin-bottom: 1rem;">Sistem berusaha membagi beban kerja dosen seadil mungkin.</p>
                         <div style="background: var(--bg-surface); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
                            <code style="display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--primary); margin-bottom: 0.5rem;">
                                CandidatePool.sort((a, b) => a.currentLoad - b.currentLoad)
                            </code>
                            <p style="margin: 0; font-size: 0.9rem;">
                                Saat mencari kandidat penguji, sistem mengurutkan seluruh dosen berdasarkan <strong>jumlah jadwal yang sudah mereka miliki</strong>. Dosen dengan beban terendah selalu diprioritaskan untuk dipilih terlebih dahulu.
                            </p>
                         </div>
                    </div>
                </section>

            </div>

             <!-- SIDEBAR: TERMINAL LOG (Mini) -->
            <div style="width: 320px; position: sticky; top: 2rem; align-self: flex-start;">
                 <div style="border: 1px solid var(--border-subtle); border-radius: 12px; overflow: hidden; background: #fafafa;">
                    <div style="padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Riwayat Proses</span>
                         <button onclick="document.getElementById('logicLog').innerHTML = ''" style="border: none; background: none; font-size: 0.7rem; color: var(--text-muted); cursor: pointer;">Bersihkan</button>
                    </div>
                    <div id="logicLog" style="height: 400px; padding: 1rem; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #333; background: #fff;">
                        <span style="color: #999;">Waiting for execution...</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
`;
