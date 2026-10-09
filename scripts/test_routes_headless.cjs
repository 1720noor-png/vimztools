const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '../dist', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(__dirname, '../dist/index.html');
    }
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return server.listen(4174);
}

const testRoutes = [
  '/',
  '/tools',
  '/construction/stair-riser-tread-calc',
  '/social-media-tools/youtube-thumbnail-extractor',
  '/social-media-tools/content-repurposing-matrix',
  '/social-media-tools/link-in-bio-builder',
  '/social-media-tools/reels-hook-script-generator',
  '/social-media-tools/instagram-grid-carousel-splitter',
  '/marketing-tools/seo-keyword-clustering-tool',
  '/marketing-tools/robots-sitemap-generator',
  '/marketing-tools/schema-json-ld-generator',
  '/marketing-tools/opengraph-card-previewer',
  '/marketing-tools/seo-redirect-map-builder',
  '/marketing-tools/content-editorial-calendar',
  '/marketing-tools/youtube-seo-optimizer',
  '/writing-tools/headline-ab-power-tester',
  '/writing-tools/podcast-show-notes-generator',
  '/business-tools/lean-canvas-business-builder',
  '/business-tools/sales-funnel-velocity-calculator',
  '/business-tools/saas-cac-payback-matrix',
  '/business-tools/sales-commission-calculator',
  '/freelance-tools/agency-retainer-calculator',
  '/freelance-tools/marketing-attribution-roi-model',
  '/freelance-tools/agency-pitch-proposal-generator'
];

async function run() {
  const server = startServer();
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:4174/'
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9223/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets?.find(t => t.type === 'page' && t.url.includes('4174')) || targets?.[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let currentExceptions = [];
  let currentResolve = null;

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      currentExceptions.push(msg.params.exceptionDetails);
    } else if (msg.id && msg.id >= 100 && currentResolve) {
      currentResolve(msg.result);
    }
  };

  await new Promise(r => setTimeout(r, 1000));

  console.log('Testing routes for clean rendering and zero exceptions:');
  let failures = 0;
  for (let i = 0; i < testRoutes.length; i++) {
    const route = testRoutes[i];
    currentExceptions = [];

    // Navigate to route
    ws.send(JSON.stringify({
      id: 50,
      method: 'Page.navigate',
      params: { url: `http://localhost:4174${route}` }
    }));

    await new Promise(r => setTimeout(r, 600));

    // Evaluate
    const evalPromise = new Promise(resolve => { currentResolve = resolve; });
    ws.send(JSON.stringify({
      id: 100 + i,
      method: 'Runtime.evaluate',
      params: {
        expression: '({ title: document.title, hasHeading: !!document.querySelector("h1"), heading: document.querySelector("h1")?.innerText })',
        returnByValue: true
      }
    }));

    const result = await evalPromise;
    const val = result?.result?.value;

    if (currentExceptions.length > 0) {
      console.error(`❌ FAIL: ${route} had ${currentExceptions.length} exceptions:`, currentExceptions[0].text);
      failures++;
    } else {
      console.log(`✅ PASS: ${route} => "${val?.heading || val?.title}"`);
    }
  }

  ws.close();
  chromeProcess.kill();
  server.close();

  console.log(`\nResults: ${testRoutes.length - failures}/${testRoutes.length} routes passed perfectly!`);
  if (failures > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
