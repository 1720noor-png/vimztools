const fs = require('fs');

let content = fs.readFileSync('src/data/registry.js', 'utf8');

const replacements = [
  { slug: 'color-palette-gen', oldName: '"name":"Color Palette Generator"', newName: '"name":"Developer Color Palette Export Tool"' },
  { slug: 'color-blindness-sim', oldName: '"name":"Color Blindness Simulator"', newName: '"name":"Clinical Color Vision Deficiency Simulator"' },
  { slug: 'golden-hour-calc', oldName: '"name":"Golden Hour Calculator"', newName: '"name":"Travel Sunset & Sunrise Planner"' },
  { slug: 'dof-calculator', oldName: '"name":"Depth of Field Calculator"', newName: '"name":"Macro & Portrait DoF Simulator"' },
  { slug: 'catering-calc', oldName: '"name":"Catering Quantity Calculator"', newName: '"name":"Party Buffet & Food Quantity Calculator"' }
];

replacements.forEach(r => {
  const lineRegex = new RegExp(`({[^}]*"slug":"${r.slug}"[^}]*})`);
  const match = content.match(lineRegex);
  if (match) {
    const updatedLine = match[1].replace(r.oldName, r.newName);
    content = content.replace(match[1], updatedLine);
    console.log(`Replaced duplicate name for slug: ${r.slug}`);
  } else {
    console.warn(`Line not found for slug: ${r.slug}`);
  }
});

fs.writeFileSync('src/data/registry.js', content, 'utf8');
console.log('Finished updating remaining duplicate names.');
