const fs = require('fs');
const path = require('path');

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

const scoredTools = tools.map(t => {
  let score = 0;
  if (PROFESSIONAL_CATEGORIES.has(t.cat)) score += 30;
  if (STRICT_BASIC_CATEGORIES.has(t.cat)) score -= 40;

  const text = (t.name + ' ' + t.desc + ' ' + t.why + ' ' + t.keywords).toLowerCase();

  if (text.includes('roi') || text.includes('valuation') || text.includes('audit') || text.includes('matrix')) score += 15;
  if (text.includes('analytics') || text.includes('strategy') || text.includes('forecast') || text.includes('model')) score += 15;
  if (text.includes('sow') || text.includes('contract') || text.includes('proposal') || text.includes('agreement')) score += 20;
  if (text.includes('enterprise') || text.includes('b2b') || text.includes('commercial') || text.includes('compliance')) score += 15;
  if (text.includes('schema') || text.includes('redirect') || text.includes('export') || text.includes('download')) score += 10;
  if (text.includes('tax') || text.includes('payroll') || text.includes('commission') || text.includes('retainer')) score += 15;
  if (text.includes('dcf') || text.includes('cac') || text.includes('ltv') || text.includes('ebitda') || text.includes('arr')) score += 20;
  if (text.includes('batch') || text.includes('bulk') || text.includes('crawler') || text.includes('inspector')) score += 10;

  if (text.includes('simple') || text.includes('basic') || text.includes('everyday')) score -= 20;
  if (text.includes('unit converter') || text.includes('word counter') || text.includes('morse') || text.includes('dice')) score -= 50;
  if (text.includes('bmi') || text.includes('age calculator') || text.includes('stopwatch') || text.includes('pet')) score -= 50;

  return { ...t, score };
});

scoredTools.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  return a.slug.localeCompare(b.slug);
});

const TARGET_ADVANCED = 700;
const advancedTools = scoredTools.slice(0, TARGET_ADVANCED);
const basicTools = scoredTools.slice(TARGET_ADVANCED);

const advancedSlugs = advancedTools.map(t => t.slug);
const basicSlugs = basicTools.map(t => t.slug);

// Determine download deliverable format by domain
function getDeliverableFormats(tool) {
  const text = (tool.name + ' ' + tool.desc + ' ' + tool.cat).toLowerCase();
  if (text.includes('image') || text.includes('carousel') || text.includes('splitter')) return ['ZIP', 'PNG', 'JPG'];
  if (text.includes('pdf') || text.includes('contract') || text.includes('invoice') || text.includes('agreement') || text.includes('brief')) return ['PDF', 'HTML', 'DOCX'];
  if (text.includes('calculator') || text.includes('forecast') || text.includes('model') || text.includes('tax') || text.includes('dcf') || text.includes('sheet')) return ['CSV', 'EXCEL', 'PDF'];
  if (text.includes('schema') || text.includes('json') || text.includes('tag') || text.includes('code') || text.includes('redirect')) return ['JSON', 'TXT', 'ZIP'];
  return ['PDF', 'CSV', 'JSON'];
}

