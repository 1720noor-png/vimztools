const fs = require('fs');

const audit = JSON.parse(fs.readFileSync('scripts/audit_results.json', 'utf8'));
const { categories, tools } = audit;

console.log('Categories defined in categories array:', categories.length);

// Count tools per category
const toolsByCat = {};
tools.forEach(t => {
  toolsByCat[t.cat] = (toolsByCat[t.cat] || 0) + 1;
});

// Categories referenced by tools
const toolCats = Object.keys(toolsByCat);
console.log('Unique categories referenced by tools:', toolCats.length);

// Are there categories defined in categories array that have 0 tools?
const emptyCats = categories.filter(c => !toolsByCat[c.slug]);
console.log('Categories in categories array with 0 tools:', emptyCats.map(c => c.slug));

// Are there tool categories not defined in categories array?
const catSlugs = new Set(categories.map(c => c.slug));
const unlistedCats = toolCats.filter(c => !catSlugs.has(c));
console.log('Tool categories not in categories array:', unlistedCats);

// Subcategories audit
let totalSubcatsInDef = 0;
const subcatsByCat = {};
categories.forEach(c => {
  const sublist = c.subcategories || [];
  totalSubcatsInDef += sublist.length;
  subcatsByCat[c.slug] = sublist;
});
console.log('Total subcategories in category definitions:', totalSubcatsInDef);

// Subcategories used by tools
const toolsBySubcat = {};
tools.forEach(t => {
  const key = `${t.cat}::${t.subcat}`;
  toolsBySubcat[key] = (toolsBySubcat[key] || 0) + 1;
});
console.log('Unique cat::subcat combinations used by tools:', Object.keys(toolsBySubcat).length);

// Tools without subcat
const toolsNoSubcat = tools.filter(t => !t.subcat);
console.log('Tools with empty subcat:', toolsNoSubcat.length);

// Duplicate check
const slugMap = {};
const nameMap = {};
const dupSlugs = [];
const dupNames = [];

tools.forEach(t => {
  if (slugMap[t.slug]) {
    dupSlugs.push({ slug: t.slug, firstId: slugMap[t.slug], secondId: t.id });
  } else {
    slugMap[t.slug] = t.id;
  }

  const normName = t.name.toLowerCase().trim();
  if (nameMap[normName]) {
    dupNames.push({ name: t.name, firstId: nameMap[normName], secondId: t.id });
  } else {
    nameMap[normName] = t.id;
  }
});

console.log('Duplicate slugs count:', dupSlugs.length);
console.log('Duplicate names count:', dupNames.length);
if (dupNames.length > 0) {
  console.log('Duplicate names details:', dupNames);
}

// Group tools per category report
const catSummary = categories.map(c => {
  const toolCount = toolsByCat[c.slug] || 0;
  const subcats = (c.subcategories || []).map(sc => {
    const scCount = toolsBySubcat[`${c.slug}::${sc.slug}`] || 0;
    return {
      slug: sc.slug,
      name: sc.name,
      toolCount: scCount
    };
  });
  return {
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    toolCount,
    subcategories: subcats
  };
});

fs.writeFileSync('scripts/category_breakdown.json', JSON.stringify({
  totalTools: tools.length,
  totalCategories: categories.length,
  totalSubcategories: totalSubcatsInDef,
  duplicateSlugs: dupSlugs,
  duplicateNames: dupNames,
  toolsWithoutSubcat: toolsNoSubcat.map(t => ({ id: t.id, name: t.name, slug: t.slug, cat: t.cat })),
  categorySummary: catSummary
}, null, 2));

console.log('Breakdown saved to scripts/category_breakdown.json');
