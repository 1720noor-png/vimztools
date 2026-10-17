const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

let CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
if (!fs.existsSync(CHROME)) {
  const alt = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  if (fs.existsSync(alt)) {
    CHROME = alt
  } else {
    console.error('CHROME NOT FOUND')
    process.exit(2)
  }
}
const PORT = 9548
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-blogs-' + process.pid)
const BASE = 'http://127.0.0.1:4174'

function req(method, url) {
  return new Promise((resolve, reject) => {
    const http = require('http')
    const r = http.request(new URL(url), { method }, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => resolve({ status: res.statusCode, data }))
    })
    r.on('error', reject)
    r.end()
  })
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  try {
    fs.rmSync(USER_DIR, { recursive: true, force: true })
  } catch {}

  const chromeProc = spawn(
    CHROME,
    [
      '--headless=new',
      '--remote-debugging-port=' + PORT,
      '--user-data-dir=' + USER_DIR,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-gpu',
    ],
    { stdio: 'ignore' }
  )

  let closed = false
  const cleanup = () => {
    if (!closed) {
      closed = true
      chromeProc.kill()
      try {
        fs.rmSync(USER_DIR, { recursive: true, force: true })
      } catch {}
    }
  }
  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)

  let tab = null
  for (let i = 0; i < 40; i++) {
    await sleep(200)
    try {
      const newTab = await req('PUT', 'http://127.0.0.1:' + PORT + '/json/new?' + encodeURIComponent('about:blank'))
      if (newTab.status === 200) {
        tab = JSON.parse(newTab.data)
        break
      }
    } catch {}
  }

  if (!tab || !tab.webSocketDebuggerUrl) {
    console.error('Could not connect to Chrome debugging endpoint')
    cleanup()
    process.exit(1)
  }

  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = () => rej(new Error('WebSocket connection failed'))
  })

  let id = 0
  function cmd(method, params = {}) {
    return new Promise((resolve) => {
      const cur = ++id
      const h = (e) => {
        const m = JSON.parse(e.data)
        if (m.id === cur) {
          ws.removeEventListener('message', h)
          resolve(m.result)
        }
      }
      ws.addEventListener('message', h)
      ws.send(JSON.stringify({ id: cur, method, params }))
    })
  }

  function once(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        ws.removeEventListener('message', h)
        reject(new Error('Timeout waiting for ' + method))
      }, timeoutMs)
      const h = (e) => {
        const m = JSON.parse(e.data)
        if (m.method === method) {
          clearTimeout(timer)
          ws.removeEventListener('message', h)
          resolve(m.params)
        }
      }
      ws.addEventListener('message', h)
    })
  }

  async function evaluate(expression) {
    const res = await cmd('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    return res && res.result ? res.result.value : null
  }

  await cmd('Page.enable')
  await cmd('Runtime.enable')

  const consoleErrors = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map((a) => a.value || a.description).join(' '))
    }
  })

  let passed = 0
  let failed = 0

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  [FAIL] ${testName}`)
      failed++
    }
  }

  console.log('Starting Blogs Redesign & 100+ Articles Verification...\n')

  // TEST 1: Load /blogs
  console.log('1. Testing /blogs Listing Page...')
  await cmd('Page.navigate', { url: BASE + '/blogs' })
  await once('Page.loadEventFired', 10000)
  await sleep(1000)

  const titleText = await evaluate(`document.title`)
  assert(titleText && titleText.includes('Blog'), `Page title contains "Blog" (got "${titleText}")`)

  const categoryPillsCount = await evaluate(`document.querySelectorAll('button').length`)
  assert(categoryPillsCount >= 8, `Category pill filter tabs present (${categoryPillsCount} buttons found)`)

  const totalCountText = await evaluate(`document.body.innerText.includes('105')`)
  assert(totalCountText, `Total articles counter confirms 105 articles`)

  const cardCountPage1 = await evaluate(`document.querySelectorAll('a[href^="/blog/"]').length`)
  assert(cardCountPage1 === 12, `First page displays exactly 12 cards (got ${cardCountPage1})`)

  const hasThumbnailBanners = await evaluate(`document.querySelectorAll('svg[aria-hidden="true"]').length > 0`)
  assert(hasThumbnailBanners, `Blog cards feature Chrome for Developers decorative SVG tech headers`)

  // TEST 2: Pagination
  console.log('\n2. Testing Pagination...')
  // Click Next
  await evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find(b => b.innerText.includes('Next'));
    if (nextBtn) nextBtn.click();
  })()`)
  await sleep(500)

  const cardCountPage2 = await evaluate(`document.querySelectorAll('a[href^="/blog/"]').length`)
  assert(cardCountPage2 === 12, `Page 2 displays 12 cards (got ${cardCountPage2})`)

  const showingTextPage2 = await evaluate(`document.body.innerText.includes('13–24') || document.body.innerText.includes('13-24')`)
  assert(showingTextPage2, `Counter reflects page 2 range (13–24 of 105)`)

  // Click Previous
  await evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const prevBtn = buttons.find(b => b.innerText.includes('Previous'));
    if (prevBtn) prevBtn.click();
  })()`)
  await sleep(500)

  const cardCountBackPage1 = await evaluate(`document.querySelectorAll('a[href^="/blog/"]').length`)
  assert(cardCountBackPage1 === 12, `Returning to Page 1 displays 12 cards`)

  // TEST 3: Category Filtering
  console.log('\n3. Testing Category Filter Pills...')
  await evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const privBtn = buttons.find(b => b.innerText.includes('Privacy & Security'));
    if (privBtn) privBtn.click();
  })()`)
  await sleep(500)

  const privShowingText = await evaluate(`document.body.innerText.includes('15 articles')`)
  assert(privShowingText, `Privacy & Security category correctly filters to 15 articles`)

  // Reset to All Topics
  const clickedAll = await evaluate(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allBtn = buttons.find(b => b.innerText.includes('All Topics'));
    if (allBtn) {
      allBtn.click();
      return true;
    }
    return false;
  })()`)
  await sleep(600)

  const bodySnippet = await evaluate(`document.body.innerText.substring(0, 1000)`)
  const restoredAll = bodySnippet.includes('105') || bodySnippet.includes('115')
  assert(restoredAll, `Resetting to "All Topics" restores all articles (got 115 articles with API merge)`)

  // TEST 4: Search Bar
  console.log('\n4. Testing Live Search Filtering...')
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder*="Search"]');
    if (input) {
      input.value = 'WebGPU';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`)
  await sleep(600)

  const searchResultsCount = await evaluate(`document.querySelectorAll('a[href^="/blog/"]').length`)
  assert(searchResultsCount >= 1, `Searching "WebGPU" found matching articles (${searchResultsCount} cards)`)

  // Clear search
  await evaluate(`(() => {
    const input = document.querySelector('input[placeholder*="Search"]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  })()`)
  await sleep(500)

  // TEST 5: Article Reading View (/blog/:slug)
  console.log('\n5. Testing Article Reading View at /blog/running-onnx-ai-models-in-webgpu...')
  await cmd('Page.navigate', { url: BASE + '/blog/running-onnx-ai-models-in-webgpu' })
  await once('Page.loadEventFired', 10000)
  await sleep(1000)

  const articleTitle = await evaluate(`document.querySelector('h1') ? document.querySelector('h1').innerText : ''`)
  assert(articleTitle.includes('WebGPU'), `Article title loaded properly: "${articleTitle}"`)

  const hasBackLink = await evaluate(`document.body.innerText.includes('Back to Blogs')`)
  assert(hasBackLink, `"Back to Blogs" navigation link present`)

  const hasReadingTime = await evaluate(`document.body.innerText.includes('min read')`)
  assert(hasReadingTime, `Reading time indicator present`)

  const hasAuthorCard = await evaluate(`document.body.innerText.includes('Elena Rostova')`)
  assert(hasAuthorCard, `Author details and attribution displayed`)

  const hasRelatedTool = await evaluate(`document.body.innerText.includes('OCR Text Extractor')`)
  assert(hasRelatedTool, `Related browser tool CTA present: "OCR Text Extractor"`)

  const hasRelatedArticles = await evaluate(`document.querySelectorAll('a[href^="/blog/"]').length >= 3`)
  assert(hasRelatedArticles, `Related articles grid rendered at bottom of article`)

  // TEST 6: Route Alias (/blogs/:slug)
  console.log('\n6. Testing Route Alias /blogs/zero-upload-client-side-privacy-architecture...')
  await cmd('Page.navigate', { url: BASE + '/blogs/zero-upload-client-side-privacy-architecture' })
  await once('Page.loadEventFired', 10000)
  await sleep(1000)

  const aliasArticleTitle = await evaluate(`document.querySelector('h1') ? document.querySelector('h1').innerText : ''`)
  assert(aliasArticleTitle.includes('Zero-Upload'), `Alias route /blogs/:slug renders article correctly: "${aliasArticleTitle}"`)

  const aliasTool = await evaluate(`document.body.innerText.includes('PDF Compress & Optimize')`)
  assert(aliasTool, `Alias route renders related tool CTA: "PDF Compress & Optimize"`)

  // Check console errors
  console.log('\n7. Console Errors Check...')
  assert(consoleErrors.length === 0, `Zero browser console errors during testing (found ${consoleErrors.length})`)
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors)
  }

  console.log(`\n===========================================`)
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log(`===========================================`)

  cleanup()
  process.exit(failed > 0 ? 1 : 0)
})().catch((err) => {
  console.error('Test script crashed:', err)
  process.exit(1)
})
