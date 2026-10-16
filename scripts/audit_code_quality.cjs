/**
 * scripts/audit_code_quality.cjs
 * Comprehensive Code Quality, Architecture & Security Auditor for Vimz.ai
 * Read-only analysis across Frontend (React/Vite) and Backend (Laravel/Sanctum).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const API = path.join(ROOT, 'api');

console.log('=== VIMZ.AI COMPLETE CODE QUALITY AUDIT ===\n');

// Utility: Recursively list all files in directory
function getAllFiles(dir, extensions = ['.js', '.jsx', '.php', '.css', '.json']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === 'vendor' || file === 'dist' || file === '.git' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

// 1. Files Inventory
const frontendFiles = getAllFiles(SRC);
const backendFiles = getAllFiles(API);

console.log(`Discovered ${frontendFiles.length} frontend source files in src/`);
console.log(`Discovered ${backendFiles.length} backend source files in api/\n`);

// 2. Component Size & Complexity Analysis
console.log('--- 1. Component Size & Complexity Analysis ---');
const largeComponents = [];
let totalFrontendLines = 0;
const toolFiles = frontendFiles.filter(f => f.includes(path.join('src', 'tools')));

for (const f of frontendFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').length;
  totalFrontendLines += lines;
  if (lines > 200) {
    largeComponents.push({ file: path.relative(ROOT, f).replace(/\\/g, '/'), lines });
  }
}

largeComponents.sort((a, b) => b.lines - a.lines);
console.log(`Total Frontend Lines of Code: ${totalFrontendLines.toLocaleString()}`);
console.log(`Tools Directory Files: ${toolFiles.length}`);
console.log(`Components over 200 lines: ${largeComponents.length}`);
console.log('Top 10 Largest Files in Frontend:');
largeComponents.slice(0, 10).forEach(c => console.log(`  - ${c.file}: ${c.lines} lines`));

// 3. Duplicate Code & Repeated Logic
console.log('\n--- 2. Duplicate Code & Repetition Patterns ---');
let duplicateFormatters = 0;
let inlineStyleCount = 0;
let calcFunctionCount = 0;
let resetFunctionCount = 0;
let copyBtnCount = 0;

for (const f of toolFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (/const\s+calc\s*=\s*\(\)|function\s+calc\s*\(\)|const\s+calculate\s*=\s*\(\)/i.test(content)) calcFunctionCount++;
  if (/const\s+reset\s*=\s*\(\)|function\s+reset\s*\(\)/i.test(content)) resetFunctionCount++;
  if (/style=\{\{/i.test(content)) inlineStyleCount += (content.match(/style=\{\{/g) || []).length;
  if (/<CopyBtn/i.test(content)) copyBtnCount++;
  if (/toLocaleString\(|\.toFixed\(2\)/i.test(content)) duplicateFormatters++;
}

console.log(`Tools with local calc/calculate function: ${calcFunctionCount} / ${toolFiles.length}`);
console.log(`Tools with local reset function: ${resetFunctionCount} / ${toolFiles.length}`);
console.log(`Total inline style occurrences in tools: ${inlineStyleCount}`);
console.log(`Tools using shared <CopyBtn>: ${copyBtnCount} / ${toolFiles.length}`);
console.log(`Tools with ad-hoc number/currency formatting: ${duplicateFormatters} / ${toolFiles.length}`);

// 4. Dead Code & Unused Dependencies
console.log('\n--- 3. Dependency & Dead Code Audit ---');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const declaredDeps = Object.keys(pkg.dependencies || {});
const depUsage = {};
declaredDeps.forEach(d => depUsage[d] = 0);

for (const f of frontendFiles) {
  const content = fs.readFileSync(f, 'utf8');
  declaredDeps.forEach(d => {
    if (content.includes(`'${d}'`) || content.includes(`"${d}"`) || content.includes(`from '${d}`) || content.includes(`from "${d}`)) {
      depUsage[d]++;
    }
  });
}

console.log('npm dependencies usage count across frontend files:');
Object.entries(depUsage).forEach(([dep, count]) => {
  console.log(`  - ${dep}: used in ${count} files ${count === 0 ? '[UNUSED!]' : ''}`);
});

// Check orphan files in src/components, src/utils, src/api
const nonToolFiles = frontendFiles.filter(f => !f.includes(path.join('src', 'tools')));
const registryContent = fs.readFileSync(path.join(SRC, 'data', 'registry.js'), 'utf8');
const appContent = fs.readFileSync(path.join(SRC, 'App.jsx'), 'utf8');

// 5. Security Inspection
console.log('\n--- 4. Security Inspection (Frontend & Backend) ---');
const securityFindings = [];

// Frontend Security
for (const f of frontendFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (/dangerouslySetInnerHTML/i.test(content)) {
    securityFindings.push({ type: 'dangerouslySetInnerHTML', file: rel, severity: 'HIGH' });
  }
  if (/eval\(|window\.eval/i.test(content)) {
    securityFindings.push({ type: 'eval usage', file: rel, severity: 'CRITICAL' });
  }
  if (/localStorage\.getItem\(['"]token['"]\)|localStorage\.getItem\(['"]auth['"]\)/i.test(content)) {
    securityFindings.push({ type: 'Token in localStorage (XSS risk)', file: rel, severity: 'MEDIUM' });
  }
}

// Backend Security
for (const f of backendFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (/DB::raw\(\s*['"].*\$.*['"]\)/i.test(content)) {
    securityFindings.push({ type: 'Potential SQL Injection in DB::raw', file: rel, severity: 'CRITICAL' });
  }
  if (/\$guarded\s*=\s*\[\s*\]/i.test(content)) {
    securityFindings.push({ type: 'Mass Assignment: $guarded = []', file: rel, severity: 'HIGH' });
  }
}

console.log(`Identified ${securityFindings.length} potential security occurrences:`);
securityFindings.forEach(s => console.log(`  [${s.severity}] ${s.type} in ${s.file}`));

// 6. Error Handling & State Resilience
console.log('\n--- 5. Error Handling & Resilience Patterns ---');
let toolsWithTryCatch = 0;
let toolsWithLoading = 0;
let toolsWithValidation = 0;
let toolsWithAlert = 0;

for (const f of toolFiles) {
  const content = fs.readFileSync(f, 'utf8');
  if (/try\s*{[\s\S]*catch/i.test(content)) toolsWithTryCatch++;
  if (/loading|setLoading|isSubmitting/i.test(content)) toolsWithLoading++;
  if (/setErr|setError|error\s*&&/i.test(content)) toolsWithValidation++;
  if (/alert\(/i.test(content)) toolsWithAlert++;
}

console.log(`Tools with try/catch blocks: ${toolsWithTryCatch} / ${toolFiles.length} (${((toolsWithTryCatch/toolFiles.length)*100).toFixed(1)}%)`);
console.log(`Tools with explicit loading state: ${toolsWithLoading} / ${toolFiles.length} (${((toolsWithLoading/toolFiles.length)*100).toFixed(1)}%)`);
console.log(`Tools with dedicated error state (setErr): ${toolsWithValidation} / ${toolFiles.length} (${((toolsWithValidation/toolFiles.length)*100).toFixed(1)}%)`);
console.log(`Tools using native window.alert(): ${toolsWithAlert} / ${toolFiles.length} (${((toolsWithAlert/toolFiles.length)*100).toFixed(1)}%)`);

// 7. Testing Infrastructure Analysis
console.log('\n--- 6. Testing Infrastructure Audit ---');
const testFiles = frontendFiles.concat(backendFiles).filter(f => f.includes('test') || f.includes('spec'));
console.log(`Total test files in repository: ${testFiles.length}`);
testFiles.forEach(t => console.log(`  - ${path.relative(ROOT, t).replace(/\\/g, '/')}`));

const scriptTests = fs.readdirSync(path.join(ROOT, 'scripts')).filter(s => s.startsWith('test_') || s.startsWith('verify_'));
console.log(`Verification/Test scripts in scripts/: ${scriptTests.length}`);

// Write summary JSON for report generation
const qualityAuditSummary = {
  timestamp: new Date().toISOString(),
  frontend: {
    totalFiles: frontendFiles.length,
    toolFiles: toolFiles.length,
    totalLines: totalFrontendLines,
    largeComponentsCount: largeComponents.length,
    topLargeComponents: largeComponents.slice(0, 15),
    inlineStylesCount: inlineStyleCount,
    toolsWithCalc: calcFunctionCount,
    toolsWithReset: resetFunctionCount,
    toolsWithTryCatch,
    toolsWithLoading,
    toolsWithValidation,
    toolsWithAlert
  },
  dependencies: {
    declared: declaredDeps,
    usage: depUsage
  },
  security: securityFindings,
  testing: {
    repoTestFiles: testFiles.map(f => path.relative(ROOT, f).replace(/\\/g, '/')),
    scriptTests
  }
};

const outPath = path.join(ROOT, 'reports', 'vimz-ai-freemium-audit', 'code_quality_telemetry.json');
fs.writeFileSync(outPath, JSON.stringify(qualityAuditSummary, null, 2), 'utf8');
console.log(`\nSaved telemetry to ${outPath}`);
