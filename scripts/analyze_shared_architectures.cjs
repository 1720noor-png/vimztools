const fs = require('fs');
const path = require('path');

const inv = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'reports', 'vimz-ai-freemium-audit', 'tool_implementation_inventory.json'), 'utf8'));
const sharedComponents = {};
let standaloneCount = 0;

inv.forEach(t => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', t.relPath), 'utf8');
  const m = code.match(/import\s+([A-Za-z0-9_]+)\s+from\s+['"](\.\.\/\.\.\/components\/[A-Za-z0-9_.]+)['"]/);
  if (m) {
    const comp = m[2];
    sharedComponents[comp] = (sharedComponents[comp] || 0) + 1;
  } else {
    standaloneCount++;
  }
});

console.log('Shared Reusable Component Architectures:');
Object.entries(sharedComponents).sort((a,b) => b[1] - a[1]).forEach(([comp, count]) => {
  console.log(`- ${comp.padEnd(35)}: ${count} tools`);
});
console.log(`- Standalone Custom Components       : ${standaloneCount} tools`);
