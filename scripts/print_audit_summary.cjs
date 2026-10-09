const fs = require('fs');

const audit = JSON.parse(fs.readFileSync('scripts/matrix_audit.json', 'utf8'));

console.log('=== MATRIX SUMMARY ===');
audit.forEach(item => {
  console.log(`[${item.category}] ${item.req}: ${item.matchedTools.length > 0 ? item.matchedTools.join(', ') : 'NONE'}`);
});
