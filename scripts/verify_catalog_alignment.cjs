const fs = require('fs');
const path = require('path');

const catFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monetizationCatalog.js'), 'utf8');
const regFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'registry.js'), 'utf8');

// Parse ADVANCED_TOOL_SLUGS
const startIdx = catFile.indexOf('export const ADVANCED_TOOL_SLUGS = new Set([');
const endIdx = catFile.indexOf(']);', startIdx);
const setContent = catFile.slice(startIdx, endIdx);

const advancedSlugs = [];
const lines = setContent.split('\n');
lines.forEach(l => {
  const m = l.match(/"([^"]+)"/);
  if (m) advancedSlugs.push(m[1]);
});

console.log('ADVANCED_TOOL_SLUGS in Set:', advancedSlugs.length);
const uniqueAdv = new Set(advancedSlugs);
console.log('Unique Advanced Slugs:', uniqueAdv.size);

// Parse registry slugs
const regSlugs = [];
const rLines = regFile.slice(regFile.indexOf('export const tools = [')).split('\n');
rLines.forEach(l => {
  const m = l.match(/"slug":\s*"([^"]+)"/);
  if (m) regSlugs.push(m[1]);
});

console.log('Total tools in registry.js:', regSlugs.length);
const uniqueReg = new Set(regSlugs);
console.log('Unique slugs in registry.js:', uniqueReg.size);

let missingInReg = 0;
uniqueAdv.forEach(s => {
  if (!uniqueReg.has(s)) missingInReg++;
});
console.log('Advanced slugs missing from registry.js:', missingInReg);

const freeBasicCount = uniqueReg.size - uniqueAdv.size;
console.log(`Basic Free Tools: ${freeBasicCount}`);
console.log(`Advanced Pro Tools: ${uniqueAdv.size}`);
console.log(`Exact Total: ${freeBasicCount + uniqueAdv.size}`);
