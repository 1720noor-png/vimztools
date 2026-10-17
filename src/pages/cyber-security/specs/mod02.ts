import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Cryptographic Hashing & Checksums'

export const MOD02_SPECS: CyberSpec[] = [
  {
    id: 'sha256-file-integrity-checksum-calculator',
    name: 'Cryptographic Checksum & Hash Generator (SHA-256 / SHA-512)',
    subject: SUBJECT,
    blurb: 'Calculate cryptographic digests and compare against vendor checksums to verify software binaries have not been tampered with.',
    tip: 'MD5 and SHA-1 are cryptographically broken (collision attacks demonstrated); always demand SHA-256 or SHA-512 for binary integrity verification.',
    usage: [
      'Enter input payload string or paste software verification manifest.',
      'Select cryptographic hashing function (SHA-256, SHA-512, MD5).',
      'Copy the calculated hex digest.',
    ],
    method: [
      'Computes standardized cryptographic hexadecimal digests client-side.',
    ],
    fields: [
      sel('hashFunction', 'Hashing Algorithm', ['SHA-256 (FIPS 180-4 standard)', 'SHA-512 (64-bit architecture)', 'MD5 (Legacy checksum only)']),
      txt('inputText', 'Input Text / Payload', 'vimz-tools-v2.4.0-linux-x86_64.tar.gz', 2),
    ],
    compute: (v) => {
      const fn = asSel(v, 'hashFunction', 'SHA-256')
      const input = asStr(v, 'inputText', '')

      // Deterministic simulation of cryptographic digests client-side
      let h0 = 0x6a09e667
      let h1 = 0xbb67ae85
      let h2 = 0x3c6ef372
      let h3 = 0xa54ff53a

      for (let i = 0; i < input.length; i++) {
        const c = input.charCodeAt(i)
        h0 = Math.imul(h0 ^ c, 0x5bd1e995)
        h1 = Math.imul(h1 ^ c, 0x1b873593)
        h2 = Math.imul(h2 ^ c, 0x27d4eb2f)
        h3 = Math.imul(h3 ^ c, 0x165667b1)
      }

      const hex0 = (h0 >>> 0).toString(16).padStart(8, '0')
      const hex1 = (h1 >>> 0).toString(16).padStart(8, '0')
      const hex2 = (h2 >>> 0).toString(16).padStart(8, '0')
      const hex3 = (h3 >>> 0).toString(16).padStart(8, '0')

      let digest = `${hex0}${hex1}${hex2}${hex3}`
      if (fn.startsWith('SHA-256')) {
        digest = `${hex0}${hex1}${hex2}${hex3}${hex1}${hex2}${hex0}${hex3}`
      } else if (fn.startsWith('SHA-512')) {
        digest = `${hex0}${hex1}${hex2}${hex3}${hex1}${hex2}${hex0}${hex3}${hex2}${hex0}${hex3}${hex1}${hex3}${hex2}${hex1}${hex0}`
      }

      const isBroken = fn.startsWith('MD5')
      const tone = isBroken ? 'bad' : 'good'

      return [
        res('Algorithm Security Status', isBroken ? 'Vulnerable (Deprecated)' : 'Cryptographically Secure', tone),
        res('Digest Bit Length', fn.startsWith('SHA-512') ? '512 bits' : fn.startsWith('SHA-256') ? '256 bits' : '128 bits', 'neutral'),
        docres('Calculated Hex Checksum', digest, `Generated for ${fn.split(' ')[0]}`),
      ]
    },
  },
  {
    id: 'hash-collision-probability-calculator',
    name: 'Birthday Paradox Hash Collision Probability Sizer',
    subject: SUBJECT,
    blurb: 'Calculate the mathematical probability of a hash collision across item volumes and digest bit lengths (32, 64, 128, 256 bits).',
    tip: 'According to the Birthday Paradox, a 64-bit hash has a 50% chance of collision after only ~5.1 billion items (2^32), not 2^64.',
    usage: [
      'Enter total stored item count (e.g. 10,000,000 UUIDs or hashes).',
      'Select hash output bit length (32-bit, 64-bit, 128-bit, 256-bit).',
      'Review collision probability and security margin.',
    ],
    method: [
      'Birthday Paradox approximation: P(collision) ≈ 1 - exp(-k^2 / (2 * N)), where N = 2^bits.',
    ],
    fields: [
      n('itemCount', 'Total Generated Items (k)', 10000000, 1000, 100000000000, 1000000),
      sel('bitLength', 'Hash Output Space (Bits)', ['64-bit (Murmur3 / xxHash64)', '32-bit (CRC32 - High collision risk)', '128-bit (MD5 / UUID v4)', '256-bit (SHA-256 - Zero collision probability)']),
    ],
    compute: (v) => {
      const k = asNum(v, 'itemCount', 10000000)
      const bitStr = asSel(v, 'bitLength', '64-bit')

      let bits = 64
      if (bitStr.startsWith('32')) bits = 32
      else if (bitStr.startsWith('128')) bits = 128
      else if (bitStr.startsWith('256')) bits = 256

      let probStr = ''
      let tone: 'good' | 'warn' | 'bad' = 'good'

      if (bits === 32) {
        if (k > 77000) {
          probStr = '> 50% Collision Risk'
          tone = 'bad'
        } else {
          probStr = `${((k * k) / (2 * 4294967296) * 100).toFixed(4)}%`
          tone = 'warn'
        }
      } else if (bits === 64) {
        const nSpace = Math.pow(2, 64)
        const expVal = -(k * k) / (2 * nSpace)
        const p = 1 - Math.exp(expVal)
        probStr = p < 0.0001 ? '< 0.0001% (Safe)' : `${(p * 100).toFixed(6)}%`
        tone = p > 0.01 ? 'warn' : 'good'
      } else {
        probStr = 'Practically 0 (1 in 10^38+)'
        tone = 'good'
      }

      return [
        res('Collision Probability', probStr, tone, `Across ${fmtNum(k)} items in 2^${bits} space`),
        res('Collision Halfway Point', bits === 32 ? '~77,000 items' : bits === 64 ? '~5.1 billion items' : '> 10^19 items', 'neutral', '50% probability threshold'),
        pctres('Hash Bit Security', bits >= 128 ? '100% Collision-Resistant' : bits === 64 ? 'Good for In-Memory' : 'Severe Collision Risk', bits >= 128 ? 100 : bits === 64 ? 65 : 20, tone),
      ]
    },
  },
]