// Write src/data/monetizationCatalog.js
const catalogContent = `/**
 * Vimz.ai Official Monetization Catalog & Feature Classification
 * Generated automatically: Exactly 700 Advanced Tools, Exactly 359 Basic Free Tools
 */

export const MONETIZATION_STATS = {
  totalTools: ${tools.length},
  advancedToolsCount: ${advancedTools.length},
  basicFreeToolsCount: ${basicTools.length},
  proMonthlyPrice: 9.00,
  proAnnualPrice: 89.00,
  singleToolPrice: 19.00
};

export const PRICING_TIERS = {
  free: {
    id: 'free',
    name: 'Free Basic',
    price: 0,
    period: 'forever',
    features: [
      'Access to all 359 Basic Utility Tools 100% Free',
      'Free standard calculations and on-screen outputs for all 700 Advanced Tools',
      'Standard text copy and basic CSV/JSON downloads',
      'Full privacy with 100% client-side computing',
      'No account or credit card required'
    ]
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Vimz.ai Pro Monthly',
    price: 9.00,
    period: 'month',
    variantId: 'var_pro_monthly',
    features: [
      'Instant access to ALL 700 Advanced Professional Tools',
      'Unbranded / White-label PDF, Excel, and SVG deliverables',
      'Unlimited bulk & batch operations',
      'Full Chrome Extension Pro sync & on-page tools',
      'Priority fast downloads & persistent cloud saved results',
      'Cancel anytime with instant grace period protection'
    ]
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Vimz.ai Pro Annual',
    price: 89.00,
    period: 'year',
    savings: '17% Savings (2 Months Free)',
    variantId: 'var_pro_annual',
    features: [
      'Everything in Pro Monthly',
      'Dedicated email & developer API support',
      'Early access to all newly released professional tools',
      'Annual invoicing & company expense receipts'
    ]
  },
  single_tool: {
    id: 'single_tool',
    name: 'Single Tool Lifetime License',
    price: 19.00,
    period: 'one-time lifetime',
    variantId: 'var_single_tool',
    features: [
      'Lifetime advanced unlocks for 1 specific tool',
      'White-label downloads and high-res vector exports',
      'No recurring charges or subscriptions',
      'Permanent license linked to account or email token'
    ]
  }
};

// Exactly 700 Genuinely Advanced Tools
export const ADVANCED_TOOL_SLUGS = new Set(${JSON.stringify(advancedSlugs, null, 2)});

// Exactly 359 Basic Free Tools
export const BASIC_FREE_TOOL_SLUGS = new Set(${JSON.stringify(basicSlugs, null, 2)});

/**
 * Check if a tool is an advanced professional tool
 */
export function isAdvancedTool(slug) {
  if (!slug) return false;
  return ADVANCED_TOOL_SLUGS.has(slug);
}

/**
 * Check if a tool is a basic free tool
 */
export function isBasicTool(slug) {
  if (!slug) return true;
  return !ADVANCED_TOOL_SLUGS.has(slug);
}

/**
 * Get monetization metadata for a given tool
 */
export function getToolMonetization(slug) {
  const isAdv = isAdvancedTool(slug);
  return {
    slug,
    isAdvanced: isAdv,
    tier: isAdv ? 'pro_advanced' : 'free_basic',
    badgeText: isAdv ? '💎 Pro Feature Available' : '✓ 100% Free Tool',
    badgeClass: isAdv ? 'badge-pro' : 'badge-free',
    isProSubscriptionIncluded: isAdv,
    singleToolPrice: isAdv ? 19.00 : 0.00,
    monthlyProPrice: 9.00,
    hasBasicFreeMode: true, // Basic usage is always free
    proFeatures: isAdv ? [
      'Watermark-free high-resolution PDF / Excel export',
      'Unlimited batch processing and data sets',
      'White-label executive client reports'
    ] : []
  };
}
`;

fs.writeFileSync('src/data/monetizationCatalog.js', catalogContent, 'utf8');
console.log('Successfully generated src/data/monetizationCatalog.js');

// Also write report manifest
const reportManifest = {
  generated_at: new Date().toISOString(),
  total_tools: tools.length,
  advanced_tools_count: advancedTools.length,
  basic_free_tools_count: basicTools.length,
  advanced_tools: advancedTools.map(t => ({
    slug: t.slug,
    name: t.name,
    category: t.cat,
    deliverables: getDeliverableFormats(t)
  })),
  basic_free_tools: basicTools.map(t => ({
    slug: t.slug,
    name: t.name,
    category: t.cat
  }))
};

fs.writeFileSync('reports/vimz-ai-freemium-audit/700_advanced_tools_manifest.json', JSON.stringify(reportManifest, null, 2), 'utf8');
console.log('Successfully generated reports/vimz-ai-freemium-audit/700_advanced_tools_manifest.json');
