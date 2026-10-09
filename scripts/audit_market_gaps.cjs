const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

// Categories
const catStart = content.indexOf('export const categories = [');
const catEnd = content.indexOf('export const tools = [');
const catStr = content.substring(catStart + 'export const categories = '.length, catEnd).trim().replace(/;$/, '');
const categories = JSON.parse(catStr);

// Tools
const toolsStart = content.indexOf('export const tools = [');
const toolsEnd = content.indexOf('export const related =');
const toolsStr = content.substring(toolsStart + 'export const tools = ['.length, toolsEnd).trim();
const toolBlocks = toolsStr.split(/\n\s*\{/).filter(Boolean);

const tools = [];
toolBlocks.forEach(b => {
  const c = b.match(/"cat":\s*"([^"]+)"/);
  const s = b.match(/"slug":\s*"([^"]+)"/);
  const n = b.match(/"name":\s*"([^"]+)"/);
  const sub = b.match(/"subcat":\s*"([^"]+)"/);
  if (c && s) {
    tools.push({
      cat: c[1],
      slug: s[1],
      name: n ? n[1] : '',
      subcat: sub ? sub[1] : ''
    });
  }
});

console.log('=== VIMZ.AI INVENTORY AUDIT ===');
console.log(`Categories count: ${categories.length}`);
console.log(`Tools count: ${tools.length}`);

const targetDomains = [
  'social-media-tools',
  'marketing-tools',
  'business-tools',
  'freelance-tools',
  'writing-tools',
  'ecommerce-tools',
  'data-tools',
  'image-tools',
  'media-tools'
];

console.log('\n=== TARGET DOMAINS TOOL COUNTS & CURRENT TOOLS ===');
targetDomains.forEach(dom => {
  const catObj = categories.find(c => c.slug === dom);
  const catTools = tools.filter(t => t.cat === dom);
  console.log(`\nDomain: [${dom}] (${catObj?.name || 'Unknown'}) — ${catTools.length} existing tools:`);
  catTools.forEach(t => {
    console.log(`  • [${t.slug}] ${t.name} (Subcat: ${t.subcat || 'none'})`);
  });
});
