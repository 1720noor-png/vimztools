const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '../src/data/registry.js'), 'utf8');

const toolsStart = content.indexOf('export const tools = [');
const toolsEnd = content.indexOf('export const related =');
const toolsStr = content.substring(toolsStart, toolsEnd);

const regex = /\{\s*"cat"\s*:\s*"(privacy-tools|women-tools)"[\s\S]*?"slug"\s*:\s*"([^"]+)"[\s\S]*?"name"\s*:\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(toolsStr)) !== null) {
  console.log(`Cat: ${match[1]} | Slug: ${match[2]} | Name: ${match[3]}`);
}
