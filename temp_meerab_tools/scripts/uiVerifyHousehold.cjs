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
const PORT = 9389
const USER_DIR = path.join(process.env.TEMP || '.', 'opencode-ui-hh-' + process.pid)
const BASE = 'http://127.0.0.1:4174'

const EXPECTED_SUBS = [
  { id: 'cleaning', title: 'Cleaning', count: 20 },
  { id: 'laundry', title: 'Laundry', count: 20 },
  { id: 'kitchen', title: 'Kitchen', count: 25 },
  { id: 'grocery', title: 'Grocery', count: 20 },
  { id: 'budget', title: 'Budget', count: 24 },
  { id: 'electricity', title: 'Electricity', count: 22 },
  { id: 'utilities', title: 'Utilities', count: 22 },
  { id: 'home-planning', title: 'Home Planning', count: 22 },
  { id: 'diy', title: 'DIY', count: 22 },
  { id: 'maintenance', title: 'Maintenance', count: 22 },
  { id: 'gardening', title: 'Gardening', count: 24 },
  { id: 'pets', title: 'Pets', count: 30 },
  { id: 'family', title: 'Family', count: 25 },
  { id: 'moving', title: 'Moving', count: 30 },
  { id: 'safety', title: 'Safety', count: 30 },
]

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

  async function nav(route, ms = 500) {
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

  console.log('\n=== 1. VERIFYING HOUSEHOLD HUB PAGE (/household) ===')
  await nav('/household', 1000)
  const hubH1 = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
  check('Hub H1 present and contains Household', !!hubH1 && hubH1.includes('Household'), hubH1)

  const tileCount = await evalJs(`document.querySelectorAll('.hh-tile').length`)
  check('Found exactly 15 subcategory tiles', tileCount === 15, `Found: ${tileCount}`)

  for (const s of EXPECTED_SUBS) {
    const tileText = await evalJs(`
      (() => {
        const link = document.querySelector('a[href="/household/${s.id}"]');
        return link ? link.innerText : null;
      })()
    `)
    check(`Tile ${s.title} indicates ${s.count} tools`, !!tileText && tileText.includes(s.title) && tileText.includes(`${s.count} tools`), tileText)
  }

  console.log('\n=== 2. VERIFYING ALL 15 SUBCATEGORY PAGES ===')
  for (const s of EXPECTED_SUBS) {
    await nav(`/household/${s.id}`, 450)
    const subH1 = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
    check(`Subpage ${s.id} H1 matches "${s.title}"`, subH1 === s.title, subH1)

    const cardsCount = await evalJs(`document.querySelectorAll('a[href*="/household/${s.id}/"]').length`)
    check(`Subpage ${s.id} renders exactly ${s.count} tool cards`, cardsCount === s.count, `Found ${cardsCount} cards, expected ${s.count}`)
  }

  console.log('\n=== 3. VERIFYING SAMPLE TOOL PAGES ACROSS DIVERSE CATEGORIES ===')
  const sampleTools = [
    { sub: 'cleaning', slug: 'cleaning-time-estimator', name: 'Cleaning Time Estimator' },
    { sub: 'kitchen', slug: 'kitchen-storage-capacity-calculator', name: 'Kitchen Storage Capacity Calculator' },
    { sub: 'electricity', slug: 'appliance-wattage-finder', name: 'Appliance Wattage Finder' },
    { sub: 'pets', slug: 'pet-age-calculator', name: 'Pet Age Calculator' },
    { sub: 'moving', slug: 'moving-cost-calculator', name: 'Moving Cost Calculator' },
    { sub: 'safety', slug: 'emergency-water-storage-calculator', name: 'Emergency Water Storage Calculator' },
    { sub: 'budget', slug: 'household-income-allocation-calculator', name: 'Household Income Allocation Calculator' },
    { sub: 'diy', slug: 'diy-material-quantity-estimator', name: 'DIY Material Quantity Estimator' },
    { sub: 'gardening', slug: 'garden-water-requirement-calculator', name: 'Garden Water Requirement Calculator' },
    { sub: 'family', slug: 'family-screen-time-tracker', name: 'Family Screen Time Tracker' },
    { sub: 'laundry', slug: 'laundry-cost-per-load-calculator', name: 'Laundry Cost per Load Calculator' },
    { sub: 'maintenance', slug: 'home-maintenance-cost-forecast', name: 'Home Maintenance Cost Forecast' },
  ]

  for (const t of sampleTools) {
    await nav(`/household/${t.sub}/${t.slug}`, 500)
    const titleText = await evalJs(`document.querySelector('h1')?.innerText?.trim()`)
    check(`Tool ${t.slug} H1 matches`, !!titleText && titleText.includes(t.name), titleText)

    const inputsCount = await evalJs(`document.querySelectorAll('input, select, textarea').length`)
    check(`Tool ${t.slug} has inputs rendered`, inputsCount > 0, `${inputsCount} inputs`)

    const guideSteps = await evalJs(`document.body.innerText.includes('How to Use in 3 Simple Steps')`)
    check(`Tool ${t.slug} has guide steps rendered`, guideSteps === true)

    const resetBtn = await evalJs(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Reset Defaults'));
        return Boolean(btn);
      })()
    `)
    check(`Tool ${t.slug} has Reset Defaults button`, resetBtn === true)

    const copyBtn = await evalJs(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Copy Summary'));
        return Boolean(btn);
      })()
    `)
    check(`Tool ${t.slug} has Copy Summary button`, copyBtn === true)
  }

  console.log('\n=== 4. TESTING REACTIVE RECOMPUTE AND RESET DEFAULTS ===')
  await nav('/household/cleaning/cleaning-time-estimator', 600)
  const initialValue = await evalJs(`
    (() => {
      const p = document.querySelector('.rounded-2xl.border-amber-100 p.text-base.font-bold');
      return p ? p.innerText : null;
    })()
  `)
  // Mutate input
  await evalJs(`
    (() => {
      const inp = document.querySelector('input[type="number"]');
      if (inp) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(inp, '5000');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `)
  await sleep(400)
  const mutatedValue = await evalJs(`
    (() => {
      const p = document.querySelector('.rounded-2xl.border-amber-100 p.text-base.font-bold');
      return p ? p.innerText : null;
    })()
  `)
  check('Changing input recalculates result', !!initialValue && !!mutatedValue && initialValue !== mutatedValue, `was: "${initialValue}", now: "${mutatedValue}"`)

  // Click Reset Defaults
  await evalJs(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Reset Defaults'));
      if (btn) btn.click();
    })()
  `)
  await sleep(400)
  const resetValue = await evalJs(`
    (() => {
      const p = document.querySelector('.rounded-2xl.border-amber-100 p.text-base.font-bold');
      return p ? p.innerText : null;
    })()
  `)
  check('Reset Defaults restores initial value', resetValue === initialValue, `reset: "${resetValue}", init: "${initialValue}"`)

  console.log('\n=== 5. VERIFYING ZERO RUNTIME CONSOLE ERRORS ===')
  check('Zero runtime console errors during tests', errors.length === 0, errors.join('; '))

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
