const fs = require('fs');

const audit = JSON.parse(fs.readFileSync('scripts/audit_results.json', 'utf8'));
const tools = audit.tools;

// Search helper
function findTools(regex) {
  return tools.filter(t => 
    regex.test(t.name) || 
    regex.test(t.slug) || 
    regex.test(t.cat) || 
    regex.test(t.subcat || '') ||
    regex.test(t.desc || '') ||
    regex.test(t.keywords || '')
  );
}

// 1. Social Media Video, Image, Thumbnail Downloads & Media Inspection
const socialDownloadMatches = findTools(/download|thumbnail|media-inspector|video-downloader|instagram-grid|youtube-thumb/i);

// 2. Digital Marketers
const marketingMatches = tools.filter(t => t.cat === 'marketing-tools' || t.cat === 'advertising-tools' || /marketing|ad-|roas|roi|campaign|attribution|ab-test/i.test(t.slug));

// 3. Social Media Marketers
const socialMediaMatches = tools.filter(t => t.cat === 'social-media-tools' || /social|hashtag|instagram|youtube|tiktok|reels|bio/i.test(t.slug));

// 4. SEO Specialists
const seoMatches = tools.filter(t => t.subcat === 'seo-tools' || /seo|sitemap|robots|schema|hreflang|canonical|serp|keyword/i.test(t.slug));

// 5. Content Strategists
const contentMatches = tools.filter(t => /content|editorial|calendar|decay|repurpos|brief|cluster/i.test(t.slug));

// 6. Business Model Generator
const businessModelMatches = tools.filter(t => /business-model|lean-canvas|swot|canvas/i.test(t.slug));

// 7. Business Sales Funnel Planner
const funnelMatches = tools.filter(t => /funnel|pipeline|lead-scor|cac-payback|sales-commission/i.test(t.slug));

console.log('Social Download / Media matches:', socialDownloadMatches.map(t => ({ id: t.id, name: t.name, slug: t.slug, cat: t.cat })));
console.log('Marketing tools count:', marketingMatches.length);
console.log('Social Media tools count:', socialMediaMatches.length);
console.log('SEO tools count:', seoMatches.length);
console.log('Content Strategy matches:', contentMatches.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
console.log('Business Model matches:', businessModelMatches.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
console.log('Funnel matches:', funnelMatches.map(t => ({ id: t.id, name: t.name, slug: t.slug })));

fs.writeFileSync('scripts/teacher_matches.json', JSON.stringify({
  socialDownload: socialDownloadMatches,
  marketing: marketingMatches,
  socialMedia: socialMediaMatches,
  seo: seoMatches,
  content: contentMatches,
  businessModel: businessModelMatches,
  funnel: funnelMatches
}, null, 2));

console.log('Teacher requirements mapped to scripts/teacher_matches.json');
