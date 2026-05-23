const fs = require('fs');

function fixConflicts(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const before = (content.match(/<<<<<<</g) || []).length;
    if (before === 0) { console.log('OK (no conflicts):', filePath.split('/').pop()); return 0; }
    const pattern = /<<<<<<< HEAD[\r\n]+([\s\S]*?)=======[\r\n]+[\s\S]*?>>>>>>> [^\r\n]*[\r\n]*/g;
    const fixed = content.replace(pattern, (match, headPart) => headPart);
    const after = (fixed.match(/<<<<<<</g) || []).length;
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`Fixed: ${filePath.split('/').pop()}  (${before} conflicts -> ${after} remaining)`);
    return after;
}

const files = [
    'RadarFrontend/src/components/investor/Watchlist.jsx',
];

files.forEach(f => {
    try { fixConflicts(f); } catch(e) { console.error('Error:', f.split('/').pop(), e.message); }
});
console.log('Done.');
