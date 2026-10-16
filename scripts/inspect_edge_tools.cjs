const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'reports', 'vimz-ai-freemium-audit', 'phase32_tool_categorization.json'), 'utf8'));

console.log('PARTIAL TOOLS:');
data.tools.filter(t => t.status === 'PARTIAL').forEach(t => console.log(`- [${t.slug}] ${t.name} (${t.cat}): ${t.reason}`));

console.log('\nUNTESTED TOOLS:');
data.tools.filter(t => t.status === 'UNTESTED').forEach(t => console.log(`- [${t.slug}] ${t.name} (${t.cat}): ${t.reason}`));
