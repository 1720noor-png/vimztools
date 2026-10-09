const fs = require('fs');

async function verifyLive() {
  console.log('=== STARTING LIVE PRODUCTION VERIFICATION ===');
  
  // 1. Fetch live production index.html
  try {
    const res = await fetch('https://vimztools-app.netlify.app');
    console.log('Live Netlify status:', res.status);
    const text = await res.text();
    console.log('Live HTML title/brand present:', text.includes('Vimz.ai') || text.includes('Vimz') || text.includes('root'));
  } catch (err) {
    console.error('Failed to fetch Netlify frontend:', err);
  }

  // 2. Fetch Railway backend health / tools endpoint
  try {
    const apiRes = await fetch('https://charming-vitality-production-dd02.up.railway.app/api/tools');
    console.log('Railway backend /api/tools status:', apiRes.status);
    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log('Railway backend tools count:', Array.isArray(data) ? data.length : (data.data ? data.data.length : 'Object'));
    }
  } catch (err) {
    console.error('Failed to fetch Railway backend:', err);
  }

  // 3. Check local build files & registry
  const regContent = fs.readFileSync('src/data/registry.js', 'utf8');
  const slugMatches = [...regContent.matchAll(/"slug":"([^"]+)"/g)].map(m => m[1]);
  console.log('Local registry total tools:', slugMatches.length);
}

verifyLive();
