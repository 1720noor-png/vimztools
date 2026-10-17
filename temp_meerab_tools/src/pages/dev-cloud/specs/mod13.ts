import {
  asNum,
  asSel,
  fmtBytes,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Frontend Architecture & Rendering'

export const MOD13_SPECS: DevCloudSpec[] = [
  {
    id: 'hydration-budget-rendering-strategy-planner',
    name: 'Rendering Strategy & Hydration Cost Planner',
    subject: SUBJECT,
    blurb: 'Compare SSR, SSG (Static Generation), CSR (SPA), and Islands Architecture based on initial page weight and client hydration CPU overhead.',
    tip: 'Islands Architecture and Partial Hydration eliminate 70%+ of main-thread JavaScript execution by rendering static HTML with zero client hydration.',
    usage: [
      'Enter total client JavaScript bundle size in KB.',
      'Select rendering architecture paradigm.',
      'Inspect estimated Time-to-Interactive (TTI) and main thread execution time.',
    ],
    method: [
      'Models JavaScript parse + compile + hydration execution at ~1ms per 10KB on mid-tier mobile hardware.',
    ],
    fields: [
      n('jsKb', 'Client JavaScript Bundle (KB)', 450, 20, 5000, 25),
      sel('strategy', 'Rendering Strategy', ['Server-Side Rendered (Full Hydration)', 'Static Site Generation (SSG)', 'Islands Architecture (Astro / Partial)', 'Single Page App (CSR - Client Hydration)']),
    ],
    compute: (v) => {
      const kb = asNum(v, 'jsKb', 450)
      const strat = asSel(v, 'strategy', 'Server-Side Rendered')

      let hydratedKb = kb
      if (strat.startsWith('Islands')) hydratedKb = Math.round(kb * 0.25)
      else if (strat.startsWith('Single')) hydratedKb = kb

      // Mid-tier mobile CPU: ~1ms per 8KB script execution
      const cpuTimeMs = Math.round((hydratedKb / 8) * 1.5)
      const ttiMs = cpuTimeMs + 650 // TTFB + paint baseline

      const tone = ttiMs <= 1000 ? 'good' : ttiMs <= 2500 ? 'warn' : 'bad'

      return [
        res('Active Hydration Script Weight', `${fmtBytes(hydratedKb * 1024)}`, hydratedKb < 200 ? 'good' : 'warn', `vs ${fmtBytes(kb * 1024)} total code`),
        res('Est. Main Thread CPU Hydration', `${cpuTimeMs} ms`, cpuTimeMs < 100 ? 'good' : 'warn', 'Evaluated on mid-tier mobile CPU'),
        res('Projected Time to Interactive (TTI)', `${(ttiMs / 1000).toFixed(2)} seconds`, tone),
        pctres('Hydration Efficiency', `${Math.round(((kb - hydratedKb) / kb) * 100)}% Code Saved`, Math.round(((kb - hydratedKb) / kb) * 100), 'good'),
      ]
    },
  },
  {
    id: 'bundle-chunk-splitting-budgeter',
    name: 'Vite / Webpack Bundle Chunk Splitting Budgeter',
    subject: SUBJECT,
    blurb: 'Calculate optimum chunk size limits and vendor manual chunks grouping to prevent mega-bundle warnings and maximize browser HTTP/2 caching.',
    tip: 'Split heavy vendor libraries (React, Charts, PDF, Tesseract) into separate manual chunks so user caches are not invalidated on small app edits.',
    usage: [
      'Enter total application uncompressed source size in MB.',
      'Enter estimated third-party vendor library count.',
      'Review recommended chunk split limits and cache hit ratio.',
    ],
    method: [
      'Advises keeping individual chunks between 50KB - 250KB gzipped for ideal HTTP/2 multiplexed streaming.',
    ],
    fields: [
      n('appMb', 'Total Application Codebase Size (MB)', 8.5, 0.5, 100, 0.5),
      n('vendorCount', 'Third-Party NPM Dependencies', 35, 5, 200, 5),
    ],
    compute: (v) => {
      const appMb = asNum(v, 'appMb', 8.5)
      const vendors = asNum(v, 'vendorCount', 35)

      const targetChunks = Math.max(4, Math.ceil(vendors / 6))
      const avgChunkKb = Math.round((appMb * 1024 * 0.25) / targetChunks) // ~25% after minify+gzip

      return [
        res('Recommended Manual Chunks', `${targetChunks} vendor chunks`, 'good', 'Isolates core vendors from rapid UI changes'),
        res('Target Gzip Chunk Size', `~${fmtNum(avgChunkKb)} KB / chunk`, avgChunkKb < 250 ? 'good' : 'warn', 'Under the 500KB Vite warning threshold'),
        pctres('Long-Term Cache Retention', '85% Cache Reuse', 85, 'good', 'Only modified feature chunks reload on deployment'),
      ]
    },
  },
]
