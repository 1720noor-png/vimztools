const { spawn } = require('child_process');

const liveRoutes = [
  'https://vimztools-app.netlify.app/',
  'https://vimztools-app.netlify.app/construction/stair-riser-tread-calc',
  'https://vimztools-app.netlify.app/social-media-tools/youtube-thumbnail-extractor',
  'https://vimztools-app.netlify.app/business-tools/saas-cac-payback-matrix',
  'https://vimztools-app.netlify.app/marketing-tools/seo-keyword-clustering-tool'
];

async function run() {
  console.log('Spawning Chrome headless against live Netlify deployment...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--no-sandbox',
    '--disable-gpu',
    'https://vimztools-app.netlify.app/'
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9224/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets?.find(t => t.type === 'page' && t.url.includes('vimztools')) || targets?.[0];
  if (!pageTarget) {
    console.error('Target not found');
    chromeProcess.kill();
    return;
  }

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

  console.log('Testing live Netlify routes:');
  let failures = 0;

  for (let i = 0; i < liveRoutes.length; i++) {
    const url = liveRoutes[i];
    currentExceptions = [];

    ws.send(JSON.stringify({
      id: 50,
      method: 'Page.navigate',
      params: { url }
    }));

    await new Promise(r => setTimeout(r, 1500));

    const evalPromise = new Promise(resolve => { currentResolve = resolve; });
    ws.send(JSON.stringify({
      id: 100 + i,
      method: 'Runtime.evaluate',
      params: {
        expression: '({ title: document.title, heading: document.querySelector("h1")?.innerText, bodySnippet: document.body.innerText?.slice(0, 100) })',
        returnByValue: true
      }
    }));

    const result = await evalPromise;
    const val = result?.result?.value;

    if (currentExceptions.length > 0) {
      console.error(`❌ FAIL: ${url} had exceptions:`, currentExceptions[0].text, currentExceptions[0].exception?.description);
      failures++;
    } else {
      console.log(`✅ PASS: ${url}`);
      console.log(`   Title: "${val?.title}"`);
      console.log(`   Heading: "${val?.heading}"`);
      console.log(`   Body preview: "${val?.bodySnippet?.replace(/\n/g, ' ')}"`);
    }
  }

  ws.close();
  chromeProcess.kill();

  console.log(`\nLive Netlify Result: ${liveRoutes.length - failures}/${liveRoutes.length} passed.`);
  if (failures > 0) process.exit(1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
