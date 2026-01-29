export const INITIAL_MAHASISWA = [
    // ================= FIK =================

    // S1 Informatika (5)
    { nim: "22.11.1001", nama: "Budi Santoso", prodi: "Informatika", pembimbing: "Kusnawi, S.Kom., M.Eng." },
    { nim: "22.11.1002", nama: "Siti Aminah", prodi: "Informatika", pembimbing: "Drs. Asro Nasiri, M.Kom." },
    { nim: "22.11.1003", nama: "Reza Rahardian", prodi: "Informatika", pembimbing: "Sudarmawan, S.T., M.T." },
    { nim: "22.11.1004", nama: "Dewi Lestari", prodi: "Informatika", pembimbing: "Amirudin Khorul Huda, M.Kom" },
    { nim: "22.11.1005", nama: "Agus Pratama", prodi: "Informatika", pembimbing: "Yudi Sutanto, S.Kom., M.Kom." },

    // S1 Sistem Informasi (5) - Corrected Pembimbing (Must be SI Lecturers)
    { nim: "22.12.2001", nama: "Rina Wati", prodi: "Sistem Informasi", pembimbing: "Agung Nugroho, S.Kom., M.Kom." },
    { nim: "22.12.2002", nama: "Joko Susilo", prodi: "Sistem Informasi", pembimbing: "Deni Kurnianto Nugroho, S.Pd., M.Eng" },
    { nim: "22.12.2003", nama: "Maya Sari", prodi: "Sistem Informasi", pembimbing: "Dr. Sri Ngudi Wahyuni, S.T., M.Kom." }, // Cross check: She is S2 but listed, lets stick to pure SI if possible or general FIK allowed. Wait, for strict prodi correctness lets pick pure SI. 
    // Re-check SI lecturers: Agung Nugroho (196), Deni Kurnianto (206), Mei Parwanto (225), Krisnawati (223), Hanif Al Fatta (S2 PJJ but often teaches SI? No, let's use Mei Parwanto)
    { nim: "22.12.2003", nama: "Maya Sari", prodi: "Sistem Informasi", pembimbing: "Mei Parwanto Kurniawan, S.Kom., M.Kom." },
    { nim: "22.12.2004", nama: "Eko Prasetyo", prodi: "Sistem Informasi", pembimbing: "Krisnawati, S.Si., M.T." },
    { nim: "22.12.2005", nama: "Tia Monica", prodi: "Sistem Informasi", pembimbing: "Hanif Al Fatta, S.Kom., M.Kom., Ph.D." }, // Hanif is S2 PJJ, but maybe OK? Let's use pure SI: "Kardilah Rohmat Hidayat, M.Kom"
    { nim: "22.12.2005", nama: "Tia Monica", prodi: "Sistem Informasi", pembimbing: "Kardilah Rohmat Hidayat, M.Kom" },

    // S1 Teknologi Informasi (5) - STRICT
    { nim: "22.13.3001", nama: "Andi Saputra", prodi: "Teknologi Informasi", pembimbing: "Bhanu Sri Nugraha, S.Kom., M.Kom." },
    { nim: "22.13.3002", nama: "Nina Karlina", prodi: "Teknologi Informasi", pembimbing: "Dhimas Adi Satria, S.Kom., M.Kom." },
    { nim: "22.13.3003", nama: "Rudi Hartono", prodi: "Teknologi Informasi", pembimbing: "Rokhmatullah Batik Firmansyah, S.Kom., M.Kom." },
    { nim: "22.13.3004", nama: "Lilis Suryani", prodi: "Teknologi Informasi", pembimbing: "Aryanto Yuniawan, S.Kom., M.Kom." },
    { nim: "22.13.3005", nama: "Bambang Pamungkas", prodi: "Teknologi Informasi", pembimbing: "Ibnu Hadi Purwanto, S.Kom., M.Kom." },

    // S1 Teknik Komputer (5)
    { nim: "22.14.4001", nama: "Kevin Sanjaya", prodi: "S1 Teknik Komputer", pembimbing: "Anggit Ferdita Nugraha, S.T., M.Eng." },
    { nim: "22.14.4002", nama: "Marcus Gideon", prodi: "S1 Teknik Komputer", pembimbing: "Banu Santoso, A.Md., S.T., M.Eng." },
    { nim: "22.14.4003", nama: "Taufik Hidayat", prodi: "S1 Teknik Komputer", pembimbing: "Dr. Dony Ariyus, S.S., M.Kom." },
    { nim: "22.14.4004", nama: "Liem Swie King", prodi: "S1 Teknik Komputer", pembimbing: "Melwin Syafrizal, S.Kom., M.Eng., Ph.D." },
    { nim: "22.14.4005", nama: "Susy Susanti", prodi: "S1 Teknik Komputer", pembimbing: "Wahid Miftahul Ashari, S.Kom., M.T." },

    // D3 Manajemen Informatika (5)
    { nim: "22.01.5001", nama: "Desta Mahendra", prodi: "D3 Manajemen Informatika", pembimbing: "Akhmad Dahlan , S.Kom., M.Kom." },
    { nim: "22.01.5002", nama: "Vincent Rompies", prodi: "D3 Manajemen Informatika", pembimbing: "Dewi Anisa Istiqomah, S.Pd., M.Cs" },
    { nim: "22.01.5003", nama: "Andre Taulany", prodi: "D3 Manajemen Informatika", pembimbing: "Heri Sismoro, S.Kom., M.Kom." },
    { nim: "22.01.5004", nama: "Sule Prikitiw", prodi: "D3 Manajemen Informatika", pembimbing: "Jaeni , S.Kom., M.Eng." },
    { nim: "22.01.5005", nama: "Parto Patrio", prodi: "D3 Manajemen Informatika", pembimbing: "Lukman, S.Kom., M.Kom." },

    // D3 Teknik Informatika (5)
    { nim: "22.02.6001", nama: "Raffi Ahmad", prodi: "D3 Teknik Informatika", pembimbing: "Ahlihi Masruro, S.Kom., M.Kom." },
    { nim: "22.02.6002", nama: "Nagita Slavina", prodi: "D3 Teknik Informatika", pembimbing: "Arvin C Frobenius, S.Kom., M.Kom." },
    { nim: "22.02.6003", nama: "Baim Wong", prodi: "D3 Teknik Informatika", pembimbing: "Barka Satya, S.Kom., M.Kom." },
    { nim: "22.02.6004", nama: "Paula Verhoeven", prodi: "D3 Teknik Informatika", pembimbing: "Firman Asharudin, S.Kom., M.Kom." },
    { nim: "22.02.6005", nama: "Deddy Corbuzier", prodi: "D3 Teknik Informatika", pembimbing: "Hastari Utama, S.Kom., M.Cs." },

    // S2 Informatika (5)
    { nim: "23.51.7001", nama: "Elon Musk", prodi: "S2 Informatika", pembimbing: "Dhani Ariatmanto, S.Kom., M.Kom., Ph.D." },
    { nim: "23.51.7002", nama: "Mark Zuckerberg", prodi: "S2 Informatika", pembimbing: "Dr. Andi Sunyoto, S.Kom., M.Kom." },
    { nim: "23.51.7003", nama: "Bill Gates", prodi: "S2 Informatika", pembimbing: "Dr. Drs. Muhamad Idris Purwanto, M.M." },
    { nim: "23.51.7004", nama: "Steve Jobs", prodi: "S2 Informatika", pembimbing: "Emha Taufiq Luthfi, S.T., M.Kom., Ph.D." },
    { nim: "23.51.7005", nama: "Jensen Huang", prodi: "S2 Informatika", pembimbing: "Tonny Hidayat, S.Kom., M.Kom., Ph.D." },

    // S2 PJJ Informatika (5)
    { nim: "23.52.8001", nama: "Nadiem Makarim", prodi: "S2 PJJ Informatika", pembimbing: "Alva Hendi Muhammad, A.Md., S.T., M.Eng., Ph.D." },
    { nim: "23.52.8002", nama: "Belva Devara", prodi: "S2 PJJ Informatika", pembimbing: "Hanafi, S.Kom., M.Eng., Ph.D." },
    { nim: "23.52.8003", nama: "Iman Usman", prodi: "S2 PJJ Informatika", pembimbing: "Hanif Al Fatta, S.Kom., M.Kom., Ph.D." },
    { nim: "23.52.8004", nama: "Achmad Zaky", prodi: "S2 PJJ Informatika", pembimbing: "I Made Artha Agastya, S.T., M.Eng., Ph.D." },
    { nim: "23.52.8005", nama: "William Tanuwijaya", prodi: "S2 PJJ Informatika", pembimbing: "Robert Marco, S.T., M.T., Ph.D." },

    // S3 Informatika (5)
    { nim: "24.61.9001", nama: "B.J. Habibie", prodi: "S3 Informatika", pembimbing: "Dr. Ferry Wahyu Wibowo, S.Si., M.Cs." },
    { nim: "24.61.9002", nama: "Samaun Samadikun", prodi: "S3 Informatika", pembimbing: "Prof. Arief Setyanto, S.Si., M.T., Ph.D." },
    { nim: "24.61.9003", nama: "Khoo Peng Beng", prodi: "S3 Informatika", pembimbing: "Prof. Dr. Ema Utami, S.Si., M.Kom." },
    { nim: "24.61.9004", nama: "Ken Kawan Soetanto", prodi: "S3 Informatika", pembimbing: "Prof. Dr. Kusrini, S.Kom., M.Kom." },
    { nim: "24.61.9005", nama: "Nelson Tansu", prodi: "S3 Informatika", pembimbing: "Prof. Dr. Mohammad Suyanto, M.M." },

    // ================= FES =================

    // S1 Ilmu Komunikasi (5)
    { nim: "22.21.4001", nama: "Citra Kirana", prodi: "S1 Ilmu Komunikasi", pembimbing: "Erik Hadi Saputra, S.Kom., M.Eng." },
    { nim: "22.21.4002", nama: "Doni Tata", prodi: "S1 Ilmu Komunikasi", pembimbing: "Dr. Nurbayti, S.I.Kom., M.A." },
    { nim: "22.21.4003", nama: "Vina Panduwinata", prodi: "S1 Ilmu Komunikasi", pembimbing: "Sheila Lestari Giza Pudrianisa, S.I.Kom., M.I.Kom." },
    { nim: "22.21.4004", nama: "Gading Marten", prodi: "S1 Ilmu Komunikasi", pembimbing: "Raden Arditya Mutwara Lokita, M.I.Kom" },
    { nim: "22.21.4005", nama: "Gisel Anastasia", prodi: "S1 Ilmu Komunikasi", pembimbing: "Stara Asrita, S.I.Kom., M.A." },

    // S1 Akuntansi (5)
    { nim: "22.22.7001", nama: "Sri Mulyani", prodi: "S1 Akuntansi", pembimbing: "Agung Wijanarko, S.Sos, MM" },
    { nim: "22.22.7002", nama: "Bambang Brodjonegoro", prodi: "S1 Akuntansi", pembimbing: "Alfriadi Dwi Atmoko, S.E., Ak., M.Si." },
    { nim: "22.22.7003", nama: "Chatib Basri", prodi: "S1 Akuntansi", pembimbing: "Edy Anan, S.E., M.Ak., Ak., CA" },
    { nim: "22.22.7004", nama: "Agus Martowardojo", prodi: "S1 Akuntansi", pembimbing: "Fahrul Imam Santoso, S.E., M.Akt." },
    { nim: "22.22.7005", nama: "Boediono", prodi: "S1 Akuntansi", pembimbing: "Sutarni, S.E., M.M." },

    // S1 Ekonomi (5)
    { nim: "22.23.8001", nama: "Kwik Kian Gie", prodi: "S1 Ekonomi", pembimbing: "Anggrismono, S.E., M.Ec.Dev." },
    { nim: "22.23.8002", nama: "Rizal Ramli", prodi: "S1 Ekonomi", pembimbing: "Atika Fatimah, S.E., M.Ec.Dev." },
    { nim: "22.23.8003", nama: "Emil Salim", prodi: "S1 Ekonomi", pembimbing: "Dr. Achmad Fauzi, S.E., M.M." },
    { nim: "22.23.8004", nama: "Mari Elka Pangestu", prodi: "S1 Ekonomi", pembimbing: "Dr. Moch. Hamied Wijaya, M.M" },
    { nim: "22.23.8005", nama: "Miranda Goeltom", prodi: "S1 Ekonomi", pembimbing: "Fitri Juniwati Ayuningtyas, S.E., M.Ec.Dev." },

    // S1 Hubungan Internasional (5)
    { nim: "22.24.9001", nama: "Marty Natalegawa", prodi: "S1 Hubungan Internasional", pembimbing: "Aditya Maulana Hasymi, S.IP., M.A." },
    { nim: "22.24.9002", nama: "Retno Marsudi", prodi: "S1 Hubungan Internasional", pembimbing: "Isti Nur Rahmahwati, S.IP., Ll.M., Ph.D." },
    { nim: "22.24.9003", nama: "Ali Alatas", prodi: "S1 Hubungan Internasional", pembimbing: "Muh. Ayub Pramana, S.H., M.H." },
    { nim: "22.24.9004", nama: "Adam Malik", prodi: "S1 Hubungan Internasional", pembimbing: "Rezki Satris, S.I.P., M.A." },
    { nim: "22.24.9005", nama: "Mochtar Kusumaatmadja", prodi: "S1 Hubungan Internasional", pembimbing: "Tunggul Wicaksono, S.I.P., M.A" },

    // S1 Ilmu Pemerintahan (5)
    { nim: "22.25.1001", nama: "Ganjar Pranowo", prodi: "S1 Ilmu Pemerintahan", pembimbing: "Agustina Rahmawati, S.A.P., M.Si." },
    { nim: "22.25.1002", nama: "Anies Baswedan", prodi: "S1 Ilmu Pemerintahan", pembimbing: "Ardiyati, S.I.P., M.P.A" },
    { nim: "22.25.1003", nama: "Ridwan Kamil", prodi: "S1 Ilmu Pemerintahan", pembimbing: "Ferri Wicaksono, S.I.P., M.A." },
    { nim: "22.25.1004", nama: "Khofifah Indar", prodi: "S1 Ilmu Pemerintahan", pembimbing: "Hanantyo Sri Nugroho, S.IP., M.A." },
    { nim: "22.25.1005", nama: "Tri Rismaharini", prodi: "S1 Ilmu Pemerintahan", pembimbing: "Muhammad Zuhdan, S.I.P., M.A." },

    // S1 Kewirausahaan (5)
    { nim: "22.26.1101", nama: "Bob Sadino", prodi: "S1 Kewirausahaan", pembimbing: "Ahmad Sumiyanto, SE, M.Si" },
    { nim: "22.26.1102", nama: "Chairul Tanjung", prodi: "S1 Kewirausahaan", pembimbing: "Dinda Sukmaningrum, S.T., M.M" },
    { nim: "22.26.1103", nama: "Sandiaga Uno", prodi: "S1 Kewirausahaan", pembimbing: "Dr. Reza Widhar Pahlevi, S.E., M.M." },
    { nim: "22.26.1104", nama: "William Tanuwijaya", prodi: "S1 Kewirausahaan", pembimbing: "Nurhayanto, SE, MBA" },
    { nim: "22.26.1105", nama: "Achmad Zaky", prodi: "S1 Kewirausahaan", pembimbing: "Yusuf Amri Amrullah, S.E., M.M." },

    // ================= FST =================

    // S1 Geografi (5)
    { nim: "22.31.5001", nama: "Hendra Setiawan", prodi: "S1 Geografi", pembimbing: "Dr. Ika Afianita Suherningtyas, S.Si., M.Sc." },
    { nim: "22.31.5002", nama: "Susi Susanti", prodi: "S1 Geografi", pembimbing: "Sadewa Purba Sejati, S.Si., M.Sc." },
    { nim: "22.31.5003", nama: "Taufik Hidayat", prodi: "S1 Geografi", pembimbing: "Widiyana Riasasi, S.Si., M.Sc." },
    { nim: "22.31.5004", nama: "Lia Eden", prodi: "S1 Geografi", pembimbing: "Fitria Nucifera, S.Si., M.Sc." },
    { nim: "22.31.5005", nama: "Ahmad Dhani", prodi: "S1 Geografi", pembimbing: "Afrinia Lisditya Permatasari, S.Si., M.Sc." },

    // S1 Arsitektur (5)
    { nim: "22.32.1201", nama: "Ridwan Kamil", prodi: "S1 Arsitektur", pembimbing: "Amir Fatah Sofyan, S.T., M.Kom." },
    { nim: "22.32.1202", nama: "Frederich Silaban", prodi: "S1 Arsitektur", pembimbing: "Ani Hastuti Arthasari, S.T., M.Sc." },
    { nim: "22.32.1203", nama: "Y.B. Mangunwijaya", prodi: "S1 Arsitektur", pembimbing: "Dr. Ir. Hamdi Buldan, M.T." },
    { nim: "22.32.1204", nama: "Andra Matin", prodi: "S1 Arsitektur", pembimbing: "Nurizka Fidali, S.T., M.Sc." },
    { nim: "22.32.1205", nama: "Budi Pradono", prodi: "S1 Arsitektur", pembimbing: "Prasetyo Febriarto, S.T., M.Sc." },

    // S1 Perencanaan Wilayah Kota (5)
    { nim: "22.33.1301", nama: "Basuki Hadimuljono", prodi: "S1 Perencanaan Wilayah Kota", pembimbing: "Bagus Ramadhan, S.T., M.Eng." },
    { nim: "22.33.1302", nama: "Djoko Kirmanto", prodi: "S1 Perencanaan Wilayah Kota", pembimbing: "Gardyas Bidari Adninda, S.T., M.A." },
    { nim: "22.33.1303", nama: "Suharso Monoarfa", prodi: "S1 Perencanaan Wilayah Kota", pembimbing: "Ibnul Muntaza, S.P.W.K., M.URP" },
    { nim: "22.33.1304", nama: "Ferry Mursyidan Baldan", prodi: "S1 Perencanaan Wilayah Kota", pembimbing: "Muhammad Najih Fasya, S.P.W.K., M.PAR." },
    { nim: "22.33.1305", nama: "Sofyan Djalil", prodi: "S1 Perencanaan Wilayah Kota", pembimbing: "Ni'mah Mahnunah, S.T., M.T." }
];
