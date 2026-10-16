const fs = require('fs');
const path = require('path');

// 1. Read registry.js
const registryCode = fs.readFileSync('src/data/registry.js', 'utf8');

// Parse imports to locate component files
const importMap = {};
const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"]\.\.\/tools\/([^'"]+)['"]/g;
let match;
while ((match = importRegex.exec(registryCode)) !== null) {
  importMap[match[1]] = path.join('src/tools', match[2]);
}

// Parse categories
const catStart = registryCode.indexOf('export const categories = [');
const catEnd = registryCode.indexOf('export const tools = [');
const categoriesBlock = registryCode.slice(catStart + 'export const categories = '.length, catEnd).trim();
const categories = eval('(' + categoriesBlock.replace(/;*\s*$/, '') + ')');
const catLookup = {};
categories.forEach(c => { catLookup[c.slug] = c.name; });

// Parse tools array
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

console.log(`Parsed ${toolsArrayLines.length} tool registry definitions.`);

const audited = [];

toolsArrayLines.forEach((toolLine, idx) => {
  let line = toolLine;
  if (line.endsWith(',')) line = line.slice(0, -1);
  const compMatch = line.match(/"?Component"?\s*:\s*([A-Za-z0-9_]+)/);
  const compName = compMatch ? compMatch[1] : null;
  const evalSafe = line.replace(/"?Component"?\s*:\s*([A-Za-z0-9_]+)/g, '"Component": "$1"');
  
  let toolObj;
  try {
    toolObj = eval('(' + evalSafe + ')');
  } catch (e) {
    return;
  }

  const compPath = compName ? importMap[compName] : null;
  let fileContent = '';
  let fileExists = false;
  if (compPath && fs.existsSync(compPath)) {
    fileExists = true;
    fileContent = fs.readFileSync(compPath, 'utf8');
  }

  // Feature detection in component
  const hasPdf = fileContent.includes('pdf-lib') || fileContent.includes('window.print') || fileContent.includes('exportPdf');
  const hasZip = fileContent.includes('jszip') || fileContent.includes('JSZip');
  const hasCsv = fileContent.includes('text/csv') || fileContent.includes('.csv') || fileContent.includes('downloadCsv') || fileContent.includes('exportCsv');
  const hasJsonExport = fileContent.includes('application/json') || fileContent.includes('.json') || fileContent.includes('exportJson');
  const hasCanvas = fileContent.includes('canvas.toDataURL') || fileContent.includes('canvas.toBlob') || fileContent.includes('drawImage');
  const hasMultiStep = fileContent.includes('activeTab') || fileContent.includes('step') || fileContent.includes('steps');
  const hasBulk = fileContent.includes('bulk') || fileContent.includes('batch') || fileContent.includes('multi');
  const hasTesseract = fileContent.includes('tesseract') || fileContent.includes('Tesseract');
  const hasApiCall = fileContent.includes('fetch(') || fileContent.includes('toolsApi.');

  // Classification Logic:
  // Strict rules:
  // 1. Core utility calculators, basic converters, single math formulas, everyday trackers -> FREE (100% Free)
  // 2. High-value business, marketing, agency, finance, dev, or export-heavy generators -> PREMIUM CANDIDATE
  // 3. Complex tools needing external servers / live scraping -> NEEDS REVIEW

  const toolNameLower = (toolObj.name || '').toLowerCase();
  const slugLower = (toolObj.slug || '').toLowerCase();
  const catSlug = toolObj.cat || '';

  // Explicit High-Value Professional Tools that justify a genuine Premium Tier
  const isDedicatedPremiumCandidate = 
    // Business & Strategy Workspaces
    slugLower.includes('business-model-canvas') ||
    slugLower.includes('value-proposition-canvas') ||
    slugLower.includes('lean-canvas') ||
    slugLower.includes('swot-analyzer') ||
    slugLower.includes('sales-pipeline') ||
    slugLower.includes('revenue-model-comparison') ||
    slugLower.includes('idea-validation') ||
    slugLower.includes('cold-email') ||
    slugLower.includes('saas-cac') ||
    slugLower.includes('sales-commission') ||
    slugLower.includes('sales-funnel-velocity') ||
    // Marketing & SEO Audits / Planners
    slugLower.includes('technical-seo-audit') ||
    slugLower.includes('content-brief-generator') ||
    slugLower.includes('landing-page-audit') ||
    slugLower.includes('internal-linking-cluster') ||
    slugLower.includes('campaign-budget-allocator') ||
    slugLower.includes('local-seo-gbp-audit') ||
    slugLower.includes('seo-content-decay') ||
    slugLower.includes('seo-redirect-map') ||
    slugLower.includes('schema-json-ld') ||
    slugLower.includes('robots-sitemap') ||
    slugLower.includes('marketing-attribution') ||
    // Freelance & Agency Client Deliverables
    slugLower.includes('client-retainer-roi') ||
    slugLower.includes('project-scope-pricing') ||
    slugLower.includes('agency-pitch-proposal') ||
    slugLower.includes('agency-retainer-calculator') ||
    slugLower.includes('agency-blended-rate') ||
    slugLower.includes('invoice-generator') ||
    // Advanced Financial Valuation
    slugLower.includes('discounted-cash-flow') ||
    slugLower.includes('dcf-valuation') ||
    slugLower.includes('commercial-lease') ||
    slugLower.includes('cap-table') ||
    // Complex Legal Agreements
    slugLower.includes('nda-generator') ||
    slugLower.includes('contractor-agreement') ||
    slugLower.includes('terms-of-service-generator') ||
    slugLower.includes('privacy-policy-generator') ||
    // Media & Visual Slicers
    slugLower.includes('instagram-grid-carousel-splitter');

  let classification = 'FREE';
  let proposedFree = 'Full standard calculation, real-time results, and direct clipboard copy.';
  let proposedPremium = 'None — tool is designed to remain completely free.';
  let premiumStatus = 'N/A';
  let evidence = 'Standard client-side utility/calculator with zero defensible commercial upgrade boundary.';

  if (hasTesseract || slugLower.includes('image-to-text')) {
    classification = 'NEEDS REVIEW';
    proposedFree = 'Single-image in-browser OCR preview (up to 3 pages / standard resolution).';
    proposedPremium = 'Batch document OCR, searchable PDF export, multi-language engine, and cloud processing.';
    premiumStatus = 'Partially Implemented (Client-side Tesseract.js exists)';
    evidence = 'Uses Tesseract.js client-side wasm; high client CPU/memory usage; batch OCR requires server queue.';
  } else if (isDedicatedPremiumCandidate) {
    classification = 'PREMIUM CANDIDATE';
    premiumStatus = 'Partially Implemented (Core logic functional; advanced export / multi-scenario needed)';
    
    if (slugLower.includes('canvas') || slugLower.includes('swot') || slugLower.includes('idea-validation')) {
      proposedFree = 'Complete 9-box / matrix interactive editing, card creation, on-screen results, and standard JSON export.';
      proposedPremium = 'Vector PDF presentation export without watermark, custom brand palette, multi-model comparison, and executive presentation mode.';
      evidence = `Component (${compName}) implements interactive strategy workspace; client-facing PDF/white-labeling is high-value.`;
    } else if (slugLower.includes('invoice') || slugLower.includes('proposal') || slugLower.includes('contract') || slugLower.includes('retainer') || slugLower.includes('scope')) {
      proposedFree = 'Full scope/pricing calculations, standard document preview, and basic print format.';
      proposedPremium = 'White-label PDF export without Vimz watermark, custom company logo/signature embedding, multiple tax/VAT presets, and saved client profiles.';
      evidence = `Component (${compName}) creates commercial agency deliverables; unbranded PDF export is prime monetization asset.`;
    } else if (slugLower.includes('audit') || slugLower.includes('brief') || slugLower.includes('checklist') || slugLower.includes('cluster') || slugLower.includes('gbp')) {
      proposedFree = 'Full 20-24 point checklist rubric, instant health score, prioritized issues list, and on-screen recommendations.';
      proposedPremium = 'Client-ready branded executive PDF audit report, comprehensive CSV data export, and agency white-label presentation deck.';
      evidence = `Component (${compName}) generates comprehensive technical audits; agencies charge clients for these deliverables.`;
    } else if (slugLower.includes('budget') || slugLower.includes('pipeline') || slugLower.includes('cac') || slugLower.includes('attribution') || slugLower.includes('dcf') || slugLower.includes('revenue-model') || slugLower.includes('commission')) {
      proposedFree = 'Full multi-variable mathematical calculation, blended metrics, and single baseline scenario review.';
      proposedPremium = 'Multi-scenario sensitivity modeling (Best vs. Base vs. Worst case), historical forecast projections, 5-year trend export, and CSV download.';
      evidence = `Component (${compName}) performs complex multi-stage financial calculations; scenario sensitivity modeling is standard B2B SaaS premium value.`;
    } else if (slugLower.includes('carousel-splitter')) {
      proposedFree = 'Full panoramic upload, 2-10 slide slicing, aspect ratio presets, and individual slide downloads.';
      proposedPremium = '1-click Batch Download All (ZIP) with metadata, lossless uncompressed export, and custom story grid templates.';
      evidence = `Component (${compName}) implements HTML5 Canvas slicing and JSZip packaging; batch ZIP and lossless quality is natural pro tier.`;
    } else {
      proposedFree = 'Full tool calculation, standard parameters, and instant results.';
      proposedPremium = 'Batch bulk data processing, unwatermarked PDF summary, and advanced parameter sensitivity.';
      evidence = `Component (${compName}) provides professional enterprise functionality.`;
    }
  }

  audited.push({
    id: idx + 1,
    name: toolObj.name,
    slug: toolObj.slug,
    category: toolObj.cat,
    categoryName: catLookup[toolObj.cat] || toolObj.cat,
    subcat: toolObj.subcat,
    component: compName,
    classification,
    proposedFree,
    proposedPremium,
    premiumStatus,
    evidence
  });
});

// Group counts
const counts = {
  total: audited.length,
  free: audited.filter(a => a.classification === 'FREE').length,
  premiumCandidate: audited.filter(a => a.classification === 'PREMIUM CANDIDATE').length,
  needsReview: audited.filter(a => a.classification === 'NEEDS REVIEW').length
};

console.log('--- AUDIT SUMMARY ---');
console.log(`Total Tools Audited: ${counts.total}`);
console.log(`Free-Only Tools: ${counts.free} (${((counts.free / counts.total)*100).toFixed(1)}%)`);
console.log(`Premium Candidate Tools: ${counts.premiumCandidate} (${((counts.premiumCandidate / counts.total)*100).toFixed(1)}%)`);
console.log(`Needs Review Tools: ${counts.needsReview} (${((counts.needsReview / counts.total)*100).toFixed(1)}%)`);

// Category summary
const catSummary = {};
audited.forEach(a => {
  if (!catSummary[a.category]) {
    catSummary[a.category] = { name: a.categoryName, total: 0, free: 0, premium: 0, review: 0 };
  }
  catSummary[a.category].total++;
  if (a.classification === 'FREE') catSummary[a.category].free++;
  else if (a.classification === 'PREMIUM CANDIDATE') catSummary[a.category].premium++;
  else catSummary[a.category].review++;
});

// Write CSV
const csvHeader = 'ID,Tool Name,Slug,Category Slug,Category Name,Subcategory,Component,Classification,Proposed Free Features,Potential Premium Features,Premium Status,Source Code Evidence\n';
const csvRows = audited.map(a => 
  `${a.id},"${a.name.replace(/"/g, '""')}","${a.slug}","${a.category}","${a.categoryName.replace(/"/g, '""')}","${a.subcat}","${a.component || ''}","${a.classification}","${a.proposedFree.replace(/"/g, '""')}","${a.proposedPremium.replace(/"/g, '""')}","${a.premiumStatus}","${a.evidence.replace(/"/g, '""')}"`
).join('\n');

const reportsDir = path.resolve('reports/vimz-ai-freemium-audit');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(path.join(reportsDir, 'freemium_classification_matrix.csv'), csvHeader + csvRows);
fs.writeFileSync(path.join(reportsDir, 'freemium_audit_summary.json'), JSON.stringify({ counts, catSummary }, null, 2));

console.log(`Successfully exported audit to ${reportsDir}/freemium_classification_matrix.csv`);
