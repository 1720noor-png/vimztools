const fs = require('fs');

let content = fs.readFileSync('src/data/registry.js', 'utf8');

// Parse categories to know valid subcategories per category slug
const catStart = content.indexOf('export const categories = [');
const catEnd = content.indexOf('export const tools = [');
const categoriesBlock = content.slice(catStart + 'export const categories = '.length, catEnd).trim();
const categories = eval('(' + categoriesBlock.replace(/;*\s*$/, '') + ')');

const catSubcatMap = {};
categories.forEach(c => {
  catSubcatMap[c.slug] = (c.subcategories || []).map(sc => ({ slug: sc.slug, name: sc.name }));
});

// Parse tools lines and update any line missing subcat
const lines = content.split('\n');
let insideTools = false;
let updatedToolsCount = 0;

const newLines = lines.map(line => {
  if (line.includes('export const tools = [')) {
    insideTools = true;
    return line;
  }
  if (insideTools && line.includes('export const related =')) {
    insideTools = false;
    return line;
  }
  if (insideTools && line.trim().startsWith('{')) {
    // Check if subcat is empty or missing
    if (!line.includes('"subcat":') || line.includes('"subcat":""') || line.includes('"subcat":null')) {
      const catMatch = line.match(/"cat":"([^"]+)"/);
      if (catMatch) {
        const catSlug = catMatch[1];
        const validSubs = catSubcatMap[catSlug] || [];
        if (validSubs.length > 0) {
          // Pick the first/default subcategory for this category or match keyword
          const chosen = validSubs[0];
          let updatedLine = line;
          if (line.includes('"subcat":""')) {
            updatedLine = updatedLine.replace('"subcat":""', `"subcat":"${chosen.slug}","subcatName":"${chosen.name}"`);
          } else if (line.includes('"subcat":null')) {
            updatedLine = updatedLine.replace('"subcat":null', `"subcat":"${chosen.slug}","subcatName":"${chosen.name}"`);
          } else {
            // insert subcat right after cat
            updatedLine = updatedLine.replace(`"cat":"${catSlug}",`, `"cat":"${catSlug}","subcat":"${chosen.slug}","subcatName":"${chosen.name}",`);
          }
          updatedToolsCount++;
          return updatedLine;
        }
      }
    }
  }
  return line;
});

console.log(`Assigned subcategories to ${updatedToolsCount} tools.`);
fs.writeFileSync('src/data/registry.js', newLines.join('\n'), 'utf8');
console.log('Saved updated registry.js with complete subcategories.');
