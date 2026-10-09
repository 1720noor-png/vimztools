const fs = require('fs');
const content = fs.readFileSync('src/data/registry.js', 'utf8');
const lines = content.split('\n');
const slugs = [
  'content-calendar-planner',
  'content-calendar',
  'content-editorial-calendar',
  'ab-test-calculator'
];

slugs.forEach(s => {
  const line = lines.find(l => l.includes('"slug":"' + s + '"'));
  if (line) {
    const compMatch = line.match(/"Component":\s*([A-Za-z0-9_]+)/);
    const compName = compMatch ? compMatch[1] : 'unknown';
    const impMatch = content.match(new RegExp(`import\\s+${compName}\\s+from\\s+['"]([^'"]+)['"]`));
    console.log(s, '-> Comp:', compName, '-> Path:', impMatch ? impMatch[1] : 'unknown');
  }
});
