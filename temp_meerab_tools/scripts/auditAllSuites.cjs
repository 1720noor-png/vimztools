const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function countSpecs(relDir) {
  const dir = path.join(root, relDir);
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.ts') && f.startsWith('mod')) {
      const c = fs.readFileSync(path.join(dir, f), 'utf8');
      const m = c.match(/id:\s*['"]([a-z0-9-]+)['"]/g);
      if (m) count += m.length;
    }
  }
  return count;
}

function countIdsInFile(relFile) {
  const file = path.join(root, relFile);
  if (!fs.existsSync(file)) return 0;
  const c = fs.readFileSync(file, 'utf8');
  const m = c.match(/id:\s*['"]([a-z0-9-]+)['"]/g);
  return m ? m.length : 0;
}

const breakdown = {
  'Base catalog.ts literal tools': countIdsInFile('src/lib/catalog.ts'),
  'Office Corporate (30 modules)': countSpecs('src/pages/office/specs'),
  'Marketers SEO (18 modules)': countSpecs('src/pages/marketing/specs'),
  'Students Academics (20 modules)': countSpecs('src/pages/students/specs'),
  'Image Tools (20 modules)': countSpecs('src/pages/image-tools/specs'),
  'MS Word Suite (documentWordConfig)': countIdsInFile('src/pages/document-word/documentWordConfig.ts'),
  'AI Machine Learning (20 modules)': countSpecs('src/pages/ai-tools/specs'),
  'Developer Cloud (20 modules)': countSpecs('src/pages/dev-cloud/specs'),
  'Cybersecurity Privacy (20 modules)': countSpecs('src/pages/cyber-security/specs'),
  'Sustainable Green Energy (20 modules)': countSpecs('src/pages/green-energy/specs'),
  'Fintech Venture (20 modules)': countSpecs('src/pages/fintech-venture/specs'),
  'Civic Lifestyle Everyday (20 modules)': countSpecs('src/pages/civic-lifestyle/specs'),
  'Health Config Curated': countIdsInFile('src/pages/health/healthConfig.ts'),
  'Household Tools Config': countIdsInFile('src/pages/household/householdConfig.ts'),
  'PDF Tools Config': countIdsInFile('src/pages/pdf/pdfConfig.ts'),
};

console.table(breakdown);
const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
console.log('Estimated Total Registered Tools Across App:', total);
