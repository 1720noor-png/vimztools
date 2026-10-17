const http = require('http');

const paths = [
  '/',
  '/ai-tools',
  '/ai-tools/ai-prompt-engineering',
  '/tools/ai-tools/prompt-clarity-optimizer',
  '/dev-cloud',
  '/dev-cloud/dc-k8s-pod-sizing',
  '/tools/dev-cloud/k8s-resource-calculator',
  '/cyber-security',
  '/cyber-security/cs-password-entropy',
  '/tools/cyber-security/password-entropy-analyzer',
  '/green-energy',
  '/green-energy/ge-solar-pv-sizing',
  '/tools/green-energy/solar-pv-system-sizer',
  '/fintech-venture',
  '/fintech-venture/fv-runway-burn',
  '/tools/fintech-venture/runway-burn-calculator',
  '/civic-lifestyle',
  '/civic-lifestyle/cl-readability-audit',
  '/tools/civic-lifestyle/flesch-kincaid-readability-analyzer',
  '/tools/pdf',
  '/office-corporate',
  '/tools/document-word',
  '/image-tools',
  '/health',
  '/household'
];

async function check() {
  let allOk = true;
  for (const p of paths) {
    await new Promise((resolve) => {
      http.get('http://127.0.0.1:4174' + p, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => {
          const hasRoot = data.includes('id="root"');
          const ok = r.statusCode === 200 && hasRoot;
          if (!ok) allOk = false;
          console.log((ok ? '✓' : '✗') + ` [${r.statusCode}] ${p} (length: ${data.length}, root: ${hasRoot})`);
          resolve();
        });
      }).on('error', (e) => {
        console.error('✗ ' + p + ' ' + e.message);
        allOk = false;
        resolve();
      });
    });
  }
  if (!allOk) {
    process.exitCode = 1;
  } else {
    console.log('\nAll 25 sampled routes verified successfully (HTTP 200 with SPA root container)!');
  }
}
check();
