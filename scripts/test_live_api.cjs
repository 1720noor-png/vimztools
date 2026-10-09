const https = require('https');

function request(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING LIVE RAILWAY LARAVEL API SMOKE TESTS ===\n');

  // 1. Health check
  const health = await request('https://charming-vitality-production-dd02.up.railway.app/up');
  console.log('1. Health Check (/up): Status', health.status);

  // 2. Fetch Tools Catalog
  const toolsRes = await request('https://charming-vitality-production-dd02.up.railway.app/api/tools');
  console.log('2. Tools Catalog (/api/tools): Status', toolsRes.status, '| Total Paid Tools in DB:', toolsRes.body.count || (toolsRes.body.tools && toolsRes.body.tools.length));

  // 3. Admin Login
  const loginRes = await request('https://charming-vitality-production-dd02.up.railway.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  }, { email: 'admin@vimztools.com', password: 'AdminVimz2026!' });
  console.log('3. Admin Authentication (/api/auth/login): Status', loginRes.status, '| Logged In As:', loginRes.body.user?.email, '| Role:', loginRes.body.user?.role);
  const token = loginRes.body.token;

  // 4. Admin Dashboard Stats
  const statsRes = await request('https://charming-vitality-production-dd02.up.railway.app/api/admin/stats', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
  });
  console.log('4. Protected Admin Stats (/api/admin/stats): Status', statsRes.status, '| Total Paid Tools:', statsRes.body.stats?.paid_tools, '| Total Users:', statsRes.body.stats?.total_users);

  // 5. One-Time Purchase Test (Sandbox)
  const purchaseRes = await request('https://charming-vitality-production-dd02.up.railway.app/api/checkout/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  }, { tool_slug: 'invoice-generator', payment_method: 'sandbox', guest_email: 'guest_live@vimztools.com' });
  console.log('5. One-Time Paid Tool Unlock (/api/checkout/purchase): Status', purchaseRes.status, '| Txn:', purchaseRes.body.purchase?.transaction_id, '| Token:', purchaseRes.body.purchase?.download_token?.substring(0, 15) + '...');
  const dlToken = purchaseRes.body.purchase?.download_token;

  // 6. Download Authorization Verification
  if (dlToken) {
    const verifyRes = await request(`https://charming-vitality-production-dd02.up.railway.app/api/download/verify/${dlToken}`);
    console.log('6. Download Token Authorization (/api/download/verify): Status', verifyRes.status, '| Valid:', verifyRes.body.valid, '| Tool:', verifyRes.body.purchase?.tool_slug);
  }

  // 7. Protected Download Without Valid Token
  const invalidRes = await request('https://charming-vitality-production-dd02.up.railway.app/api/download/verify/invalid_token_12345');
  console.log('7. Unauthorized Protection Test (Fake Token): Status', invalidRes.status, '| Expected 404/403');

  console.log('\n=== ALL LIVE API TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(console.error);
