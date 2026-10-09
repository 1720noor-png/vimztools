const fs = require('fs');
const path = require('path');
const https = require('https');
const JSZip = require('jszip');

const SITE_ID = '1127e61c-f81e-4e08-931f-1322cd60c295'; // vimztools-app.netlify.app

function addFolderToZip(zip, folderPath, rootPath) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(folderPath, entry.name);
    const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      addFolderToZip(zip, fullPath, rootPath);
    } else {
      zip.file(relPath, fs.readFileSync(fullPath));
    }
  }
}

async function createDistZip(distDir) {
  const zip = new JSZip();
  addFolderToZip(zip, distDir, distDir);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function uploadZip(siteId, token, zipBuffer) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1/sites/${siteId}/deploys`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'Authorization': `Bearer ${token}`,
        'Content-Length': zipBuffer.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ raw: data });
          }
        } else {
          reject(new Error(`Netlify deploy failed (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(zipBuffer);
    req.end();
  });
}

function getDeployStatus(deployId, token) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1/deploys/${deployId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const configPath = path.join(process.env.APPDATA, 'netlify', 'Config', 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('Netlify config not found');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const user = Object.values(config.users || {})[0];
  const token = user?.auth?.token;
  if (!token) {
    throw new Error('No Netlify auth token found');
  }

  const distDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory does not exist! Run npm run build first.');
  }

  console.log('Zipping dist directory...');
  const zipBuffer = await createDistZip(distDir);
  console.log(`Zip created (${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB). Deploying to Netlify site ${SITE_ID}...`);

  const deploy = await uploadZip(SITE_ID, token, zipBuffer);
  console.log(`Deploy created: ${deploy.id}, state: ${deploy.state}`);
  console.log(`Deploy URL: ${deploy.deploy_ssl_url || deploy.url}`);

  // Poll until ready
  let deployState = deploy.state;
  let attempts = 0;
  while (deployState !== 'ready' && deployState !== 'error' && attempts < 30) {
    await new Promise(r => setTimeout(r, 3000));
    attempts++;
    const current = await getDeployStatus(deploy.id, token);
    deployState = current.state;
    console.log(`Deploy status check ${attempts}: ${deployState}`);
  }

  if (deployState === 'ready') {
    console.log('SUCCESS: Deployment is live and ready!');
    console.log('Live URL:', 'https://vimztools-app.netlify.app');
  } else {
    console.error('Deployment ended in state:', deployState);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
