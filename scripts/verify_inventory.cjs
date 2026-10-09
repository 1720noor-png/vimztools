const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');
const lines = content.split('\n');
const abLine = lines.find(l => l.includes('"slug":"ab-test-calculator"'));
console.log('abLine:', abLine);
