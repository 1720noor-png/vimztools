const fs = require('fs');

async function test() {
  console.log('=== CHECKING LIVE PRODUCTION DEPLOYMENT ===');
  const res = await fetch('https://vimztools-app.netlify.app/');
  console.log('HTML Status:', res.status);
  const html = await res.text();
  console.log('HTML (first 1000 chars):\n', html.slice(0, 1000));
  
  const scriptRegex = /<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/g;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    const scriptUrl = src.startsWith('http') ? src : 'https://vimztools-app.netlify.app' + src;
    console.log('\nFetching script:', scriptUrl);
    const sRes = await fetch(scriptUrl);
    console.log('Script status:', sRes.status, 'Content-Type:', sRes.headers.get('content-type'));
    const text = await sRes.text();
    console.log('Script size:', text.length, 'bytes');
  }

  const cssRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+)">/g;
  while ((match = cssRegex.exec(html)) !== null) {
    const href = match[1];
    const cssUrl = href.startsWith('http') ? href : 'https://vimztools-app.netlify.app' + href;
    console.log('\nFetching CSS:', cssUrl);
    const cRes = await fetch(cssUrl);
    console.log('CSS status:', cRes.status, 'Content-Type:', cRes.headers.get('content-type'));
  }
}

test().catch(err => console.error('Error:', err));
