const fs = require('fs');

const files = [
  'src/tools/social/YouTubeThumbnailExtractor.jsx',
  'src/tools/social/ContentRepurposingMatrix.jsx',
  'src/tools/social/LinkInBioBuilder.jsx',
  'src/tools/social/ReelsHookScriptGenerator.jsx',
  'src/tools/social/InstagramGridCarouselSplitter.jsx',
  'src/tools/marketing/SeoKeywordClusteringTool.jsx',
  'src/tools/marketing/RobotsSitemapGenerator.jsx',
  'src/tools/marketing/SchemaJsonLdGenerator.jsx',
  'src/tools/marketing/OpenGraphCardPreviewer.jsx',
  'src/tools/marketing/SeoRedirectMapBuilder.jsx',
  'src/tools/marketing/ContentEditorialCalendar.jsx',
  'src/tools/marketing/YouTubeSeoOptimizer.jsx',
  'src/tools/writing/HeadlineAbPowerTester.jsx',
  'src/tools/writing/PodcastShowNotesGenerator.jsx',
  'src/tools/business/LeanCanvasBusinessBuilder.jsx',
  'src/tools/business/SalesFunnelVelocityCalculator.jsx',
  'src/tools/business/SaasCacPaybackMatrix.jsx',
  'src/tools/business/SalesCommissionCalculator.jsx',
  'src/tools/freelance/AgencyRetainerCalculator.jsx',
  'src/tools/freelance/MarketingAttributionRoiModel.jsx',
  'src/tools/freelance/AgencyPitchProposalGenerator.jsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  // Remove lucide-react import
  code = code.replace(/import\s*\{[^}]*\}\s*from\s*['"]lucide-react['"];?\n?/g, '');
  
  // Replace Lucide component JSX with emoji/text
  const replacements = [
    { regex: /<Sparkles\s*className="[^"]*"\s*\/>/g, text: '✨' },
    { regex: /<Copy\s*className="[^"]*"\s*\/>/g, text: '📋' },
    { regex: /<Check\s*className="[^"]*"\s*\/>/g, text: '✓' },
    { regex: /<RefreshCw\s*className="[^"]*"\s*\/>/g, text: '🔄' },
    { regex: /<Share2\s*className="[^"]*"\s*\/>/g, text: '↗️' },
    { regex: /<Layers\s*className="[^"]*"\s*\/>/g, text: '📑' },
    { regex: /<FileText\s*className="[^"]*"\s*\/>/g, text: '📄' },
    { regex: /<Send\s*className="[^"]*"\s*\/>/g, text: '🚀' },
    { regex: /<Download\s*className="[^"]*"\s*\/>/g, text: '📥' },
    { regex: /<Plus\s*className="[^"]*"\s*\/>/g, text: '➕' },
    { regex: /<Trash2\s*className="[^"]*"\s*\/>/g, text: '🗑️' },
    { regex: /<Eye\s*className="[^"]*"\s*\/>/g, text: '👁️' },
    { regex: /<Code\s*className="[^"]*"\s*\/>/g, text: '💻' },
    { regex: /<Smartphone\s*className="[^"]*"\s*\/>/g, text: '📱' },
    { regex: /<Palette\s*className="[^"]*"\s*\/>/g, text: '🎨' },
    { regex: /<ExternalLink\s*className="[^"]*"\s*\/>/g, text: '↗' },
    { regex: /<Video\s*className="[^"]*"\s*\/>/g, text: '🎥' },
    { regex: /<Play\s*className="[^"]*"\s*\/>/g, text: '▶️' },
    { regex: /<Film\s*className="[^"]*"\s*\/>/g, text: '🎬' },
    { regex: /<ArrowRight\s*className="[^"]*"\s*\/>/g, text: '→' },
    { regex: /<LayoutGrid\s*className="[^"]*"\s*\/>/g, text: '📐' },
    { regex: /<Image\s*className="[^"]*"\s*\/>/g, text: '🖼️' },
    { regex: /<Info\s*className="[^"]*"\s*\/>/g, text: 'ℹ️' },
    { regex: /<Search\s*className="[^"]*"\s*\/>/g, text: '🔍' },
    { regex: /<Filter\s*className="[^"]*"\s*\/>/g, text: '⚡' },
    { regex: /<AlertTriangle\s*className="[^"]*"\s*\/>/g, text: '⚠️' },
    { regex: /<FileCode\s*className="[^"]*"\s*\/>/g, text: '📄' },
    { regex: /<Shield\s*className="[^"]*"\s*\/>/g, text: '🛡️' },
    { regex: /<Globe\s*className="[^"]*"\s*\/>/g, text: '🌐' },
    { regex: /<HelpCircle\s*className="[^"]*"\s*\/>/g, text: '❓' },
    { regex: /<CheckCircle2\s*className="[^"]*"\s*\/>/g, text: '✓' },
    { regex: /<CheckCircle\s*className="[^"]*"\s*\/>/g, text: '✓' },
    { regex: /<ShieldCheck\s*className="[^"]*"\s*\/>/g, text: '🛡️' },
    { regex: /<AlignLeft\s*className="[^"]*"\s*\/>/g, text: '📝' },
    { regex: /<ArrowRightLeft\s*className="[^"]*"\s*\/>/g, text: '⇄' },
    { regex: /<Calendar\s*className="[^"]*"\s*\/>/g, text: '📅' },
    { regex: /<Youtube\s*className="[^"]*"\s*\/>/g, text: '📺' },
    { regex: /<Hash\s*className="[^"]*"\s*\/>/g, text: '#' },
    { regex: /<Clock\s*className="[^"]*"\s*\/>/g, text: '⏱️' },
    { regex: /<AlertCircle\s*className="[^"]*"\s*\/>/g, text: '⚠️' },
    { regex: /<Type\s*className="[^"]*"\s*\/>/g, text: '🔤' },
    { regex: /<TrendingUp\s*className="[^"]*"\s*\/>/g, text: '📈' },
    { regex: /<Mic\s*className="[^"]*"\s*\/>/g, text: '🎙️' },
    { regex: /<UserCheck\s*className="[^"]*"\s*\/>/g, text: '👤' },
    { regex: /<ListOrdered\s*className="[^"]*"\s*\/>/g, text: '📋' },
    { regex: /<Layout\s*className="[^"]*"\s*\/>/g, text: '📐' },
    { regex: /<Gauge\s*className="[^"]*"\s*\/>/g, text: '⚡' },
    { regex: /<DollarSign\s*className="[^"]*"\s*\/>/g, text: '$' },
    { regex: /<Percent\s*className="[^"]*"\s*\/>/g, text: '%' },
    { regex: /<BarChart2\s*className="[^"]*"\s*\/>/g, text: '📊' },
    { regex: /<Award\s*className="[^"]*"\s*\/>/g, text: '🏆' },
    { regex: /<Users\s*className="[^"]*"\s*\/>/g, text: '👥' },
    { regex: /<Briefcase\s*className="[^"]*"\s*\/>/g, text: '💼' },
    { regex: /<PieChart\s*className="[^"]*"\s*\/>/g, text: '🥧' },
    { regex: /<Building\s*className="[^"]*"\s*\/>/g, text: '🏢' },
    // Also handle self closing without className or with different props
    { regex: /<[A-Z][a-zA-Z0-9]*\s*className=\{[^}]*\}\s*\/>/g, text: '•' },
    { regex: /<Icon\s+className="[^"]*"\s*\/>/g, text: '•' },
    { regex: /icon:\s*[A-Z][a-zA-Z0-9]*/g, text: 'icon: "⚡"' }
  ];

  replacements.forEach(r => {
    code = code.replace(r.regex, r.text);
  });

  fs.writeFileSync(f, code, 'utf8');
});

console.log('Successfully cleaned all icon imports across 21 tools!');
