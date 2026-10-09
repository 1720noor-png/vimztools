const fs = require('fs');

const registryPath = 'src/data/registry.js';
let content = fs.readFileSync(registryPath, 'utf8');

// 1. Add imports at the top
const newImports = `
// Phase 3 & 4: Expansion Tools (Business, Strategy, SEO, Social, Freelance)
import BusinessModelCanvasBuilderTool from '../tools/business/BusinessModelCanvasBuilder.jsx'
import ValuePropositionCanvasMapperTool from '../tools/business/ValuePropositionCanvasMapper.jsx'
import SalesPipelineStagePlannerTool from '../tools/business/SalesPipelineStagePlanner.jsx'
import BusinessIdeaValidationPlannerTool from '../tools/business/BusinessIdeaValidationPlanner.jsx'
import RevenueModelComparisonCalculatorTool from '../tools/business/RevenueModelComparisonCalculator.jsx'
import ProjectScopePricingEstimatorTool from '../tools/freelance/ProjectScopePricingEstimator.jsx'
import ColdEmailOutreachPlannerTool from '../tools/business/ColdEmailOutreachPlanner.jsx'
import TechnicalSeoAuditChecklistTool from '../tools/marketing/TechnicalSeoAuditChecklist.jsx'
import ContentBriefGeneratorTool from '../tools/marketing/ContentBriefGenerator.jsx'
import LandingPageAuditChecklistTool from '../tools/marketing/LandingPageAuditChecklist.jsx'
import InternalLinkingClusterArchitectTool from '../tools/marketing/InternalLinkingClusterArchitect.jsx'
import CampaignBudgetAllocatorTool from '../tools/marketing/CampaignBudgetAllocator.jsx'
import LocalSeoGbpAuditPlannerTool from '../tools/marketing/LocalSeoGbpAuditPlanner.jsx'
import SocialMediaOembedViewerTool from '../tools/socialmedia/SocialMediaOembedViewer.jsx'
import ShortVideoSoundHookPlannerTool from '../tools/socialmedia/ShortVideoSoundHookPlanner.jsx'
import ClientRetainerRoiReportGeneratorTool from '../tools/freelance/ClientRetainerRoiReportGenerator.jsx'
`;

// Insert new imports before "export const categories ="
const catExportIndex = content.indexOf('export const categories = [');
if (catExportIndex === -1) throw new Error('Could not find categories export');

content = content.slice(0, catExportIndex) + newImports + '\n' + content.slice(catExportIndex);

// 2. Register privacy-tools and women-tools in categories array if not present
if (!content.includes('"slug": "privacy-tools"') && !content.includes("'slug': 'privacy-tools'")) {
  const newCatEntries = `  {
    "slug": "privacy-tools",
    "name": "Privacy & Digital Safety",
    "icon": "🔒",
    "desc": "Protect personal data, evaluate cookies, and audit online digital exposure.",
    "accent": "slate",
    "subcategories": [
      { "slug": "privacy-checklists", "name": "Privacy Checklists & Audits" },
      { "slug": "identity-protection", "name": "Identity & Data Protection" }
    ]
  },
  {
    "slug": "women-tools",
    "name": "Women Care & Health",
    "icon": "🌸",
    "desc": "Health calculators, cycle tracking, pregnancy due dates, and apparel sizing.",
    "accent": "pink",
    "subcategories": [
      { "slug": "cycle-pregnancy", "name": "Cycle & Pregnancy Calculators" },
      { "slug": "wellness-sizing", "name": "Wellness & Sizing Converters" }
    ]
  },
`;
  // Insert inside categories array (right after "export const categories = [")
  const catArrayStart = content.indexOf('export const categories = [') + 'export const categories = [\n'.length;
  content = content.slice(0, catArrayStart) + newCatEntries + content.slice(catArrayStart);
}

