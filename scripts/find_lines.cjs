const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('categories') || l.includes('tools =')) {
    console.log(`Line ${i + 1}: ${l.substring(0, 80)}`);
  }
});
