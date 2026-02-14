function compareNames(name1, name2) {
    if (!name1 || !name2) return false;
    
    const normalize = (n) => {
        let base = n.split(',')[0];
        base = base.replace(/^(dr|drs|prof|apt|irk)\.?\s+/gi, '');
        return base.toLowerCase()
            .replace(/[.,]/g, ' ')
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(w => w.length > 0);
    };
    
    const words1 = normalize(name1);
    const words2 = normalize(name2);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    const commonWords = words1.filter(w => words2.includes(w));
    
    return commonWords.length >= 2;
}

// Test cases
const tests = [
    ['Yusuf Amri Amrullah, S.E., M.M.', 'Yusuf Amri Amri Amrullah', true, 'Bentrok case utama'],
    ['Ahmad Yusuf', 'Yusuf Ahmad', true, 'Order berbeda tapi same person'],
    ['Yusuf Ahmad', 'Yusuf Amri', false, 'Hanya 1 kata sama'],
    ['Yusuf', 'Ahmad', false, 'Tidak ada kata sama'],
    ['Dr. Yusuf Amri Amrullah', 'Yusuf Amri Amri', true, 'Dengan gelar depan'],
    ['Yusuf Amri Amrullah', 'Dr. Yusuf Amri', true, 'Minimal 2 kata cocok']
];

console.log('=== Testing compareNames Function ===\n');

let passed = 0;
tests.forEach((test, idx) => {
    const [name1, name2, expected, desc] = test;
    const result = compareNames(name1, name2);
    const status = result === expected ? 'PASS' : 'FAIL';
    if (result === expected) passed++;
    console.log(`[${status}] Test ${idx + 1}: ${desc}`);
    console.log(`      compareNames('${name1}', '${name2}')`);
    console.log(`      Result: ${result}, Expected: ${expected}\n`);
});

console.log(`\n=== Summary: ${passed}/${tests.length} tests passed ===`);
