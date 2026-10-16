const http = require('http');
const fs = require('fs');
const path = require('path');

const distPath = path.resolve('dist');
if (!fs.existsSync(distPath)) {
  console.error('dist directory does not exist! Run npm run build first.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distPath, reqPath === '/' ? 'index.html' : reqPath);

  // SPA fallback
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distPath, 'index.html');
  }

  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml'
  };

  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

const PORT = 4199;
server.listen(PORT, async () => {
  console.log(`Test static server running on http://localhost:${PORT}`);

  const routesToTest = [
    '/',
    '/pricing',
    '/checkout',
    '/checkout?tier=pro_monthly',
    '/checkout?tier=pro_annual',
    '/checkout?tier=single_tool&slug=dcf-valuation-calc',
    '/tools',
    '/dashboard',
    '/login',
    '/register',
    '/social-media-tools/instagram-grid-carousel-splitter',
    '/math/fraction-to-decimal-percentage-converter',
    '/finance-tools/discounted-cash-flow-dcf-valuation-tool',
    '/weather/celsius-fahrenheit-kelvin-converter'
  ];

  let passed = 0;
  let failed = 0;

  for (const r of routesToTest) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}${r}`, (response) => {
          let data = '';
          response.on('data', chunk => data += chunk);
          response.on('end', () => resolve({ status: response.statusCode, length: data.length, data }));
        }).on('error', reject);
      });

      if (res.status === 200 && res.length > 500 && res.data.includes('<div id="root">')) {
        console.log(`[PASS] Route ${r} returned 200 OK (${res.length} bytes)`);
        passed++;
      } else {
        console.error(`[FAIL] Route ${r} returned unexpected status: ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] Route ${r} request failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nROUTE TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
});
