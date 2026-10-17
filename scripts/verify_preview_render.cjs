const { spawn } = require('child_process');

async function testLocalPreview() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:4173/student-tools/percentage-calculator'
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2500));

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

  const page = targets?.find(t => t.type === 'page');
  if (!page) {
    console.error('No page target found');
    chromeProcess.kill();
    return;
  }

  const ws = new (require('ws'))(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) {
        ws.off('message', handler);
        resolve(parsed.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await send('Page.enable');
  await new Promise(r => setTimeout(r, 2000));

  const textRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText'
  });
  const htmlRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerHTML'
  });

  const bodyText = textRes?.result?.value || '';
  const bodyHtml = htmlRes?.result?.value || '';

  console.log('--- Percentage Calculator (Local Preview http://localhost:4173) ---');
  console.log('Has "Download (.html)" button in text:', bodyText.includes('Download (.html)'));
  console.log('Has "Without Internet" banner in text:', bodyText.includes('Without Internet'));
  console.log('Has "Download Tool (.html)" button in text:', bodyText.includes('Download Tool (.html)'));

  // Now test a Pro tool: GPA Calculator
  await send('Page.navigate', { url: 'http://localhost:4173/student-tools/gpa-calculator' });
  await new Promise(r => setTimeout(r, 2000));

  const dcfTextRes = await send('Runtime.evaluate', {
    expression: 'document.body.innerText'
  });
  const dcfText = dcfTextRes?.result?.value || '';

  console.log('\n--- GPA Calculator (Pro Tool on Local Preview http://localhost:4173) ---');
  console.log('Has "Unlock (.html)" button in text:', dcfText.includes('Unlock (.html)'));
  console.log('Has "Pay $19" button in text:', dcfText.includes('Pay $19'));
  console.log('Has "Without Internet" banner in text:', dcfText.includes('Without Internet'));

  ws.close();
  chromeProcess.kill();
}

testLocalPreview().catch(console.error);
