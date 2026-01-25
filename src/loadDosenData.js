// Script untuk memuat data dosen dari CSV dengan parsing yang akurat
export async function loadDosenData() {
    try {
        const response = await fetch('/file/Data pegawai - DAAK.csv');
        const csvText = await response.text();

        // Parse CSV dengan library sederhana tapi akurat
        function parseCSVLine(line, separator = ';') {
            const result = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        // Escaped quote
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quotes
                        inQuotes = !inQuotes;
                    }
                } else if (char === separator && !inQuotes) {
                    // End of field
                    result.push(current.trim());
                    current = '';
                } else if (char !== '\r') {
                    // Normal character (skip carriage return)
                    current += char;
                }
            }

            // Add last field
            result.push(current.trim());
            return result;
        }

        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = parseCSVLine(lines[0]);

        console.log('CSV Headers:', headers);

        const dosenData = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);

            if (values.length < 4) continue; // Skip incomplete lines

            // Mapping sesuai urutan kolom di CSV:
            // 0: No
            // 1: Nik
            // 2: Status (Dosen/Tendik)
            // 3: Nama
            // 4: Kategori Dosen/Karyawan
            // 5: NIDN
            // 6: Jenis Kelamin

            const status = values[2];

            // Hanya ambil data DOSEN (bukan TENDIK)
            if (status === 'DOSEN') {
                dosenData.push({
                    no: values[0],
                    nik: values[1],
                    status: values[2],
                    nama: values[3],
                    kategori: values[4] || '-',
                    nidn: values[5] || '-',
                    jenisKelamin: values[6] || '-'
                });
            }
        }

        console.log(`✅ Loaded ${dosenData.length} dosen from SDM CSV`);
        return dosenData;
    } catch (error) {
        console.error('❌ Error loading dosen data:', error);
        return [];
    }
}
