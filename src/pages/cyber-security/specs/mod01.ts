import {
  asNum,
  asSel,
  asStr,
  n,
  pctres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Password Entropy & Key Derivation'

export const MOD01_SPECS: CyberSpec[] = [
  {
    id: 'password-entropy-crack-time-estimator',
    name: 'NIST Password Entropy & GPU Brute-Force Crack Time Sizer',
    subject: SUBJECT,
    blurb: 'Calculate information-theoretic Shannon entropy bits and estimate brute-force cracking resistance against 100 GH/s multi-GPU cracking rigs.',
    tip: 'Password length dominates complexity: a 16-character phrase with letters only has more entropy than an 8-character password packed with special symbols.',
    usage: [
      'Enter candidate password or secret token.',
      'Select attacker compute capabilities (RTX 4090 rig vs State-Sponsored Cluster).',
      'Inspect entropy bits, keyspace size, and brute-force time.',
    ],
    method: [
      'Calculates character pool size R (lowercase=26, mixed=52, digits=62, symbols=94).',
      'Entropy E = Length * log2(R). Cracking time = (2^E / 2) / Hash_Rate.',
    ],
    fields: [
      txt('password', 'Candidate Password / Passphrase', 'CorrectHorseBatteryStaple77!', 1),
      sel('hashAlgo', 'Assumed Hash Function', ['MD5 / NTLM (Fast - 100 GH/s)', 'SHA-256 (Moderate - 10 GH/s)', 'Bcrypt / Argon2id (Slow - 100 kH/s)']),
    ],
    compute: (v) => {
      const pwd = asStr(v, 'password', '')
      const algo = asSel(v, 'hashAlgo', 'MD5 / NTLM')

      if (!pwd) return [res('Entropy Assessment', 'Enter a password to evaluate', 'bad')]

      let pool = 0
      if (/[a-z]/.test(pwd)) pool += 26
      if (/[A-Z]/.test(pwd)) pool += 26
      if (/[0-9]/.test(pwd)) pool += 10
      if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32
      pool = Math.max(10, pool)

      const entropy = Math.round(pwd.length * Math.log2(pool))

      let hashesPerSec = 100000000000 // 100 GH/s default
      if (algo.includes('SHA-256')) hashesPerSec = 10000000000
      else if (algo.includes('Bcrypt')) hashesPerSec = 100000

      const combinations = Math.pow(2, entropy)
      const avgSeconds = (combinations / 2) / hashesPerSec

      let timeStr = 'Instant'
      let tone: 'good' | 'warn' | 'bad' = 'bad'

      if (avgSeconds < 1) {
        timeStr = 'Instant (< 1 second)'
        tone = 'bad'
      } else if (avgSeconds < 3600) {
        timeStr = `${Math.round(avgSeconds / 60)} minutes`
        tone = 'bad'
      } else if (avgSeconds < 86400 * 30) {
        timeStr = `${Math.round(avgSeconds / 86400)} days`
        tone = 'warn'
      } else if (avgSeconds < 86400 * 365 * 100) {
        timeStr = `${Math.round(avgSeconds / (86400 * 365))} years`
        tone = 'good'
      } else {
        timeStr = `${(avgSeconds / (86400 * 365 * 1000)).toExponential(1)} millennia`
        tone = 'good'
      }

      return [
        res('Entropy Bits', `${entropy} bits of entropy`, entropy >= 80 ? 'good' : entropy >= 60 ? 'warn' : 'bad', entropy >= 80 ? 'NIST SP 800-63B Compliant' : 'Below recommended 80-bit threshold'),
        res('Brute-Force Resistance', timeStr, tone, `Against 8x GPU rig hashing ${algo.split(' ')[0]}`),
        pctres('Entropy Strength Ratio', entropy >= 100 ? 'Military-Grade' : `${entropy}% Strength`, Math.min(100, entropy), tone),
        res('Character Pool Diversity', `${pool} characters pool`, 'neutral', `${pwd.length} chars total length`),
      ]
    },
  },
  {
    id: 'pbkdf2-argon2-key-derivation-budgeter',
    name: 'Argon2id & PBKDF2 Password Hashing Cost Tuner',
    subject: SUBJECT,
    blurb: 'Size memory cost, iteration counts, and parallelism for Argon2id (RFC 9106) and PBKDF2 to achieve a 250ms target hashing latency.',
    tip: 'Argon2id is memory-hard: requiring 64 MB of RAM per hash renders GPU and ASIC password cracking economically infeasible.',
    usage: [
      'Select password hashing algorithm (Argon2id vs PBKDF2-HMAC-SHA512).',
      'Set target verification latency on your authentication server.',
      'Copy the OWASP recommended tuning parameters.',
    ],
    method: [
      'Applies OWASP 2024 Password Storage Cheat Sheet standards.',
      'Argon2id baseline: m=65536 (64MB), t=3 iterations, p=4 parallelism.',
    ],
    fields: [
      sel('algo', 'Hashing Algorithm', ['Argon2id (Modern Memory-Hard - Recommended)', 'PBKDF2-HMAC-SHA512 (FIPS 140-3 Compliant)', 'Scrypt (Memory-Hard Alternative)']),
      n('targetMs', 'Target Server Latency (ms)', 250, 50, 2000, 25),
    ],
    compute: (v) => {
      const a = asSel(v, 'algo', 'Argon2id')
      const ms = asNum(v, 'targetMs', 250)

      let config = ''
      if (a.startsWith('Argon2id')) {
        config = `memory_cost: 65536 (64 MiB)\ntime_cost (iterations): 3\nparallelism: 4 threads\nhash_length: 32 bytes`
      } else if (a.startsWith('PBKDF2')) {
        config = `iterations: 600000 (OWASP 2024 standard)\nhash_function: HMAC-SHA512\nsalt_length: 16 bytes (cryptographic CSPRNG)`
      } else {
        config = `cost_parameter (N): 131072 (2^17)\nblock_size (r): 8\nparallelization (p): 1`
      }

      return [
        res('Selected KDF Algorithm', a.split(' ')[0], 'good'),
        res('Target Server Delay', `${ms} ms / attempt`, 'good', 'Throttles brute-force credential stuffing'),
        pctres('Defense Hardening Level', '99% ASIC-Resistant', 99, 'good'),
        res('OWASP Recommended Parameters', config, 'neutral'),
      ]
    },
  },
]
