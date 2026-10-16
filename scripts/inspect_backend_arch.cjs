const fs = require('fs');
const path = require('path');

const API = path.resolve(__dirname, '..', 'api');

function listPhp(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (item === 'vendor') continue;
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(listPhp(full));
    } else if (item.endsWith('.php')) {
      results.push(full);
    }
  }
  return results;
}

const phpFiles = listPhp(API);
console.log(`Discovered ${phpFiles.length} PHP files in api/`);

// Group by subdirectories
const groups = {};
for (const f of phpFiles) {
  const rel = path.relative(API, f).replace(/\\/g, '/');
  const top = rel.split('/')[0];
  groups[top] = (groups[top] || 0) + 1;
}

console.log('PHP Files by Directory:');
Object.entries(groups).forEach(([g, c]) => console.log(`  - api/${g}: ${c} files`));

// Check Controllers
const ctrlDir = path.join(API, 'app', 'Http', 'Controllers');
if (fs.existsSync(ctrlDir)) {
  console.log('\nControllers in app/Http/Controllers:');
  const ctrls = listPhp(ctrlDir);
  ctrls.forEach(c => console.log('  -', path.relative(API, c).replace(/\\/g, '/')));
}

// Check Models
const modelDir = path.join(API, 'app', 'Models');
if (fs.existsSync(modelDir)) {
  console.log('\nModels in app/Models:');
  const models = listPhp(modelDir);
  models.forEach(m => console.log('  -', path.relative(API, m).replace(/\\/g, '/')));
}

// Check Routes
const routeFile = path.join(API, 'routes', 'api.php');
if (fs.existsSync(routeFile)) {
  console.log('\nroutes/api.php contents:');
  console.log(fs.readFileSync(routeFile, 'utf8'));
}
