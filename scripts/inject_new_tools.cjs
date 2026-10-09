const fs = require('fs');

let content = fs.readFileSync('src/data/registry.js', 'utf8');

const newImports = [
  "import B2bLeadScoringMatrixTool from '../tools/business/B2bLeadScoringMatrix.jsx'",
  "import HreflangTagGeneratorTool from '../tools/marketing/HreflangTagGenerator.jsx'",
  "import AgencyBlendedRateCalculatorTool from '../tools/freelance/AgencyBlendedRateCalculator.jsx'",
  "import EmailDeliverabilityHealthCheckerTool from '../tools/marketing/EmailDeliverabilityHealthChecker.jsx'",
  "import SocialMediaMediaInspectorTool from '../tools/social/SocialMediaMediaInspector.jsx'",
  "import SeoContentDecayAuditCalculatorTool from '../tools/marketing/SeoContentDecayAuditCalculator.jsx'",
  "import SaasCohortRetentionCalculatorTool from '../tools/business/SaasCohortRetentionCalculator.jsx'"
].join('\n');

const newToolEntries = [
  '  {"cat":"business-tools","subcat":"sales-crm","subcatName":"Sales & Pipeline Management","slug":"b2b-lead-scoring-matrix","name":"B2B Lead Scoring & Qualification Matrix","icon":"🎯","Component":B2bLeadScoringMatrixTool,"desc":"Score inbound and outbound prospects across Budget, Authority, Need, and Timeline with configurable BANT weights.","why":"Enables sales development reps and account executives to standardize deal qualification and prioritize high-value pipeline.","keywords":"b2b lead scoring matrix bant qualification criteria sql mql pipeline sales crm"},',
  '  {"cat":"marketing-tools","subcat":"seo-tools","subcatName":"Search Engine Optimization (SEO)","slug":"hreflang-tag-generator","name":"Hreflang & Multi-Regional SEO Tag Generator","icon":"🌐","Component":HreflangTagGeneratorTool,"desc":"Generate valid HTML and XML Sitemap hreflang annotations with ISO 639-1 languages, ISO 3166-1 regions, and x-default.","why":"Ensures international search engines index the correct localized URL variant without duplicate content penalties.","keywords":"hreflang tag generator international seo multi-regional x-default xml sitemap iso 639-1 iso 3166-1"},',
  '  {"cat":"freelance-tools","subcat":"client-pricing","subcatName":"Client Pricing & Invoicing","slug":"agency-blended-rate-calculator","name":"Agency Blended Billing Rate & Capacity Utilization Calculator","icon":"🏢","Component":AgencyBlendedRateCalculatorTool,"desc":"Model multi-role team billable capacity, overhead absorption, and target gross margins to calculate true blended rates.","why":"Helps agency founders and finance leaders price client contracts profitably while absorbing non-billable overhead.","keywords":"agency blended rate calculator capacity utilization billable hours overhead absorption gross margin"},',
  '  {"cat":"marketing-tools","subcat":"analytics-tracking","subcatName":"Analytics & Performance Tracking","slug":"email-deliverability-health-checker","name":"Email Deliverability & Campaign Health Diagnostic","icon":"✉️","Component":EmailDeliverabilityHealthCheckerTool,"desc":"Audit campaign bounce rates, spam complaints, and subject lines against Google/Yahoo 2024 bulk sender rules.","why":"Prevents sender domain reputation penalties and ESP suspensions by detecting spam triggers and list decay early.","keywords":"email deliverability health checker spam rate bounce rate ctor subject line spam trigger bulk sender"},',
  '  {"cat":"social-media-tools","subcat":"visual-media","subcatName":"Visual Media","slug":"social-media-media-inspector","name":"Social Media Media Inspector & Compliance Hub","icon":"🎬","Component":SocialMediaMediaInspectorTool,"desc":"Technical feasibility matrix and authorized media downloader for YouTube, Instagram, TikTok, Pinterest, X, and LinkedIn.","why":"Clarifies download feasibility across major social platforms and provides direct downloads for authorized public media.","keywords":"social media media inspector downloader compliance youtube instagram tiktok pinterest video audio image"},',
  '  {"cat":"marketing-tools","subcat":"seo-tools","subcatName":"Search Engine Optimization (SEO)","slug":"seo-content-decay-audit-calculator","name":"SEO Content Decay & Revenue Loss Calculator","icon":"📉","Component":SeoContentDecayAuditCalculatorTool,"desc":"Quantify organic traffic decay across published articles, calculate commercial revenue lost, and prioritize content refreshes.","why":"Helps SEO specialists and content teams identify decaying URLs and prioritize content refreshes with the highest revenue upside.","keywords":"seo content decay calculator traffic drop organic refresh revenue loss lead value search optimization"},',
  '  {"cat":"business-tools","subcat":"financial-forecasting","subcatName":"Financial Forecasting & Budgeting","slug":"saas-cohort-retention-calculator","name":"SaaS Customer Cohort Retention Calculator","icon":"📈","Component":SaasCohortRetentionCalculatorTool,"desc":"Visualize customer retention heatmaps across monthly onboarding cohorts to detect churn half-life and evaluate PMF.","why":"Essential for SaaS founders and product leads to measure Net Retention, logo churn curves, and product-market fit stickiness.","keywords":"saas cohort retention calculator customer retention heatmap logo churn nrr product market fit half life"},'
].join('\n');

const targetImport = "import AgencyPitchProposalGeneratorTool from '../tools/freelance/AgencyPitchProposalGenerator.jsx'";
if (content.includes(targetImport)) {
  content = content.replace(targetImport, targetImport + '\n' + newImports);
  console.log('Successfully injected imports!');
} else {
  console.error('Target import line not found!');
  process.exit(1);
}

const targetEntry = '"slug":"agency-pitch-proposal-generator"';
const lines = content.split('\n');
const entryIdx = lines.findIndex(l => l.includes(targetEntry));
if (entryIdx !== -1) {
  lines.splice(entryIdx + 1, 0, newToolEntries);
  content = lines.join('\n');
  console.log('Successfully injected tool entries!');
} else {
  console.error('Target tool entry line not found!');
  process.exit(1);
}

fs.writeFileSync('src/data/registry.js', content, 'utf8');
console.log('Saved src/data/registry.js successfully!');
