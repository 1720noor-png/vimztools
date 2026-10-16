const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function buildExtensionZip() {
  const zip = new JSZip();
  const extDir = path.resolve('extension');
  const extDistDir = path.resolve('extension-dist');
  const distDir = path.resolve('dist');

  if (!fs.existsSync(extDistDir)) {
    fs.mkdirSync(extDistDir, { recursive: true });
  }

  // Recursive directory walker
  function addDirectory(currentDir, zipFolder) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(file);
        addDirectory(fullPath, subFolder);
      } else {
        // Exclude README, store checklist, and Windows system files
        if (file === 'README.md' || file === 'CHROMEWEBSTORE.md' || file.toLowerCase() === 'desktop.ini' || file.toLowerCase() === 'thumbs.db' || file.startsWith('.')) {
          continue;
        }
        const fileData = fs.readFileSync(fullPath);
        zipFolder.file(file, fileData);
      }
    }
  }

  console.log('Packaging extension files from:', extDir);
  addDirectory(extDir, zip);

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  
  const extOutputPath = path.join(extDistDir, 'vimz-ai-extension.zip');
  fs.writeFileSync(extOutputPath, content);
  console.log(`Successfully built Chrome Extension package: ${extOutputPath} (${content.length} bytes)`);

  if (fs.existsSync(distDir)) {
    const distOutputPath = path.join(distDir, 'vimz-ai-extension.zip');
    fs.writeFileSync(distOutputPath, content);
    console.log(`Also mirrored to: ${distOutputPath}`);
  }
}

buildExtensionZip().catch(err => {
  console.error('Failed to build extension zip:', err);
  process.exit(1);
});
