const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('export const tools = ['));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === ']');

const toolLines = lines.slice(startIdx + 1, endIdx).filter(l => l.trim().startsWith('{'));
console.log('Total tools parsed in tools array:', toolLines.length);

const slugs = [];
const duplicates = [];

for (const line of toolLines) {
  const match = line.match(/"slug":"([^"]+)"/);
  if (match) {
    const slug = match[1];
    if (slugs.includes(slug)) {
      duplicates.push(slug);
    } else {
      slugs.push(slug);
    }
  }
}

console.log('Unique tool slugs:', slugs.length);
console.log('Duplicate slugs count:', duplicates.length);
if (duplicates.length > 0) {
  console.log('Duplicates found:', duplicates);
} else {
  console.log('Integrity check PASSED: 0 duplicate slugs.');
}
