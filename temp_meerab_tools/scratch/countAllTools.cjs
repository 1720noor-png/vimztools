const fs = require('fs');
const path = require('path');

function countInFile(filePath, regex) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

console.log('--- AUDITING ALL TOOL COUNTS ---');

// Office
const officeFiles = fs.readdirSync('src/pages/office/specs').filter(f => f.endsWith('.ts'));
let officeCount = 0;
for (const f of officeFiles) {
  officeCount += countInFile(path.join('src/pages/office/specs', f), /id:\s*['"][^'"]+['"]/g);
}
console.log('Office Specs (12 modules):', officeCount);

// Marketing / SEO
const mktFiles = fs.readdirSync('src/pages/marketing/specs').filter(f => f.endsWith('.ts') && f !== 'index.ts');
let mktCount = 0;
for (const f of mktFiles) {
  mktCount += countInFile(path.join('src/pages/marketing/specs', f), /id:\s*['"][^'"]+['"]/g);
}
console.log('Marketing & SEO Specs (18 modules):', mktCount);

// Students & Academics
const stuFiles = fs.readdirSync('src/pages/students/specs').filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'studentSpec.ts');
let stuCount = 0;
for (const f of stuFiles) {
  stuCount += countInFile(path.join('src/pages/students/specs', f), /id:\s*['"][^'"]+['"]/g);
}
console.log('Students & Academics Specs (20 modules):', stuCount);

// Image Tools
const imgFiles = fs.readdirSync('src/pages/image-tools/specs').filter(f => f.endsWith('.ts') && f !== 'index.ts');
let imgCount = 0;
for (const f of imgFiles) {
  imgCount += countInFile(path.join('src/pages/image-tools/specs', f), /id:\s*['"][^'"]+['"]/g);
}
console.log('Image Tools Specs (20 modules):', imgCount);

// Health configs
const hlthFiles = fs.readdirSync('src/pages/tools/health/registry').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
let hlthCount = 0;
for (const f of hlthFiles) {
  hlthCount += countInFile(path.join('src/pages/tools/health/registry', f), /id:\s*['"][^'"]+['"]/g);
}
console.log('Health Config-driven Tools:', hlthCount);

// PDF
const pdfCount = countInFile('src/pages/pdf/pdfConfig.ts', /id:\s*['"][^'"]+['"]/g);
console.log('PDF Tools:', pdfCount);

// Document / Word
const docCount = countInFile('src/pages/document-word/documentWordConfig.ts', /id:\s*['"][^'"]+['"]/g);
console.log('Document / Word Tools:', docCount);

// Catalog.ts literal items
const cat = fs.readFileSync('src/lib/catalog.ts', 'utf8');
const literalMatches = cat.match(/id:\s*['"][a-z0-9-]+['"]/g) || [];
console.log('Catalog.ts literal items:', literalMatches.length);

const total = officeCount + mktCount + stuCount + imgCount + hlthCount + pdfCount + docCount + literalMatches.length;
console.log('TOTAL ESTIMATED TOOLS IN CATALOG:', total);
