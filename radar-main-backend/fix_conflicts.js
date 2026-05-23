const fs = require('fs');

const files = [
  'src/controllers/newsController.js',
  'src/controllers/ohlcController.js',
  'src/controllers/userController.js',
  'src/controllers/watchlistController.js',
  'src/services/finnhubService.js',
  'src/services/fundamentalsEnrichmentService.js',
  'src/services/indicatorService.js',
  'src/services/newsService.js',
  'src/services/screenerService.js',
  'src/services/stockInsightsService.js',
  'src/services/stockService.js',
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    // Match conflict blocks and keep only HEAD portion
    const pattern = /<<<<<<< HEAD[\r\n]+([\s\S]*?)=======[\r\n]+[\s\S]*?>>>>>>> [^\r\n]*[\r\n]*/g;
    const fixed = content.replace(pattern, (match, headPart) => headPart);
    fs.writeFileSync(f, fixed, 'utf8');
    const remaining = (fixed.match(/<<<<<<</g) || []).length;
    console.log('Fixed:', f, remaining > 0 ? '(STILL HAS ' + remaining + ' conflicts)' : 'OK');
  } catch (err) {
    console.error('Error fixing', f, err.message);
  }
});

console.log('Done.');
