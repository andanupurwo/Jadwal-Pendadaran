const fs = require('fs');

// Helper untuk normalisasi nama (menghapus gelar, spasi ekstra, dll)
function normalizeName(name) {
    return name
        .toLowerCase()
        .replace(/[,.'"`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Helper untuk menghapus gelar
function removeTitle(name) {
    return name
        .replace(/\b(prof|dr|ir|drs|dra|s\.?e\.?|s\.?kom\.?|s\.?si\.?|s\.?t\.?|s\.?sos\.?|s\.?ag\.?|s\.?h\.?|s\.?i\.?kom\.?|s\.?i\.?p\.?|s\.?a\.?p\.?|m\.?m\.?|m\.?kom\.?|m\.?si\.?|m\.?t\.?|m\.?eng\.?|m\.?sc\.?|m\.?a\.?|m\.?i\.?kom\.?|m\.?ak\.?|m\.?akt\.?|m\.?ec\.?dev\.?|m\.?b\.?a\.?|m\.?hum\.?|m\.?p\.?a\.?|m\.?med\.?kom\.?|ph\.?d\.?|ak\.?|ca\.?|ll\.?m\.?)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Parse CSV dengan quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else if (char !== '\r') {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Baca data SDM
const sdmCsv = fs.readFileSync('./file/NIK AMIKOM 2026 - RAW DOSEN.csv', 'utf-8');
const sdmLines = sdmCsv.split('\n').filter(l => l.trim());

// Parse SDM data
const sdmData = [];
for (let i = 1; i < sdmLines.length; i++) {
    const values = parseCSVLine(sdmLines[i]);
    if (values[2] === 'DOSEN' && values[3]) {
        sdmData.push({
            no: values[0],
            nik: values[1],
            nama: values[3],
            namaNormalized: normalizeName(values[3]),
            namaCore: normalizeName(removeTitle(values[3]))
        });
    }
}

console.log('Total SDM data:', sdmData.length);

// Helper untuk mencari match
function findMatch(name) {
    const normalized = normalizeName(name);
    const core = normalizeName(removeTitle(name));
    
    // Coba exact match dulu
    let match = sdmData.find(d => d.namaNormalized === normalized);
    if (match) return { ...match, confidence: 100 };
    
    // Coba core name match
    match = sdmData.find(d => d.namaCore === core);
    if (match) return { ...match, confidence: 90 };
    
    // Coba partial match
    match = sdmData.find(d => d.namaCore.includes(core) || core.includes(d.namaCore));
    if (match) return { ...match, confidence: 70 };
    
    return null;
}

console.log('\n=== FES ANALYSIS ===');
const fesCsv = fs.readFileSync('./file/Dosen FES.csv', 'utf-8');
const fesLines = fesCsv.split('\n').filter(l => l.trim());

let fesMatched = 0;
let fesUnmatched = [];
const fesResults = [];

for (let i = 1; i < fesLines.length; i++) {
    const parts = parseCSVLine(fesLines[i]);
    const nomor = parts[0];
    const nama = parts[2];
    const prodi = parts[3];
    
    if (nama) {
        const match = findMatch(nama);
        if (match) {
            fesMatched++;
            console.log(`✓ ${nama} => ${match.nama} (NIK: ${match.nik}) [${match.confidence}%]`);
            fesResults.push({
                nomor,
                nik: match.nik,
                nama: match.nama,
                prodi
            });
        } else {
            fesUnmatched.push(nama);
            console.log(`✗ ${nama} => NOT FOUND`);
            fesResults.push({
                nomor,
                nik: '',
                nama: nama,
                prodi
            });
        }
    }
}

console.log(`\nFES: ${fesMatched} matched, ${fesUnmatched.length} unmatched`);

console.log('\n=== FST ANALYSIS ===');
const fstCsv = fs.readFileSync('./file/Dosen FST.csv', 'utf-8');
const fstLines = fstCsv.split('\n').filter(l => l.trim());

let fstMatched = 0;
let fstUnmatched = [];
const fstResults = [];

for (let i = 0; i < fstLines.length; i++) {
    const parts = parseCSVLine(fstLines[i]);
    const nama = parts[0];
    const prodi = parts[1];
    
    if (nama) {
        const match = findMatch(nama);
        if (match) {
            fstMatched++;
            console.log(`✓ ${nama} => ${match.nama} (NIK: ${match.nik}) [${match.confidence}%]`);
            fstResults.push({
                nomor: (i + 1).toString(),
                nik: match.nik,
                nama: match.nama,
                prodi
            });
        } else {
            fstUnmatched.push(nama);
            console.log(`✗ ${nama} => NOT FOUND`);
            fstResults.push({
                nomor: (i + 1).toString(),
                nik: '',
                nama: nama,
                prodi
            });
        }
    }
}

console.log(`\nFST: ${fstMatched} matched, ${fstUnmatched.length} unmatched`);

// Generate new CSV files
console.log('\n=== GENERATING NEW FILES ===');

// Generate FES CSV
let fesNewCsv = 'Nomor,NIK,DOSEN,PRODI\n';
fesResults.forEach(r => {
    fesNewCsv += `${r.nomor},${r.nik},"${r.nama}",${r.prodi}\n`;
});
fs.writeFileSync('./file/Dosen FES_updated.csv', fesNewCsv, 'utf-8');
console.log('✓ Generated: Dosen FES_updated.csv');

// Generate FST CSV  
let fstNewCsv = 'Nomor,NIK,DOSEN,PRODI\n';
fstResults.forEach(r => {
    fstNewCsv += `${r.nomor},${r.nik},"${r.nama}",${r.prodi}\n`;
});
fs.writeFileSync('./file/Dosen FST_updated.csv', fstNewCsv, 'utf-8');
console.log('✓ Generated: Dosen FST_updated.csv');

console.log('\nDone! Check the _updated.csv files.');
