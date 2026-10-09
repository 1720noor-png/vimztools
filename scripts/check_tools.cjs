const fs = require('fs');
const path = require('path');

const registryContent = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

// Extract categories array
const catSectionMatch = registryContent.match(/export const categories = (\[[\s\S]*?\]);\s*export const tools/);
let categories = [];
if (catSectionMatch) {
  try {
    // Eval in sandbox safe
    categories = eval(catSectionMatch[1]);
  } catch (e) {
    console.error('Failed to parse categories:', e);
  }
}

console.log('Total categories found:', categories.length);
const catMap = new Map();
categories.forEach(c => catMap.set(c.slug, c));

// Extract tools array
const toolMatches = [...registryContent.matchAll(/\{\s*"cat"\s*:\s*"([^"]+)"[\s\S]*?"slug"\s*:\s*"([^"]+)"[\s\S]*?"name"\s*:\s*"([^"]+)"/g)];
console.log('Total tools matched:', toolMatches.length);

const missingCats = new Set();
toolMatches.forEach(m => {
  const cat = m[1];
  const slug = m[2];
  const name = m[3];
  if (!catMap.has(cat)) {
    missingCats.add(cat);
  }
});

console.log('Categories in tools but missing in categories array:', [...missingCats]);
