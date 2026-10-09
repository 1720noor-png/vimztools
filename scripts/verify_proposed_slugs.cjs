const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

const proposedSlugs = [
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

console.log('Checking collisions for', proposedSlugs.length, 'proposed slugs:');
proposedSlugs.forEach(slug => {
  const exists = content.includes(`"slug":"${slug}"`) || content.includes(`'${slug}'`);
  console.log(`Slug [${slug}]: ${exists ? 'EXISTS (COLLISION)' : 'AVAILABLE (100% UNIQUE)'}`);
});
