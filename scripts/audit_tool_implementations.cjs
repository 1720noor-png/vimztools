const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', 'src', 'data', 'registry.js');
const registryCode = fs.readFileSync(registryPath, 'utf8');

// Parse import statements: import Name from '../tools/...'
const importMap = {};
const lines = registryCode.split('\n');
for (const line of lines) {
  const m = line.match(/^import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"]/);
  if (m) {
    importMap[m[1]] = m[2];
  }
}

console.log('Total component imports mapped:', Object.keys(importMap).length);

// Parse tools array
const toolsStartIndex = registryCode.indexOf('export const tools = [');
const toolsCode = registryCode.slice(toolsStartIndex);
const toolLines = toolsCode.split('\n').filter(l => l.trim().startsWith('{') && l.includes('"slug":'));

console.log('Total tool definitions:', toolLines.length);

const toolAudit = [];
const missingFiles = [];
const placeholderPatterns = [
  /coming soon/i,
  /under construction/i,
  /placeholder/i,
  /todo/i,
  /not implemented/i
];

let genuineImplementations = 0;
let suspiciousOrPlaceholders = 0;
let fileMissingCount = 0;

for (let i = 0; i < toolLines.length; i++) {
  const l = toolLines[i];
  const slugM = l.match(/"slug":\s*"([^"]+)"/);
  const nameM = l.match(/"name":\s*"([^"]+)"/);
  const catM = l.match(/"cat":\s*"([^"]+)"/);
  const compM = l.match(/["']?Component["']?:\s*([a-zA-Z0-9_]+)/);
  const descM = l.match(/"desc":\s*"([^"]*)"/);

  if (!slugM || !compM) continue;

  const slug = slugM[1];
  const name = nameM ? nameM[1] : slug;
  const cat = catM ? catM[1] : 'unknown';
  const compName = compM[1];
  const desc = descM ? descM[1] : '';

  const relPath = importMap[compName];
  if (!relPath) {
    missingFiles.push({ slug, compName, reason: 'No import statement in registry.js' });
    fileMissingCount++;
    continue;
  }

  // Resolve file path relative to src/data/
  const absPath = path.resolve(path.join(__dirname, '..', 'src', 'data', relPath));
  if (!fs.existsSync(absPath)) {
    missingFiles.push({ slug, compName, relPath, absPath, reason: 'File does not exist on disk' });
    fileMissingCount++;
    continue;
  }

  const code = fs.readFileSync(absPath, 'utf8');

  // Check file size, inputs, calculations, buttons, exports
  const fileBytes = Buffer.byteLength(code, 'utf8');
  const lineCount = code.split('\n').length;

  // Analysis of implementation signals
  const hasInputs = /<input|<textarea|<select|<button/i.test(code);
  const hasCalculation = /Math\.|parseInt|parseFloat|\+|-|\*|\/|toFixed|reduce|map|filter/i.test(code);
  const hasState = /useState|useReducer|useRef/i.test(code);
  const hasResultRendering = /className=['"](out|result|card|panel|alert|score|output)['"]/i.test(code) || /<strong>|<pre>|<code>/i.test(code);
  const hasDownloadOrExport = /download|export|blob|csv|json|pdf/i.test(code);

  // Check for placeholder or mock text
  let isPlaceholder = false;
  if (lineCount < 20 && !hasInputs) {
    isPlaceholder = true;
  }
  for (const pattern of placeholderPatterns) {
    if (pattern.test(code) && lineCount < 30) {
      isPlaceholder = true;
      break;
    }
  }

  if (isPlaceholder) {
    suspiciousOrPlaceholders++;
  } else {
    genuineImplementations++;
  }

  toolAudit.push({
    index: i + 1,
    slug,
    name,
    cat,
    compName,
    relPath,
    fileBytes,
    lineCount,
    hasInputs,
    hasCalculation,
    hasState,
    hasResultRendering,
    hasDownloadOrExport,
    isPlaceholder
  });
}

console.log('Audit summary:');
console.log(`- Tools audited: ${toolAudit.length}`);
console.log(`- Missing files on disk: ${fileMissingCount}`);
console.log(`- Genuine functional implementations: ${genuineImplementations}`);
console.log(`- Placeholders or suspicious tools: ${suspiciousOrPlaceholders}`);

// Print category breakdown of line counts & functional components
const catStats = {};
for (const t of toolAudit) {
  if (!catStats[t.cat]) {
    catStats[t.cat] = { total: 0, linesSum: 0, withInputs: 0, withCalc: 0 };
  }
  catStats[t.cat].total++;
  catStats[t.cat].linesSum += t.lineCount;
  if (t.hasInputs) catStats[t.cat].withInputs++;
  if (t.hasCalculation) catStats[t.cat].withCalc++;
}

console.log('\nCategory Implementation Health:');
Object.entries(catStats).sort((a,b) => b[1].total - a[1].total).slice(0, 15).forEach(([cat, s]) => {
  console.log(`- ${cat.padEnd(28)}: ${s.total.toString().padStart(4)} tools | Avg lines: ${Math.round(s.linesSum / s.total)} | Inputs: ${s.withInputs}/${s.total} | Calc: ${s.withCalc}/${s.total}`);
});

fs.writeFileSync(path.join(__dirname, '..', 'reports', 'vimz-ai-freemium-audit', 'tool_implementation_inventory.json'), JSON.stringify(toolAudit, null, 2));
console.log('\nSaved full inventory to reports/vimz-ai-freemium-audit/tool_implementation_inventory.json');
