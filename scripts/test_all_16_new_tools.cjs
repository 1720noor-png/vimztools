const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer(port = 4178) {
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
  return server.listen(port);
}

const routesToTest = [
  '/business-tools/business-model-canvas-builder',
  '/business-tools/value-proposition-canvas-mapper',
  '/business-tools/sales-pipeline-stage-planner',
  '/business-tools/business-idea-validation-planner',
  '/business-tools/revenue-model-comparison-calculator',
  '/freelance-tools/project-scope-pricing-estimator',
  '/business-tools/cold-email-outreach-planner',
  '/marketing-tools/technical-seo-audit-checklist',
  '/marketing-tools/content-brief-generator',
  '/marketing-tools/landing-page-audit-checklist',
  '/marketing-tools/internal-linking-cluster-architect',
  '/marketing-tools/campaign-budget-allocator',
  '/marketing-tools/local-seo-gbp-audit-planner',
  '/social-media-tools/social-oembed-viewer',
  '/social-media-tools/short-video-sound-hook-planner',
  '/freelance-tools/client-retainer-roi-report-generator'
];

async function run() {
  const port = 4178;
  const server = startServer(port);
  console.log(`Local test server started on http://localhost:${port}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--no-sandbox',
    '--disable-gpu',
    `http://localhost:${port}/`
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9228/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets?.find(t => t.type === 'page' && t.url.includes('4178')) || targets?.[0];
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

  // Wait for initial bundle parse
  await new Promise(r => setTimeout(r, 3000));

  console.log('Testing all 16 new tools via headless Chrome:');
  let passed = 0;

  for (let i = 0; i < routesToTest.length; i++) {
    const route = routesToTest[i];
    currentExceptions = [];

    ws.send(JSON.stringify({
      id: 50,
      method: 'Page.navigate',
      params: { url: `http://localhost:${port}${route}` }
    }));

    await new Promise(r => setTimeout(r, 1200));

    const evalPromise = new Promise(resolve => { currentResolve = resolve; });
    ws.send(JSON.stringify({
      id: 100 + i,
      method: 'Runtime.evaluate',
      params: {
        expression: '({ title: document.title, hasHeading: Boolean(document.querySelector("h1, h2")), text: (document.querySelector("h1, h2")?.innerText || "") })',
        returnByValue: true
      }
    }));

    const result = await evalPromise;
    const val = result?.result?.value || result?.value;

    if (val && val.hasHeading && currentExceptions.length === 0) {
      console.log(`PASS [${i+1}/16]: ${route} -> "${val.text.slice(0, 45)}" (0 errors)`);
      passed++;
    } else {
      console.error(`FAIL: ${route} (heading: ${val?.hasHeading}, errors: ${currentExceptions.length})`);
      if (currentExceptions.length > 0) {
        console.error(currentExceptions);
      }
    }
  }

  console.log(`\nRESULTS: ${passed}/${routesToTest.length} routes passed with ZERO runtime exceptions!`);

  ws.close();
  chromeProcess.kill();
  server.close();

  if (passed === routesToTest.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
