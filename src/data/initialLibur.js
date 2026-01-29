export const INITIAL_LIBUR = [
    // Senin, 16 Feb 2026
    {
        nama: "Hanif Al Fatta, S.Kom., M.Kom., Ph.D.",
        type: "recurring",
        days: ["Senin"],
        times: ["08:00", "09:30"],
        reason: "Rapat Prodi Rutin"
    },
    {
        nama: "Kusnawi, S.Kom., M.Eng.",
        type: "date",
        date: "2026-02-16",
        reason: "Izin Sakit"
    },

    // Selasa, 17 Feb 2026
    {
        nama: "Dr. Andi Sunyoto, S.Kom., M.Kom.",
        type: "recurring",
        days: ["Selasa"],
        times: ["08:00", "09:30"],
        reason: "Mengajar Kelas Pagi"
    },
    {
        nama: "Dr. Sri Ngudi Wahyuni, S.T., M.Kom.", // Corrected name structure matches CSV
        type: "date",
        date: "2026-02-17",
        reason: "Dinas Luar Kota"
    },

    // Rabu, 18 Feb 2026
    {
        nama: "Bhanu Sri Nugraha, S.Kom., M.Kom.",
        type: "recurring",
        days: ["Rabu"],
        times: ["13:00", "14:30"],
        reason: "Bimbingan Skripsi"
    },
    {
        nama: "Sudarmawan, S.T., M.T.",
        type: "date",
        date: "2026-02-18",
        reason: "Keperluan Keluarga"
    },

    // Kamis, 19 Feb 2026
    {
        nama: "Erik Hadi Saputra, S.Kom., M.Eng.",
        type: "date",
        date: "2026-02-19",
        reason: "Cuti Tahunan"
    },

    // Jumat, 20 Feb 2026
    {
        nama: "Drs. Asro Nasiri, M.Kom.",
        type: "recurring",
        days: ["Jumat"],
        times: ["13:00", "14:30"],
        reason: "Jumatan & Istirahat"
    },

    // Contoh Range: 23 Feb - 25 Feb (Senin-Rabu minggu depannya)
    {
        nama: "Mei Parwanto Kurniawan, S.Kom., M.Kom.",
        type: "range",
        start: "2026-02-23",
        end: "2026-02-25",
        reason: "Pelatihan Asesor BNSP"
    }
];
