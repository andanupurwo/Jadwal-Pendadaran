# 🤖 Jarvis - Git Workflow Assistant

Panduan lengkap untuk sinkronisasi pekerjaan antara kantor (Windows) dan rumah (Mac Mini M4).

## 🎯 Konsep

Anda akan bekerja di **branch `update`** untuk development sehari-hari, dan hanya merge ke **branch `main`** ketika fitur sudah selesai dan siap production.

## 📋 Workflow Commands

### 0. `/jarvis-setup` - Setup Awal (Hanya Sekali)

**Kapan digunakan:** Saat pertama kali menggunakan sistem Jarvis (belum punya branch `update`)

**Apa yang dilakukan:**
- ✅ Membuat branch `update` dari branch saat ini
- ✅ Push branch `update` ke GitHub
- ✅ Set tracking untuk sync otomatis

**Cara pakai di Google Antigravity:**
```
/jarvis-setup
```

**Catatan:** Workflow ini **hanya dijalankan SEKALI** di awal. Setelah itu tidak perlu lagi.

---

### 1. `/jarvis-out` - Saat Meninggalkan Workstation

**Kapan digunakan:** Saat akan pulang dari kantor atau selesai kerja di rumah

**Apa yang dilakukan:**
- ✅ Menyimpan semua perubahan
- ✅ Commit otomatis dengan timestamp
- ✅ Push ke GitHub (branch `update`)

**Cara pakai di Google Antigravity:**
```
/jarvis-out
```

### 2. `/jarvis-in` - Saat Memulai di Workstation Lain

**Kapan digunakan:** Saat tiba di kantor/rumah dan ingin melanjutkan pekerjaan

**Apa yang dilakukan:**
- ✅ Mengambil perubahan terbaru dari GitHub
- ✅ Checkout ke branch `update`
- ✅ Menampilkan status dan commit terakhir

**Cara pakai di Google Antigravity:**
```
/jarvis-in
```

### 3. `/jarvis-merge` - Saat Fitur Selesai (Buat Pull Request)

**Kapan digunakan:** Ketika fitur sudah selesai dan siap di-merge ke `main`

**Apa yang dilakukan:**
- ✅ Commit dan push branch `update` ke GitHub
- ✅ Memberikan link untuk membuat Pull Request
- ✅ Main branch **HANYA** diupdate via PR di GitHub (best practice!)

**Cara pakai di Google Antigravity:**
```
/jarvis-merge
```

**Setelah itu:**
1. Buka link yang diberikan di browser
2. Review perubahan di GitHub
3. Klik "Create pull request"
4. Merge PR di GitHub

## 🔄 Contoh Skenario Penggunaan

### Scenario 1: Kerja di Kantor (Windows)
```
09:00 - Tiba di kantor
      → Buka Google Antigravity
      → Ketik: /jarvis-in
      → Mulai coding...

16:00 - Waktunya pulang (buru-buru!)
      → Ketik: /jarvis-out
      → Selesai! Semua tersimpan di GitHub
```

### Scenario 2: Lanjut di Rumah (Mac Mini M4)
```
19:00 - Sampai rumah
      → Buka Google Antigravity
      → Ketik: /jarvis-in
      → Lanjut coding persis dari terakhir kali di kantor...

23:00 - Selesai untuk hari ini
      → Ketik: /jarvis-out
      → Istirahat!
```

### Scenario 3: Fitur Selesai, Siap Production
```
      → Ketik: /jarvis-merge
      → Buka link PR yang diberikan
      → Review & merge PR di GitHub
      → Main branch terupdate!
      → Siap deploy!
```

## 🌳 Branch Strategy

```
main (production-ready code)
  ↑
  | HANYA via Pull Request di GitHub (/jarvis-merge)
  |
update (daily development)
  ↑
  | push/pull setiap hari (/jarvis-out, /jarvis-in)
  |
Your Work
```

**Penting:** Branch `main` **TIDAK PERNAH** di-push langsung dari lokal. Selalu via PR di GitHub!

## 💡 Tips & Best Practices

