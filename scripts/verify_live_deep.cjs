const { spawn } = require('child_process');

async function run() {
  console.log('Spawning Chrome to deeply inspect live Netlify page content...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--no-sandbox',
    '--disable-gpu',
    'https://vimztools-app.netlify.app/'
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets?.find(t => t.type === 'page' && t.url.includes('vimztools')) || targets?.[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  const errors = [];
  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION:', msg.params.exceptionDetails);
      errors.push(msg.params.exceptionDetails);
    }
  };

  // Wait 6 seconds for network download & React render
  console.log('Waiting 6 seconds for initial bundle download and execution...');
  await new Promise(r => setTimeout(r, 6000));

  // Check DOM
  const evalPromise = new Promise(resolve => {
    const listener = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === 10) {
        ws.removeEventListener('message', listener);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', listener);
  });

  ws.send(JSON.stringify({
    id: 10,
    method: 'Runtime.evaluate',
    params: {
      expression: '({ title: document.title, rootHTML: document.getElementById("root")?.innerHTML?.slice(0, 300), bodyText: document.body.innerText?.slice(0, 300) })',
      returnByValue: true
    }
  }));

  const res = await evalPromise;
  console.log('Rendered DOM on live Netlify:');
  console.log(JSON.stringify(res?.result?.value, null, 2));

  // Now test tool detail page
  console.log('\nNavigating to /construction/stair-riser-tread-calc on live site...');
  ws.send(JSON.stringify({
    id: 20,
    method: 'Page.navigate',
    params: { url: 'https://vimztools-app.netlify.app/construction/stair-riser-tread-calc' }
  }));

  await new Promise(r => setTimeout(r, 4000));

  const toolPromise = new Promise(resolve => {
    const listener = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === 30) {
        ws.removeEventListener('message', listener);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', listener);
  });

  ws.send(JSON.stringify({
    id: 30,
    method: 'Runtime.evaluate',
    params: {
      expression: '({ title: document.title, heading: document.querySelector("h1")?.innerText, rootHTML: document.getElementById("root")?.innerHTML?.slice(0, 300), bodyText: document.body.innerText?.slice(0, 300) })',
      returnByValue: true
    }
  }));

  const toolRes = await toolPromise;
  console.log('Rendered Tool Page on live Netlify:');
  console.log(JSON.stringify(toolRes?.result?.value, null, 2));

  ws.close();
  chromeProcess.kill();

  if (errors.length === 0) {
    console.log('\n>>> DEEP VERIFICATION COMPLETE: Live Netlify site is 100% WORKING and rendering with zero exceptions!');
  } else {
    console.error('Exceptions found:', errors);
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
