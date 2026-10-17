async function testUrls() {
  const urls = [
    'https://vimz-ai.surge.sh/',
    'https://vimz-ai.surge.sh/tools/pdf',
    'https://vimz-ai.surge.sh/office-corporate',
    'https://vimz-ai.surge.sh/tools/ms-word-tools',
    'https://vimz-ai.surge.sh/image-tools',
    'https://vimz-ai.surge.sh/health',
    'https://vimz-ai.surge.sh/household'
  ];
  let allOk = true;
  for (const u of urls) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      const hasRoot = text.includes('id="root"');
      console.log(`[HTTP ${res.status}] ${u} (Length: ${text.length}, SPA root: ${hasRoot})`);
      if (res.status !== 200 || !hasRoot) {
        allOk = false;
      }
    } catch (err) {
      console.error(`${u} -> Error: ${err.message}`);
      allOk = false;
    }
  }
  if (allOk) {
    console.log('ALL ROUTES RETURN 200 OK WITH SPA HTML!');
  } else {
    console.error('Some routes failed!');
    process.exitCode = 1;
  }
}
testUrls();
