const fs = require('fs');
const path = require('path');

const invPath = path.join(__dirname, '..', 'reports', 'vimz-ai-freemium-audit', 'tool_implementation_inventory.json');
const data = JSON.parse(fs.readFileSync(invPath, 'utf8'));

console.log('Total tools in inventory:', data.length);
const sample = data.slice(0, 3);
console.log('Sample entry:', JSON.stringify(sample, null, 2));

// Summary statistics
let hasState = 0;
let hasInputs = 0;
let hasCalculations = 0;
let hasExport = 0;
let zeroSize = 0;

for (const t of data) {
  if (t.fileSize === 0) zeroSize++;
  if (t.hasState) hasState++;
  if (t.inputs && t.inputs.length > 0) hasInputs++;
  if (t.hasCalculations) hasCalculations++;
  if (t.hasExport) hasExport++;
}

console.log('Zero size:', zeroSize);
console.log('Has state hooks:', hasState);
console.log('Has inputs identified:', hasInputs);
console.log('Has calculations identified:', hasCalculations);
console.log('Has export logic:', hasExport);
