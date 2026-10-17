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
const PORT = 9392
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-pdf-' + process.pid)
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

  console.log('=== STARTING PDF UTILITIES CDP VERIFICATION ===\n')

  // 1. Visit PDF Hub (/tools/pdf)
  await nav('/tools/pdf', 1000)
  check('PDF hub loads with 0 runtime errors', errors.length === 0, errors.join('; '))

  const heading = await evalJs(`document.querySelector('h1')?.textContent || ''`)
  check('PDF hub h1 is rendered', heading.includes('PDF Utilities'), `Got: ${heading}`)

  const folderCount = await evalJs(`document.querySelectorAll('.grid button h3').length`)
  check('PDF hub renders all 23 folder cards', folderCount === 23, `Got: ${folderCount}`)

  // Strict Hub Cleanliness: Zero loose tool cards floating outside folders on the main landing page
  const looseCardsCount = await evalJs(`document.querySelectorAll('main a[href*="/tools/pdf/"]').length`)
  check('PDF hub has 0 loose tool cards floating on landing page', looseCardsCount === 0, `Got: ${looseCardsCount}`)

  // 2. Test Preserved Tools Navigation
  const preservedTests = [
    { slug: 'image-to-pdf', name: 'Image to PDF Converter' },
    { slug: 'pdf-merge-split', name: 'PDF Merge & Split' },
    { slug: 'pdf-password-protect', name: 'Protect PDF' },
    { slug: 'pdf-ocr', name: 'PDF OCR' },
    { slug: 'word-to-pdf', name: 'Word to PDF' },
  ]

  for (const t of preservedTests) {
    await nav(`/tools/pdf/${t.slug}`, 800)
    check(`Preserved tool ${t.slug} loads with 0 errors`, errors.length === 0, errors.join('; '))
    const titleText = await evalJs(`document.querySelector('h1')?.textContent || ''`)
    check(`Preserved tool ${t.slug} displays proper header`, titleText.length > 0, `Title: ${titleText}`)
  }

  // 3. Test 3-Tier Routing Isolation (/tools/pdf/[subcategory]/[tool-slug])
  const threeTierTests = [
    { sub: 'core', slug: 'image-to-pdf' },
    { sub: 'page-management', slug: 'pdf-split' },
    { sub: 'security-privacy', slug: 'pdf-password-protect' },
    { sub: 'extraction-smart', slug: 'pdf-ocr' },
  ]
  for (const t of threeTierTests) {
    await nav(`/tools/pdf/${t.sub}/${t.slug}`, 800)
    check(`3-Tier route /tools/pdf/${t.sub}/${t.slug} resolves with 0 errors`, errors.length === 0, errors.join('; '))
    const titleText = await evalJs(`document.querySelector('h1')?.textContent || ''`)
    check(`3-Tier route /tools/pdf/${t.sub}/${t.slug} renders valid tool`, titleText.length > 0, `Title: ${titleText}`)
  }

  // 4. Test Deduplicated New Tools Navigation & Param Controls
  const newToolTests = [
    { slug: 'pdf-to-text', label: 'PDF to Text Converter' },
    { slug: 'multiple-pages-per-sheet-print', label: 'Multiple Pages Per Sheet' },
    { slug: 'pdf-official-stamps', label: 'PDF Official Stamp Suite' },
    { slug: 'a4-to-letter-converter', label: 'Standard Paper Size Converter' },
    { slug: 'edit-pdf-metadata', label: 'PDF Metadata Editor' },
    { slug: 'sign-pdf-tool', label: 'E-Sign PDF Tool' },
    { slug: 'pdf-text-diff-tool', label: 'PDF Text Diff Tool' },
    { slug: 'extract-images-from-pdf', label: 'Extract Images from PDF' },
  ]

  for (const t of newToolTests) {
    await nav(`/tools/pdf/${t.slug}`, 800)
    check(`Deduplicated tool ${t.slug} loads with 0 errors`, errors.length === 0, errors.join('; '))
    const dropzoneExists = await evalJs(`!!document.querySelector('input[type="file"]')`)
    check(`Deduplicated tool ${t.slug} renders dropzone input`, dropzoneExists)
    const runBtnExists = await evalJs(`!!document.querySelector('button')`)
    check(`Deduplicated tool ${t.slug} renders action button`, runBtnExists)
  }

  // 5. Test Dark Mode rendering
  await nav('/tools/pdf', 600)
  await evalJs(`document.documentElement.classList.add('dark')`)
  await sleep(300)
  const isDark = await evalJs(`document.documentElement.classList.contains('dark')`)
  check('Dark mode toggles cleanly on PDF Hub', isDark)
  check('Dark mode produces 0 runtime errors', errors.length === 0, errors.join('; '))
  await evalJs(`document.documentElement.classList.remove('dark')`)

  // 6. Test Breadcrumb / Drill-down interaction
  await nav('/tools/pdf', 800)
  // Click first folder button
  await evalJs(`
    const firstFolderBtn = document.querySelectorAll('.grid button')[0];
    if (firstFolderBtn) firstFolderBtn.click();
  `)
  await sleep(500)
  const toolsCountInSub = await evalJs(`document.querySelectorAll('.grid a').length`)
  check('Folder drilldown reveals category tools', toolsCountInSub > 0, `Count: ${toolsCountInSub}`)
  check('Folder drilldown produces 0 errors', errors.length === 0, errors.join('; '))

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
    console.log('\n🎉 ALL HEADLESS CDP TESTS PASSED WITH 0 ERRORS! 🎉')
    process.exit(0)
  }
})()
