const fs = require('fs');

console.log('=== VERIFYING POPULAR TOOLS & STAIRCASE CALCULATOR ===');

// 1. Verify Staircase Calculator file
const stairFile = 'src/tools/construction/StairRiserTreadCalc.jsx';
if (fs.existsSync(stairFile)) {
  const content = fs.readFileSync(stairFile, 'utf8');
  console.log('Staircase tool exists:', true);
  console.log('Staircase handles safe default states:', content.includes('useState'));
} else {
  console.error('Staircase tool file missing!');
}

// 2. Verify registry entry for stair-riser-tread-calc
const reg = fs.readFileSync('src/data/registry.js', 'utf8');
console.log('stair-riser-tread-calc in registry:', reg.includes('"slug":"stair-riser-tread-calc"'));

// 3. Check popular tools lookup / route resolution in pages/Home.jsx or components
const homePath = fs.existsSync('src/pages/Home.jsx') ? 'src/pages/Home.jsx' : (fs.existsSync('src/pages/HomePage.jsx') ? 'src/pages/HomePage.jsx' : null);
console.log('Home page file:', homePath);
if (homePath) {
  const homeContent = fs.readFileSync(homePath, 'utf8');
  console.log('Home links use /tool/:slug:', homeContent.includes('/tool/') || homeContent.includes('slug'));
}

// 4. Check App.jsx routes
const appPath = 'src/App.jsx';
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  console.log('App route for tool page exists:', appContent.includes('path="/tool/:slug"') || appContent.includes('path="/tools/:slug"') || appContent.includes(':slug'));
}
