const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');
const lines = content.split('\n');
const tools = [];

for (const line of lines) {
  if (line.includes('"slug":')) {
    const slugMatch = line.match(/"slug":\s*"([^"]+)"/);
    const catMatch = line.match(/"cat":\s*"([^"]+)"/);
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    const descMatch = line.match(/"desc":\s*"([^"]+)"/);
    if (slugMatch && catMatch) {
      tools.push({
        slug: slugMatch[1],
        cat: catMatch[1],
        name: nameMatch ? nameMatch[1] : '',
        desc: descMatch ? descMatch[1] : ''
      });
    }
  }
}

console.log('Total tools found in registry:', tools.length);

const catCounts = {};
tools.forEach(t => {
  catCounts[t.cat] = (catCounts[t.cat] || 0) + 1;
});

console.log('Categories count:', Object.keys(catCounts).length);
console.log('Category breakdown:\n', JSON.stringify(catCounts, null, 2));
