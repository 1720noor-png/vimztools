const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
if (!fs.existsSync(CHROME)) CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9399;
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-count-' + Date.now());

const chromeProc = spawn(CHROME, [
  '--headless=new',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + USER_DIR,
  '--no-first-run',
  '--disable-gpu',
  'about:blank'
]);

setTimeout(async () => {
  try {
    const tabRes = await fetch('http://127.0.0.1:' + PORT + '/json/new?http://127.0.0.1:4174/tools', { method: 'PUT' });
    const tab = await tabRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: `JSON.stringify({
            title: document.title,
            headerText: document.querySelector('h1')?.innerText,
            subText: document.querySelector('p')?.innerText,
            allText: document.body.innerText.slice(0, 500)
          })`,
          returnByValue: true
        }
      }));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === 1) {
        console.log('Result:', msg.result.result.value);
        ws.close();
        chromeProc.kill();
        setTimeout(() => {
          try { fs.rmSync(USER_DIR, { recursive: true, force: true }); } catch {}
        }, 500);
        process.exit(0);
      }
    };
  } catch (err) {
    console.error('Error:', err.message);
    chromeProc.kill();
    process.exit(1);
  }
}, 3000);
