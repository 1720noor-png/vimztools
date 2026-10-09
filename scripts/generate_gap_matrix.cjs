const fs = require('fs');

const tools = JSON.parse(fs.readFileSync('scripts/all_1036_tools.json', 'utf8'));

// Define the comprehensive requirements across all 8 requested areas:
const requirements = [
  // 1. Social Media Media Downloads
  {
    category: 'Social Media Media Downloads',
    req: 'YouTube Video & Audio Download',
    desc: 'Download raw YouTube MP4 video and MP3 audio directly from URL.',
    expected: 'Direct video/audio binary file streaming from YouTube'
  },
  {
    category: 'Social Media Media Downloads',
    req: 'YouTube HD Thumbnail Download',
    desc: 'Extract and download 1080p MaxRes, HD, HQ, SD video thumbnails.',
    expected: 'Full resolution thumbnail image download'
  },
  {
    category: 'Social Media Media Downloads',
    req: 'Instagram Video / Reels Download',
    desc: 'Download Instagram video MP4 files directly from URL.',
    expected: 'Direct MP4 stream extraction from Instagram post'
  },
  {
    category: 'Social Media Media Downloads',
    req: 'Instagram Photo / Carousel Download',
    desc: 'Download multi-slide carousel images and single post photos.',
    expected: 'Direct JPG/PNG download from Instagram post'
  },
  {
    category: 'Social Media Media Downloads',
    req: 'TikTok Video Download (No Watermark)',
    desc: 'Download raw TikTok video without watermark.',
    expected: 'Direct MP4 stream extraction from TikTok link'
  },
  {
    category: 'Social Media Media Downloads',
    req: 'X / Twitter Video & GIF Download',
    desc: 'Extract and download MP4 video and GIF clips from tweets.',
    expected: 'Direct video file download from tweet URL'
  },
  {
    category: 'Social Media Media Downloads',
    req: 'Pinterest Image & Pin Extractor',
    desc: 'Download high-resolution image pins from Pinterest URL.',
    expected: 'Direct image extraction from pin'
  },

  // 2. Digital Marketing
  {
    category: 'Digital Marketing',
    req: 'UTM Campaign URL Builder',
    desc: 'Build tracked URLs with utm_source, utm_medium, utm_campaign, etc.',
    expected: 'URL generation with query parameters'
  },
  {
    category: 'Digital Marketing',
    req: 'Multi-Touch Attribution & ROAS Modeler',
    desc: 'Model First-Touch, Last-Touch, and Linear revenue attribution.',
    expected: 'Attribution calculations across channels'
  },
  {
    category: 'Digital Marketing',
    req: 'Ad Spend ROI / ROAS & Break-Even Calculator',
    desc: 'Calculate target ROAS, CPA, break-even ad spend, and profit margins.',
    expected: 'Formulaic advertising unit economics'
  },
  {
    category: 'Digital Marketing',
    req: 'A/B Test Statistical Significance Calculator',
    desc: 'Determine conversion rate confidence and statistical significance.',
    expected: 'P-value, sample size, and significance calculation'
  },
  {
    category: 'Digital Marketing',
    req: 'Email Campaign CTR & Open Rate Benchmarker',
    desc: 'Analyze email delivery, open rate, CTR, and list decay.',
    expected: 'Email performance metrics calculations'
  },

  // 3. Search Engine Optimization (SEO)
  {
    category: 'SEO',
    req: 'Robots.txt & Crawler Directives Builder',
    desc: 'Visual editor for user-agent allow/disallow and sitemap indexing.',
    expected: 'Direct text file generation'
  },
  {
    category: 'SEO',
    req: 'XML Sitemap Generator / Validator',
    desc: 'Generate compliant XML sitemap protocol structures.',
    expected: 'XML output formatting'
  },
  {
    category: 'SEO',
    req: 'Google Schema JSON-LD Generator',
    desc: 'Generate rich snippet JSON-LD for Articles, FAQs, and Products.',
    expected: 'Valid Schema.org script output'
  },
  {
    category: 'SEO',
    req: 'Open Graph & Social Card Previewer',
    desc: 'Simulate Twitter, Facebook, and LinkedIn feed preview cards.',
    expected: 'Visual card preview + meta tag generation'
  },
  {
    category: 'SEO',
    req: 'SEO 301 / 302 Redirect Map Builder',
    desc: 'Generate Apache .htaccess, Nginx, and Netlify migration rules.',
    expected: 'Server config generation'
  },
  {
    category: 'SEO',
    req: 'Keyword Intent Clustering Tool',
    desc: 'Cluster raw keyword lists into Informational, Commercial, Transactional.',
    expected: 'Semantic categorization + CSV export'
  },
  {
    category: 'SEO',
    req: 'SERP Title & Meta Description Pixel Truncation Previewer',
    desc: 'Test Google desktop (600px) and mobile pixel width truncation.',
    expected: 'Accurate pixel width measurement & snippet preview'
  },
  {
    category: 'SEO',
    req: 'Canonical Tag & Hreflang Language Header Generator',
    desc: 'Generate multilingual hreflang and self-referencing canonical tags.',
    expected: 'HTML and HTTP header tag markup'
  },

  // 4. Content Strategy & Operations
  {
    category: 'Content Strategy',
    req: 'Multi-Channel Content Repurposing Matrix',
    desc: 'Transform long-form text into 5 cross-platform content formats.',
    expected: 'Cross-channel text transformation'
  },
  {
    category: 'Content Strategy',
    req: 'Editorial Publishing Calendar',
    desc: 'Plan, schedule, and filter content across thematic pillars.',
    expected: 'Publishing schedule with CSV export'
  },
  {
    category: 'Content Strategy',
    req: 'Headline A/B Power & CTR Tester',
    desc: 'Compare headlines for emotional triggers and power words.',
    expected: 'Emotional scoring and split test analysis'
  },
  {
    category: 'Content Strategy',
    req: 'Podcast Show Notes & Chapter Timestamp Formatter',
    desc: 'Generate structured show notes, timestamps, and guest summaries.',
    expected: 'Formatted show notes output'
  },
  {
    category: 'Content Strategy',
    req: 'Short-Form Video Hook & Pacing Script Generator',
    desc: 'Viral 3-second hooks, pacing cues, and timed video scripts.',
    expected: 'Script generation'
  },
  {
    category: 'Content Strategy',
    req: 'Readability & Flesch-Kincaid Grade Level Analyzer',
    desc: 'Score text reading ease and grade level for audience clarity.',
    expected: 'Syllable / sentence complexity formulas'
  },

  // 5. Business Modeling
  {
    category: 'Business Modeling',
    req: 'Lean Canvas 1-Page Business Model Builder',
    desc: '9-box Lean Startup business model planning board.',
    expected: 'Interactive 9-box canvas'
  },
  {
    category: 'Business Modeling',
    req: 'SaaS CAC Payback, LTV & Rule of 40 Matrix',
    desc: 'Gross margin-adjusted payback, LTV:CAC multiple, Rule of 40 score.',
    expected: 'Unit economics and valuation metrics'
  },
  {
    category: 'Business Modeling',
    req: 'Startup Runway & Cash Burn Rate Calculator',
    desc: 'Calculate net cash burn, runway months, and zero-cash date.',
    expected: 'Runway forecasting formulas'
  },
  {
    category: 'Business Modeling',
    req: 'Break-Even & Contribution Margin Calculator',
    desc: 'Determine break-even sales volume and revenue threshold.',
    expected: 'Break-even formulas'
  },

  // 6. Sales Funnels & Pipeline
  {
    category: 'Sales Funnels & CRM',
    req: 'B2B Sales Funnel Velocity Calculator',
    desc: 'Calculate pipeline revenue velocity and 30-day run rate.',
    expected: 'Sales velocity formulas'
  },
  {
    category: 'Sales Funnels & CRM',
    req: 'Tiered Sales Commission & Quota Accelerator Calculator',
    desc: 'Calculate tiered quota accelerators and total OTE earnings.',
    expected: 'Commission tier breakdown'
  },
  {
    category: 'Sales Funnels & CRM',
    req: 'Lead Scoring & Qualification Matrix (BANT / MEDDIC)',
    desc: 'Score inbound leads based on Budget, Authority, Need, Timeline.',
    expected: 'Weighted scoring framework'
  },

  // 7. Agency Operations & Pricing
  {
    category: 'Agency Operations',
    req: 'Agency Client Retainer & Margin Calculator',
    desc: 'Price retainers with blended rates, scope buffers, and profit margins.',
    expected: 'Retainer pricing formulas'
  },
  {
    category: 'Agency Operations',
    req: 'Agency Commercial Pitch Proposal & SOW Generator',
    desc: 'Generate statements of work, deliverable phases, and pricing terms.',
    expected: 'Formatted contract/SOW generation'
  },
  {
    category: 'Agency Operations',
    req: 'Agency Blended Billing Rate & Utilization Calculator',
    desc: 'Calculate billable capacity, overhead markup, and target rate.',
    expected: 'Utilization & rate formulas'
  },

  // 8. Business Productivity & Utilities
  {
    category: 'Business Productivity',
    req: 'Link-in-Bio Landing Page Builder',
    desc: 'Create mobile link hubs with live phone mockup and HTML/CSS export.',
    expected: 'Custom bio page generator'
  },
  {
    category: 'Business Productivity',
    req: 'Instagram Grid & Seamless Carousel Splitter',
    desc: 'Calculate canvas pixels and slice coordinate guides.',
    expected: 'Figma/Photoshop slicing guides'
  },
  {
    category: 'Business Productivity',
    req: 'Meeting Cost & Time Waste Calculator',
    desc: 'Calculate dollar cost per minute of team meetings based on salaries.',
    expected: 'Meeting cost formulas'
  }
];

// Match each requirement against tools
const report = [];

requirements.forEach(r => {
  const matches = tools.filter(t => {
    const hay = `${t.name} ${t.slug} ${t.desc}`.toLowerCase();
    const reqWords = r.req.toLowerCase().split(/[\s/&-]+/).filter(w => w.length > 2);
    const score = reqWords.filter(w => hay.includes(w)).length;
    return score >= Math.min(2, reqWords.length);
  });

  report.push({
    ...r,
    matchedTools: matches.map(m => `${m.name} (\`${m.slug}\`)`)
  });
});

fs.writeFileSync('scripts/matrix_audit.json', JSON.stringify(report, null, 2), 'utf8');
console.log(`Analyzed ${requirements.length} requirements. Saved to scripts/matrix_audit.json`);
