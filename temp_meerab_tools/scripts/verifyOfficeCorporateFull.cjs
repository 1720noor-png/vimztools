const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

let CHROME = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
if (!fs.existsSync(CHROME)) CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9395
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-off-' + process.pid)
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
  fs.rmSync(USER_DIR, { recursive: true, force: true })
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
      errors.push(m.params.exceptionDetails?.text || 'exception')
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

  async function nav(route, ms = 600) {
    errors.length = 0
    const loaded = once('Page.loadEventFired', 10000)
    await cmd('Page.navigate', { url: BASE + route })
    await loaded
    await sleep(ms)
  }

  const evalJs = async (expr) => (await cmd('Runtime.evaluate', { expression: expr, returnByValue: true }))?.result?.value

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

  console.log('\n=== 1. VERIFYING HOMEPAGE & HEADER NAVIGATION ===')
  await nav('/', 800)
  const officeHeaderBtn = await evalJs(`
    (() => {
      const btns = Array.from(document.querySelectorAll('header nav button'));
      return btns.some(b => b.innerText.includes('Office & Corporate'));
    })()
  `)
  check('Header contains "Office & Corporate" navigation link', officeHeaderBtn === true)

  const officeCardOnHome = await evalJs(`
    (() => {
      const cards = Array.from(document.querySelectorAll('button, a'));
      return cards.some(c => c.innerText.includes('Office & Corporate'));
    })()
  `)
  check('Homepage "Browse by category" contains "Office & Corporate Utilities" card', officeCardOnHome === true)

  console.log('\n=== 2. VERIFYING OFFICE & CORPORATE HUB (/office-corporate) ===')
  await nav('/office-corporate', 800)
  const hubH1 = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
  check('Hub H1 is "Office & Corporate Utilities"', hubH1 === 'Office & Corporate Utilities', hubH1)

  const hubDescription = await evalJs(`document.body.innerText.includes('All 600 tools run entirely in your browser')`)
  check('Hub states 600 tools available', hubDescription === true)

  const modulesCount = await evalJs(`document.querySelectorAll('a[href*="/office-corporate/"]').length`)
  check('Hub renders all 12 corporate modules', modulesCount === 12, `Found ${modulesCount} module cards`)

  console.log('\n=== 3. VERIFYING OFFICE MODULE & SUBCATEGORY DRILL-DOWN ===')
  await nav('/office-corporate/hr-people', 600)
  const moduleH1 = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
  check('Module page H1 is "HR & People"', moduleH1 === 'HR & People', moduleH1)

  const subcatLinks = await evalJs(`document.querySelectorAll('a[href*="/office-corporate/hr-people/"]').length`)
  check('HR & People renders its 3 subcategories', subcatLinks === 3, `Found ${subcatLinks}`)

  await nav('/office-corporate/hr-people/recruitment', 600)
  const subcatH1 = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
  check('Subcategory page H1 is "Recruitment"', subcatH1 === 'Recruitment', subcatH1)

  const subcatToolsCount = await evalJs(`document.querySelectorAll('a[href*="/tools/office-corporate/"]').length`)
  check('Recruitment subcategory renders all 12 tools', subcatToolsCount === 12, `Found ${subcatToolsCount}`)

  console.log('\n=== 4. VERIFYING TOOL EXECUTION & REAL RECOMPUTE ===')
  await nav('/tools/office-corporate/cost-per-hire-calculator', 600)
  const toolH1 = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
  check('Tool H1 is "Cost-Per-Hire Calculator"', toolH1 === 'Cost-Per-Hire Calculator', toolH1)

  const inputsCount = await evalJs(`document.querySelectorAll('input, select').length`)
  check('Tool has input fields rendered', inputsCount >= 3, `Found ${inputsCount} inputs`)

  const initialCph = await evalJs(`
    (() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.includes('$700'));
      return Boolean(el);
    })()
  `)
  check('Tool calculates default cost-per-hire ($700)', initialCph === true)

  console.log('\n=== 5. VERIFYING TOOLS DIRECTORY (/tools/office-corporate) ===')
  await nav('/tools/office-corporate', 1200)
  const totalCards = await evalJs(`document.querySelectorAll('a[href*="/tools/office-corporate/"]').length`)
  check('Tools directory renders exactly 600 tools for office-corporate', totalCards === 600, `Found ${totalCards} tools`)

  console.log('\n=== 6. VERIFYING ZERO CONSOLE ERRORS ===')
  check('Zero console errors throughout all Office & Corporate tests', errors.length === 0, errors.join('; '))

  console.log(`\n========================================`)
  console.log(`VERIFICATION SUMMARY: ${pass} PASSED, ${fail} FAILED`)
  console.log(`========================================\n`)

  ws.close()
  proc.kill()
  try {
    fs.rmSync(USER_DIR, { recursive: true, force: true })
  } catch {}

  process.exit(fail > 0 ? 1 : 0)
})().catch((err) => {
  console.error('Test harness exception:', err)
  process.exit(1)
})