// 3. Disambiguate the 13 duplicate display names
const disambiguations = [
  { search: '{"cat":"developer-tools","subcat":"network-api-data-inspection","subcatName":"API, Network & Data Inspection","slug":"http-status-lookup","name":"HTTP Status Code Lookup"', replace: '{"cat":"developer-tools","subcat":"network-api-data-inspection","subcatName":"API, Network & Data Inspection","slug":"http-status-lookup","name":"HTTP Status Code Quick Reference"' },
  { search: '"slug":"http-status-code-lookup","name":"HTTP Status Code Lookup"', replace: '"slug":"http-status-code-lookup","name":"HTTP Status Code & Header Debugger"' },

  { search: '{"cat":"design-tools","subcat":"css-graphics","subcatName":"CSS & Graphics","slug":"gradient-generator","name":"CSS Gradient Generator"', replace: '{"cat":"design-tools","subcat":"css-graphics","subcatName":"CSS & Graphics","slug":"gradient-generator","name":"Visual Gradient Designer"' },
  { search: '"slug":"css-gradient-generator","name":"CSS Gradient Generator"', replace: '"slug":"css-gradient-generator","name":"CSS Multi-Stop Gradient Generator"' },

  { search: '{"cat":"design-tools","subcat":"css-graphics","subcatName":"CSS & Graphics","slug":"box-shadow-generator","name":"CSS Box Shadow Generator"', replace: '{"cat":"design-tools","subcat":"css-graphics","subcatName":"CSS & Graphics","slug":"box-shadow-generator","name":"UI Elevation & Box Shadow Designer"' },
  { search: '"slug":"css-box-shadow-generator","name":"CSS Box Shadow Generator"', replace: '"slug":"css-box-shadow-generator","name":"Layered CSS Drop-Shadow Generator"' },

  { search: '{"cat":"design-tools","subcat":"colors-palettes","subcatName":"Colors & Palettes","slug":"color-palette-generator","name":"Color Palette Generator"', replace: '{"cat":"design-tools","subcat":"colors-palettes","subcatName":"Colors & Palettes","slug":"color-palette-generator","name":"Harmonious Palette Generator"' },
  { search: '"slug":"palette-generator","name":"Color Palette Generator"', replace: '"slug":"palette-generator","name":"Developer Color Palette Export Tool"' },

  { search: '{"cat":"accessibility-tools","subcat":"visual-color-accessibility","subcatName":"Visual & Color Accessibility","slug":"color-blindness-simulator","name":"Color Blindness Simulator"', replace: '{"cat":"accessibility-tools","subcat":"visual-color-accessibility","subcatName":"Visual & Color Accessibility","slug":"color-blindness-simulator","name":"UI Accessibility Color Blindness Checker"' },
  { search: '"slug":"colorblind-simulator","name":"Color Blindness Simulator"', replace: '"slug":"colorblind-simulator","name":"Clinical Color Vision Deficiency Simulator"' },

  { search: '{"cat":"photography-tools","subcat":"exposure-lighting","subcatName":"Exposure & Lighting","slug":"golden-hour-calculator","name":"Golden Hour Calculator"', replace: '{"cat":"photography-tools","subcat":"exposure-lighting","subcatName":"Exposure & Lighting","slug":"golden-hour-calculator","name":"Photographer\'s Golden Hour & Blue Hour Calculator"' },
  { search: '"slug":"photography-golden-hour-calc","name":"Golden Hour Calculator"', replace: '"slug":"photography-golden-hour-calc","name":"Travel Sunset & Sunrise Planner"' },

  { search: '{"cat":"photography-tools","subcat":"exposure-lighting","subcatName":"Exposure & Lighting","slug":"depth-of-field-calculator","name":"Depth of Field Calculator"', replace: '{"cat":"photography-tools","subcat":"exposure-lighting","subcatName":"Exposure & Lighting","slug":"depth-of-field-calculator","name":"Optical Depth of Field (DoF) Calculator"' },
  { search: '"slug":"depth-of-field-calc","name":"Depth of Field Calculator"', replace: '"slug":"depth-of-field-calc","name":"Macro & Portrait DoF Simulator"' },

  { search: '{"cat":"productivity-tools","subcat":"workflow-randomizers-utilities","subcatName":"Workflow Utilities & Randomizers","slug":"random-number-generator","name":"Random Number Generator"', replace: '{"cat":"productivity-tools","subcat":"workflow-randomizers-utilities","subcatName":"Workflow Utilities & Randomizers","slug":"random-number-generator","name":"Quick Random Number Drawer"' },
  { search: '"slug":"random-number-picker","name":"Random Number Generator"', replace: '"slug":"random-number-picker","name":"Statistical Random Number Generator"' },

  { search: '{"cat":"developer-tools","subcat":"web-frontend-styling","subcatName":"Web & CSS Styling","slug":"lorem-ipsum-generator","name":"Lorem Ipsum Generator"', replace: '{"cat":"developer-tools","subcat":"web-frontend-styling","subcatName":"Web & CSS Styling","slug":"lorem-ipsum-generator","name":"Developer Mock Text (Lorem Ipsum) Generator"' },
  { search: '"slug":"lorem-ipsum-gen","name":"Lorem Ipsum Generator"', replace: '"slug":"lorem-ipsum-gen","name":"Editorial Dummy Copy & Paragraph Builder"' },

  { search: '{"cat":"office-tools","subcat":"business-communications-forms","subcatName":"Business Communications & Forms","slug":"email-signature-generator","name":"Email Signature Generator"', replace: '{"cat":"office-tools","subcat":"business-communications-forms","subcatName":"Business Communications & Forms","slug":"email-signature-generator","name":"Standard Corporate Email Signature Maker"' },
  { search: '"slug":"email-signature-builder","name":"Email Signature Generator"', replace: '"slug":"email-signature-builder","name":"Branded Marketing Email Signature Builder"' },

  { search: '{"cat":"student-tools","subcat":"assignments-writing-prep","subcatName":"Assignments & Writing Prep","slug":"essay-outline-generator","name":"Essay Outline Generator"', replace: '{"cat":"student-tools","subcat":"assignments-writing-prep","subcatName":"Assignments & Writing Prep","slug":"essay-outline-generator","name":"Academic Essay 5-Paragraph Outline Planner"' },
  { search: '"slug":"essay-outline-maker","name":"Essay Outline Generator"', replace: '"slug":"essay-outline-maker","name":"Narrative & Long-Form Essay Structure Generator"' },

  { search: '{"cat":"event-planning-tools","subcat":"budget-catering","subcatName":"Budget & Catering","slug":"catering-quantity-calculator","name":"Catering Quantity Calculator"', replace: '{"cat":"event-planning-tools","subcat":"budget-catering","subcatName":"Budget & Catering","slug":"catering-quantity-calculator","name":"Event & Wedding Catering Portion Planner"' },
  { search: '"slug":"catering-food-quantity-calc","name":"Catering Quantity Calculator"', replace: '"slug":"catering-food-quantity-calc","name":"Party Buffet & Food Quantity Calculator"' },

  { search: '{"cat":"developer-tools","subcat":"regex-text-developer-tools","subcatName":"Regex & String Manipulation","slug":"diff-checker","name":"Text Diff Checker"', replace: '{"cat":"developer-tools","subcat":"regex-text-developer-tools","subcatName":"Regex & String Manipulation","slug":"diff-checker","name":"Side-by-Side Code Diff Viewer"' },
  { search: '"slug":"text-diff-checker","name":"Text Diff Checker"', replace: '"slug":"text-diff-checker","name":"Inline Text & Prose Diff Checker"' }
];

