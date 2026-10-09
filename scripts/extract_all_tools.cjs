const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');

// Match every slug in registry
const slugMatches = [...content.matchAll(/"slug":"([^"]+)"/g)].map(m => m[1]);
console.log('Total slugs found:', slugMatches.length);

// Extract tool JSON objects by finding each {"cat": ... } block
// In registry.js, each tool is a JSON object on its own line or multiline with "slug":
const lines = content.split('\n');
const toolList = [];

for (const line of lines) {
  const slugMatch = line.match(/"slug":"([^"]+)"/);
  const nameMatch = line.match(/"name":"([^"]+)"/);
  const catMatch = line.match(/"cat":"([^"]+)"/);
  const subcatMatch = line.match(/"subcat":"([^"]+)"/);
  const descMatch = line.match(/"desc":"([^"]+)"/);
  
  if (slugMatch && nameMatch) {
    toolList.push({
      slug: slugMatch[1],
      name: nameMatch[1],
      cat: catMatch ? catMatch[1] : '',
      subcat: subcatMatch ? subcatMatch[1] : '',
      desc: descMatch ? descMatch[1] : ''
    });
  }
}

console.log('Extracted tools with slug and name:', toolList.length);

fs.writeFileSync('scripts/all_1036_tools.json', JSON.stringify(toolList, null, 2), 'utf8');
console.log('Saved to scripts/all_1036_tools.json');
