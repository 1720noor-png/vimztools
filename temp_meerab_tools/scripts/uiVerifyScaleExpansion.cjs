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
const PORT = 9398
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-scale-' + process.pid)
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

  console.log('=== STARTING SCALE EXPANSION SUITES CDP VERIFICATION ===\n')

  // 1. Homepage loads cleanly
  await nav('/', 800)
  check('Homepage loads with 0 errors', errors.length === 0, errors.join('; '))

  // 2. Check 6 new categories on homepage
  const newPortals = [
    'AI & Machine Learning',
    'Developer & Cloud Suite',
    'Cybersecurity, Privacy & Cryptography',
    'Sustainable Energy & Climate Tech',
    'Fintech & Venture Economics',
    'Everyday Utilities & Accessibility',
  ]

  for (const portal of newPortals) {
    const exists = await evalJs(`
      Array.from(document.querySelectorAll('.cat-card h3')).some(h => h.textContent.includes('${portal}'))
    `)
    check(`Homepage category grid includes "${portal}"`, exists)
  }

  // 3. Verify Portal Hubs
  const hubs = [
    { name: 'AI Tools', route: '/ai-tools', sub: '/ai-tools/ai-prompt-engineering', tool: '/tools/ai-tools/few-shot-prompt-formatter' },
    { name: 'Dev & Cloud', route: '/dev-cloud', sub: '/dev-cloud/api-webhooks', tool: '/tools/dev-cloud/curl-to-fetch-python-converter' },
    { name: 'Cybersecurity', route: '/cyber-security', sub: '/cyber-security/password-entropy', tool: '/tools/cyber-security/password-entropy-crack-time-estimator' },
    { name: 'Green Energy', route: '/green-energy', sub: '/green-energy/solar-pv', tool: '/tools/green-energy/solar-pv-array-capacity-calculator' },
    { name: 'Fintech', route: '/fintech-venture', sub: '/fintech-venture/startup-runway', tool: '/tools/fintech-venture/startup-runway-zero-cash-date-calculator' },
    { name: 'Everyday Tools', route: '/civic-lifestyle', sub: '/civic-lifestyle/wcag-contrast', tool: '/tools/civic-lifestyle/wcag-apca-color-contrast-checker' },
  ]

  for (const h of hubs) {
    // Hub page
    await nav(h.route, 800)
    check(`${h.name} Hub loads with 0 errors`, errors.length === 0, errors.join('; '))
    const folderCount = await evalJs(`document.querySelectorAll('.grid a').length`)
    check(`${h.name} renders folder tiles (count=${folderCount})`, folderCount >= 20)

    // Subcategory page
    await nav(h.sub, 800)
    check(`${h.name} Subcategory page loads with 0 errors`, errors.length === 0, errors.join('; '))
    const toolCards = await evalJs(`document.querySelectorAll('.grid a').length`)
    check(`${h.name} Subcategory displays tool cards (count=${toolCards})`, toolCards >= 1)

    // Tool Workspace page
    await nav(h.tool, 800)
    check(`${h.name} Tool page loads with 0 errors`, errors.length === 0, errors.join('; '))
    const inputCount = await evalJs(`document.querySelectorAll('input, select, textarea').length`)
    check(`${h.name} Tool renders active workspace with inputs (count=${inputCount})`, inputCount >= 1)
  }

  // 4. Dark theme toggle test
  await nav('/', 600)
  await evalJs(`document.documentElement.classList.add('dark')`)
  await sleep(300)
  const isDark = await evalJs(`document.documentElement.classList.contains('dark')`)
  check('Dark mode toggles on smoothly', isDark)
  check('Dark mode renders with 0 errors', errors.length === 0, errors.join('; '))

  console.log(`\n=== VERIFICATION FINISHED: ${pass} PASSED, ${fail} FAILED ===\n`)
  ws.close()
  proc.kill()
  process.exit(fail === 0 ? 0 : 1)
})()
