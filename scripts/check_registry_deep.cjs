const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

// Parse categories JSON array
const catStart = content.indexOf('export const categories = [');
const catEnd = content.indexOf('export const tools = [');
const catStr = content.substring(catStart + 'export const categories = '.length, catEnd).trim();
const cleanCatStr = catStr.replace(/;$/, '');
const categories = JSON.parse(cleanCatStr);

console.log('Categories count:', categories.length);

const catMap = new Map();
categories.forEach(c => catMap.set(c.slug, c));

// Parse tools JSON array (without Component)
const toolsStart = content.indexOf('export const tools = [');
const toolsEnd = content.indexOf('export const related =');
const toolsStr = content.substring(toolsStart + 'export const tools = ['.length, toolsEnd).trim();

// Tools lines
const toolBlocks = toolsStr.split(/\n\s*\{/).filter(Boolean);
console.log('Tool blocks:', toolBlocks.length);

let missingCats = new Set();
let allTools = [];
toolBlocks.forEach(block => {
  const catMatch = block.match(/"cat"\s*:\s*"([^"]+)"/);
  const slugMatch = block.match(/"slug"\s*:\s*"([^"]+)"/);
  const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
  if (catMatch && slugMatch) {
    const cat = catMatch[1];
    const slug = slugMatch[1];
    const name = nameMatch ? nameMatch[1] : '';
    allTools.push({ cat, slug, name });
    if (!catMap.has(cat)) {
      missingCats.add(cat);
    }
  }
});

console.log('Total parsed tools:', allTools.length);
console.log('Missing categories in tools:', [...missingCats]);

// Check duplicate slugs
const slugMap = new Map();
allTools.forEach(t => {
  if (slugMap.has(t.slug)) {
    console.log('Duplicate slug:', t.slug, 'Cats:', t.cat, slugMap.get(t.slug).cat);
  } else {
    slugMap.set(t.slug, t);
  }
});
