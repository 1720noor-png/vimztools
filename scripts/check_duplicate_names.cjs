const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');
const lines = content.split('\n');

const tools = [];
for (const line of lines) {
  if (line.trim().startsWith('{')) {
    const slugMatch = line.match(/"slug":"([^"]+)"/);
    const nameMatch = line.match(/"name":"([^"]+)"/);
    if (slugMatch && nameMatch) {
      tools.push({ slug: slugMatch[1], name: nameMatch[1] });
    }
  }
}

console.log('Total tools checked:', tools.length);
const nameMap = {};
const duplicates = [];

tools.forEach(t => {
  const norm = t.name.toLowerCase().trim();
  if (nameMap[norm]) {
    duplicates.push({ name: t.name, slug1: nameMap[norm], slug2: t.slug });
  } else {
    nameMap[norm] = t.slug;
  }
});

console.log('Duplicate names count:', duplicates.length);
if (duplicates.length > 0) {
  console.log(duplicates);
}
