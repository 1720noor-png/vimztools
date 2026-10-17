import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Symmetric & Asymmetric Ciphers'

export const MOD03_SPECS: CyberSpec[] = [
  {
    id: 'aes-256-gcm-encryption-tag-sizer',
    name: 'AES-256-GCM Authenticated Encryption (AEAD) Sizer',
    subject: SUBJECT,
    blurb: 'Calculate NIST SP 800-38D GCM parameters: 96-bit IV nonce reuse limits, 128-bit authentication tags, and invocation safety margins.',
    tip: 'Never reuse an AES-GCM Initialization Vector (IV/nonce) with the same key; repeating a nonce allows an attacker to recover the authentication key (GHASH).',
    usage: [
      'Enter total messages or API calls encrypted with a single session key.',
      'Select IV generation method (Deterministic counter vs Random CSPRNG).',
      'Inspect maximum invocation limit before mandatory key rotation.',
    ],
    method: [
      'NIST SP 800-38D restricts random 96-bit IVs to 2^32 invocations per key to limit collision risk to < 2^-32.',
    ],
    fields: [
      n('msgCount', 'Encrypted Invocations per Key', 500000, 1000, 10000000000, 100000),
      sel('ivStrategy', 'IV / Nonce Construction', ['Deterministic 96-bit Counter (2^64 safe invocations)', 'Random 96-bit CSPRNG (2^32 maximum invocations)']),
    ],
    compute: (v) => {
      const count = asNum(v, 'msgCount', 500000)
      const strat = asSel(v, 'ivStrategy', 'Deterministic 96-bit Counter')

      const isRandom = strat.includes('Random')
      const maxAllowed = isRandom ? 4294967296 : 18446744073709551616 // 2^32 vs 2^64

      const utilizationPct = (count / maxAllowed) * 100
      const isDangerous = count >= maxAllowed

      const tone = isDangerous ? 'bad' : utilizationPct > 50 ? 'warn' : 'good'

      return [
        res('Authentication Tag', '128 bits (16 bytes)', 'good', 'Provides cryptographic integrity and authenticity'),
        res('Max Invocations per Key', isRandom ? '2^32 (4.29 billion msgs)' : '2^64 (~1.8 * 10^19 msgs)', 'neutral'),
        pctres('Key Lifetime Consumption', `${utilizationPct < 0.01 ? '< 0.01' : utilizationPct.toFixed(2)}% of Safe Limit`, Math.min(100, Math.round(utilizationPct)), tone),
        res('Key Rotation Verdict', isDangerous ? 'Mandatory Rekeying Required' : 'Within Safe Cryptographic Bounds', tone),
      ]
    },
  },
  {
    id: 'rsa-key-strength-factorization-sizer',
    name: 'RSA vs ECC (Elliptic Curve) Key Strength Sizer',
    subject: SUBJECT,
    blurb: 'Compare security bit equivalents, public key wire sizes, and GNFS factorization resistance between RSA and modern Elliptic Curve (Ed25519 / P-256).',
    tip: 'A 256-bit ECC key (Ed25519) provides the same 128-bit cryptographic security strength as a massive 3072-bit RSA key, but with 10x faster signatures.',
    usage: [
      'Select candidate cryptographic algorithm (RSA vs Ed25519 / ECDSA).',
      'Select key modulus or curve size.',
      'Inspect equivalent security bits and NIST compliance sunset dates.',
    ],
    method: [
      'NIST SP 800-57 Part 1 Rev. 5 Cryptographic Key Management guidelines.',
    ],
    fields: [
      sel('algo', 'Cryptographic Algorithm', ['RSA-2048 (Legacy standard - 112-bit security)', 'RSA-3072 (Current NIST standard - 128-bit security)', 'RSA-4096 (High security - 152-bit security)', 'Ed25519 / Curve25519 (Modern ECC - 128-bit security)', 'ECDSA P-384 (Suite B - 192-bit security)']),
    ],
    compute: (v) => {
      const a = asSel(v, 'algo', 'RSA-2048')

      let secBits = 112
      let keyBytes = 256
      let nistStatus = 'Acceptable through 2030'
      let tone: 'good' | 'warn' | 'bad' = 'warn'

      if (a.startsWith('RSA-2048')) {
        secBits = 112
        keyBytes = 256
        nistStatus = 'Disallowed after 2030 (Deprecated by NIST)'
        tone = 'warn'
      } else if (a.startsWith('RSA-3072')) {
        secBits = 128
        keyBytes = 384
        nistStatus = 'Approved for General Use (NIST 2030+)'
        tone = 'good'
      } else if (a.startsWith('RSA-4096')) {
        secBits = 152
        keyBytes = 512
        nistStatus = 'Approved (Heavy performance overhead)'
        tone = 'good'
      } else if (a.startsWith('Ed25519')) {
        secBits = 128
        keyBytes = 32
        nistStatus = 'Modern Standard (Fastest, constant-time)'
        tone = 'good'
      } else if (a.startsWith('ECDSA P-384')) {
        secBits = 192
        keyBytes = 48
        nistStatus = 'NSA Suite B Top Secret Approved'
        tone = 'good'
      }

      return [
        res('Security Strength', `${secBits} bits of symmetric security`, tone),
        res('Public Key Wire Footprint', `${keyBytes} bytes (${keyBytes * 8} bits)`, a.includes('RSA') ? 'warn' : 'good', a.includes('Ed25519') ? '92% smaller than RSA-3072' : 'Substantial TLS handshake overhead'),
        res('NIST Compliance Outlook', nistStatus, tone),
        pctres('Cryptographic Strength', `${secBits} bits`, Math.min(100, Math.round((secBits / 192) * 100)), tone),
      ]
    },
  },
]
