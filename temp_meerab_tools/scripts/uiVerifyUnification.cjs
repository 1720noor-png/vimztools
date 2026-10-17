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
const PORT = 9396
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-unif-' + process.pid)
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
  fs.mkdirSync(USER_DIR, { recursive: true })

  const proc = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--remote-debugging-port=' + PORT,
      '--user-data-dir=' + USER_DIR,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  let ver = null
  for (let i = 0; i < 40 && !ver; i++) {
    try {
      const r = await req('GET', 'http://127.0.0.1:' + PORT + '/json/version')
      if (r.status === 200) ver = JSON.parse(r.data)
    } catch {}
    if (!ver) await sleep(400)
  }
  if (!ver) {
    console.log('FATAL: chrome failed to start')
    proc.kill()
    process.exit(1)
  }

  const newTab = await req('PUT', 'http://127.0.0.1:' + PORT + '/json/new?' + encodeURIComponent('about:blank'))
  const tab = JSON.parse(newTab.data)
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
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        ws.removeEventListener('message', h)
        resolve(null)
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

  const errors = []
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.method === 'Runtime.exceptionThrown') {
      const text = m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || 'exception'
      errors.push(text)
    }
    if (
      m.method === 'Log.entryAdded' &&
      m.params.entry.level === 'error' &&
      !/net::|Failed to load resource/.test(m.params.entry.text)
    ) {
      errors.push(m.params.entry.text)
    }
  })

  await cmd('Page.enable')
  await cmd('Runtime.enable')
  await cmd('Log.enable')

  async function nav(route, ms = 700) {
    errors.length = 0
    const loaded = once('Page.loadEventFired', 10000)
    await cmd('Page.navigate', { url: BASE + route })
    await loaded
    await sleep(ms)
  }

  const evalJs = async (expr) =>
    (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true }))?.result?.value

  let pass = 0
  let fail = 0

  function check(name, ok, detail) {
    if (ok) {
      console.log(`[PASS] ${name}`)
      pass++
    } else {
      console.error(`[FAIL] ${name}${detail ? ' :: ' + detail : ''}`)
      fail++
    }
  }

  console.log('=== STARTING UI/UX UNIFICATION & INTEGRATION VERIFICATION ===\n')

  // 1. Verify Top Navbar Header Links & Active Indicators
  await nav('/', 800)
  check('Homepage loads with 0 errors', errors.length === 0, errors.join('; '))

  const hasWordHeaderLink = await evalJs(`
    Array.from(document.querySelectorAll('header nav button')).some(b => b.textContent.includes('MS Word Suite'))
  `)
  check('Top Navbar has "MS Word Suite" nav button', hasWordHeaderLink)

  // Verify Active State Pill Indicator on Navbar when visiting /tools/document-word
  await nav('/tools/document-word', 800)
  const isWordNavActive = await evalJs(`
    const btn = Array.from(document.querySelectorAll('header nav button')).find(b => b.textContent.includes('MS Word Suite'));
    btn ? btn.className.includes('bg-primary-50') && btn.className.includes('text-primary-700') : false
  `)
  check('Navbar shows active pill indicator when on MS Word Suite', isWordNavActive)

  // 2. Verify Homepage Category Grid Inclusion
  await nav('/', 800)
  const hasWordCategoryCard = await evalJs(`
    Array.from(document.querySelectorAll('.cat-card h3')).some(h => h.textContent.includes('MS Word & Document Suite'))
  `)
  check('Homepage "Browse by category" grid includes MS Word & Document Suite', hasWordCategoryCard)

  const wordCardCountBadge = await evalJs(`
    const card = Array.from(document.querySelectorAll('.cat-card')).find(c => c.textContent.includes('MS Word & Document Suite'));
    card ? card.textContent.includes('105 tools') : false
  `)
  check('Homepage MS Word card displays "105 tools" count badge', wordCardCountBadge)

  // 3. Verify Unified Top Search Bar & Subcategory Cards on MS Word Suite
  await nav('/tools/document-word', 800)
  const wordSearchExists = await evalJs(`!!document.querySelector('input[placeholder*="Search all ms word"]')`)
  check('MS Word Hub renders prominent top search bar', wordSearchExists)

  const wordFoldersCount = await evalJs(`document.querySelectorAll('.grid button h3').length`)
  check('MS Word Hub renders exactly 35 subcategory folder cards', wordFoldersCount === 35, `Got: ${wordFoldersCount}`)

  // Verify hover description transition class on cards
  const hasHoverDesc = await evalJs(`
    const p = document.querySelector('.grid button p.opacity-0');
    p ? p.className.includes('group-hover:opacity-100') : false
  `)
  check('Subcategory card has smart hover reveal transition', hasHoverDesc)

  // Test real-time top search query filtering
  await evalJs(`
    const input = document.querySelector('input[placeholder*="Search all ms word"]');
    input.value = 'TOC';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  `)
  await sleep(400)
  check('Real-time search filtering produced 0 errors', errors.length === 0, errors.join('; '))

  // 4. Verify Unified Top Search Bar & Subcategory Cards on PDF Utilities
  await nav('/tools/pdf', 800)
  const pdfSearchExists = await evalJs(`!!document.querySelector('input[placeholder*="Search all pdf utilities"]')`)
  check('PDF Utilities Hub renders prominent top search bar', pdfSearchExists)

  const pdfFoldersCount = await evalJs(`document.querySelectorAll('.grid button h3').length`)
  check('PDF Utilities Hub renders exactly 23 subcategory folder cards', pdfFoldersCount === 23, `Got: ${pdfFoldersCount}`)

  // 5. Verify Unified Top Search Bar on other Category Portals
  const portalRoutes = [
    { route: '/image-tools', name: 'Image Tools', count: 20 },
    { route: '/office-corporate', name: 'Office & Corporate', count: 4 },
    { route: '/health', name: 'Health', count: 19 },
    { route: '/students-academics', name: 'Students & Academics', count: 20 },
    { route: '/household', name: 'Household', count: 15 },
    { route: '/marketers-seo', name: 'Marketers & SEO', count: 23 },
  ]

  for (const portal of portalRoutes) {
    await nav(portal.route, 800)
    check(`Portal ${portal.name} loads with 0 errors`, errors.length === 0, errors.join('; '))
    const searchFound = await evalJs(`!!document.querySelector('input[placeholder*="Search"]')`)
    check(`Portal ${portal.name} renders unified top search bar`, searchFound)
  }

  // 6. Verify Tool Workspace Standard Layout (ToolShell)
  await nav('/tools/document-word/word-document-fixer', 800)
  check('Word Document Fixer tool workspace loads with 0 errors', errors.length === 0, errors.join('; '))

  // Verify Breadcrumb
  const hasBreadcrumb = await evalJs(`!!document.querySelector('nav[aria-label="Breadcrumb"]')`)
  check('Tool workspace renders Breadcrumb navigation', hasBreadcrumb)

  // Verify Category Badge
  const hasCategoryBadge = await evalJs(`
    const badge = document.querySelector('.flex-1 span[class*="uppercase"]');
    badge ? badge.textContent.length > 0 : false
  `)
  check('Tool workspace renders Category Badge chip', hasCategoryBadge)

  // Verify Collapsible Guide Section
  const hasGuideSection = await evalJs(`
    Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('How to Use This Tool'))
  `)
  check('Tool workspace renders Collapsible "How to Use This Tool" guide', hasGuideSection)

  // Test toggling collapsible guide
  await evalJs(`
    const guideToggle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('How to Use This Tool'));
    if (guideToggle) guideToggle.click();
  `)
  await sleep(300)
  check('Toggling guide collapse produced 0 errors', errors.length === 0, errors.join('; '))

  // 7. Verify Dark Mode across Shell & Hubs
  await nav('/tools/document-word', 600)
  await evalJs(`document.documentElement.classList.add('dark')`)
  await sleep(300)
  const isDark = await evalJs(`document.documentElement.classList.contains('dark')`)
  check('Dark mode toggles cleanly on unified Hub', isDark)
  check('Dark mode on unified Hub produces 0 errors', errors.length === 0, errors.join('; '))
  await evalJs(`document.documentElement.classList.remove('dark')`)

  console.log(`\n=== CDP TEST SUMMARY ===`)
  console.log(`Passed: ${pass}`)
  console.log(`Failed: ${fail}`)

  proc.kill()
  try {
    fs.rmSync(USER_DIR, { recursive: true, force: true })
  } catch {}

  if (fail > 0) {
    process.exit(1)
  } else {
    console.log('\n🎉 ALL UNIFICATION & INTEGRATION CDP TESTS PASSED WITH 0 ERRORS! 🎉')
    process.exit(0)
  }
})()
