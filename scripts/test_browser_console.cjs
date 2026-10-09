const { spawn } = require('child_process');
const http = require('http');

async function run() {
  console.log('Spawning Chrome headless...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-extensions',
    'https://vimztools-app.netlify.app'
  ], { detached: false });

  // Wait 2 seconds for Chrome to start
  await new Promise(r => setTimeout(r, 2000));

  // Get debug target
  console.log('Fetching targets from http://127.0.0.1:9222/json ...');
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

  if (!targets || targets.length === 0) {
    console.error('Failed to get targets from Chrome');
    chromeProcess.kill();
    return;
  }

  console.log('Targets found:', targets.map(t => ({ title: t.title, url: t.url })));
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('vimztools')) || targets[0];
  console.log('Connecting to WebSocket:', pageTarget.webSocketDebuggerUrl);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  ws.onopen = () => {
    console.log('WebSocket connected. Enabling domains...');
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Console.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Log.enable' }));
    ws.send(JSON.stringify({ id: 4, method: 'Page.enable' }));
    // Reload page to catch all initialization errors
    setTimeout(() => {
      ws.send(JSON.stringify({ id: 5, method: 'Page.reload' }));
    }, 500);
  };

  const logs = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('\n>>> RUNTIME EXCEPTION THROWN:');
      console.error(JSON.stringify(msg.params.exceptionDetails, null, 2));
      logs.push(msg);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      console.log(`\n[Console ${msg.params.type}]:`, msg.params.args.map(a => a.value || a.description || a).join(' '));
    } else if (msg.method === 'Log.entryAdded') {
      console.log('\n[Log Entry]:', msg.params.entry);
    }
  };

  // Wait 8 seconds to capture all logs
  await new Promise(r => setTimeout(r, 8000));
  
  // Also evaluate document.body.innerHTML and document.title
  const evalMsg = {
    id: 10,
    method: 'Runtime.evaluate',
    params: {
      expression: '({ title: document.title, rootHTML: document.getElementById("root")?.innerHTML?.slice(0, 300), bodyText: document.body.innerText?.slice(0, 300) })',
      returnByValue: true
    }
  };
  ws.send(JSON.stringify(evalMsg));

  await new Promise(r => setTimeout(r, 2000));

  ws.close();
  chromeProcess.kill();
  console.log('Done.');
}

run().catch(err => console.error('Error running test:', err));
