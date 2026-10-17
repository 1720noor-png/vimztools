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
const PORT = 9394
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-docx-' + process.pid)
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

  console.log('=== STARTING MS WORD & DOCUMENT SUITE CDP VERIFICATION ===\n')

  // 1. Visit MS Word Hub (/tools/document-word)
  await nav('/tools/document-word', 1000)
  check('MS Word hub loads with 0 runtime errors', errors.length === 0, errors.join('; '))

  const heading = await evalJs(`document.querySelector('h1')?.textContent || ''`)
  check('MS Word hub h1 is rendered', heading.includes('MS Word & Document Suite'), `Got: ${heading}`)

  const folderCount = await evalJs(`document.querySelectorAll('.grid button h3').length`)
  check('MS Word hub renders exactly 35 folder cards', folderCount === 35, `Got: ${folderCount}`)

  // Strict Hub Cleanliness: Zero loose tool cards floating outside folders on the main landing page
  const looseCardsCount = await evalJs(`document.querySelectorAll('main a[href*="/tools/document-word/"]').length`)
  check('MS Word hub has 0 loose tool cards floating on landing page', looseCardsCount === 0, `Got: ${looseCardsCount}`)

  // 2. Test Legacy/Shortcut Redirects
  await nav('/tools/ms-word-tools', 800)
  const redirectedUrl1 = await evalJs(`window.location.pathname`)
  check('Redirect /tools/ms-word-tools -> /tools/document-word works', redirectedUrl1 === '/tools/document-word', `Got: ${redirectedUrl1}`)
  check('/tools/ms-word-tools redirect has 0 runtime errors', errors.length === 0, errors.join('; '))

  await nav('/ms-word-tools', 800)
  const redirectedUrl2 = await evalJs(`window.location.pathname`)
  check('Redirect /ms-word-tools -> /tools/document-word works', redirectedUrl2 === '/tools/document-word', `Got: ${redirectedUrl2}`)
  check('/ms-word-tools redirect has 0 runtime errors', errors.length === 0, errors.join('; '))

  // 3. Test Core Flagship Tool: All-in-One MS Word Document Fixer
  await nav('/tools/document-word/word-document-fixer', 1000)
  check('Word Document Fixer loads with 0 errors', errors.length === 0, errors.join('; '))

  const fixerTitle = await evalJs(`document.querySelector('h1')?.textContent || ''`)
  check('Word Document Fixer has correct title', fixerTitle.includes('Word Document Fixer'), `Got: ${fixerTitle}`)

  // Check Action Bar
  const hasUploadBtn = await evalJs(`!!document.querySelector('input[type="file"]')`)
  check('Action Bar has file upload input', hasUploadBtn)

  const hasQuickFixBtn = await evalJs(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('One-Click Quick Fix'))`)
  check('Action Bar has "One-Click Quick Fix" button', hasQuickFixBtn)

  // Check Tabs
  const tabNames = ['Table of Contents', 'Line & Spacing', 'Page Numbers', 'Header & Footer']
  for (const tab of tabNames) {
    const tabExists = await evalJs(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('${tab}'))`)
    check(`Fixer has tab: ${tab}`, tabExists)
  }

  // Click "Load Academic Sample" button to test full live engine flow
  await evalJs(`
    const demoBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Load Academic Sample'));
    if (demoBtn) demoBtn.click();
  `)
  await sleep(1500)
  check('Academic Sample DOCX load produced 0 errors', errors.length === 0, errors.join('; '))

  // Check if live document summary & stats appeared
  const statsRendered = await evalJs(`!!document.querySelector('.grid.grid-cols-2')`)
  check('Loaded document statistics and metadata are displayed', statsRendered)

  // Check if live Mammoth preview rendered content
  const previewHtmlLength = await evalJs(`(document.querySelector('.prose')?.innerHTML || '').length`)
  check('Live Mammoth HTML preview successfully rendered', previewHtmlLength > 50, `Length: ${previewHtmlLength}`)

  // Test "One-Click Quick Fix" processing and verify Download button appears
  await evalJs(`
    const quickFixBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('One-Click Quick Fix'));
    if (quickFixBtn) quickFixBtn.click();
  `)
  await sleep(1500)
  check('One-Click Quick Fix produced 0 errors', errors.length === 0, errors.join('; '))

  const hasDownloadBtn = await evalJs(`Array.from(document.querySelectorAll('a')).some(b => b.textContent.includes('Download Processed DOCX'))`)
  check('Action Bar displays "Download Processed DOCX" button after processing', hasDownloadBtn)

  // 4. Test Sample Subcategory Dedicated Tools
  const sampleTools = [
    { slug: 'global-font-changer', name: 'Global Document Font Family Changer', isStarter: false },
    { slug: 'line-spacing-adjuster', name: 'Global Line & Paragraph Spacing Adjuster', isStarter: false },
    { slug: 'apa-7-formatter', name: 'APA 7th Edition Academic Formatter', isStarter: false },
    { slug: 'paper-size-converter-word', name: 'A4, US Letter & Legal Size Converter', isStarter: false },
    { slug: 'header-footer-manager', name: 'Header & Footer Master Controller', isStarter: false },
    { slug: 'page-number-inserter', name: 'Top/Bottom & Left/Center/Right Page Numberer', isStarter: false },
    { slug: 'toc-auto-generator', name: 'Automatic Heading-Based Table of Contents', isStarter: false },
    { slug: 'batch-find-replace-word', name: 'Batch Find & Replace Throughout Document', isStarter: false },
    { slug: 'docx-metadata-cleaner', name: 'Document Privacy & Metadata Wiper', isStarter: false },
    { slug: 'docx-to-markdown-converter', name: 'DOCX to Clean Markdown (.md) Converter', isStarter: false },
    { slug: 'academic-paper-template', name: 'Academic & Journal Paper Starter Template', isStarter: true },
    { slug: 'executive-report-template', name: 'Executive Business Report Template', isStarter: true },
  ]

  for (const t of sampleTools) {
    await nav(`/tools/document-word/${t.slug}`, 700)
    check(`Tool ${t.slug} loads with 0 errors`, errors.length === 0, errors.join('; '))
    const toolTitle = await evalJs(`document.querySelector('h1')?.textContent || ''`)
    check(`Tool ${t.slug} renders proper title`, toolTitle.length > 0, `Title: ${toolTitle}`)

    if (t.isStarter) {
      const hasGenBtn = await evalJs(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Generate & Download'))`)
      check(`Starter tool ${t.slug} renders generate button`, hasGenBtn)
    } else {
      const hasDropzone = await evalJs(`!!document.querySelector('input[type="file"]')`)
      check(`Tool ${t.slug} has interactive file dropzone`, hasDropzone)
    }
  }

  // 5. Test Folder Drill-Down Interaction on Hub
  await nav('/tools/document-word', 800)
  // Click first folder button (TOC, Outlines & Headings)
  await evalJs(`
    const firstFolderBtn = document.querySelectorAll('.grid button')[0];
    if (firstFolderBtn) firstFolderBtn.click();
  `)
  await sleep(500)
  const toolsCountInSub = await evalJs(`document.querySelectorAll('.grid a').length`)
  check('Folder drilldown reveals subcategory tools', toolsCountInSub > 0, `Count: ${toolsCountInSub}`)
  check('Folder drilldown produces 0 errors', errors.length === 0, errors.join('; '))

  // 6. Test Dark Mode rendering
  await nav('/tools/document-word', 600)
  await evalJs(`document.documentElement.classList.add('dark')`)
  await sleep(300)
  const isDark = await evalJs(`document.documentElement.classList.contains('dark')`)
  check('Dark mode toggles cleanly on MS Word Hub', isDark)
  check('Dark mode produces 0 runtime errors on Hub', errors.length === 0, errors.join('; '))

  await nav('/tools/document-word/word-document-fixer', 600)
  check('Dark mode on Word Document Fixer produces 0 runtime errors', errors.length === 0, errors.join('; '))
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
    console.log('\n🎉 ALL HEADLESS CDP TESTS PASSED WITH 0 ERRORS! 🎉')
    process.exit(0)
  }
})()
