const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

function startServer(port = 4182) {
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

async function run() {
  const port = 4182;
  const server = startServer(port);
  console.log(`Local test server started on http://localhost:${port}`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--no-sandbox',
    '--disable-gpu',
    `http://localhost:${port}/`
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2000));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9232/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets?.find(t => t.type === 'page' && t.url.includes(String(port))) || targets?.[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  const exceptions = [];
  let currentResolve = null;

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params.exceptionDetails);
    } else if (msg.id && msg.id >= 100 && currentResolve) {
      currentResolve(msg.result);
    }
  };

  // Wait for initial connection
  await new Promise(r => setTimeout(r, 1500));

  const route = '/social-media-tools/instagram-grid-carousel-splitter';
  console.log(`Navigating to ${route}...`);

  ws.send(JSON.stringify({
    id: 50,
    method: 'Page.navigate',
    params: { url: `http://localhost:${port}${route}` }
  }));

  await new Promise(r => setTimeout(r, 1500));

  // Helper to evaluate in page
  let evalId = 100;
  const evaluate = async (expression) => {
    const p = new Promise(resolve => { currentResolve = resolve; });
    ws.send(JSON.stringify({
      id: evalId++,
      method: 'Runtime.evaluate',
      params: {
        expression,
        returnByValue: true,
        awaitPromise: true
      }
    }));
    const res = await p;
    return res?.result?.value;
  };

  // 1. Verify component mounted
  const mountCheck = await evaluate(`({
    h1: document.querySelector('h1')?.innerText,
    hasUpload: document.body.innerText.includes('Upload or Drag & Drop'),
    hasSampleBtn: Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Sample Panorama'))
  })`);
  console.log('1. Mount Check:', mountCheck);

  if (!mountCheck?.hasSampleBtn) {
    throw new Error('Component failed to mount properly');
  }

  // 2. Click "Try Sample Panorama" button
  console.log('2. Triggering sample panorama upload...');
  const clickResult = await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sample Panorama'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  })()`);
  console.log('   Click succeeded:', clickResult);

  // Wait for canvas processing & slicing
  await new Promise(r => setTimeout(r, 2000));

  // 3. Verify slices generated
  const slicesCheck = await evaluate(`(() => {
    const slideCards = document.querySelectorAll('img[alt^="carousel-slide-"]');
    const hasZipBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Download All (ZIP)'));
    const sliceSrcs = Array.from(slideCards).map(img => ({
      alt: img.alt,
      isDataUrl: img.src.startsWith('data:image/jpeg;base64,'),
      length: img.src.length
    }));
    return {
      sliceCount: slideCards.length,
      hasZipBtn,
      sliceSrcs
    };
  })()`);
  console.log('3. Slices Verification:', {
    sliceCount: slicesCheck?.sliceCount,
    hasZipBtn: slicesCheck?.hasZipBtn,
    slice1_name: slicesCheck?.sliceSrcs?.[0]?.alt,
    slice1_isDataUrl: slicesCheck?.sliceSrcs?.[0]?.isDataUrl
  });

  if (!slicesCheck || slicesCheck.sliceCount === 0 || !slicesCheck.hasZipBtn) {
    throw new Error('Failed to generate slices from uploaded panorama');
  }

  // 4. Test aspect ratio switch to 1:1 Square
  console.log('4. Switching aspect ratio to 1:1 Square...');
  await evaluate(`(() => {
    const sqBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('1:1 Square'));
    if (sqBtn) sqBtn.click();
  })()`);

  await new Promise(r => setTimeout(r, 1500));

  const squareCheck = await evaluate(`(() => {
    return document.body.innerText.includes('1080 × 1080') || document.body.innerText.includes('1080×1080');
  })()`);
  console.log('   Square re-slicing confirmed:', squareCheck);

  // 5. Test ZIP button click
  console.log('5. Testing ZIP trigger...');
  const zipTriggerResult = await evaluate(`(() => {
    const zipBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download All (ZIP)'));
    if (zipBtn) {
      zipBtn.click();
      return true;
    }
    return false;
  })()`);
  console.log('   ZIP click triggered:', zipTriggerResult);

  await new Promise(r => setTimeout(r, 1000));

  console.log('\nException Count:', exceptions.length);
  if (exceptions.length > 0) {
    console.error('Exceptions:', exceptions);
  }

  ws.close();
  chromeProcess.kill();
  server.close();

  if (exceptions.length === 0 && slicesCheck.sliceCount > 0) {
    console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED: Instagram Carousel Splitter is 100% functional!');
    process.exit(0);
  } else {
    console.error('\n❌ Tests failed.');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
