const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer(port = 4176) {
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

const toolsToTest = [
  // Upgraded Legacy Tools
  '/social-media-tools/ab-test-calculator',
  '/productivity-tools/swot-analyzer',
  '/business-tools/swot-template',
  '/developer-tools/meta-og-preview',
  '/freelance-tools/client-proposal-builder',
  '/social-media-tools/content-calendar-planner',
  '/accessibility-tools/readability-score-checker',
  '/education-tools/reading-level-analyzer',

  // 7 New Priority & Professional Tools
  '/business-tools/b2b-lead-scoring-matrix',
  '/marketing-tools/hreflang-tag-generator',
  '/freelance-tools/agency-blended-rate-calculator',
  '/marketing-tools/email-deliverability-health-checker',
  '/social-media-tools/social-media-media-inspector',
  '/marketing-tools/seo-content-decay-audit-calculator',
  '/business-tools/saas-cohort-retention-calculator'
];

async function run() {
  const port = 4176;
  const server = startServer(port);
  console.log(`Local test server started on http://localhost:${port}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--no-sandbox',
    '--disable-gpu',
    `http://localhost:${port}/`
  ]);

  await new Promise(r => setTimeout(r, 2000));

  let targets = [];
  try {
    const listRes = await fetch('http://127.0.0.1:9226/json');
    targets = await listRes.json();
  } catch (err) {
    console.error('Failed to connect to Chrome debugging endpoint:', err.message);
    chromeProcess.kill();
    server.close();
    process.exit(1);
  }

  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) {
    console.error('No page target found');
    chromeProcess.kill();
    server.close();
    process.exit(1);
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  await new Promise(res => {
    ws.onopen = res;
  });

  let id = 100;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
      errors.push(desc);
      console.error('RUNTIME EXCEPTION:', desc);
    }
    if (msg.id && pending.has(msg.id)) {
      const resolve = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  };

  const send = (method, params = {}) => new Promise((resolve) => {
    const reqId = id++;
    pending.set(reqId, resolve);
    ws.send(JSON.stringify({ id: reqId, method, params }));
  });

  const errors = [];

  await send('Page.enable');
  await send('Runtime.enable');

  console.log(`Warming up browser on root...`);
  await send('Page.navigate', { url: `http://localhost:${port}/` });
  await new Promise(r => setTimeout(r, 1500));

  console.log(`Starting automated checks across all ${toolsToTest.length} routes...`);

  let allPassed = true;

  for (const route of toolsToTest) {
    errors.length = 0;
    const url = `http://localhost:${port}${route}`;
    await send('Page.navigate', { url });

    let info = {};
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise(r => setTimeout(r, 400));
      const evalRes = await send('Runtime.evaluate', {
        expression: '({ title: document.title, heading: document.querySelector("h1")?.innerText, bodyLen: document.body.innerText.length })',
        returnByValue: true
      });
      info = evalRes?.result?.value || {};
      if (info.heading) break;
    }

    if (errors.length > 0 || !info.heading) {
      console.error(`[FAIL] ${route} -> Errors: ${errors.length}, Heading: ${info.heading}`);
      allPassed = false;
    } else {
      console.log(`[PASS] ${route} -> "${info.heading}" (${info.bodyLen} chars)`);
    }
  }

  ws.close();
  chromeProcess.kill();
  server.close();

  if (allPassed) {
    console.log('\n========================================');
    console.log(`ALL ${toolsToTest.length} ROUTES TESTED SUCCESSFULLY WITH 0 RUNTIME EXCEPTIONS!`);
    console.log('========================================');
    process.exit(0);
  } else {
    console.error('\nSOME ROUTES FAILED AUTOMATED VERIFICATION!');
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
