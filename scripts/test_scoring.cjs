const fs = require('fs');

// Read registry
const content = fs.readFileSync('src/data/registry.js', 'utf8');
const lines = content.split('\n');
const tools = [];

for (const line of lines) {
  if (line.includes('"slug":')) {
    const slugMatch = line.match(/"slug":\s*"([^"]+)"/);
    const catMatch = line.match(/"cat":\s*"([^"]+)"/);
    const nameMatch = line.match(/"name":\s*"([^"]+)"/);
    const descMatch = line.match(/"desc":\s*"([^"]+)"/);
    const whyMatch = line.match(/"why":\s*"([^"]+)"/);
    const keywordsMatch = line.match(/"keywords":\s*"([^"]+)"/);

    if (slugMatch && catMatch) {
      tools.push({
        slug: slugMatch[1],
        cat: catMatch[1],
        name: nameMatch ? nameMatch[1] : '',
        desc: descMatch ? descMatch[1] : '',
        why: whyMatch ? whyMatch[1] : '',
        keywords: keywordsMatch ? keywordsMatch[1] : ''
      });
    }
  }
}

console.log('Total tools parsed:', tools.length);

// Categories that are strictly basic / everyday life utilities (remain 100% FREE):
const STRICT_BASIC_CATEGORIES = new Set([
  'weather-tools',
  'household-tools',
  'outdoor-tools',
  'baking-tools',
  'pet-care-tools',
  'gardening-tools',
  'parenting-tools',
  'volunteer-tools',
  'elderly-care-tools',
  'diy-tools',
  'sewing-crafts-tools',
  'sports-tools',
  'geography-maps-tools',
  'astronomy-space-tools',
  'gaming-tools',
  'wedding-tools',
  'mental-health-tools',
  'women-tools',
  'home-maintenance-tools',
  'interior-design-tools',
  'food-nutrition-tools',
  'fitness-tools',
  'travel-planning-tools',
  'moving-relocation-tools',
  'organization-tools',
  'math-unit-tools',
  'chemistry-tools',
  'shopping-tools'
]);

// Basic slugs in other categories that should never be paid:
const BASIC_SLUG_PATTERNS = [
  /converter$/,
  /calculator$/,
  /counter$/,
  /generator$/,
  /formatter$/,
  /beautifier$/,
  /validator$/,
  /checker$/,
  /viewer$/
];

// High-value professional categories
const PROFESSIONAL_CATEGORIES = new Set([
  'business-tools',
  'finance-tools',
  'marketing-tools',
  'freelance-tools',
  'legal-tools',
  'real-estate-tools',
  'retirement-planning-tools',
  'insurance-tools',
  'ecommerce-tools',
  'data-tools',
  'developer-tools',
  'social-media-tools',
  'writing-tools',
  'productivity-tools',
  'office-tools',
  'security-tools',
  'hr-tools',
  'career-tools',
  'crypto-blockchain-tools',
  'networking-tools',
  'presentation-tools',
  'sustainability-tools',
  'pdf-tools',
  'image-tools',
  'typography-tools',
  'health-wellness-tools',
  'education-tools',
  'student-tools'
]);

// Scoring algorithm to identify genuinely advanced professional tools
const scoredTools = tools.map(t => {
  let score = 0;
  const isStrictBasicCat = STRICT_BASIC_CATEGORIES.has(t.cat);
  const isProfCat = PROFESSIONAL_CATEGORIES.has(t.cat);

  if (isProfCat) score += 30;
  if (isStrictBasicCat) score -= 40;

  const text = (t.name + ' ' + t.desc + ' ' + t.why + ' ' + t.keywords).toLowerCase();

  // Professional indicators
  if (text.includes('roi') || text.includes('valuation') || text.includes('audit') || text.includes('matrix')) score += 15;
  if (text.includes('analytics') || text.includes('strategy') || text.includes('forecast') || text.includes('model')) score += 15;
  if (text.includes('sow') || text.includes('contract') || text.includes('proposal') || text.includes('agreement')) score += 20;
  if (text.includes('enterprise') || text.includes('b2b') || text.includes('commercial') || text.includes('compliance')) score += 15;
  if (text.includes('schema') || text.includes('redirect') || text.includes('export') || text.includes('download')) score += 10;
  if (text.includes('tax') || text.includes('payroll') || text.includes('commission') || text.includes('retainer')) score += 15;
  if (text.includes('dcf') || text.includes('cac') || text.includes('ltv') || text.includes('ebitda') || text.includes('arr')) score += 20;
  if (text.includes('batch') || text.includes('bulk') || text.includes('crawler') || text.includes('inspector')) score += 10;

  // Basic utility indicators (reduce score)
  if (text.includes('simple') || text.includes('basic') || text.includes('everyday')) score -= 20;
  if (text.includes('unit converter') || text.includes('word counter') || text.includes('morse') || text.includes('dice')) score -= 50;
  if (text.includes('bmi') || text.includes('age calculator') || text.includes('stopwatch') || text.includes('pet')) score -= 50;

  return { ...t, score };
});

// Sort by score descending
scoredTools.sort((a, b) => b.score - a.score);

// Exactly 700 advanced tools, 359 basic tools
const TARGET_ADVANCED = 700;
const advancedTools = scoredTools.slice(0, TARGET_ADVANCED);
const basicTools = scoredTools.slice(TARGET_ADVANCED);

console.log('Selected Advanced Tools count:', advancedTools.length);
console.log('Selected Basic Free Tools count:', basicTools.length);
console.log('Min score of advanced tool:', advancedTools[advancedTools.length - 1].score);
console.log('Max score of basic tool:', basicTools[0].score);

// Sample check
console.log('\nTop 5 Advanced Tools:');
advancedTools.slice(0, 5).forEach(t => console.log(` - [${t.score}] ${t.name} (${t.cat})`));

console.log('\nSample 5 Basic Tools:');
basicTools.slice(0, 5).forEach(t => console.log(` - [${t.score}] ${t.name} (${t.cat})`));
