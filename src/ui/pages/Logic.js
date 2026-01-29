import { MOCK_DATA, ROOMS } from '../../data/store.js';
import { getAllDosen } from '../../utils/helpers.js';

export const LogicView = () => `
    <div class="container" style="max-width: 100%; padding: 0.5rem 1.5rem 6rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- 1. MODERN COMMAND HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem;">
            <div>
                <h1 style="font-size: 1.75rem; font-weight: 850; color: var(--text-main); letter-spacing: -0.03em; line-height: 1;">Scheduling Engine</h1>
                <p style="margin-top: 6px; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Pusat kendali algoritma dan optimasi jadwal massal.</p>
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" onclick="document.getElementById('logicLog').innerHTML = ''" class="btn-secondary" style="padding: 8px 16px; font-size: 0.75rem;">🗑️ Clear Logs</button>
                <button type="button" onclick="window.runStressTest()" class="btn-danger" style="padding: 8px 16px; font-size: 0.75rem;"> High-Load Test</button>
            </div>
        </div>

        <!-- 2. CONTROL PANEL CARD -->
        <div class="card" style="margin: 0; padding: 1.25rem; background: var(--card-bg); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; border-radius: 20px; box-shadow: var(--shadow-sm);">
            <div style="display: flex; align-items: center; gap: 2rem;">
                <!-- Parameter 1 -->
                <div>
                    <label style="display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Target Scope</label>
                    <select id="scheduleScope" class="form-select" style="min-width: 220px; border-radius: 10px; background-color: var(--bg);">
                        <option value="all">🚀 Seluruh Program Studi</option>
                        <option value="Informatika">Informatika</option>
                        <option value="Sistem Informasi">Sistem Informasi</option>
                        <option value="Teknologi Informasi">Teknologi Informasi</option>
                    </select>
                </div>

                <div style="width: 1px; height: 30px; background: var(--border-subtle);"></div>

                <!-- Parameter 2 -->
                <div>
                    <label style="display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">Execution Mode</label>
                    <label class="switch-container" style="display: flex; align-items: center; gap: 10px; background: var(--bg); padding: 8px 11px; border-radius: 10px; cursor: pointer; border: 1px solid var(--border-subtle);">
                        <input type="checkbox" id="incrementalMode" style="width:16px; height:16px; accent-color: var(--primary);">
                        <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">Incremental Smart</span>
                    </label>
                </div>
            </div>

            <!-- MAIN ACTION -->
            <button type="button" onclick="window.generateSchedule()" class="btn-primary" style="padding: 12px 32px; font-size: 1rem; font-weight: 800; border-radius: 14px; background: linear-gradient(135deg, var(--primary), #7c7cf0); box-shadow: 0 8px 20px rgba(88, 86, 214, 0.3);">
                <span style="margin-right: 8px;">▶</span> JALANKAN MESIN SEKARANG
            </button>
        </div>

        <!-- 2. CONTENT GRID -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
            
            <!-- LEFT: SYSTEM BLUEPRINT -->
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                
                <!-- TERMINAL LOGS -->
                <div class="card" style="margin: 0; background: #000; border: 1px solid #333; height: 280px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <div style="background: #1a1a1a; padding: 8px 16px; border-bottom: 1px solid #333; display: flex; gap: 8px; align-items: center;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
                        <span style="color: #666; font-size: 11px; font-family: 'JetBrains Mono', monospace; margin-left: 10px; font-weight: 600;">engine_runtime.log</span>
                    </div>
                    <div id="logicLog" style="flex: 1; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #00ff41; overflow-y: auto; line-height: 1.6;">
                        <div style="opacity: 0.4;">Ready for instruction set...</div>
                    </div>
                </div>

                <!-- LOGIC EXPLAINER CARDS -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                    <div class="card" style="border-top: 4px solid var(--primary);">
                        <h3 style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary); display: flex; align-items: center; gap: 8px;">⚖️ Fair Sharing Logic</h3>
                        <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.8;">
                            <li><strong>Dynamic Priority:</strong> Dosen dengan jumlah jam menguji paling sedikit selalu menjadi kandidat utama di setiap slot baru.</li>
                            <li><strong>Global Equality:</strong> Tidak ada Dosen yang memiliki selisih jadwal ekstrem (misal 5 vs 0) jika ketersediaan memungkinkan.</li>
                            <li><strong>Conflict Avoidance:</strong> Secara otomatis menghitung total beban ujian dari seluruh ruangan untuk menyeimbangkan distribusi.</li>
                        </ul>
                    </div>

                     <div class="card" style="border-top: 4px solid var(--success);">
                        <h3 style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--success); display: flex; align-items: center; gap: 8px;">🧩 Consistency Logic</h3>
                        <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.8;">
                            <li><strong>FES & FST (Strict):</strong> 100% Wajib sesama prodi (Ilmu Komunikasi, Manajemen, Akuntansi, Arsitektur, dll).</li>
                            <li><strong>FIK Cross-Allowed:</strong> <span class="badge-success" style="padding:2px 6px; font-size:10px;">Informatika</span> & <span class="badge-success" style="padding:2px 6px; font-size:10px;">Sistem Informasi</span> saling berbagi penguji.</li>
                            <li><strong>FIK Strict Group:</strong> Wajib sesama prodi:
                                <div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:4px;">
                                    <span style="font-size:10px; background:#f0f0f0; padding:2px 6px; border-radius:4px;">Teknologi Informasi</span>
                                    <span style="font-size:10px; background:#f0f0f0; padding:2px 6px; border-radius:4px;">Teknik Komputer</span>
                                    <span style="font-size:10px; background:#f0f0f0; padding:2px 6px; border-radius:4px;">S2/S3 Informatika</span>
                                    <span style="font-size:10px; background:#f0f0f0; padding:2px 6px; border-radius:4px;">D3 MI/TI</span>
                                </div>
                            </li>
                            <li style="margin-top:8px;"><strong>Supervisor Lock:</strong> Pembimbing dikunci di slot yang sama, dilarang menjadi penguji.</li>
                        </ul>
                    </div>

                    <div class="card" style="border-top: 4px solid var(--warning);">
                        <h3 style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--warning); display: flex; align-items: center; gap: 8px;">⏳ Availability & Timebox</h3>
                        <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.8;">
                            <li><strong>Work Hours:</strong> Hanya memplot jadwal antara pukul 08:30 s/d 15:00. Jumatan (11:30) otomatis dilewati.</li>
                            <li><strong>Smart Rules:</strong> Mendukung aturan Libur Spesifik, Rentang Tanggal (Cuti), dan Aturan Rutin (misal: Setiap Rabu Pagi).</li>
                            <li><strong>Double-Booking Check:</strong> Verifikasi real-time antar ruangan untuk memastikan 1 dosen tidak berada di 2 tempat sekaligus.</li>
                        </ul>
                    </div>

                     <div class="card" style="border-top: 4px solid var(--danger);">
                        <h3 style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--danger); display: flex; align-items: center; gap: 8px;">⚙️ Processing Workflow</h3>
                        <ul style="font-size: 0.8rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.8;">
                            <li><strong>Sorting Sequence:</strong> Mahasiswa diproses urut NIM. Ruangan diisi berurutan s/d penuh sebelum pindah ke jam berikutnya.</li>
                            <li><strong>Incremental Smart:</strong> Jika aktif, jadwal yang sudah ada tidak akan dirombak. Mesin hanya mencari slot untuk mahasiswa baru.</li>
                            <li><strong>Full Reset:</strong> Menghapus seluruh draft dan melakukan optimasi ulang dari nol untuk hasil distribusi yang paling merata.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- RIGHT: SYSTEM INSPECTOR -->
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                
                <div class="card">
                    <h3 style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1rem;">System Health</h3>
                    <div style="display: grid; gap: 12px;">
                        <div style="padding: 12px; background: rgba(52, 199, 89, 0.08); border-radius: 12px; border: 1px solid rgba(52, 199, 89, 0.2); display: flex; flex-direction: column; gap: 4px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: #27c93f; box-shadow: 0 0 10px #27c93f;"></div>
                                <span style="font-size: 0.8rem; font-weight: 800; color: #2e7d32;">ENGINE READY</span>
                            </div>
                            <span style="font-size: 0.7rem; color: #34c759; font-weight: 600;">V3.5 Adaptive Distribution Active</span>
                        </div>

                         <div style="padding: 12px; background: rgba(0, 0, 0, 0.03); border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);">Constraint Mode</span>
                            <span style="font-size: 0.7rem; background: var(--primary-subtle); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-weight: 700;">STRICT</span>
                        </div>
                    </div>
                </div>

                <div class="card" style="flex: 1;">
                    <h3 style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 1.5rem;">Quick Stats</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div style="width:36px; height:36px; background:#f0f0ff; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">👨‍🏫</div>
                            <div>
                                <div style="font-size:1.1rem; font-weight:800; line-height:1;">${getAllDosen().length}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Dosen Terdaftar</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div style="width:36px; height:36px; background:#fff7e6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">🎓</div>
                            <div>
                                <div style="font-size:1.1rem; font-weight:800; line-height:1;">${MOCK_DATA.mahasiswa.length}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Mhs Antrian</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div style="width:36px; height:36px; background:#e6fff0; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">🏨</div>
                            <div>
                                <div style="font-size:1.1rem; font-weight:800; line-height:1;">${ROOMS.length}</div>
                                <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Ruangan Aktif</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px dashed var(--border);">
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; margin-bottom: 10px;">DATA SYNCHRONIZATION</div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600;">
                            <span style="color:var(--success);">●</span> LocalStorage Persistent
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; margin-top: 4px;">
                            <span style="color:var(--success);">●</span> CSV Master Matched
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
