const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

const catStart = content.indexOf('export const categories = [');
const catEnd = content.indexOf('export const tools = [');
const catStr = content.substring(catStart + 'export const categories = '.length, catEnd).trim().replace(/;$/, '');
const categories = JSON.parse(catStr);

console.log(categories.map(c => c.slug));
