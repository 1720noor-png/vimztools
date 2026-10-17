const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', 'src', 'data', 'registry.js');

// 1. Read existing registry.js
let registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');

// Parse existing categories
const catStart = registryContent.indexOf('export const categories = [');
const catEnd = registryContent.indexOf('export const tools = [');
if (catStart === -1 || catEnd === -1) {
  console.error('Could not locate categories or tools in registry.js');
  process.exit(1);
}

const existingCatsCode = registryContent.slice(catStart + 'export const categories = '.length, catEnd).trim().replace(/;\s*$/, '');
const existingCategories = JSON.parse(existingCatsCode);
const existingCatSlugs = new Set(existingCategories.map(c => c.slug));

console.log(`Found ${existingCategories.length} existing categories.`);

// Parse existing tool slugs
const toolStart = registryContent.indexOf('export const tools = [');
const toolEnd = registryContent.indexOf('\nexport const related =');
const rawToolsCode = registryContent.substring(toolStart + 'export const tools = ['.length, toolEnd).trim().replace(/\]\s*$/, '');
const safeToolsJs = rawToolsCode.replace(/["']?Component["']?\s*:\s*([A-Za-z0-9_]+)/g, '"Component": "$1"');
const existingTools = new Function('return [' + safeToolsJs + ']')().filter(Boolean);
const existingToolSlugs = new Set(existingTools.map(t => t.slug));

console.log(`Found ${existingTools.length} existing tools.`);

// 2. Define the new categories
const NEW_CATEGORIES = [
  {
    slug: 'beauty-care-tools',
    name: 'Beauty, Skincare & Cosmetics',
    icon: '✨',
    desc: 'Sunscreen timers, ingredient conflict checkers, skin cycling, hair porosity, and cosmetic care.',
    accent: 'rose',
    subcategories: [
      { slug: 'skincare-routines', name: 'Skincare Routines & Timers' },
      { slug: 'hair-cosmetics', name: 'Hair, Makeup & Formulation' }
    ]
  },
  {
    slug: 'cooking-kitchen-tools',
    name: 'Cooking & Kitchen Precision',
    icon: '🍳',
    desc: 'Recipe scaling, oven conversions, spice substitutes, and meal planning.',
    accent: 'orange',
    subcategories: [
      { slug: 'recipe-scaling', name: 'Recipe Scaling & Substitutes' },
      { slug: 'kitchen-converters', name: 'Kitchen Units & Baking Timers' }
    ]
  },
  {
    slug: 'image-studio-tools',
    name: 'Image Studio & Canvas Tools',
    icon: '🖼️',
    desc: '300+ browser-based canvas tools for AI image editing, background removal, passport photos, and batch optimization.',
    accent: 'indigo',
    subcategories: [
      { slug: 'ai-enhancement', name: 'AI Enhancement & Filters' },
      { slug: 'background-cutout', name: 'Background & Cutouts' },
      { slug: 'passport-id', name: 'Passport & ID Photos' },
      { slug: 'compression-resize', name: 'Compression & Resizing' },
      { slug: 'formats-conversion', name: 'Format Conversion & OCR' }
    ]
  },
  {
    slug: 'femhealth-tools',
    name: "Women's Health & FemHealth",
    icon: '🌸',
    desc: 'Hormonal health, PCOS assessments, fertility cycle planners, and postpartum wellness.',
    accent: 'pink',
    subcategories: [
      { slug: 'hormonal-health', name: 'Hormonal Health & PCOS' },
      { slug: 'maternal-wellness', name: 'Maternal & Postpartum Wellness' }
    ]
  },
  {
    slug: 'student-academics-tools',
    name: 'Student Academics & Research Suite',
    icon: '🎓',
    desc: 'Thesis helpers, literature review, citation formatters, STEM equation solvers, and study planners.',
    accent: 'violet',
    subcategories: [
      { slug: 'academic-research', name: 'Academic Research & Writing' },
      { slug: 'stem-solvers', name: 'STEM Equation Solvers' },
      { slug: 'study-planning', name: 'Study Timers & Productivity' }
    ]
  },
  {
    slug: 'household-living-tools',
    name: 'Household & Fabric Care',
    icon: '🏡',
    desc: 'Stain removal solver, detergent calculators, fabric care, and home inventory.',
    accent: 'emerald',
    subcategories: [
      { slug: 'cleaning-fabric', name: 'Cleaning & Fabric Care' },
      { slug: 'home-inventory', name: 'Home Organization & Inventory' }
    ]
  },
  {
    slug: 'corporate-office-tools',
    name: 'Office, Dev & Corporate Utilities',
    icon: '💼',
    desc: 'Corporate tax deductions, freelance margins, SQL/Excel generators, JSON validators, and regex test benches.',
    accent: 'cyan',
    subcategories: [
      { slug: 'corporate-finance', name: 'Corporate & Freelance' },
      { slug: 'dev-parsers', name: 'Developer Parsers & Utilities' }
    ]
  },
  {
    slug: 'pdf-advanced-tools',
    name: 'Advanced PDF & Document Suite',
    icon: '📄',
    desc: 'Client-side PDF password protection, redacting, OCR, split/merge, and Word doc repair.',
    accent: 'sky',
    subcategories: [
      { slug: 'pdf-security', name: 'PDF Security & Privacy' },
      { slug: 'pdf-page-tools', name: 'Page Management & OCR' }
    ]
  },
  {
    slug: 'fitness-body-tools',
    name: 'Fitness & Body Composition',
    icon: '🏃',
    desc: 'US Navy body fat, lean mass, metabolic rates, macro splitters, and fasting schedules.',
    accent: 'teal',
    subcategories: [
      { slug: 'body-composition', name: 'Body Fat & Composition' },
      { slug: 'nutrition-fasting', name: 'Nutrition & Fasting' }
    ]
  },
  {
    slug: 'study-planning-tools',
    name: 'Study Planning & Timers',
    icon: '📚',
    desc: 'Interactive exam countdowns, assignment trackers, GPA calculators, and flashcard makers.',
    accent: 'blue',
    subcategories: [
      { slug: 'study-schedule', name: 'Timetables & Planners' },
      { slug: 'exam-prep', name: 'Exam Prep & Flashcards' }
    ]
  },
  {
    slug: 'career-work-tools',
    name: 'Career & Freelance Hub',
    icon: '💼',
    desc: 'CV/Resume builders, proposal generators, interview timers, and salary negotiation guides.',
    accent: 'slate',
    subcategories: [
      { slug: 'job-application', name: 'Resumes & Portfolios' },
      { slug: 'freelance-rates', name: 'Freelance & Productivity' }
    ]
  },
  {
    slug: 'personal-budget-tools',
    name: 'Personal Wealth & Budget',
    icon: '💰',
    desc: 'Bill trackers, debt payoff calculators, emergency funds, and Zakat estimators.',
    accent: 'green',
    subcategories: [
      { slug: 'budgeting', name: 'Daily & Monthly Budgets' },
      { slug: 'savings-debt', name: 'Debt & Savings Goals' }
    ]
  }
];

// Helper to convert PascalCase/camelCase to readable name
function toReadableName(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Helper to convert filename or PascalCase to kebab-case slug
function toSlug(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

const newToolEntries = [];

// 3. Scan src/pages/tools subdirectories
const TOOLS_BASE = path.join(__dirname, '..', 'src', 'pages', 'tools');
const CATEGORY_MAP = {
  'beauty': { cat: 'beauty-care-tools', icon: '✨', subcat: 'skincare-routines', subcatName: 'Skincare Routines & Timers' },
  'cooking': { cat: 'cooking-kitchen-tools', icon: '🍳', subcat: 'recipe-scaling', subcatName: 'Recipe Scaling & Substitutes' },
  'femhealth': { cat: 'femhealth-tools', icon: '🌸', subcat: 'hormonal-health', subcatName: 'Hormonal Health & PCOS' },
  'fitness': { cat: 'fitness-body-tools', icon: '🏃', subcat: 'body-composition', subcatName: 'Body Fat & Composition' },
  'household': { cat: 'household-living-tools', icon: '🏡', subcat: 'cleaning-fabric', subcatName: 'Cleaning & Fabric Care' },
  'home': { cat: 'household-living-tools', icon: '🏠', subcat: 'home-inventory', subcatName: 'Home Organization & Inventory' },
  'student': { cat: 'student-academics-tools', icon: '🎓', subcat: 'academic-research', subcatName: 'Academic Research & Writing' },
  'study': { cat: 'study-planning-tools', icon: '📚', subcat: 'study-schedule', subcatName: 'Timetables & Planners' },
  'career': { cat: 'career-work-tools', icon: '💼', subcat: 'job-application', subcatName: 'Resumes & Portfolios' },
  'money': { cat: 'personal-budget-tools', icon: '💰', subcat: 'budgeting', subcatName: 'Daily & Monthly Budgets' },
  'office': { cat: 'corporate-office-tools', icon: '🏢', subcat: 'corporate-finance', subcatName: 'Corporate & Freelance' },
  'pdf': { cat: 'pdf-advanced-tools', icon: '📄', subcat: 'pdf-security', subcatName: 'PDF Security & Privacy' },
  'document-word': { cat: 'pdf-advanced-tools', icon: '📝', subcat: 'pdf-page-tools', subcatName: 'Page Management & OCR' },
  'documents': { cat: 'pdf-advanced-tools', icon: '📑', subcat: 'pdf-page-tools', subcatName: 'Page Management & OCR' }
};

if (fs.existsSync(TOOLS_BASE)) {
  const folders = fs.readdirSync(TOOLS_BASE, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const folder of folders) {
    const mapping = CATEGORY_MAP[folder.name];
    if (!mapping) continue;

    const folderPath = path.join(TOOLS_BASE, folder.name);
    // Read recursively or direct files
    const files = fs.readdirSync(folderPath, { recursive: true }).filter(f => f.endsWith('.tsx') && !f.endsWith('.d.ts') && !f.includes('index.ts'));
    
    for (const file of files) {
      const baseName = path.basename(file, '.tsx');
      const slug = toSlug(baseName);

      const KNOWN_DUPLICATES = new Set([
        'gpa-cgpa-calculator',
        'percentage-calculator',
        'grade-calculator',
        'attendance-calculator',
        'unit-converter',
        'word-counter',
        'qr-code-generator',
        'text-to-speech',
        'bmi-calculator',
        'cgpa-calculator',
        'gpa-calculator'
      ]);

      if (KNOWN_DUPLICATES.has(slug) || existingToolSlugs.has(slug)) continue;
      existingToolSlugs.add(slug);

      const name = toReadableName(baseName);
      newToolEntries.push({
        cat: mapping.cat,
        subcat: mapping.subcat,
        subcatName: mapping.subcatName,
        slug: slug,
        name: name,
        icon: mapping.icon,
        desc: `Interactive ${name} tool running 100% client-side in your browser with offline download support.`,
        why: `Streamlines ${name.toLowerCase()} workflows with immediate results and data privacy.`,
        steps: [
          'Enter or select your desired parameters in the interactive panel.',
          'Review calculated results or instant live preview.',
          'Copy, export or download your deliverable for offline use.'
        ],
        keywords: `${name.toLowerCase()} ${slug.replace(/-/g, ' ')} calculator converter generator offline download tool`
      });
    }
  }
}

// 4. Scan image tools specs (src/pages/image-tools/specs/mod01.ts to mod20.ts)
const SPECS_DIR = path.join(__dirname, '..', 'src', 'pages', 'image-tools', 'specs');
if (fs.existsSync(SPECS_DIR)) {
  for (let i = 1; i <= 20; i++) {
    const modFile = path.join(SPECS_DIR, `mod${String(i).padStart(2, '0')}.ts`);
    if (!fs.existsSync(modFile)) continue;

    const modContent = fs.readFileSync(modFile, 'utf8');
    // Extract object definitions with id, title, and description
    const specBlocks = modContent.split(/(?=id:\s*['"])/g);
    for (const block of specBlocks) {
      const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
      const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
      const descMatch = block.match(/description:\s*['"]([^'"]+)['"]/);

      if (idMatch && !existingToolSlugs.has(idMatch[1])) {
        const slug = idMatch[1];
        existingToolSlugs.add(slug);

        const name = titleMatch ? titleMatch[1] : toReadableName(slug);
        const desc = descMatch ? descMatch[1] : `Interactive canvas image utility for ${name}.`;

        newToolEntries.push({
          cat: 'image-studio-tools',
          subcat: 'ai-enhancement',
          subcatName: 'AI Enhancement & Filters',
          slug: slug,
          name: name,
          icon: '🖼️',
          desc: desc,
          why: 'High-speed browser-based image canvas processing with no server uploads required.',
          steps: [
            'Upload or drag-and-drop your image file into the canvas.',
            'Adjust tuning sliders, resolution or filters in real-time.',
            'Download the final processed image in PNG, WebP or JPG format.'
          ],
          keywords: `${name.toLowerCase()} ${slug.replace(/-/g, ' ')} image canvas photo editor online tool`
        });
      }
    }
  }
}

console.log(`Prepared ${newToolEntries.length} new tool catalog entries!`);

// 5. Update Categories in registry.js
const updatedCategories = [...existingCategories];
for (const newCat of NEW_CATEGORIES) {
  if (!existingCatSlugs.has(newCat.slug)) {
    updatedCategories.push(newCat);
    existingCatSlugs.add(newCat.slug);
  }
}

console.log(`Total categories will be: ${updatedCategories.length}`);

// Format new categories as clean JSON string
const updatedCatsJson = JSON.stringify(updatedCategories, null, 2);

// Format new tools as JSON objects without outer brackets
const newToolsCode = newToolEntries.map(t => '  ' + JSON.stringify(t)).join(',\n');

// 6. Splice updated categories and tools back into registry.js
const beforeCats = registryContent.substring(0, catStart);
const afterCatsBeforeTools = registryContent.substring(catEnd, toolStart + 'export const tools = [\n'.length);
const afterTools = registryContent.substring(toolEnd);

// Check if rawToolsCode ends with comma
const needsComma = rawToolsCode.trim().length > 0 && !rawToolsCode.trim().endsWith(',');

const finalRegistryContent = 
  beforeCats + 
  'export const categories = ' + updatedCatsJson + ';\n\n' +
  afterCatsBeforeTools +
  rawToolsCode + (needsComma ? ',\n' : '\n') +
  newToolsCode + '\n];\n\n' +
  afterTools;

fs.writeFileSync(REGISTRY_PATH, finalRegistryContent, 'utf8');
console.log('Successfully updated src/data/registry.js!');
