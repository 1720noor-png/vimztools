const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', 'src', 'data', 'registry.js');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'tool-index.json');

console.log('Generating Vimz.ai Tool Index from registry.js...');

const content = fs.readFileSync(registryPath, 'utf8');

const startIdx = content.indexOf('export const tools = [');
const endIdx = content.indexOf('\nexport const related =');

if (startIdx === -1 || endIdx === -1) {
  console.error('Delimiters not found in registry.js');
  process.exit(1);
}

const rawTools = content.substring(startIdx + 'export const tools = ['.length, endIdx).trim();
const cleanTools = rawTools.replace(/\]\s*$/, '');
const safeJs = cleanTools.replace(/["']?Component["']?\s*:\s*([A-Za-z0-9_]+)/g, '"Component": "$1"');

const rawToolList = new Function('return [' + safeJs + ']')().filter(Boolean);
console.log(`Extracted ${rawToolList.length} valid raw tools from registry.`);

// Roman Urdu & Domain Synonyms Dictionary
const CATEGORY_SYNONYMS_UR = {
  'finance-tools': ['paisa', 'sood', 'munafa', 'sarmaya', 'bachat', 'qarz', 'kist', 'kamai', 'kharcha', 'mehangai', 'daulat', 'bank', 'invest'],
  'student-tools': ['parhai', 'taleem', 'number', 'marks', 'hazri', 'imtihan', 'dakhla', 'result', 'feesadh', 'college', 'university', 'school'],
  'math-tools': ['hisab', 'riyazi', 'murabba', 'square', 'pahara', 'percentage', 'formula', 'divide', 'average'],
  'health-tools': ['sehat', 'wazan', 'motapa', 'kamzori', 'diet', 'roza', 'dil', 'dharkan', 'charbi', 'paani', 'neend', 'doctor'],
  'career-tools': ['naukri', 'mulazmat', 'rozgar', 'resume', 'cv', 'interview', 'salary', 'tankhwah', 'job'],
  'business-tools': ['karobar', 'munafa', 'nuqsan', 'grahak', 'client', 'bill', 'invoice', 'sales', 'profit', 'loss'],
  'freelance-tools': ['freelancer', 'client', 'retainer', 'ghanta rate', 'hourly rate', 'kamai', 'online job'],
  'developer-tools': ['coding', 'programmer', 'software', 'code', 'base64', 'hash', 'password', 'format', 'json'],
  'writing-tools': ['likhna', 'mazmoon', 'insha', 'urdu', 'grammar', 'jumla', 'alfaz', 'words', 'essay'],
  'converter-tools': ['tabdeel karna', 'badalna', 'inch', 'meter', 'kilo', 'gram', 'darja hararat', 'speed'],
  'construction-tools': ['makan', 'tameer', 'cement', 'eent', 'paint', 'kamra', 'plinth', 'chhat']
};

const SPECIFIC_KEYWORD_RULES = [
  { match: /rule.*72|doubling/i, ur: ['paisa double', 'kitne saal me double', 'sarmaya double', 'money double'] },
  { match: /attendance/i, ur: ['hazri', 'short attendance', 'chhutti', 'classes attend', 'hazri percentage'] },
  { match: /gpa|cgpa/i, ur: ['gpa calculate', 'cgpa score', 'university grade point', 'semester gpa'] },
  { match: /grade/i, ur: ['marks grade', 'assessment number', 'exam grade'] },
  { match: /percentage/i, ur: ['feesadh', 'percentage nikalna', 'kitne percent'] },
  { match: /mortgage|emi/i, ur: ['ghar ki kist', 'home loan emi', 'makan qarz', 'monthly installment'] },
  { match: /tip/i, ur: ['bakhsheesh', 'bill hisab', 'dost bill split', 'restaurant tip'] },
  { match: /salary|wage/i, ur: ['tankhwah', 'monthly to hourly', 'per hour kamai', 'monthly pay'] },
  { match: /debt|dti/i, ur: ['qarz', 'karza wapsi', 'debt ratio', 'dti'] },
  { match: /emergency.*fund/i, ur: ['emergency bachat', 'mushkil waqt bachat', 'emergency savings'] },
  { match: /dcf|discounted cash flow/i, ur: ['company valuation', 'fair value', 'stock price value'] },
  { match: /net.*worth/i, ur: ['kul daulat', 'personal net worth', 'asase aur qarz'] },
  { match: /dividend|drip/i, ur: ['share ka munafa', 'drip growth', 'stock dividend'] },
  { match: /credit.*card/i, ur: ['credit card ka qarz', 'minimum payment payoff'] },
  { match: /inflation/i, ur: ['mehangai ka asar', 'real return', 'purchasing power'] },
  { match: /loan.*payoff/i, ur: ['qarz jaldi khatam', 'extra payment loan'] },
  { match: /529|college.*saving/i, ur: ['bachon ki parhai fund', 'college savings'] },
  { match: /sip|systematic investment/i, ur: ['mahina sarmaya kari', 'sip mutual fund', 'sip return'] },
  { match: /quadratic/i, ur: ['do darji masawat', 'quadratic roots', 'x value formula'] },
  { match: /gcd|lcm/i, ur: ['aad e aazam', 'zuaaf e aql', 'common factor', 'lcm gcd'] },
  { match: /standard.*deviation|variance/i, ur: ['inheeraf', 'data spread', 'statistics deviation'] },
  { match: /bmi|body mass/i, ur: ['sehatmand wazan', 'motapa check', 'bmi calculator'] },
  { match: /calorie/i, ur: ['wazan kam karna', 'calorie deficit', 'diet food'] },
  { match: /water/i, ur: ['paani kitna peena', 'daily water intake'] },
  { match: /sleep/i, ur: ['neend ka waqt', 'sleep cycle', 'bedtime'] },
  { match: /json/i, ur: ['json format', 'json beautify', 'json validate'] },
  { match: /base64/i, ur: ['base64 encode', 'base64 decode'] },
  { match: /password/i, ur: ['mazboot password', 'secure password generator'] }
];

const enrichedTools = rawToolList.map((t, idx) => {
  const slug = t.slug || `tool-${idx + 1}`;
  const name = t.name || slug;
  const cat = t.cat || '';
  const subcat = t.subcat || '';
  const subcatName = t.subcatName || '';
  const desc = t.desc || '';
  const why = t.why || '';
  const icon = t.icon || '🛠️';

  // Base english keywords
  const rawKeywords = typeof t.keywords === 'string' ? t.keywords.toLowerCase().split(/\s+/).filter(Boolean) : [];
  
  // Extract words from name & slug
  const nameWords = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
  const slugWords = slug.toLowerCase().split('-').filter((w) => w.length > 2);
  
  const allEngKeywords = Array.from(new Set([...rawKeywords, ...nameWords, ...slugWords]));

  // Build Roman Urdu keywords
  const urKeywords = new Set();
  
  // Add category-level Roman Urdu synonyms
  if (CATEGORY_SYNONYMS_UR[cat]) {
    CATEGORY_SYNONYMS_UR[cat].forEach((w) => urKeywords.add(w));
  }

  // Check specific keyword rules
  const fullHaystack = `${name} ${slug} ${desc} ${cat} ${allEngKeywords.join(' ')}`;
  for (const rule of SPECIFIC_KEYWORD_RULES) {
    if (rule.match.test(fullHaystack)) {
      rule.ur.forEach((w) => urKeywords.add(w));
    }
  }

  return {
    id: slug,
    slug,
    name,
    cat,
    subcat,
    subcatName,
    desc,
    why,
    icon,
    keywords: allEngKeywords.join(' '),
    keywords_ur: Array.from(urKeywords).join(' '),
    level: 'L1' // Fast client-side executable tool
  };
});

fs.writeFileSync(outputPath, JSON.stringify(enrichedTools, null, 2), 'utf8');
console.log(`Generated enriched tool index at ${outputPath} with ${enrichedTools.length} tools!`);
