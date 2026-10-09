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

  // Fix bare emojis in JSX ternaries like `{copied ? ✓ : 📋}` -> `{copied ? '✓' : '📋'}`
  // or `{copiedKey === ... ? ✓ : 📋}`
  code = code.replace(/\{\s*([^?]+)\s*\?\s*([^:'"{}]+)\s*:\s*([^}'"]+)\s*\}/g, (match, cond, trueVal, falseVal) => {
    let t = trueVal.trim();
    let fa = falseVal.trim();
    
    // If not already wrapped in quotes or JSX
    if (!t.startsWith('"') && !t.startsWith("'") && !t.startsWith('<') && !t.startsWith('(') && t.length > 0 && isNaN(t) && t !== 'true' && t !== 'false' && t !== 'null') {
      t = `'${t}'`;
    }
    if (!fa.startsWith('"') && !fa.startsWith("'") && !fa.startsWith('<') && !fa.startsWith('(') && fa.length > 0 && isNaN(fa) && fa !== 'true' && fa !== 'false' && fa !== 'null') {
      fa = `'${fa}'`;
    }
    return `{${cond} ? ${t} : ${fa}}`;
  });

  fs.writeFileSync(f, code, 'utf8');
});

console.log('Fixed JSX string literals across all 21 files!');
