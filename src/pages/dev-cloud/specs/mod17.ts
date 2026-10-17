import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtBytes,
  n,
  pctres,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Mobile & Progressive Web Apps'

export const MOD17_SPECS: DevCloudSpec[] = [
  {
    id: 'pwa-web-manifest-generator',
    name: 'PWA Web App Manifest (manifest.json) Builder',
    subject: SUBJECT,
    blurb: 'Generate W3C-standard `manifest.json` specifications for Progressive Web Apps to enable home-screen installation and offline capabilities.',
    tip: 'Include at least one 192x192 icon and one 512x512 maskable icon to satisfy Google Chrome PWA installability criteria.',
    usage: [
      'Enter app name, short name, and theme accent hex color.',
      'Select display mode (standalone, fullscreen, minimal-ui).',
      'Copy the production `manifest.json` file and `<link>` tag.',
    ],
    method: [
      'Outputs compliant W3C Web App Manifest specification with standard icon declarations.',
    ],
    fields: [
      txt('appName', 'Application Name', 'Vimz Productivity Suite', 1),
      txt('shortName', 'Short Name (Home screen)', 'Vimz', 1),
      txt('themeColor', 'Theme Color (Hex)', '#8B5CF6', 1),
      txt('bgColor', 'Splash Background Color (Hex)', '#0F172A', 1),
      sel('displayMode', 'Display Mode', ['standalone (App-like feel without browser chrome)', 'fullscreen (Immersive games/media)', 'minimal-ui (Restricted nav bar)']),
    ],
    compute: (v) => {
      const name = asStr(v, 'appName', 'App')
      const shortName = asStr(v, 'shortName', 'App')
      const theme = asStr(v, 'themeColor', '#8B5CF6')
      const bg = asStr(v, 'bgColor', '#0F172A')
      const disp = asSel(v, 'displayMode', 'standalone').split(' ')[0]

      const manifest = {
        name,
        short_name: shortName,
        start_url: '/',
        display: disp,
        background_color: bg,
        theme_color: theme,
        description: `${name} - High performance Progressive Web App`,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      }

      const jsonStr = JSON.stringify(manifest, null, 2)
      const linkTag = `<link rel="manifest" href="/manifest.json">\n<meta name="theme-color" content="${theme}">`

      return [
        res('PWA Installability', 'Chrome & iOS Install Ready', 'good'),
        res('Display Mode', disp, 'neutral'),
        docres('manifest.json Manifest', jsonStr, 'Place in web root /public/manifest.json'),
        docres('HTML <head> Link Tags', linkTag, 'Add inside index.html <head>'),
      ]
    },
  },
  {
    id: 'service-worker-cache-budget-sizer',
    name: 'Service Worker Offline Cache Budget Sizer',
    subject: SUBJECT,
    blurb: 'Calculate offline CacheStorage budgets for Progressive Web Apps to prevent storage eviction on constrained mobile devices.',
    tip: 'Keep offline shell caches below 25 MB on mobile Safari; iOS can evict CacheStorage when device memory pressure spikes.',
    usage: [
      'Enter static asset bundle sizes in MB (JS/CSS, Fonts, Images).',
      'Select cache strategy (Cache First vs Stale While Revalidate).',
      'Inspect total storage footprint and mobile eviction safety margin.',
    ],
    method: [
      'Assesses CacheStorage footprint against standard mobile browser quotas.',
    ],
    fields: [
      n('codeMb', 'Core Code Assets (JS + CSS in MB)', 2.5, 0.5, 50, 0.5),
      n('fontMb', 'Custom Web Fonts (MB)', 0.8, 0.1, 10, 0.1),
      n('imgMb', 'Offline Icons & Hero Images (MB)', 4.2, 0.5, 100, 0.5),
    ],
    compute: (v) => {
      const code = asNum(v, 'codeMb', 2.5)
      const font = asNum(v, 'fontMb', 0.8)
      const img = asNum(v, 'imgMb', 4.2)

      const totalMb = code + font + img
      const totalBytes = totalMb * 1024 * 1024

      const isSafe = totalMb <= 25
      const tone = isSafe ? 'good' : totalMb <= 50 ? 'warn' : 'bad'

      return [
        res('Total Offline Cache Weight', `${totalMb.toFixed(1)} MB (${fmtBytes(totalBytes)})`, tone),
        res('Mobile Storage Safety', isSafe ? 'Well within mobile quotas (< 25 MB)' : 'Risk of eviction on iOS Safari', tone),
        pctres('Mobile Storage Budget', `${Math.min(100, Math.round((totalMb / 25) * 100))}% of 25MB Budget`, Math.min(100, Math.round((totalMb / 25) * 100)), tone),
        res('Asset Breakdown', `${code}MB code, ${font}MB fonts, ${img}MB media`, 'neutral'),
      ]
    },
  },
]
