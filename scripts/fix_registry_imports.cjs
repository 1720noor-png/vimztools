const fs = require('fs');

const path = 'src/data/registry.js';
const raw = fs.readFileSync(path, 'utf8');
const lines = raw.split(/\r?\n/);

const newLines = [];
let removedCount = 0;
let insertedImports = false;

const staticImports = [
  "import YouTubeThumbnailExtractorTool from '../tools/social/YouTubeThumbnailExtractor.jsx'",
  "import ContentRepurposingMatrixTool from '../tools/social/ContentRepurposingMatrix.jsx'",
  "import LinkInBioBuilderTool from '../tools/social/LinkInBioBuilder.jsx'",
  "import ReelsHookScriptGeneratorTool from '../tools/social/ReelsHookScriptGenerator.jsx'",
  "import InstagramGridCarouselSplitterTool from '../tools/social/InstagramGridCarouselSplitter.jsx'",
  "import SeoKeywordClusteringTool from '../tools/marketing/SeoKeywordClusteringTool.jsx'",
  "import RobotsSitemapGeneratorTool from '../tools/marketing/RobotsSitemapGenerator.jsx'",
  "import SchemaJsonLdGeneratorTool from '../tools/marketing/SchemaJsonLdGenerator.jsx'",
  "import OpenGraphCardPreviewerTool from '../tools/marketing/OpenGraphCardPreviewer.jsx'",
  "import SeoRedirectMapBuilderTool from '../tools/marketing/SeoRedirectMapBuilder.jsx'",
  "import ContentEditorialCalendarTool from '../tools/marketing/ContentEditorialCalendar.jsx'",
  "import YouTubeSeoOptimizerTool from '../tools/marketing/YouTubeSeoOptimizer.jsx'",
  "import HeadlineAbPowerTesterTool from '../tools/writing/HeadlineAbPowerTester.jsx'",
  "import PodcastShowNotesGeneratorTool from '../tools/writing/PodcastShowNotesGenerator.jsx'",
  "import LeanCanvasBusinessBuilderTool from '../tools/business/LeanCanvasBusinessBuilder.jsx'",
  "import SalesFunnelVelocityCalculatorTool from '../tools/business/SalesFunnelVelocityCalculator.jsx'",
  "import SaasCacPaybackMatrixTool from '../tools/business/SaasCacPaybackMatrix.jsx'",
  "import SalesCommissionCalculatorTool from '../tools/business/SalesCommissionCalculator.jsx'",
  "import AgencyRetainerCalculatorTool from '../tools/freelance/AgencyRetainerCalculator.jsx'",
  "import MarketingAttributionRoiModelTool from '../tools/freelance/MarketingAttributionRoiModel.jsx'",
  "import AgencyPitchProposalGeneratorTool from '../tools/freelance/AgencyPitchProposalGenerator.jsx'"
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Insert static imports right after StairRiserTreadCalcTool import
  if (line.includes("import StairRiserTreadCalcTool from '../tools/construction/StairRiserTreadCalcTool.jsx'")) {
    newLines.push(line);
    staticImports.forEach(imp => newLines.push(imp));
    insertedImports = true;
    continue;
  }

  // Skip the 21 lazy lines
  if (line.trim().startsWith('const ') && line.includes('lazy(')) {
    removedCount++;
    continue;
  }

  newLines.push(line);
}

console.log(`Inserted static imports: ${insertedImports}`);
console.log(`Removed lazy lines: ${removedCount}`);

if (!insertedImports || removedCount !== 21) {
  console.error('Validation failed! Aborting.');
  process.exit(1);
}

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log('Successfully updated src/data/registry.js!');
