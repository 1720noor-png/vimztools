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
const PORT = 9488
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-auth-' + process.pid)
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

  async function nav(route, ms = 800) {
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

  console.log('=== STARTING STRICT AUTH GATING & ROUTE PROTECTION VERIFICATION ===\n')

  // 1. Landing Page public access
  await nav('/', 800)
  const homeTitle = await evalJs('document.title')
  check('Landing page is publicly accessible', Boolean(homeTitle && homeTitle.includes('vimz')), homeTitle)

  const ctaGetStarted = await evalJs(`
    Boolean(Array.from(document.querySelectorAll('a, button')).some(el => el.textContent.includes('Get Started')))
  `)
  check('Prominent "Get Started" CTA exists in Hero and Navbar', ctaGetStarted)

  // 2. Strict Route Protection: unauthenticated access to /tools
  await nav('/tools', 800)
  let currentUrl = await evalJs('window.location.href')
  check(
    'Accessing /tools redirects unauthenticated user to /login?redirect=%2Ftools',
    Boolean(currentUrl && currentUrl.includes('/login') && currentUrl.includes('redirect=')),
    currentUrl
  )

  // 3. Strict Route Protection: unauthenticated access to /image-tools
  await nav('/image-tools', 800)
  currentUrl = await evalJs('window.location.href')
  check(
    'Accessing /image-tools redirects unauthenticated user to /login?redirect=%2Fimage-tools',
    Boolean(currentUrl && currentUrl.includes('/login') && currentUrl.includes('redirect=')),
    currentUrl
  )

  // 4. Strict Route Protection: unauthenticated access to /health
  await nav('/health', 800)
  currentUrl = await evalJs('window.location.href')
  check(
    'Accessing /health redirects unauthenticated user to /login?redirect=%2Fhealth',
    Boolean(currentUrl && currentUrl.includes('/login') && currentUrl.includes('redirect=')),
    currentUrl
  )

  // 5. Registration page public access & password complexity checklist
  await nav('/register', 800)
  currentUrl = await evalJs('window.location.href')
  check('Registration page is publicly accessible', Boolean(currentUrl && currentUrl.includes('/register')), currentUrl)

  const regText = await evalJs(`document.body.innerText`)
  const isMinimalRegisterForm = Boolean(
    !regText.includes('Password Complexity') &&
    !regText.includes('Minimum 8 characters') &&
    !regText.includes('Quick test drive') &&
    !regText.includes('1-Click Demo Guest Mode')
  )
  check('Registration form has clean minimal UI with static checklist and demo mode removed', isMinimalRegisterForm)

  // 6. Test standard validation on form submit
  await evalJs(`
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Get Started Free'));
    if (submitBtn) submitBtn.click();
  `)
  await sleep(400)
  const hasSubmitValidation = await evalJs(`
    Boolean(document.body.innerText.includes('required') || document.body.innerText.includes('complexity requirements'))
  `)
  check('Registration form enforces standard validation on submit without static checklist', hasSubmitValidation)

  // 7. Forgot Password Page
  await nav('/forgot-password', 1000)
  const forgotTitle = await evalJs('document.title')
  check('Forgot Password page is accessible', Boolean(forgotTitle && (forgotTitle.includes('Forgot Password') || forgotTitle.includes('Recover'))), forgotTitle)

  // 8. Reset Password Page
  await nav('/reset-password', 1000)
  const resetText = await evalJs('document.body.innerText')
  const hasResetRules = Boolean(
    resetText &&
    resetText.includes('Minimum 8 characters') &&
    resetText.toLowerCase().includes('confirm new password')
  )
  check('Reset Password page renders with the same strict password complexity rules', hasResetRules, resetText?.slice(0, 80))

  // 9. Login & post-login redirect to requested tool workspace
  await nav('/login?redirect=%2Fimage-tools', 800)
  const hasNotice = await evalJs(`
    Boolean(document.body.innerText.includes('Please sign in to access your requested tool workspace'))
  `)
  check('Login page displays friendly redirect notice when redirected from protected tool', hasNotice)

  // Click 1-Click Demo Guest Mode to authenticate
  await evalJs(`
    const demoBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demo Guest Mode'));
    if (demoBtn) demoBtn.click();
  `)
  await sleep(1000)

  // Verify user is now on /image-tools (the redirect target!)
  currentUrl = await evalJs('window.location.href')
  check(
    'User is seamlessly redirected to target tool workspace (/image-tools) after logging in',
    Boolean(currentUrl && currentUrl.includes('/image-tools')),
    currentUrl
  )

  // Verify authenticated state in Header
  const hasUserPill = await evalJs(`
    Boolean(document.body.innerText.includes('Demo') || document.querySelector('button span.bg-gradient-to-tr'))
  `)
  check('Navbar displays user avatar and authenticated session', hasUserPill)

  console.log(`\n=== ALL CHECKS: ${pass} PASSED, ${fail} FAILED ===`)
  cleanup()
  process.exit(fail === 0 ? 0 : 1)
})().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
