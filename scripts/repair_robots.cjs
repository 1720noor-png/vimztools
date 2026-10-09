const fs = require('fs');

const file = 'src/tools/marketing/RobotsSitemapGenerator.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const fullSitemap = [^\n]+/,
  "const fullSitemap = sitemapPath.startsWith('http') ? sitemapPath : `${cleanUrl}${sitemapPath.startsWith('/') ? '' : '/'}${sitemapPath}`;"
);

fs.writeFileSync(file, content, 'utf8');
console.log('RobotsSitemapGenerator.jsx line 52 repaired successfully!');
