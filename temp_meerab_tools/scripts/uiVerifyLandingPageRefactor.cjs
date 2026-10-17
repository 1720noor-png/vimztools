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
const PORT = 9552
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-landing-' + process.pid)
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

  async function evalJs(expression) {
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

  console.log('=== STARTING LANDING PAGE UI REFACTOR VERIFICATION ===\n')

  // Set desktop viewport
  await cmd('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  })

  // 1. Navigate to Landing Page
  console.log('1. Checking Sticky Navbar Background, Blur & Z-Index...')
  await cmd('Page.navigate', { url: BASE + '/' })
  await once('Page.loadEventFired', 10000)
  await sleep(1000)

  const headerInfo = await evalJs(`
    (() => {
      const header = document.querySelector('header');
      if (!header) return null;
      const cs = window.getComputedStyle(header);
      return {
        classes: header.className,
        position: cs.position,
        zIndex: cs.zIndex,
        backdropFilter: cs.backdropFilter || cs.webkitBackdropFilter,
        borderBottomWidth: cs.borderBottomWidth,
        borderBottomColor: cs.borderBottomColor,
      };
    })()
  `)

  assert(headerInfo && headerInfo.position === 'sticky', 'Header position is sticky')
  assert(headerInfo && headerInfo.zIndex === '50', `Header z-index is 50 (got ${headerInfo?.zIndex})`)
  assert(headerInfo && headerInfo.classes.includes('bg-white/90'), 'Header has semi-translucent solid bg-white/90 background')
  assert(headerInfo && headerInfo.classes.includes('backdrop-blur-md'), 'Header has backdrop-blur-md')
  assert(headerInfo && (headerInfo.classes.includes('border-b') && headerInfo.classes.includes('border-gray-100')), 'Header has subtle border-b border-gray-100')

  // 2. Checking Redundant Search Bar behavior on HomePage
  console.log('\n2. Checking Redundant Search Bar at Top of Page vs Scrolled...')
  const heroSearchExists = await evalJs(`Boolean(document.querySelector('input[placeholder="Search tools..."]'))`)
  assert(heroSearchExists, 'Hero search bar is present in hero section')

  // At top of page: Navbar should show compact icon trigger, NOT the full text input
  const navbarFullSearchAtTop = await evalJs(`
    (() => {
      const header = document.querySelector('header');
      if (!header) return false;
      const kbd = header.querySelector('kbd');
      return kbd !== null && window.getComputedStyle(kbd).display !== 'none';
    })()
  `)
  assert(!navbarFullSearchAtTop, 'Navbar full search input is hidden at top of page (no redundant search inputs)')

  const navbarCompactIconAtTop = await evalJs(`
    (() => {
      const header = document.querySelector('header');
      if (!header) return false;
      const btn = header.querySelector('button[aria-label="Search tools"], button[title*="Search"]');
      return btn !== null;
    })()
  `)
  assert(navbarCompactIconAtTop, 'Navbar compact search icon trigger is rendered at top of page')

  // Now scroll past hero (e.g. scrollY = 350)
  await evalJs(`
    window.scrollTo({ top: 350, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 350;
    window.dispatchEvent(new Event('scroll'));
  `)
  await sleep(400)

  const navbarFullSearchScrolled = await evalJs(`
    (() => {
      const header = document.querySelector('header');
      if (!header) return false;
      const kbd = header.querySelector('kbd');
      return kbd !== null;
    })()
  `)
  assert(navbarFullSearchScrolled, 'Navbar full search input reveals when scrolled past hero section')

  // Return to top
  await evalJs(`
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    window.dispatchEvent(new Event('scroll'));
  `)
  await sleep(400)

  // 3. Category Card Badges Contrast & Typography
  console.log('\n3. Checking Category Card Badges Contrast & Typography...')
  const badgeInfo = await evalJs(`
    (() => {
      const badges = document.querySelectorAll('.cat-count-badge');
      if (badges.length === 0) return null;
      const first = badges[0];
      const cs = window.getComputedStyle(first);
      return {
        count: badges.length,
        sampleText: first.textContent.trim(),
        classes: first.className,
        fontWeight: cs.fontWeight,
        color: cs.color,
      };
    })()
  `)

  assert(badgeInfo && badgeInfo.count >= 10, `Category count badges found (${badgeInfo?.count} badges)`)
  assert(badgeInfo && (badgeInfo.fontWeight === '500' || badgeInfo.classes.includes('font-medium')), `Badge font-weight is medium (500) (got ${badgeInfo?.fontWeight})`)
  assert(badgeInfo && (badgeInfo.classes.includes('text-gray-700') || badgeInfo.color === 'rgb(55, 65, 81)'), 'Badge has high-contrast text-gray-700 in light mode')

  // Check Dark Mode Badge Contrast
  await evalJs(`document.documentElement.classList.add('dark');`)
  await sleep(300)

  const darkBadgeColor = await evalJs(`
    (() => {
      const first = document.querySelector('.cat-count-badge');
      if (!first) return null;
      const cs = window.getComputedStyle(first);
      return cs.color;
    })()
  `)
  assert(darkBadgeColor === 'rgb(229, 231, 235)' || darkBadgeColor === 'rgb(249, 250, 251)', `Badge has high-contrast text-gray-200 in dark mode (got ${darkBadgeColor})`)

  // Reset to light mode
  await evalJs(`document.documentElement.classList.remove('dark');`)
  await sleep(200)

  // 4. Category Grid Layout & Spacing
  console.log('\n4. Checking Category Grid Layout & Centered Container Spacing...')
  const gridInfo = await evalJs(`
    (() => {
      const section = document.querySelector('section.max-w-7xl:has(.cat-card)') ||
                      Array.from(document.querySelectorAll('section')).find(s => s.querySelector('.cat-card'));
      if (!section) return null;

      const grid = section.querySelector('.grid');
      const cards = section.querySelectorAll('.cat-card');
      const firstCard = cards[0];

      const rect = section.getBoundingClientRect();
      const clientWidth = document.documentElement.clientWidth;
      const leftMargin = rect.left;
      const rightMargin = clientWidth - rect.right;

      return {
        sectionClasses: section.className,
        gridClasses: grid ? grid.className : '',
        cardClasses: firstCard ? firstCard.className : '',
        leftMargin: Math.round(leftMargin),
        rightMargin: Math.round(rightMargin),
        equalMargins: Math.abs(leftMargin - rightMargin) <= 3,
      };
    })()
  `)

  assert(gridInfo && gridInfo.sectionClasses.includes('mx-auto'), 'Section container has mx-auto')
  assert(gridInfo && gridInfo.sectionClasses.includes('max-w-7xl'), 'Section container has max-w-7xl')
  assert(gridInfo && gridInfo.sectionClasses.includes('px-4'), 'Section container has px-4')
  assert(gridInfo && gridInfo.equalMargins, `Container is centrally aligned with equal left & right margins (L: ${gridInfo?.leftMargin}px, R: ${gridInfo?.rightMargin}px)`)
  assert(gridInfo && (gridInfo.gridClasses.includes('gap-4') && gridInfo.gridClasses.includes('md:gap-6')), 'Grid maintains responsive gap-4 md:gap-6')
  assert(gridInfo && (gridInfo.cardClasses.includes('p-5') && gridInfo.cardClasses.includes('md:p-6')), 'Cards maintain balanced padding p-5 md:p-6')

  // 5. Check Console Errors
  console.log('\n5. Checking Console Errors...')
  assert(consoleErrors.length === 0, `Zero console errors (found ${consoleErrors.length})`)

  console.log(`\n===========================================`)
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log(`===========================================`)

  cleanup()
  process.exit(failed > 0 ? 1 : 0)
})().catch((err) => {
  console.error('Test script crashed:', err)
  process.exit(1)
})
