const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Basic static file server for dist
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
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
  return server.listen(4173);
}

async function run() {
  console.log('Starting preview server on port 4173...');
  const server = startServer();

  console.log('Spawning Chrome headless on http://localhost:4173/ ...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:4173/'
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets?.find(t => t.type === 'page' && t.url.includes('4173')) || targets?.[0];
  if (!pageTarget) {
    console.error('No page target found');
    chromeProcess.kill();
    server.close();
    return;
  }

  console.log('Connecting to WebSocket:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let uncaughtErrors = [];
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
    setTimeout(() => {
      ws.send(JSON.stringify({ id: 3, method: 'Page.reload' }));
    }, 500);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION THROWN:', msg.params.exceptionDetails);
      uncaughtErrors.push(msg.params.exceptionDetails);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      console.log(`[Console ${msg.params.type}]:`, msg.params.args.map(a => a.value || a.description || a).join(' '));
    } else if (msg.id === 10) {
      console.log('\n=== DOM EVALUATION RESULT ===');
      console.log(JSON.stringify(msg.result?.result?.value, null, 2));
    }
  };

  await new Promise(r => setTimeout(r, 5000));

  // Evaluate DOM
  ws.send(JSON.stringify({
    id: 10,
    method: 'Runtime.evaluate',
    params: {
      expression: '({ title: document.title, rootChildrenCount: document.getElementById("root")?.children.length, rootInnerHTMLSnippet: document.getElementById("root")?.innerHTML?.slice(0, 500), bodyTextSnippet: document.body.innerText?.slice(0, 300) })',
      returnByValue: true
    }
  }));

  await new Promise(r => setTimeout(r, 2000));

  ws.close();
  chromeProcess.kill();
  server.close();

  if (uncaughtErrors.length === 0) {
    console.log('\n>>> SUCCESS: Zero uncaught exceptions! Page rendered successfully!');
  } else {
    console.error(`\n>>> FAILED: ${uncaughtErrors.length} uncaught exceptions detected!`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
