const fs = require('fs');

const file = 'src/tools/business/SaasCacPaybackMatrix.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const paybackMonths = [^\n]+/,
  "const paybackMonths = marginAdjArpu > 0 ? (cac / marginAdjArpu) : 0;"
);

fs.writeFileSync(file, content, 'utf8');
console.log('SaasCacPaybackMatrix.jsx line 21 repaired!');