let replacedDisambiguations = 0;
disambiguations.forEach(d => {
  if (content.includes(d.search)) {
    content = content.replace(d.search, d.replace);
    replacedDisambiguations++;
  } else {
    console.warn('Disambiguation string not found:', d.search.slice(0, 50));
  }
});
console.log(`Applied ${replacedDisambiguations} disambiguations.`);

// 4. Append the 16 new tools before the end of the tools array
const newToolObjects = `  {"cat":"business-tools","subcat":"business-planning","subcatName":"Business Planning","slug":"business-model-canvas-builder","name":"Business Model Canvas Builder","icon":"📊","popular":true,"Component":BusinessModelCanvasBuilderTool,"desc":"Design and export a complete 9-block Strategyzer Business Model Canvas with local autosave and templates.","why":"Eliminates fragmented spreadsheets and produces an investor-ready 9-block canvas in minutes.","steps":["Select a starting business preset or start from scratch.","Add strategic bullets to Partners, Activities, Resources, Value Props, and Channels.","Complete Cost Structure and Revenue Streams.","Export to JSON, CSV or print formatted A4 canvas."],"keywords":"business model canvas bmc strategyzer startup planning value proposition cost structure"},
  {"cat":"business-tools","subcat":"business-planning","subcatName":"Business Planning","slug":"value-proposition-canvas-mapper","name":"Value Proposition Canvas Mapper","icon":"💎","Component":ValuePropositionCanvasMapperTool,"desc":"Map Customer Jobs, Pains, and Gains against Products, Pain Relievers, and Gain Creators for problem-solution fit.","why":"Ensures your product features directly alleviate user pains and deliver tangible customer gains.","steps":["Define customer profile jobs, pains, and gains.","List your product features, pain relievers, and gain creators.","Check your automated Problem-Solution Fit score.","Export alignment matrix as JSON or CSV."],"keywords":"value proposition canvas vpc problem solution fit strategyzer customer jobs customer pains gain creators"},
  {"cat":"business-tools","subcat":"sales-crm","subcatName":"Sales & Pipeline Management","slug":"sales-pipeline-stage-planner","name":"Sales Pipeline Stage Velocity & Leakage Planner","icon":"📈","Component":SalesPipelineStagePlannerTool,"desc":"Model multi-stage pipeline conversions, pinpoint stage drop-off leakage, and calculate revenue velocity ($/day).","why":"Identifies exact pipeline bottlenecks where deals stagnate and quantifies the revenue impact of conversion fixes.","steps":["Enter deals entering top of funnel.","Configure conversion rates, average deal size, and duration per stage.","Inspect the automated bottleneck detector alert.","Export pipeline stage velocity breakdown as CSV."],"keywords":"sales pipeline velocity stage conversion funnel leakage deal velocity b2b crm revenue forecast"},
  {"cat":"business-tools","subcat":"business-planning","subcatName":"Business Planning","slug":"business-idea-validation-planner","name":"Business Idea Validation Planner","icon":"🎯","Component":BusinessIdeaValidationPlannerTool,"desc":"Evaluate product and startup ideas across Desirability, Viability, Feasibility, Defensibility, and Market Timing.","why":"Quantifies commercial viability and identifies high-risk unvalidated assumptions before building.","steps":["Enter your product or business thesis.","Score desirability, unit economics, technical feasibility, and timing questions.","Review the weighted 0-100 Validation Index and verdict.","Download Markdown validation summary."],"keywords":"idea validation startup viability feasibility market timing business scoring framework"},
  {"cat":"business-tools","subcat":"financial-forecasting","subcatName":"Financial Forecasting","slug":"revenue-model-comparison-calculator","name":"Revenue Model Comparison Calculator","icon":"⚖️","Component":RevenueModelComparisonCalculatorTool,"desc":"Compare SaaS subscription, usage-based metering, marketplace take-rates, freemium, and enterprise contracts side-by-side.","why":"Shows customer scale, gross margin, and transaction volume required to hit $1M+ ARR across different business models.","steps":["Select your annual recurring revenue (ARR) target goal.","Tune pricing, churn, take-rate, and COGS per model.","Compare customer volume and GMV required.","Select the optimal monetization strategy for your business."],"keywords":"revenue model comparison saas pricing usage based marketplace take rate freemium monetization arr mrr"},
  {"cat":"freelance-tools","subcat":"client-pricing","subcatName":"Client Pricing & Rate Strategy","slug":"project-scope-pricing-estimator","name":"Project Scope & Fixed-Fee Pricing Estimator","icon":"💼","Component":ProjectScopePricingEstimatorTool,"desc":"Estimate fixed-fee project scopes factoring milestone hours, contingency buffers (10-30%), and revision limits.","why":"Prevents margin erosion and scope creep by calculating realistic contingency buffers for client quotes.","steps":["List project phases and estimated hours per phase.","Set base hourly rate and scope risk contingency percentage.","Configure included revision rounds and out-of-scope overage rate.","Export transparent client quote sheet as CSV."],"keywords":"project scope estimator fixed fee quote milestone pricing contingency freelance agency statement of work"},
  {"cat":"business-tools","subcat":"sales-crm","subcatName":"Sales & Pipeline Management","slug":"cold-email-outreach-planner","name":"Cold Email Deliverability & Volume Planner","icon":"✉️","Component":ColdEmailOutreachPlannerTool,"desc":"Calculate sending inboxes, secondary domain rotation, and ramp warm-up schedules to hit sales meeting targets safely.","why":"Protects domain reputation and prevents spam flagging while scaling outbound sales cadences.","steps":["Enter target booked meetings per month.","Set positive reply rate and meeting conversion rate assumptions.","View required inbox counts, secondary domains, and infrastructure cost.","Follow the recommended 4-week domain warm-up ramp schedule."],"keywords":"cold email deliverability outbound planner domain warmup inbox rotation sales engagement sdr bdr"},
  {"cat":"marketing-tools","subcat":"seo-tools","subcatName":"Search Engine Optimization","slug":"technical-seo-audit-checklist","name":"Technical SEO Pre-Launch Audit Checklist","icon":"🔍","Component":TechnicalSeoAuditChecklistTool,"desc":"24-point pre-launch technical SEO audit covering crawlability, canonicals, robots.txt, schema, and Core Web Vitals.","why":"Prevents costly indexing and traffic drops by catching technical misconfigurations before launch.","steps":["Enter site or staging domain URL.","Review each checkpoint across Crawlability, Architecture, Meta Tags, and CWV.","Inspect your real-time Readiness Score (0-100).","Export Markdown or print client audit report."],"keywords":"technical seo audit checklist robots txt sitemap canonical schema core web vitals migration pre launch"},
  {"cat":"marketing-tools","subcat":"content-marketing","subcatName":"Content & Copywriting","slug":"content-brief-generator","name":"Content Brief & Editorial Spec Builder","icon":"📝","Component":ContentBriefGeneratorTool,"desc":"Build comprehensive writer briefs with target keywords, search intent, heading outline, and editorial standards.","why":"Eliminates writer rework and misaligned content by generating standardized editorial specifications.","steps":["Enter article working title and primary focus keyword.","Set target search intent, audience persona, and word count.","Customize the recommended H2/H3 outline and questions to answer.","Copy Markdown brief or download .MD file."],"keywords":"content brief editorial specification writer outline seo content brief search intent headings"},
  {"cat":"marketing-tools","subcat":"campaign-tracking-advertising","subcatName":"Campaigns & Advertising","slug":"landing-page-audit-checklist","name":"Landing Page Conversion & CRO Audit","icon":"🎯","Component":LandingPageAuditChecklistTool,"desc":"Heuristic 20-point conversion rate optimization (CRO) audit assessing value prop clarity, CTA contrast, and trust signals.","why":"Uncovers conversion friction and leaks on sales and sign-up pages to boost visitor-to-lead rates.","steps":["Enter your landing page URL.","Audit Hero section, CTA visibility, social proof, and form friction.","Check your Conversion Readiness score.","Export prioritized remediation report."],"keywords":"landing page audit cro conversion rate optimization heuristic checklist call to action social proof friction"},
  {"cat":"marketing-tools","subcat":"seo-tools","subcatName":"Search Engine Optimization","slug":"internal-linking-cluster-architect","name":"SEO Internal Linking & Topic Cluster Architect","icon":"🔗","Component":InternalLinkingClusterArchitectTool,"desc":"Map hub-and-spoke topic clusters, optimize anchor text distributions, and eliminate orphan pages.","why":"Maximizes topical authority and link equity distribution across core pillar and supporting spoke articles.","steps":["Define your Master Pillar page URL and target anchor.","Add supporting cluster spoke articles with designated anchor text.","Verify bidirectional links to pillar and sibling cross-links.","Export complete cluster linking matrix as CSV."],"keywords":"internal linking topic cluster pillar page seo content architecture anchor text topical authority"},
  {"cat":"marketing-tools","subcat":"campaign-tracking-advertising","subcatName":"Campaigns & Advertising","slug":"campaign-budget-allocator","name":"Marketing Campaign Budget Allocation & Blended CAC Calculator","icon":"💰","Component":CampaignBudgetAllocatorTool,"desc":"Simulate ad spend across Search, Social, and Retargeting with blended ROAS and CAC projections.","why":"Ensures optimal capital allocation across paid channels to achieve target customer acquisition efficiency.","steps":["Enter total monthly advertising budget.","Set average customer deal value / LTV.","Adjust percentage budget allocation, CPC, and conversion rates per channel.","Review blended CAC, total customer acquisitions, and overall ROAS."],"keywords":"campaign budget allocator marketing ad spend blended cac roas google ads meta ads linkedin ads"},
  {"cat":"marketing-tools","subcat":"seo-tools","subcatName":"Search Engine Optimization","slug":"local-seo-gbp-audit-planner","name":"Local SEO Google Business Profile Audit Planner","icon":"📍","Component":LocalSeoGbpAuditPlannerTool,"desc":"Audit Google Business Profile completeness, NAP consistency, reviews, and local citation signals.","why":"Helps local businesses climb into the Google Maps 3-Pack and capture nearby high-intent searchers.","steps":["Enter business name and city/metro area.","Audit NAP consistency, primary/secondary categories, and reviews.","Review on-page LocalBusiness schema and citation aggregators.","Export local readiness report or print scorecard."],"keywords":"local seo google business profile gbp audit nap consistency maps 3-pack local citations"},
  {"cat":"social-media-tools","subcat":"content-generation","subcatName":"Content Generation","slug":"social-oembed-viewer","name":"Universal Social Media oEmbed Viewer & Generator","icon":"🌐","Component":SocialMediaOembedViewerTool,"desc":"Retrieve official embed codes, author details, and thumbnails from YouTube, TikTok, Vimeo, Spotify, and Reddit.","why":"Provides safe, legal, and CORS-compliant media previewing and embed generation without API keys.","steps":["Paste a public post, video, or audio link from a supported platform.","Select Fetch Embed Meta.","Preview verified author, title, and official thumbnail asset.","Copy the responsive HTML embed snippet."],"keywords":"social oembed viewer embed code generator youtube tiktok vimeo spotify reddit embed snippet"},
  {"cat":"social-media-tools","subcat":"video-social-media","subcatName":"Video & Social Media","slug":"short-video-sound-hook-planner","name":"Short-Form Video Hook & Sound Script Planner","icon":"🎬","Component":ShortVideoSoundHookPlannerTool,"desc":"Architect high-retention 3-second hooks, audio sync pacing, and TikTok/Reels/Shorts scripts.","why":"Boosts video retention and completion rates by engineering proven psychological hooks and visual pattern interrupts.","steps":["Select target platform (TikTok, Reels, Shorts).","Choose a proven hook preset (Curiosity Gap, Contrarian, etc.).","Write spoken hook text and plan visual pattern interrupt action.","Review estimated duration and export complete script."],"keywords":"short form video hook tiktok reels youtube shorts script planner retention sound sync pacing"},
  {"cat":"freelance-tools","subcat":"proposals-contracts","subcatName":"Proposals & Contracts","slug":"client-retainer-roi-report-generator","name":"Client Retainer ROI & Performance Report Generator","icon":"📑","Component":ClientRetainerRoiReportGeneratorTool,"desc":"Generate 1-page executive retainer reports showing deliverables completed, hours logged, and attributed ROI.","why":"Demonstrates tangible commercial value to retainer clients, preventing cancellations and driving account renewals.","steps":["Enter client name, billing period, and monthly retainer fee.","Log delivered hours and track attributed revenue/pipeline.","Add completed deliverables and next month sprint priorities.","Print 1-page executive report or export Markdown."],"keywords":"client retainer report agency roi report monthly retainer deliverables executive summary client renewal"}
`;

// Insert new tools right before the end of the tools array (before "export const related =")
const relatedExportIndex = content.lastIndexOf('export const related =');
if (relatedExportIndex === -1) throw new Error('Could not find related export');

// Find the closing bracket ']' of the tools array before relatedExportIndex
const lastBracketIndex = content.lastIndexOf(']', relatedExportIndex);
if (lastBracketIndex === -1) throw new Error('Could not find closing bracket of tools array');

content = content.slice(0, lastBracketIndex) + ',\n' + newToolObjects + '\n' + content.slice(lastBracketIndex);

fs.writeFileSync(registryPath, content, 'utf8');
console.log('Successfully updated registry.js!');
