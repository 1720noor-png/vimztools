const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

// Categories
const catStart = content.indexOf('export const categories = [');
const catEnd = content.indexOf('export const tools = [');
const catStr = content.substring(catStart + 'export const categories = '.length, catEnd).trim().replace(/;$/, '');
const categories = JSON.parse(catStr);
const catMap = new Map(categories.map(c => [c.slug, c]));

// Tools
const toolsStart = content.indexOf('export const tools = [');
const toolsEnd = content.indexOf('export const related =');
const toolsStr = content.substring(toolsStart + 'export const tools = ['.length, toolsEnd).trim();
const toolBlocks = toolsStr.split(/\n\s*\{/).filter(Boolean);

const tools = [];
toolBlocks.forEach(block => {
  const catMatch = block.match(/"cat"\s*:\s*"([^"]+)"/);
  const slugMatch = block.match(/"slug"\s*:\s*"([^"]+)"/);
  const nameMatch = block.match(/"name"\s*:\s*"([^"]+)"/);
  if (catMatch && slugMatch) {
    tools.push({
      cat: catMatch[1],
      slug: slugMatch[1],
      name: nameMatch ? nameMatch[1] : '',
    });
  }
});

console.log('Testing tool lookup for all', tools.length, 'tools:');

let failures = 0;
tools.forEach(t => {
  // Test lookup by slug (e.g. useParams: { cat: t.cat, tool: t.slug })
  const found = tools.find(x => x.slug === t.slug) || tools.find(x => x.cat === t.cat && x.slug === t.slug);
  if (!found) {
    console.error('FAILED to find tool by slug:', t.slug);
    failures++;
  }
  
  // Test category lookup
  const foundCat = catMap.get(t.cat) || catMap.get(found?.cat);
  if (!foundCat) {
    // console.log('Notice: tool cat not in categories array:', t.slug, t.cat);
  }
});

console.log(`Lookup test completed. Failures: ${failures}`);
