import {
  asNum,
  n,
  pctres,
  res,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'API Security & Rate Limiting'

export const MOD19_SPECS: CyberSpec[] = [
  {
    id: 'token-bucket-rate-limiter-sizer',
    name: 'Token Bucket Rate Limiter & Anti-Brute Force Sizer',
    subject: SUBJECT,
    blurb: 'Calculate optimum token bucket capacity and replenishment rates for API gateways (Kong, Cloudflare, Envoy) to block automated brute-force attacks.',
    tip: 'Configure sensitive endpoints (`/api/login`, `/api/forgot-password`) with low burst limits (5-10 requests) and a sustained refill rate of 1 token every 2 seconds.',
    usage: [
      'Enter sustained permitted requests per second (RPS).',
      'Enter maximum allowed burst capacity (peak spikes).',
      'Inspect refill interval, burst duration, and HTTP 429 backoff parameters.',
    ],
    method: [
      'Token Bucket Algorithm: Refill Rate $r$, Bucket Capacity $B$. Time to empty at arrival rate $R$: $T = B / (R - r)$.',
    ],
    fields: [
      n('sustainedRps', 'Sustained Rate Limit (Requests/Sec)', 20, 1, 1000, 5),
      n('burstCapacity', 'Maximum Burst Capacity (Tokens)', 50, 5, 2000, 5),
    ],
    compute: (v) => {
      const sustained = asNum(v, 'sustainedRps', 20)
      const burst = asNum(v, 'burstCapacity', 50)

      const refillPerTokenMs = Math.round(1000 / sustained)
      const timeToRefillFullSec = Math.round(burst / sustained)

      return [
        res('Bucket Burst Capacity', `${burst} tokens`, 'good', 'Absorbs legitimate traffic spikes'),
        res('Continuous Refill Rate', `${sustained} tokens / sec`, 'good', `Replenishes 1 token every ${refillPerTokenMs} ms`),
        res('Full Bucket Refill Duration', `${timeToRefillFullSec} seconds`, 'neutral', 'Time to recharge empty bucket'),
        pctres('Brute Force Defense', burst <= 50 ? 'Strict Protection' : 'Permissive Policy', burst <= 50 ? 90 : 60, burst <= 50 ? 'good' : 'warn'),
        res('HTTP 429 Header Format', `Retry-After: ${Math.max(1, Math.round(1 / sustained))} seconds`, 'neutral', 'Included on rate limited responses'),
      ]
    },
  },
]
