const fs = require('fs');

const content = fs.readFileSync('src/data/registry.js', 'utf8');

// Parse tools array
const toolMatches = [...content.matchAll(/\{"cat":"([^"]+)","subcat":"([^"]+)","subcatName":"([^"]+)","slug":"([^"]+)","name":"([^"]+)",/g)];

console.log(`Total tools regex parsed: ${toolMatches.length}`);

const tools = toolMatches.map(m => ({
  cat: m[1],
  subcat: m[2],
  subcatName: m[3],
  slug: m[4],
  name: m[5]
}));

// Categories of interest
const domainKeywords = {
  social_media: ['social', 'youtube', 'instagram', 'tiktok', 'twitter', 'tweet', 'reels', 'linkedin', 'facebook', 'pinterest', 'thumbnail', 'bio', 'hook', 'carousel'],
  video_image_download: ['download', 'extractor', 'media', 'video', 'image', 'audio', 'mp4', 'mp3', 'convert'],
  seo: ['seo', 'keyword', 'robots', 'sitemap', 'schema', 'meta', 'serp', 'backlink', 'redirect', 'alt text', 'opengraph', 'canonical'],
  content_strategy: ['content', 'editorial', 'calendar', 'headline', 'podcast', 'notes', 'repurpos', 'copy', 'writing', 'blog', 'article'],
  business_modeling: ['business', 'lean canvas', 'canvas', 'model', 'swot', 'pestel', 'break-even', 'valuation', 'saas', 'cac', 'ltv', 'burn rate', 'runway'],
  sales_funnels: ['sales', 'funnel', 'pipeline', 'commission', 'quota', 'velocity', 'lead', 'deal', 'crm'],
  agency_operations: ['agency', 'retainer', 'pitch', 'proposal', 'sow', 'hourly', 'billable', 'freelance', 'contract', 'quote']
};

const categorizedMatches = {};
for (const [key, words] of Object.entries(domainKeywords)) {
  categorizedMatches[key] = tools.filter(t => {
    const hay = `${t.name} ${t.slug} ${t.cat} ${t.subcatName}`.toLowerCase();
    return words.some(w => hay.includes(w));
  });
}

console.log('--- Domain Tool Counts ---');
for (const [key, list] of Object.entries(categorizedMatches)) {
  console.log(`${key}: ${list.length} tools`);
}

// Dump detailed match list to a json file for precise inspection
fs.writeFileSync('scripts/domain_tools_audit.json', JSON.stringify(categorizedMatches, null, 2), 'utf8');
console.log('Saved audit to scripts/domain_tools_audit.json');
