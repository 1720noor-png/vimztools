const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function checkLive() {
  console.log('========================================================================');
  console.log('VIMZ.AI — LIVE PRODUCTION DEPLOYMENT & ASSET AUDIT');
  console.log('========================================================================\n');

  // 1. Fetch live production homepage
  const home = await get('https://vimztools-app.netlify.app/');
  console.log(`Live Homepage (https://vimztools-app.netlify.app/): Status = ${home.status}`);
  
  const scriptMatches = (home.data || '').match(/src="(\/assets\/[^"]+)"/g) || [];
  const liveScripts = scriptMatches.map(s => s.replace('src="', '').replace('"', ''));
  console.log('Live JavaScript Bundles:', liveScripts);

  // Compare with local dist
  const localDistDir = path.resolve('dist/assets');
  if (fs.existsSync(localDistDir)) {
    const localFiles = fs.readdirSync(localDistDir);
    console.log('\nLocal dist/assets JavaScript Bundles:');
    localFiles.filter(f => f.endsWith('.js')).forEach(f => console.log(' - /assets/' + f));
  }

  // Check if live bundle contains Phase 27 text
  if (liveScripts.length > 0) {
    const mainBundleUrl = 'https://vimztools-app.netlify.app' + liveScripts[liveScripts.length - 1];
    console.log(`\nFetching live main bundle: ${mainBundleUrl}...`);
    const bundleRes = await get(mainBundleUrl);
    if (bundleRes.data) {
      const hasPhase27Notice = bundleRes.data.includes('Online Payments Deferred') || bundleRes.data.includes('Payments Coming Soon');
      const has700Manifest = bundleRes.data.includes('700 Advanced Tools') || bundleRes.data.includes('pro_monthly');
      const hasXlsx = bundleRes.data.includes('sample_deliverable.xlsx') || bundleRes.data.includes('-model.xlsx');
      
      console.log(`Live Bundle Size: ${bundleRes.data.length} bytes`);
      console.log(`Contains Phase 27 Deferred Notice: ${hasPhase27Notice ? 'YES (Up to date)' : 'NO (Older deployment)'}`);
      console.log(`Contains 700 Advanced Tools Manifest: ${has700Manifest ? 'YES' : 'NO'}`);
      console.log(`Contains OpenXML .xlsx Support: ${hasXlsx ? 'YES' : 'NO'}`);
    }
  }

  // 2. Check live backend API
  console.log('\n--- Live Backend API Checks ---');
  const apiTools = await get('https://charming-vitality-production-dd02.up.railway.app/api/tools');
  console.log(`GET /api/tools: Status = ${apiTools.status}`);
  if (apiTools.data) {
    try {
      const parsed = JSON.parse(apiTools.data);
      console.log(`  Tools count in live API: ${parsed.count || 0}`);
    } catch (e) {
      console.log('  Could not parse JSON');
    }
  }

  const apiEntitlements = await get('https://charming-vitality-production-dd02.up.railway.app/api/user/entitlements');
  console.log(`GET /api/user/entitlements: Status = ${apiEntitlements.status} (${apiEntitlements.status === 404 ? 'Route not deployed to live Railway yet' : 'Deployed'})`);

  console.log('\n========================================================================\n');
}

checkLive().catch(err => console.error(err));
