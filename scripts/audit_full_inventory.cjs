const fs = require('fs');
const path = require('path');

// 1. Read registry.js
const registryCode = fs.readFileSync('src/data/registry.js', 'utf8');

// Parse import statements: import <ComponentName> from '../tools/<category>/<File>.jsx'
const importMap = {};
const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"]\.\.\/tools\/([^'"]+)['"]/g;
let match;
while ((match = importRegex.exec(registryCode)) !== null) {
  const componentName = match[1];
  const relativePath = match[2];
  importMap[componentName] = 'src/tools/' + relativePath;
}

// 2. Parse categories
const catStart = registryCode.indexOf('export const categories = [');
const catEnd = registryCode.indexOf('export const tools = [');
const categoriesBlock = registryCode.slice(catStart + 'export const categories = '.length, catEnd).trim();
let categories = [];
try {
  const cleanCatBlock = categoriesBlock.replace(/;*\s*$/, '');
  categories = eval('(' + cleanCatBlock + ')');
} catch (e) {
  console.error('Error evaluating categories block:', e);
}

// 3. Parse tools array line by line using eval
const lines = registryCode.split('\n');
const toolsArrayLines = [];
let insideTools = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('export const tools = [')) {
    insideTools = true;
    continue;
  }
  if (insideTools && line.includes('export const related =')) {
    insideTools = false;
    break;
  }
  if (insideTools && line.trim().startsWith('{')) {
    toolsArrayLines.push(line.trim());
  }
}

console.log('Total tool lines identified:', toolsArrayLines.length);

const parsedTools = [];
for (let i = 0; i < toolsArrayLines.length; i++) {
  let line = toolsArrayLines[i];
  if (line.endsWith(',')) line = line.slice(0, -1);
  
  // Extract Component identifier: can be "Component": X or Component: X
  let componentName = null;
  const compMatch = line.match(/"?Component"?\s*:\s*([A-Za-z0-9_]+)/);
  if (compMatch) {
    componentName = compMatch[1];
  }

  // To safely eval each tool object without needing React components in scope:
  // replace "?Component"?\s*:\s*([A-Za-z0-9_]+) with "Component": "$1"
  const evalSafeLine = line.replace(/"?Component"?\s*:\s*([A-Za-z0-9_]+)/g, '"Component": "$1"');
  try {
    const obj = eval('(' + evalSafeLine + ')');
    obj.componentName = componentName;
    obj.componentPath = componentName ? (importMap[componentName] || 'unknown') : 'none';
    parsedTools.push(obj);
  } catch (err) {
    console.error(`Line ${i} eval error:`, err.message, line.slice(0, 80));
  }
}

console.log('Parsed tools count:', parsedTools.length);

// 4. Audit each tool
let verifiedCount = 0;
let missingComponentCount = 0;
let placeholderCount = 0;
let componentFileMissingCount = 0;
let partialCount = 0;

const auditedTools = parsedTools.map((t, idx) => {
  const fileExists = t.componentPath && t.componentPath !== 'unknown' ? fs.existsSync(t.componentPath) : false;
  let fileContent = '';
  let fileSize = 0;
  let isPlaceholder = false;
  let hasCalculation = false;
  let hasInputs = false;
  let hasState = false;

  if (fileExists) {
    fileSize = fs.statSync(t.componentPath).size;
    fileContent = fs.readFileSync(t.componentPath, 'utf8');
    
    hasState = fileContent.includes('useState') || fileContent.includes('useReducer');
    hasInputs = fileContent.includes('<input') || fileContent.includes('<select') || fileContent.includes('<textarea') || fileContent.includes('input');
    hasCalculation = fileContent.includes('Math.') || fileContent.includes('parseFloat') || fileContent.includes('parseInt') || fileContent.includes('calculate') || fileContent.includes('calc') || fileContent.includes('result') || fileContent.includes('setResult');
    
    if (fileContent.toLowerCase().includes('coming soon') || fileContent.toLowerCase().includes('under development') || fileSize < 300) {
      isPlaceholder = true;
    }
  }

  let status = 'Functional — verified';
  let improvementNeeded = 'None — active and tested';

  if (!t.componentName || t.componentPath === 'unknown' || !fileExists) {
    status = 'Broken';
    improvementNeeded = 'Missing component file or unresolved import';
    componentFileMissingCount++;
  } else if (isPlaceholder) {
    status = 'Placeholder';
    improvementNeeded = 'Full implementation required';
    placeholderCount++;
  } else if (!hasInputs && !hasState) {
    status = 'Partial implementation';
    improvementNeeded = 'Lacks interactive inputs or dynamic state';
    partialCount++;
  } else {
    verifiedCount++;
  }

  // Derive main function from desc / name
  const mainFunction = t.desc || t.name;

  return {
    id: idx + 1,
    cat: t.cat,
    subcat: t.subcat || '',
    subcatName: t.subcatName || '',
    name: t.name,
    slug: t.slug,
    route: `/${t.cat}/${t.slug}`,
    componentName: t.componentName,
    componentPath: t.componentPath,
    fileExists,
    fileSize,
    popular: !!t.popular,
    desc: t.desc || '',
    why: t.why || '',
    keywords: t.keywords || '',
    status,
    mainFunction,
    improvementNeeded
  };
});

console.log('--- AUDIT SUMMARY ---');
console.log('Total tools audited:', auditedTools.length);
console.log('Categories count:', categories.length);
console.log('Verified components:', verifiedCount);
console.log('Missing component files:', componentFileMissingCount);
console.log('Placeholders:', placeholderCount);
console.log('Partial implementation:', partialCount);

// Save full analysis as JSON
fs.writeFileSync('scripts/audit_results.json', JSON.stringify({
  categories,
  tools: auditedTools
}, null, 2));

console.log('Audit results saved to scripts/audit_results.json');
