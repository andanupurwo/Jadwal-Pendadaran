// Load Faculty Data from CSV
export async function loadFacultyData() {
    try {
        const response = await fetch('/src/assets/data/Dosen Prodi.csv');
        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        const facultyData = {
            FIK: [],
            FES: [],
            FST: []
        };

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Parse CSV line (handle quoted fields)
            const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
            const fields = [];
            let match;

            while ((match = regex.exec(line)) !== null) {
                let field = match[1];
                if (field.startsWith('"') && field.endsWith('"')) {
                    field = field.slice(1, -1).replace(/""/g, '"');
                }
                fields.push(field);
            }

            // Filter out empty fields
            const cleanFields = fields.filter(f => f !== '');

            if (cleanFields.length >= 5) {
                const [no, nama, nik, prodi, fakultas] = cleanFields;

                // Clean NIK - remove "NIK " prefix
                const cleanNik = nik.replace(/^NIK\s+/, '').trim();

                const dosenData = {
                    nomor: parseInt(no) || facultyData[fakultas]?.length + 1 || 1,
                    nama: nama.trim(),
                    nik: cleanNik,
                    prodi: prodi.trim(),
                    fakultas: fakultas.trim()
                };

                // Add to appropriate faculty
                if (fakultas === 'FIK' || fakultas === 'FES' || fakultas === 'FST') {
                    facultyData[fakultas].push(dosenData);
                }
            }
        }

        console.log('✅ Faculty data loaded successfully:');
        console.log(`   FIK: ${facultyData.FIK.length} dosen`);
        console.log(`   FES: ${facultyData.FES.length} dosen`);
        console.log(`   FST: ${facultyData.FST.length} dosen`);

        return facultyData;
    } catch (error) {
        console.error('❌ Error loading faculty data:', error);
        return {
            FIK: [],
            FES: [],
            FST: []
        };
    }
}

// Verify faculty data against SDM master data
export function verifyFacultyData(facultyData, masterSDM) {
    const results = {
        FIK: { matched: 0, unmatched: 0, details: [] },
        FES: { matched: 0, unmatched: 0, details: [] },
        FST: { matched: 0, unmatched: 0, details: [] }
    };

    for (const [faculty, dosenList] of Object.entries(facultyData)) {
        if (!['FIK', 'FES', 'FST'].includes(faculty)) continue;

        dosenList.forEach(dosen => {
            // Try to find match in SDM data by NIK
            const sdmMatch = masterSDM.find(sdm =>
                sdm.nik && dosen.nik && sdm.nik.toString().trim() === dosen.nik.toString().trim()
            );

            if (sdmMatch) {
                results[faculty].matched++;
                dosen.matchResult = {
                    matched: true,
                    type: 'exact_nik',
                    score: 100,
                    sdm: sdmMatch
                };
            } else {
                // Try fuzzy match by name
                const nameMatch = masterSDM.find(sdm => {
                    if (!sdm.nama || !dosen.nama) return false;
                    const sdmName = sdm.nama.toLowerCase().trim();
                    const dosenName = dosen.nama.toLowerCase().trim();
                    return sdmName.includes(dosenName) || dosenName.includes(sdmName);
                });

                if (nameMatch) {
                    results[faculty].matched++;
                    dosen.matchResult = {
                        matched: true,
                        type: 'fuzzy_name',
                        score: 75,
                        sdm: nameMatch
                    };
                } else {
                    results[faculty].unmatched++;
                    dosen.matchResult = {
                        matched: false,
                        type: 'no_match',
                        score: 0
                    };
                }
            }

            results[faculty].details.push(dosen);
        });
    }

    console.log('📊 Verification Results:');
    console.log(`   FIK: ${results.FIK.matched} matched, ${results.FIK.unmatched} unmatched`);
    console.log(`   FES: ${results.FES.matched} matched, ${results.FES.unmatched} unmatched`);
    console.log(`   FST: ${results.FST.matched} matched, ${results.FST.unmatched} unmatched`);

    return results;
}
