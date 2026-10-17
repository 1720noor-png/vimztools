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

export const SUBJECT = 'Core Web Vitals & Web Performance'

export const MOD08_SPECS: DevCloudSpec[] = [
  {
    id: 'core-web-vitals-lcp-inp-cls-calculator',
    name: 'Core Web Vitals (LCP, INP, CLS) Assessment & Performance Scorer',
    subject: SUBJECT,
    blurb: 'Evaluate Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) against Google thresholds.',
    tip: 'LCP must be under 2.5s, INP under 200ms, and CLS under 0.1 for 75% of page visits to earn Google Search ranking boosts.',
    usage: [
      'Enter measured 75th-percentile (p75) LCP in seconds.',
      'Enter p75 Interaction to Next Paint (INP in ms).',
      'Enter Cumulative Layout Shift (CLS score).',
    ],
    method: [
      'Google Core Web Vitals 2024 metric boundaries.',
      'Flags Good (Passed), Needs Improvement, or Poor for each metric.',
    ],
    fields: [
      n('lcp', 'Largest Contentful Paint (LCP in seconds)', 1.8, 0.2, 10.0, 0.1),
      n('inp', 'Interaction to Next Paint (INP in ms)', 120, 10, 2000, 10),
      n('cls', 'Cumulative Layout Shift (CLS score)', 0.04, 0.0, 1.0, 0.01),
    ],
    compute: (v) => {
      const lcp = asNum(v, 'lcp', 1.8)
      const inp = asNum(v, 'inp', 120)
      const cls = asNum(v, 'cls', 0.04)

      const lcpGood = lcp <= 2.5
      const lcpPoor = lcp > 4.0

      const inpGood = inp <= 200
      const inpPoor = inp > 500

      const clsGood = cls <= 0.1
      const clsPoor = cls > 0.25

      const allGood = lcpGood && inpGood && clsGood
      const anyPoor = lcpPoor || inpPoor || clsPoor

      const overallTone = allGood ? 'good' : anyPoor ? 'bad' : 'warn'
      const statusText = allGood ? 'Passed All Core Web Vitals' : anyPoor ? 'Failing Web Vitals' : 'Needs Improvement'

      return [
        res('CWV Assessment Status', statusText, overallTone, allGood ? 'Eligible for Google Search Ranking Boost' : 'User experience penalties may apply'),
        res('LCP (Loading Speed)', `${lcp}s`, lcpGood ? 'good' : lcpPoor ? 'bad' : 'warn', lcpGood ? 'Good (≤ 2.5s)' : lcpPoor ? 'Poor (> 4.0s)' : 'Needs Work (2.5s - 4.0s)'),
        res('INP (Interactivity)', `${inp}ms`, inpGood ? 'good' : inpPoor ? 'bad' : 'warn', inpGood ? 'Good (≤ 200ms)' : inpPoor ? 'Poor (> 500ms)' : 'Needs Work (200ms - 500ms)'),
        res('CLS (Visual Stability)', cls.toFixed(2), clsGood ? 'good' : clsPoor ? 'bad' : 'warn', clsGood ? 'Good (≤ 0.1)' : clsPoor ? 'Poor (> 0.25)' : 'Needs Work (0.1 - 0.25)'),
        pctres('Estimated Performance Score', `${allGood ? '95+' : anyPoor ? '50-65' : '75-89'} Lighthouse`, allGood ? 98 : anyPoor ? 55 : 82, overallTone),
      ]
    },
  },
  {
    id: 'brotli-gzip-compression-ratio-simulator',
    name: 'Brotli vs Gzip Compression & Bandwidth Simulator',
    subject: SUBJECT,
    blurb: 'Simulate compression ratios and mobile transfer latency for JavaScript, CSS, and HTML assets across Gzip and Brotli.',
    tip: 'Brotli achieves 15-25% smaller sizes than Gzip for text/code assets, drastically speeding up first-load script evaluation on mobile.',
    usage: [
      'Enter uncompressed asset size in KB (e.g. 850 KB JS bundle).',
      'Select mobile network condition (4G Good, 3G Slow, WiFi).',
      'Compare payload sizes and download latency.',
    ],
    method: [
      'Gzip compression average: ~70% reduction.',
      'Brotli-11 compression average: ~78% reduction.',
    ],
    fields: [
      n('rawKb', 'Uncompressed Bundle Size (KB)', 750, 10, 10000, 25),
      sel('network', 'Mobile Connection Quality', ['Fast 4G (15 Mbps / 50ms RTT)', 'Slow 3G (1.5 Mbps / 250ms RTT)', 'Broadband WiFi (50 Mbps / 15ms RTT)']),
    ],
    compute: (v) => {
      const rawKb = asNum(v, 'rawKb', 750)
      const net = asSel(v, 'network', 'Fast 4G')

      let mbps = 15
      let rtt = 50
      if (net.startsWith('Slow 3G')) {
        mbps = 1.5
        rtt = 250
      } else if (net.startsWith('Broadband')) {
        mbps = 50
        rtt = 15
      }

      const gzipKb = Math.round(rawKb * 0.30)
      const brotliKb = Math.round(rawKb * 0.22)

      const gzipTransferMs = Math.round(((gzipKb * 8) / (mbps * 1000)) * 1000 + rtt)
      const brotliTransferMs = Math.round(((brotliKb * 8) / (mbps * 1000)) * 1000 + rtt)

      const timeSavedMs = gzipTransferMs - brotliTransferMs

      return [
        res('Brotli-11 Wire Size', `${fmtBytes(brotliKb * 1024)} (78% smaller)`, 'good', `vs ${fmtBytes(rawKb * 1024)} uncompressed`),
        res('Gzip Wire Size', `${fmtBytes(gzipKb * 1024)} (70% smaller)`, 'neutral'),
        pctres('Brotli Bandwidth Savings', '78% Compressed', 78, 'good'),
        res('Brotli Transfer Latency', `${brotliTransferMs} ms`, 'good', `Over ${net}`),
        res('Download Time Saved', `${fmtNum(timeSavedMs)} ms faster`, 'good', 'Speedup compared to Gzip'),
      ]
    },
  },
]
