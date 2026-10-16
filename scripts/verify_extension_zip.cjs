const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function checkZip() {
  const zipPath = path.resolve('extension-dist/vimz-ai-extension.zip');
  const data = fs.readFileSync(zipPath);
  const zip = await JSZip.loadAsync(data);
  console.log('ZIP verification: Size =', data.length, 'bytes');
  const entries = Object.keys(zip.files);
  console.log(`Total entries: ${entries.length}`);
  entries.forEach(e => console.log(' -', e));

  // Check manifest inside zip
  const manifestData = await zip.file('manifest.json').async('string');
  const manifest = JSON.parse(manifestData);
  console.log('Manifest Version:', manifest.manifest_version);
  console.log('Manifest Name:', manifest.name);
  console.log('Manifest Permissions:', manifest.permissions);
  console.log('Manifest Host Permissions:', manifest.host_permissions);

  // Check tools.js inside zip
  const toolsFile = zip.file('shared/tools.js');
  console.log('shared/tools.js in zip:', !!toolsFile);
}

checkZip().catch(console.error);
