const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'tools') scanDir(fullPath);
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (l.includes('.name') && !l.includes('file.name') && !l.includes('target.name')) {
          console.log(`${path.relative(path.join(__dirname, '..'), fullPath)}:${i+1} -> ${l.trim()}`);
        }
      });
    }
  }
}

scanDir(path.join(__dirname, '../src'));
