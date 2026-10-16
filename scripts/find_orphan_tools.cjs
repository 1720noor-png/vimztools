const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(ROOT, 'src', 'tools');
const REGISTRY_FILE = path.join(ROOT, 'src', 'data', 'registry.js');

const regContent = fs.readFileSync(REGISTRY_FILE, 'utf8');

function getFiles(dir) {
  let res = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) res = res.concat(getFiles(full));
    else if (item.endsWith('.jsx') || item.endsWith('.js')) res.push(full);
  }
  return res;
}

const allTools = getFiles(TOOLS_DIR);
const orphans = [];

for (const t of allTools) {
  const base = path.basename(t);
  const rel = path.relative(path.join(ROOT, 'src'), t).replace(/\\/g, '/');
  if (!regContent.includes(base)) {
    orphans.push(rel);
  }
}

console.log(`Total tool files on disk: ${allTools.length}`);
console.log(`Orphan tool files not in registry.js: ${orphans.length}`);
orphans.forEach(o => console.log('  - Orphan:', o));
