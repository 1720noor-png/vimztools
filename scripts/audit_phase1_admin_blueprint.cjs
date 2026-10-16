const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOL_INDEX_PATH = path.join(ROOT, 'src', 'data', 'tool-index.json');
const REGISTRY_PATH = path.join(ROOT, 'src', 'data', 'registry.js');
const SRC_TOOLS = path.join(ROOT, 'src', 'tools');
const MANIFEST_700_PATH = path.join(ROOT, 'reports', 'vimz-ai-freemium-audit', '700_advanced_tools_manifest.json');

async function runAudit() {
  console.log('========================================================================');
  console.log('VIMZ.AI — ADMIN DASHBOARD BLUEPRINT: PHASE 1 COMPREHENSIVE AUDIT');
  console.log('========================================================================\n');

  // 1. Read tool-index.json
  const toolIndex = JSON.parse(fs.readFileSync(TOOL_INDEX_PATH, 'utf-8'));
  console.log(`[1] Total Tools in Tool Index: ${toolIndex.length}`);

  // 2. Read 700 manifest if exists
  let manifest700 = { advanced_tools: [], basic_free_tools_count: 359, advanced_tools_count: 700 };
  if (fs.existsSync(MANIFEST_700_PATH)) {
    manifest700 = JSON.parse(fs.readFileSync(MANIFEST_700_PATH, 'utf-8'));
    console.log(`[2] 700 Advanced Tools Manifest: ${manifest700.advanced_tools.length} advanced tools, ${manifest700.basic_free_tools_count} basic free tools.`);
  }

  const advancedSlugSet = new Set(manifest700.advanced_tools.map(t => t.slug));

  // Extract component imports from registry.js
  const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
  const componentFileMap = {};
  let imp;
  while ((imp = importRegex.exec(registryContent)) !== null) {
    const compName = imp[1];
    const importPath = imp[2];
    // resolve to absolute file path
    const resolvedPath = path.resolve(path.join(ROOT, 'src', 'data'), importPath);
    componentFileMap[compName] = resolvedPath;
  }

  // Also extract tool slug -> Component mapping from registry
  const startIdx = registryContent.indexOf('export const tools = [');
  const endIdx = registryContent.indexOf('\nexport const related =');
  const rawTools = registryContent.substring(startIdx + 'export const tools = ['.length, endIdx).trim();
  const cleanTools = rawTools.replace(/\]\s*$/, '');
  const safeJs = cleanTools.replace(/["']?Component["']?\s*:\s*([A-Za-z0-9_]+)/g, '"Component": "$1"');
  const rawToolList = new Function('return [' + safeJs + ']')().filter(Boolean);

  const slugToComponentFile = {};
  for (const t of rawToolList) {
    if (t.slug && t.Component && componentFileMap[t.Component]) {
      slugToComponentFile[t.slug] = componentFileMap[t.Component];
    }
  }

  console.log(`[3] Tools Mapped to Physical Source Files: ${Object.keys(slugToComponentFile).length}`);

  // 3. Scan each tool for Downloadable vs On-screen
  const downloadStats = {
    downloadable: 0,
    on_screen: 0,
    mixed: 0,
    unknown: 0,
  };

  const formatsDetected = {};
  const classifiedTools = [];

  for (const tool of toolIndex) {
    const slug = tool.slug;
    const filePath = slugToComponentFile[slug];

    let downloadType = 'unknown';
    let formats = [];
    let generatedWhere = 'unknown';
    let isDownloadCapable = false;

    if (filePath && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');

      const hasBlob = /new\s+Blob\s*\(/i.test(content);
      const hasDownloadAttr = /download\s*=/i.test(content) || /\.setAttribute\s*\(\s*['"]download['"]/i.test(content);
      const hasSaveAs = /saveAs\s*\(/i.test(content);
      const hasCreateObjectURL = /createObjectURL\s*\(/i.test(content);
      const hasToDataURL = /toDataURL\s*\(/i.test(content);
      const hasPdfLib = /pdf-lib|jsPDF/i.test(content);
      const hasZip = /jszip/i.test(content);
      const hasServerFetch = /fetch\s*\(\s*['"`][^'"`]*\/export/i.test(content);

      isDownloadCapable = hasBlob || hasDownloadAttr || hasSaveAs || hasCreateObjectURL || hasToDataURL || hasPdfLib || hasZip;

      if (/pdf/i.test(content) && (hasBlob || hasDownloadAttr || hasPdfLib)) formats.push('PDF');
      if (/png|jpeg|jpg|image\//i.test(content) && (hasBlob || hasToDataURL || hasDownloadAttr)) formats.push('PNG');
      if (/svg/i.test(content) && (hasBlob || hasDownloadAttr)) formats.push('SVG');
      if (/csv/i.test(content) && (hasBlob || hasDownloadAttr)) formats.push('CSV');
      if (/xlsx|excel/i.test(content) && (hasBlob || hasDownloadAttr)) formats.push('XLSX');
      if (/zip/i.test(content) && (hasBlob || hasZip || hasDownloadAttr)) formats.push('ZIP');
      if (/json/i.test(content) && (hasBlob || hasDownloadAttr)) formats.push('JSON');
      if (/txt|text\/plain/i.test(content) && (hasBlob || hasDownloadAttr)) formats.push('TXT');

      const hasOnScreenResult = /result|output|calculate|calc|score|summary|table|render/i.test(content);

      if (isDownloadCapable && hasOnScreenResult) {
        downloadType = 'mixed';
      } else if (isDownloadCapable) {
        downloadType = 'downloadable';
      } else {
        downloadType = 'on-screen';
      }

      generatedWhere = hasServerFetch ? 'server' : (isDownloadCapable ? 'browser' : 'unknown');
    }

    formats.forEach(fmt => {
      formatsDetected[fmt] = (formatsDetected[fmt] || 0) + 1;
    });

    if (downloadType === 'downloadable') downloadStats.downloadable++;
    else if (downloadType === 'mixed') downloadStats.mixed++;
    else if (downloadType === 'on-screen') downloadStats.on_screen++;
    else downloadStats.unknown++;

    const isAdvanced = advancedSlugSet.has(slug);
    const downloadGating = isAdvanced ? (isDownloadCapable ? 'paid unbranded' : 'paid only') : (isDownloadCapable ? 'free' : 'none');

    classifiedTools.push({
      slug,
      name: tool.name,
      category: tool.cat,
      is_advanced: isAdvanced,
      download_type: downloadType,
      download_formats: formats.join('; ') || 'None',
      generated_where: generatedWhere,
      download_gating: downloadGating,
      classification_source: 'audit',
      verified_at: new Date().toISOString().split('T')[0]
    });
  }

  console.log('\n--- 1,059 Tools Classification Summary ---');
  console.log(`Downloadable Only: ${downloadStats.downloadable}`);
  console.log(`Mixed (On-screen + Download): ${downloadStats.mixed}`);
  console.log(`On-screen Only: ${downloadStats.on_screen}`);
  console.log(`Unknown: ${downloadStats.unknown}`);
  console.log(`Total Download Capable Tools: ${downloadStats.downloadable + downloadStats.mixed}`);
  console.log('Detected Formats Breakdown:', formatsDetected);

  // Write reports
  const OUT_DIR = path.join(ROOT, 'reports', 'admin-blueprint');
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const csvHeader = 'slug,name,category,is_advanced,download_type,download_formats,generated_where,download_gating,classification_source,verified_at\n';
  const csvBody = classifiedTools.map(t => 
    `"${t.slug}","${t.name.replace(/"/g, '""')}","${t.category}",${t.is_advanced},"${t.download_type}","${t.download_formats}","${t.generated_where}","${t.download_gating}","${t.classification_source}","${t.verified_at}"`
  ).join('\n');

  fs.writeFileSync(path.join(OUT_DIR, 'phase1_1059_download_classification.csv'), csvHeader + csvBody);
  fs.writeFileSync(path.join(OUT_DIR, 'phase1_1059_download_classification.json'), JSON.stringify(classifiedTools, null, 2));

  console.log(`\nPhase 1 Classification datasets written to ${OUT_DIR}`);
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