### ✅ DO:
- Gunakan `/jarvis-out` setiap kali selesai kerja
- Gunakan `/jarvis-in` setiap kali mulai kerja di workstation lain
- Bekerja di branch `update` untuk development
- Update `main` **HANYA** via Pull Request di GitHub
- Review PR sebelum merge

### ❌ DON'T:
- **JANGAN PERNAH** push langsung ke `main` dari lokal
- Jangan langsung commit ke `main`
- Jangan lupa `/jarvis-out` sebelum meninggalkan workstation
- Jangan merge ke `main` jika fitur belum selesai
- Jangan skip code review di PR

## 🚨 Troubleshooting

### Masalah: Conflict saat pull
**Solusi:**
```bash
git stash
/jarvis-in
git stash pop
# Resolve conflicts manually
/jarvis-out
```

### Masalah: Lupa `/jarvis-out` di kantor
**Solusi:**
Tidak masalah! Perubahan masih ada di local. Saat kembali ke kantor, langsung jalankan `/jarvis-out`.

### Masalah: Ingin membatalkan perubahan
**Solusi:**
```bash
git reset --hard origin/update
```

## 📱 Setup Awal (Hanya Sekali)

### Opsi 1: Menggunakan Workflow (MUDAH - RECOMMENDED)

**Di workstation mana saja (pertama kali):**
```
/jarvis-setup
```

Selesai! Branch `update` sudah siap digunakan.

**Di workstation lain:**
```
/jarvis-in
```

Selesai! Anda sudah bisa mulai kerja.

---

### Opsi 2: Manual (jika perlu)

**Di Kantor (Windows):**
```bash
cd /path/to/project
git checkout -b update
git push -u origin update
```

**Di Rumah (Mac Mini M4):**
```bash
cd /path/to/project
git fetch origin
git checkout update
```

## 🎓 Penjelasan Teknis

### Kenapa Branch `update`?
- Branch `main` tetap bersih dan production-ready
- Branch `update` untuk eksperimen dan development
- Mudah rollback jika ada masalah

### Kenapa Auto-commit dengan Timestamp?
- Tidak perlu mikir pesan commit saat buru-buru
- Mudah tracking kapan perubahan dilakukan
- Bisa lihat history pekerjaan per hari

### Kenapa Push Setiap Kali?
- GitHub jadi backup otomatis
- Bisa akses dari mana saja
- Tidak khawatir kehilangan pekerjaan

### Kenapa Main HANYA via Pull Request?
- **Code Review:** Bisa review perubahan sebelum merge
- **History Bersih:** Semua merge tercatat dengan jelas di GitHub
- **Rollback Mudah:** Bisa revert PR jika ada masalah
- **Best Practice:** Standard industri untuk production code
- **Aman:** Mencegah push langsung yang bisa merusak production

## 🔗 Integrasi dengan Tools Lain

### Google Antigravity (RECOMMENDED):
Gunakan slash commands (`/jarvis-out`, `/jarvis-in`, `/jarvis-merge`) langsung di chat

### Terminal (Bash/Zsh):
Anda juga bisa menggunakan Jarvis langsung di terminal!

**Setup (Hanya Sekali):**
```bash
# Tambahkan alias ke ~/.zshrc
echo 'source /Users/purwo/VibeCoding/jadwal_pendadaran/.jarvis/aliases.zsh' >> ~/.zshrc

# Reload terminal
source ~/.zshrc
```

**Setelah setup, gunakan langsung:**
```bash
jarvis-out    # Save dan push ke GitHub
jarvis-in     # Pull dari GitHub
jarvis-merge  # Buat Pull Request
```

**Tanpa setup (langsung jalankan script):**
```bash
bash .jarvis/jarvis-out.sh
bash .jarvis/jarvis-in.sh
bash .jarvis/jarvis-merge.sh
```

📚 **Detail lengkap:** Lihat [.jarvis/README.md](file:///Users/purwo/VibeCoding/jadwal_pendadaran/.jarvis/README.md)

### VS Code:
Workflows ini kompatibel dengan VS Code di Windows dan Mac

---

**Dibuat untuk:** Workflow development yang efisien antara kantor dan rumah
**Terakhir diupdate:** 2026-02-05
