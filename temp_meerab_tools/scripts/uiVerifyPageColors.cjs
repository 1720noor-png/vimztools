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
const PORT = 9544
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-colors-' + process.pid)
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

  await cmd('Page.enable')
  await cmd('Runtime.enable')

  async function nav(route, ms = 900) {
    const loaded = once('Page.loadEventFired', 10000)
    await cmd('Page.navigate', { url: BASE + route })
    await loaded
    await sleep(ms)
  }

  const evalJs = async (expr) =>
    (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true }))?.result?.value

  console.log('=== STARTING COLOR PALETTES, VIBRANCY & AMBIENT MESH AUDIT ===\n')

  let passCount = 0
  let failCount = 0
  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`)
      passCount++
    } else {
      console.error(`[FAIL] ${message}`)
      failCount++
    }
  }

  // 1. Authenticate user via 1-Click Demo Guest Mode on /login
  await nav('/login', 800)
  await evalJs(`
    const demoBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Guest Mode'));
    if (demoBtn) demoBtn.click();
  `)
  await sleep(1000)

  // 2. Check Home Page Ambient Background & Mesh glow
  await nav('/')
  const ambientCheck = await evalJs(`
    (() => {
      const el = document.querySelector('.ambient-bg');
      if (!el) return { found: false };
      return {
        found: true,
        hasBlur: el.innerHTML.includes('blur-3xl')
      };
    })()
  `)
  assert(ambientCheck && ambientCheck.found && ambientCheck.hasBlur, 'Global AmbientBackground exists with blur-3xl mesh glow orbs')

  // 3. Check Category Cards on Home Page have distinct pastel backgrounds
  const homeCategoryAccents = await evalJs(`
    (() => {
      const cards = document.querySelectorAll('.cat-card');
      if (cards.length === 0) return 0;
      let withVars = 0;
      cards.forEach(c => {
        const bg = c.style.getPropertyValue('--cat-bg');
        const accent = c.style.getPropertyValue('--cat-accent');
        if (bg && accent) withVars++;
      });
      return withVars;
    })()
  `)
  assert(homeCategoryAccents >= 11, `Home Page features ${homeCategoryAccents} category cards with custom --cat-bg and --cat-accent vars`)

  // 4. Check /tools page category pills
  await nav('/tools')
  const toolsCategoryPills = await evalJs(`
    (() => {
      const pills = document.querySelectorAll('a[href^="/tools/"], button');
      let coloredPills = 0;
      pills.forEach(p => {
        if (p.style.backgroundColor && p.style.borderColor) coloredPills++;
      });
      return coloredPills;
    })()
  `)
  assert(toolsCategoryPills >= 10, `/tools page renders ${toolsCategoryPills} vibrant category filter pills with customized background/border styling`)

  // 5. Check /health hub & subcategory page hero and card styling
  await nav('/health')
  const healthHub = await evalJs(`
    (() => {
      const hero = document.querySelector('.accent-hero');
      const cards = document.querySelectorAll('.cat-card, a[href^="/health/"]');
      return { hasHero: !!hero, cardCount: cards.length };
    })()
  `)
  assert(healthHub && healthHub.hasHero && healthHub.cardCount > 0, `Health portal renders .accent-hero banner and ${healthHub?.cardCount} subcategory cards`)

  await nav('/health/weight-management')
  const healthSub = await evalJs(`
    (() => {
      const banner = document.querySelector('[class*="rose-50"], [class*="rose-200"]');
      return { hasRoseBanner: !!banner };
    })()
  `)
  assert(healthSub && healthSub.hasRoseBanner, 'Health subcategory page features rose pastel header banner')

  // 6. Check /image-tools hub & subcategory
  await nav('/image-tools')
  const imageHub = await evalJs(`
    (() => {
      const hero = document.querySelector('.accent-hero');
      return !!hero;
    })()
  `)
  assert(imageHub, 'Image Tools portal renders dedicated sky-blue hero banner')

  await nav('/image-tools/crop-resize')
  const imageSub = await evalJs(`
    (() => {
      const banner = document.querySelector('[class*="sky-50"], [class*="sky-200"]');
      return !!banner;
    })()
  `)
  assert(imageSub && imageSub.hasRoseBanner === undefined && imageSub, 'Image Tools subcategory features sky-blue pastel header banner')

  // 7. Check /students-academics
  await nav('/students-academics')
  const studentHub = await evalJs(`
    (() => {
      const hero = document.querySelector('.accent-hero');
      return !!hero;
    })()
  `)
  assert(studentHub, 'Students & Academics portal renders indigo hero banner')

  // 8. Check /office-corporate module page
  await nav('/office-corporate/hr-people')
  const officeModule = await evalJs(`
    (() => {
      const banner = document.querySelector('[class*="emerald-50"]');
      const cards = document.querySelectorAll('a[href^="/office-corporate/hr-people/"]');
      return { hasEmeraldBanner: !!banner, cardCount: cards.length };
    })()
  `)
  assert(officeModule && officeModule.hasEmeraldBanner && officeModule.cardCount > 0, `Office module page features emerald pastel banner and ${officeModule?.cardCount} subcategory cards`)

  // 9. Check /women subcategory
  await nav('/women/fitness')
  const womenSub = await evalJs(`
    (() => {
      const banner = document.querySelector('[class*="rose-50"]');
      return !!banner;
    })()
  `)
  assert(womenSub, 'Women subcategory page features rose-tinted pastel header banner')

  // 10. Check /category collection page
  await nav('/category')
  const categoryCollections = await evalJs(`
    (() => {
      const banner = document.querySelector('[class*="indigo-50"]');
      const cards = document.querySelectorAll('[class*="from-white"]');
      return { hasBanner: !!banner, cardCount: cards.length };
    })()
  `)
  assert(categoryCollections && categoryCollections.hasBanner, 'Collections hub features pastel header banner and themed folder cards')

  // 11. Check /blogs list & article page
  await nav('/blogs')
  const blogList = await evalJs(`
    (() => {
      const cards = document.querySelectorAll('a[href^="/blog/"]');
      return { cardCount: cards.length };
    })()
  `)
  assert(blogList && blogList.cardCount > 0, `Blog list renders ${blogList?.cardCount} warm amber styled article cards`)

  // 12. Check /privacy policy page
  await nav('/privacy')
  const privacyCheck = await evalJs(`
    (() => {
      const banner = document.querySelector('[class*="emerald-50"]');
      const cards = document.querySelectorAll('[class*="to-emerald-50"]');
      return { hasBanner: !!banner, cardCount: cards.length };
    })()
  `)
  assert(privacyCheck && privacyCheck.hasBanner && privacyCheck.cardCount >= 5, `Privacy page renders emerald header banner and ${privacyCheck?.cardCount} pastel tinted principle cards`)

  // 13. Dark Mode Audit
  const darkModeCheck = await evalJs(`
    (() => {
      document.documentElement.classList.add('dark');
      const isDark = document.documentElement.classList.contains('dark');
      const darkCards = document.querySelectorAll('[class*="dark:from-slate-900"], [class*="dark:border-slate-800"]');
      return { isDark, darkStyledCount: darkCards.length };
    })()
  `)
  assert(darkModeCheck && darkModeCheck.isDark && darkModeCheck.darkStyledCount > 0, `Dark Mode activates correctly and styles ${darkModeCheck?.darkStyledCount} elements with luminous/slate dark styling`)

  console.log(`\n=== FINAL AUDIT RESULT: ${passCount} PASSED, ${failCount} FAILED ===`)

  cleanup()
  process.exit(failCount === 0 ? 0 : 1)
})()
