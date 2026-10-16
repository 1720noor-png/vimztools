const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function getAllFiles(dir) {
  let res = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) res = res.concat(getAllFiles(full));
    else if (item.endsWith('.jsx') || item.endsWith('.js')) res.push(full);
  }
  return res;
}

const allFiles = getAllFiles(SRC);
const nonToolFiles = allFiles.filter(f => !f.includes(path.join('src', 'tools')));

console.log(`Non-tool files in src/: ${nonToolFiles.length}`);

// For each non-tool file, see if it is imported anywhere in src/
const fileImportCounts = {};

nonToolFiles.forEach(target => {
  const base = path.basename(target, path.extname(target));
  const rel = path.relative(SRC, target).replace(/\\/g, '/');
  let count = 0;

  for (const f of allFiles) {
    if (f === target) continue;
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes(`/${base}`) || content.includes(`'./${base}`) || content.includes(`"${base}"`) || content.includes(`'${base}'`)) {
      count++;
    }
  }

  fileImportCounts[rel] = count;
});

console.log('Non-tool files import frequency:');
Object.entries(fileImportCounts).forEach(([rel, count]) => {
  console.log(`  - ${rel}: referenced in ${count} files ${count === 0 ? '[POTENTIAL ORPHAN]' : ''}`);
});
