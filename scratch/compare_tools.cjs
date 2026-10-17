const fs = require('fs');
const path = require('path');

const vimzIndex = JSON.parse(fs.readFileSync('c:/Users/ranah/OneDrive/Desktop/vimztools/src/data/tool-index.json', 'utf8'));
const vimzSlugs = new Set(vimzIndex.map(t => t.slug));
console.log('Existing VimzTools total index tools:', vimzSlugs.size);

// Read catalog.ts from Meerab tools
const meerabCatalog = fs.readFileSync('c:/Users/ranah/OneDrive/Desktop/vimztools/temp_meerab_tools/src/lib/catalog.ts', 'utf8');

const idRegex = /id:\s*['"]([^'"]+)['"]/g;
const idMatches = [];
let match;
while ((match = idRegex.exec(meerabCatalog)) !== null) {
  idMatches.push(match[1]);
}

console.log('Found ID matches in Meerab catalog.ts:', idMatches.length);
const uniqueMeerabIds = [...new Set(idMatches)];
console.log('Unique Meerab IDs:', uniqueMeerabIds.length);

const newInMeerab = uniqueMeerabIds.filter(id => !vimzSlugs.has(id));
console.log('New tool IDs in Meerab not in VimzTools:', newInMeerab.length);
console.log('Sample new IDs:', newInMeerab.slice(0, 30));

// Also check all physical tool files in Meerab tools
function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const meerabPagesTools = walk('c:/Users/ranah/OneDrive/Desktop/vimztools/temp_meerab_tools/src/pages/tools');
console.log('\nTotal tool component files in src/pages/tools:', meerabPagesTools.length);

const meerabImageTools = walk('c:/Users/ranah/OneDrive/Desktop/vimztools/temp_meerab_tools/src/components/image-tools');
console.log('Total tool component files in src/components/image-tools:', meerabImageTools.length);
