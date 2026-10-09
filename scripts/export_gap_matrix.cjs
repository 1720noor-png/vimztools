const fs = require('fs');

const tools = JSON.parse(fs.readFileSync('scripts/all_1036_tools.json', 'utf8'));

// Exact verification check
function findTool(slug) {
  return tools.find(t => t.slug === slug);
}

const matrix = [
  // 1. Social Media Media Downloads
  {
    category: 'Social Media Downloads',
    requirement: 'YouTube HD Thumbnail Download',
    matchingTool: 'YouTube HD Thumbnail Extractor & Downloader (`youtube-thumbnail-extractor`)',
    evidence: 'src/tools/social/YouTubeThumbnailExtractor.jsx extracts MaxRes (1080p), HQ, MQ, SD image downloads directly from YouTube image CDN.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None for image thumbnails. Directly grabs full-resolution covers.',
    dependency: 'Pure Client-Side (No API Key)',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Social Media Downloads',
    requirement: 'YouTube Video & Audio Binary Download',
    matchingTool: 'None for direct MP4/MP3 binary files (Only thumbnail extraction exists).',
    evidence: 'src/tools/social/YouTubeThumbnailExtractor.jsx is image-only.',
    status: 'REQUIRES EXTERNAL API / BACKEND PROXY',
    missingFeatures: 'Direct video/audio stream muxing and binary file downloading.',
    dependency: 'YouTube DASH/HLS stream signatures are blocked by browser CORS. Requires backend worker with yt-dlp or third-party proxy on Railway.',
    action: 'Clearly document distinction between thumbnail extraction and video downloading; design Railway backend proxy pipeline if full video downloading is desired.'
  },
  {
    category: 'Social Media Downloads',
    requirement: 'Instagram Video / Reels Download',
    matchingTool: 'None for direct MP4 stream download.',
    evidence: 'InstagramGridCarouselSplitter is layout slicing only.',
    status: 'REQUIRES EXTERNAL API / BACKEND PROXY',
    missingFeatures: 'Direct video file download from post URL.',
    dependency: 'Instagram CDN media URLs are signed, ephemeral, and protected against browser CORS. Requires backend proxy or Graph API.',
    action: 'Document distinction; implement public post oEmbed inspection.'
  },
  {
    category: 'Social Media Downloads',
    requirement: 'Instagram Grid & Carousel Slicing',
    matchingTool: 'Instagram Grid & Seamless Carousel Splitter (`instagram-grid-carousel-splitter`)',
    evidence: 'src/tools/social/InstagramGridCarouselSplitter.jsx calculates 4:5 and 1:1 multi-panel canvas pixel dimensions and slice coordinates.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None for layout design and slicing coordinates.',
    dependency: 'Pure Client-Side (Canvas Math)',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Social Media Downloads',
    requirement: 'TikTok Video Download (No Watermark)',
    matchingTool: 'None for raw MP4 stream extraction.',
    evidence: 'ReelsHookScriptGenerator is script generation only.',
    status: 'REQUIRES EXTERNAL API / BACKEND PROXY',
    missingFeatures: 'No-watermark MP4 video stream downloading.',
    dependency: 'TikTok video blobs require reverse-engineered mobile API signatures or external server scraper.',
    action: 'Document platform restriction; provide script and metadata tools.'
  },
  {
    category: 'Social Media Downloads',
    requirement: 'X / Twitter Video & GIF Download',
    matchingTool: 'None for direct video blob download.',
    evidence: 'OpenGraphCardPreviewer previews social share cards only.',
    status: 'REQUIRES EXTERNAL API / BACKEND PROXY',
    missingFeatures: 'Direct video file downloading.',
    dependency: 'Twitter API v2 requires paid developer tier ($100/mo) or backend headless scraper.',
    action: 'Document technical constraint.'
  },

  // 2. Digital Marketing
  {
    category: 'Digital Marketing',
    requirement: 'UTM Campaign URL Builder',
    matchingTool: 'UTM Builder (`utm-builder`)',
    evidence: 'src/tools/marketing/Utm.jsx validates URLs and appends source, medium, campaign, term, and content parameters.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None. Clean link builder with one-click copy.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Digital Marketing',
    requirement: 'Multi-Touch Marketing Attribution & ROAS',
    matchingTool: 'Multi-Touch Marketing Attribution & ROI Modeler (`marketing-attribution-roi-model`)',
    evidence: 'src/tools/freelance/MarketingAttributionRoiModel.jsx models First-Touch, Last-Touch, and Linear multi-channel ROAS and profit.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None. Compares attribution models across channels.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Digital Marketing',
    requirement: 'A/B Test Statistical Significance',
    matchingTool: 'A/B Test Significance Calculator (`ab-test-significance-calculator`)',
    evidence: 'Calculates two-tailed Z-score, P-value, and confidence interval for conversion rate testing.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Digital Marketing',
    requirement: 'Email Deliverability & Campaign Metric Diagnosis',
    matchingTool: 'Email ROI Calculator (`email-roi-calculator`)',
    evidence: 'Calculates revenue return on email lists.',
    status: 'PARTIALLY IMPLEMENTED',
    missingFeatures: 'Missing open rate vs CTR drop-off benchmarks, bounce rate health thresholds, and spam score indicators.',
    dependency: 'Pure Client-Side (Industry Formulas)',
    action: 'Implement comprehensive Email Deliverability & Engagement Health Calculator.'
  },

  // 3. Search Engine Optimization (SEO)
  {
    category: 'SEO',
    requirement: 'Visual Robots.txt & Sitemap Directives Builder',
    matchingTool: 'Visual Robots.txt & Sitemap Directives Builder (`robots-sitemap-generator`)',
    evidence: 'src/tools/marketing/RobotsSitemapGenerator.jsx generates user-agent crawler rules, delays, and sitemap references with live download.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'SEO',
    requirement: 'Google Schema JSON-LD Rich Snippets',
    matchingTool: 'Google Schema JSON-LD Rich Snippet Generator (`schema-json-ld-generator`)',
    evidence: 'src/tools/marketing/SchemaJsonLdGenerator.jsx generates validated Schema.org JSON-LD for Articles, FAQs, and Products.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side (Schema.org standard)',
    action: 'Preserve active implementation.'
  },
  {
    category: 'SEO',
    requirement: 'Open Graph & Social Share Card Previewer',
    matchingTool: 'Open Graph & Social Share Card Previewer (`opengraph-card-previewer`)',
    evidence: 'src/tools/marketing/OpenGraphCardPreviewer.jsx simulates live Twitter, LinkedIn, and Facebook preview cards with meta tags.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'SEO',
    requirement: 'SEO 301 / 302 Redirect Map Builder',
    matchingTool: 'SEO 301 / 302 Redirect Map Builder (`seo-redirect-map-builder`)',
    evidence: 'src/tools/marketing/SeoRedirectMapBuilder.jsx maps URLs and exports Nginx, Apache .htaccess, and Netlify _redirects configs.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'SEO',
    requirement: 'Keyword Search Intent Clustering',
    matchingTool: 'SEO Keyword Intent Clustering Tool (`seo-keyword-clustering-tool`)',
    evidence: 'src/tools/marketing/SeoKeywordClusteringTool.jsx clusters keyword lists into Informational, Commercial, and Transactional with CSV export.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side NLP',
    action: 'Preserve active implementation.'
  },
  {
    category: 'SEO',
    requirement: 'SERP Google Snippet Pixel Width Truncation Previewer',
    matchingTool: 'Meta Tag Generator (`meta-tag-generator`) (Character-based only)',
    evidence: 'Checks string length, but does NOT compute true proportional font pixel width (600px desktop / 960px mobile).',
    status: 'PARTIALLY IMPLEMENTED',
    missingFeatures: 'Missing real proportional font canvas measurement (Arial 20px for title, 14px for description) and rich snippet rendering.',
    dependency: 'Pure Client-Side (HTML5 Canvas measureText)',
    action: 'Implement Google SERP Pixel Width Simulator & Snippet Optimizer.'
  },
  {
    category: 'SEO',
    requirement: 'Hreflang & Canonical Multi-Country Tag Generator',
    matchingTool: 'None for multi-locale matrix.',
    evidence: 'No hreflang generator in registry.',
    status: 'MISSING',
    missingFeatures: 'ISO 639-1 language and ISO 3166-1 country code multi-regional tag generator.',
    dependency: 'Pure Client-Side',
    action: 'Implement Hreflang & Multi-Regional SEO Tag Generator.'
  },

  // 4. Content Strategy
  {
    category: 'Content Strategy',
    requirement: 'Multi-Channel Content Repurposing Matrix',
    matchingTool: 'Multi-Channel Content Repurposing Matrix (`content-repurposing-matrix`)',
    evidence: 'src/tools/social/ContentRepurposingMatrix.jsx transforms long-form input into Twitter threads, LinkedIn posts, Reels scripts, and Newsletters.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Content Strategy',
    requirement: 'Content Editorial Matrix & Publishing Calendar',
    matchingTool: 'Content Editorial Matrix & Publishing Calendar (`content-editorial-calendar`)',
    evidence: 'src/tools/marketing/ContentEditorialCalendar.jsx manages multi-channel content pipelines across pillars with CSV export.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Content Strategy',
    requirement: 'Headline A/B Power Score & CTR Tester',
    matchingTool: 'Headline A/B Power Score & CTR Tester (`headline-ab-power-tester`)',
    evidence: 'src/tools/writing/HeadlineAbPowerTester.jsx scores emotional triggers, power words, and split-test CTR potential.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side NLP',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Content Strategy',
    requirement: 'Podcast Show Notes & Chapter Formatter',
    matchingTool: 'Podcast Show Notes & Chapter Formatter (`podcast-show-notes-generator`)',
    evidence: 'src/tools/writing/PodcastShowNotesGenerator.jsx structures episode overviews, key takeaways, and timestamp chapters.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Content Strategy',
    requirement: 'YouTube Video SEO & Metadata Optimizer',
    matchingTool: 'YouTube Video SEO & Metadata Optimizer (`youtube-seo-optimizer`)',
    evidence: 'src/tools/marketing/YouTubeSeoOptimizer.jsx audits mobile title truncation, 00:00 chapter markers, and 500-char tag limits.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Content Strategy',
    requirement: 'Comprehensive Readability & Grade Level Analyzer',
    matchingTool: 'Reading Time Calculator (`reading-time-calc`) (Time duration only)',
    evidence: 'Estimates reading minutes, but does not calculate Flesch Reading Ease or grade levels.',
    status: 'PARTIALLY IMPLEMENTED',
    missingFeatures: 'Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog index, sentence length complexity.',
    dependency: 'Pure Client-Side (Linguistic formulas)',
    action: 'Implement Flesch-Kincaid & Multi-Index Readability Score Analyzer.'
  },

  // 5. Business Modeling
  {
    category: 'Business Modeling',
    requirement: 'Lean Canvas 1-Page Business Model Builder',
    matchingTool: 'Lean Canvas 1-Page Business Model Builder (`lean-canvas-business-builder`)',
    evidence: 'src/tools/business/LeanCanvasBusinessBuilder.jsx provides Ash Maurya\'s 9-box lean startup framework with copyable export.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Business Modeling',
    requirement: 'SaaS CAC Payback, LTV & Rule of 40 Matrix',
    matchingTool: 'SaaS CAC Payback, LTV & Rule of 40 Matrix (`saas-cac-payback-matrix`)',
    evidence: 'src/tools/business/SaasCacPaybackMatrix.jsx computes gross margin-adjusted CAC payback, LTV:CAC multiple, and Rule of 40.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Business Modeling',
    requirement: 'Startup Cash Runway & Burn Rate Calculator',
    matchingTool: 'Burn Rate Calculator (`burn-rate-calc`)',
    evidence: 'Computes monthly cash burn and runway months.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Business Modeling',
    requirement: 'SWOT & Strategic Analysis Matrix',
    matchingTool: 'None.',
    evidence: 'No interactive SWOT analysis matrix in registry.',
    status: 'MISSING',
    missingFeatures: 'Interactive 4-quadrant SWOT matrix (Strengths, Weaknesses, Opportunities, Threats) with strategic pairing and export.',
    dependency: 'Pure Client-Side',
    action: 'Implement Interactive SWOT Strategic Analysis Matrix.'
  },

  // 6. Sales Funnels & Pipeline
  {
    category: 'Sales Funnels & CRM',
    requirement: 'B2B Sales Funnel Velocity Calculator',
    matchingTool: 'B2B Sales Funnel Velocity Calculator (`sales-funnel-velocity-calculator`)',
    evidence: 'src/tools/business/SalesFunnelVelocityCalculator.jsx calculates pipeline revenue velocity, cycle time length, and monthly run rate.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Sales Funnels & CRM',
    requirement: 'Tiered Sales Commission & Quota Accelerator',
    matchingTool: 'Tiered Sales Commission & Quota Accelerator Calculator (`sales-commission-calculator`)',
    evidence: 'src/tools/business/SalesCommissionCalculator.jsx calculates quota tiers, accelerators, and total OTE.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Sales Funnels & CRM',
    requirement: 'B2B Lead Scoring & Qualification Matrix (BANT / MEDDPICC)',
    matchingTool: 'None.',
    evidence: 'No lead qualification scoring tool in registry.',
    status: 'MISSING',
    missingFeatures: 'BANT (Budget, Authority, Need, Timeline) and MEDDIC weighted scoring with qualification likelihood index.',
    dependency: 'Pure Client-Side Framework',
    action: 'Implement B2B Lead Scoring & BANT Qualification Matrix.'
  },

  // 7. Agency Operations
  {
    category: 'Agency Operations',
    requirement: 'Agency Client Retainer & Margin Calculator',
    matchingTool: 'Agency Client Retainer & Margin Calculator (`agency-retainer-calculator`)',
    evidence: 'src/tools/freelance/AgencyRetainerCalculator.jsx prices retainers with blended rates, scope buffers, and net profit margins.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Agency Operations',
    requirement: 'Agency Commercial Pitch Proposal & SOW Generator',
    matchingTool: 'Agency Client Pitch & Proposal Generator (`agency-pitch-proposal-generator`)',
    evidence: 'src/tools/freelance/AgencyPitchProposalGenerator.jsx generates formal statements of work, deliverable phases, and fee terms.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Agency Operations',
    requirement: 'Agency Blended Billing Rate & Team Capacity Calculator',
    matchingTool: 'Freelance Hourly Rate Calculator (`freelance-hourly-rate-calculator`) (Solo only)',
    evidence: 'Calculates individual solo freelancer rate, but not multi-person agency team capacity and blended rates.',
    status: 'PARTIALLY IMPLEMENTED',
    missingFeatures: 'Multi-role blended hourly rate, team billable capacity utilization (e.g. 75%), non-billable overhead, and target gross margin.',
    dependency: 'Pure Client-Side Math',
    action: 'Implement Agency Blended Rate & Team Capacity Calculator.'
  },

  // 8. Business Productivity
  {
    category: 'Business Productivity',
    requirement: 'Link-in-Bio Landing Page Builder',
    matchingTool: 'Link-in-Bio Landing Page Builder (`link-in-bio-builder`)',
    evidence: 'src/tools/social/LinkInBioBuilder.jsx builds responsive bio pages with live phone mockup and standalone HTML/CSS export.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side',
    action: 'Preserve active implementation.'
  },
  {
    category: 'Business Productivity',
    requirement: 'Meeting Cost & Time Waste Calculator',
    matchingTool: 'Real-Time Meeting Cost per Minute Calculator (`meeting-cost-per-minute-calculator`)',
    evidence: 'Computes cost per minute of team meetings based on attendee count and average salaries.',
    status: 'FULLY IMPLEMENTED',
    missingFeatures: 'None.',
    dependency: 'Pure Client-Side Math',
    action: 'Preserve active implementation.'
  }
];

// Generate CSV string
let csv = 'Category,Requirement,Matching Existing Tool,Status,Evidence of Functionality,Missing Features,API / Dependency Requirements,Recommended Action\n';

matrix.forEach(m => {
  csv += `"${m.category}","${m.requirement}","${m.matchingTool.replace(/"/g, '""')}","${m.status}","${m.evidence.replace(/"/g, '""')}","${m.missingFeatures.replace(/"/g, '""')}","${m.dependency.replace(/"/g, '""')}","${m.action.replace(/"/g, '""')}"\n`;
});

fs.writeFileSync('scripts/gap_analysis_matrix.csv', csv, 'utf8');
console.log('Saved CSV matrix to scripts/gap_analysis_matrix.csv');
