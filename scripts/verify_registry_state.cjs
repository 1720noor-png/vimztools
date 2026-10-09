const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');

// Match all slug lines: {"cat":"...", ... "slug":"...", "name":"..."}
const slugMatches = [...content.matchAll(/"slug":"([^"]+)"/g)].map(m => m[1]);
console.log('Total tools in registry:', slugMatches.length);

const uniqueSlugs = new Set(slugMatches);
console.log('Unique slugs count:', uniqueSlugs.size);

if (slugMatches.length !== uniqueSlugs.size) {
  console.error('DUPLICATES DETECTED!');
  const counts = {};
  slugMatches.forEach(s => counts[s] = (counts[s] || 0) + 1);
  Object.entries(counts).filter(([k, v]) => v > 1).forEach(([k, v]) => console.log(`Duplicate: ${k} (${v} times)`));
} else {
  console.log('100% UNIQUE SLUGS CONFIRMED!');
}

// Verify the 21 new tools specifically
const new21 = [
  'youtube-thumbnail-extractor',
  'content-repurposing-matrix',
  'link-in-bio-builder',
  'reels-hook-script-generator',
  'instagram-grid-carousel-splitter',
  'seo-keyword-clustering-tool',
  'robots-sitemap-generator',
  'schema-json-ld-generator',
  'opengraph-card-previewer',
  'seo-redirect-map-builder',
  'content-editorial-calendar',
  'youtube-seo-optimizer',
  'headline-ab-power-tester',
  'podcast-show-notes-generator',
  'lean-canvas-business-builder',
  'sales-funnel-velocity-calculator',
  'saas-cac-payback-matrix',
  'sales-commission-calculator',
  'agency-retainer-calculator',
  'marketing-attribution-roi-model',
  'agency-pitch-proposal-generator'
];

let allFound = true;
new21.forEach(slug => {
  if (!uniqueSlugs.has(slug)) {
    console.error('MISSING SLUG:', slug);
    allFound = false;
  }
});

if (allFound) {
  console.log('ALL 21 NEW TOOLS SUCCESSFULLY REGISTERED!');
}
