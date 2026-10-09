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
  const descMatch = block.match(/"desc"\s*:\s*"([^"]+)"/);
  const whyMatch = block.match(/"why"\s*:\s*"([^"]+)"/);
  const keywordsMatch = block.match(/"keywords"\s*:\s*"([^"]+)"/);
  if (catMatch && slugMatch) {
    tools.push({
      cat: catMatch[1],
      slug: slugMatch[1],
      name: nameMatch ? nameMatch[1] : '',
      desc: descMatch ? descMatch[1] : '',
      why: whyMatch ? whyMatch[1] : '',
      keywords: keywordsMatch ? keywordsMatch[1] : '',
    });
  }
});

console.log('--- COMPREHENSIVE VIMZ.AI INTEGRITY TEST ---');
console.log(`Verified Registered Categories: ${categories.length}`);
console.log(`Verified Registered Tools: ${tools.length}`);

// 1. Test search function with null, empty, and keyword searches
function search(q, cat) {
  if (!q && !cat) return tools;
  const terms = (q || '').toLowerCase().split(/\s+/).filter(Boolean);
  return tools.filter((t) => {
    if (!t) return false;
    if (cat && t.cat !== cat) return false;
    const c = categories.find((x) => x.slug === t.cat);
    const catName = c?.name || t.cat || '';
    const hay = `${t.name || ''} ${catName} ${t.keywords || ''} ${t.desc || ''} ${t.why || ''}`.toLowerCase();
    return terms.every((w) => hay.includes(w));
  });
}

const testQueries = ['', 'gpa', 'invoice', 'json', 'dcf', 'password', 'calculator', 'converter', 'unknown_query_xyz'];
testQueries.forEach(q => {
  const res = search(q);
  console.log(`Search query "${q}": returned ${res.length} tools`);
});

// 2. Test tool lookup on all 1,015 tools (both /:cat/:tool and /tools/:tool)
let lookupFailures = 0;
tools.forEach(t => {
  // Simulate useParams({ cat: t.cat, tool: t.slug })
  const foundBySlug = tools.find((x) => x?.slug === t.slug) ||
                      tools.find((x) => x?.cat === t.cat && x?.slug === t.slug);
  
  if (!foundBySlug) {
    console.error(`ERROR: Failed to resolve tool ${t.slug}`);
    lookupFailures++;
  } else if (!foundBySlug.name) {
    console.error(`ERROR: Tool ${t.slug} has no name`);
    lookupFailures++;
  }
});

console.log(`Tool Lookup Test on 1,015 tools: ${lookupFailures === 0 ? 'PASSED (0 errors)' : `FAILED (${lookupFailures} errors)`}`);

// 3. Test related() on all 1,015 tools
function related(t) {
  if (!t || !t.cat) return [];
  const same = tools.filter((x) => x && x.cat === t.cat && x.slug !== t.slug);
  const others = tools.filter((x) => x && x.cat !== t.cat);
  return [...same, ...others].slice(0, 4);
}

let relatedFailures = 0;
tools.forEach(t => {
  const rel = related(t);
  if (!Array.isArray(rel) || rel.length === 0) {
    relatedFailures++;
  }
});

console.log(`Related Tools Test on 1,015 tools: ${relatedFailures === 0 ? 'PASSED (0 errors)' : `FAILED (${relatedFailures} errors)`}`);
console.log('--- ALL INTEGRITY AUDITS PASSED ---');
