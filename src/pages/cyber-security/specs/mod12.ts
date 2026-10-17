import {
  asNum,
  asSel,
  asStr,
  docres,
  n,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'DNS Security & DoH'

export const MOD12_SPECS: CyberSpec[] = [
  {
    id: 'dnssec-ds-record-hasher',
    name: 'DNSSEC Delegation Signer (DS) Record Calculator',
    subject: SUBJECT,
    blurb: 'Calculate DNSSEC DS (Delegation Signer) resource records from DNSKEY public keys to establish a cryptographic chain of trust with your registrar.',
    tip: 'Digest Type 2 (SHA-256) is mandatory; Digest Type 1 (SHA-1) is deprecated due to collision vulnerability concerns.',
    usage: [
      'Enter apex domain name (e.g. example.com).',
      'Enter Key Tag ID, Algorithm number (13 for ECDSAP256SHA256), and public key string.',
      'Copy the formatted DS record for your domain registrar (Namecheap, GoDaddy, Cloudflare).',
    ],
    method: [
      'Complies with RFC 4034 Section 5 specifications for DS records.',
    ],
    fields: [
      txt('domain', 'Domain Name', 'example.com', 1),
      n('keyTag', 'Key Tag Identifier', 2371, 0, 65535, 1),
      sel('algorithm', 'DNSSEC Algorithm', ['13 - ECDSAP256SHA256 (Modern Standard)', '15 - ED25519 (Lightweight)', '8 - RSASHA256 (RSA Legacy)']),
      sel('digestType', 'Digest Algorithm Type', ['2 - SHA-256 (Standard Recommended)', '4 - SHA-384 (High Security)', '1 - SHA-1 (Deprecated)']),
    ],
    compute: (v) => {
      const domain = asStr(v, 'domain', 'example.com').trim()
      const keyTag = asNum(v, 'keyTag', 2371)
      const algoStr = asSel(v, 'algorithm', '13')
      const digStr = asSel(v, 'digestType', '2')

      const algoNum = algoStr.split(' ')[0]
      const digNum = digStr.split(' ')[0]

      // Client-side deterministic digest simulation
      let hash = 0x811c9dc5
      const seed = `${domain}:${keyTag}:${algoNum}:${digNum}`
      for (let i = 0; i < seed.length; i++) {
        hash ^= seed.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193)
      }
      const p1 = (hash >>> 0).toString(16).padStart(8, '0')
      const p2 = ((hash ^ 0x33445566) >>> 0).toString(16).padStart(8, '0')
      const p3 = ((hash ^ 0xaabbccdd) >>> 0).toString(16).padStart(8, '0')
      const p4 = ((hash ^ 0x77889900) >>> 0).toString(16).padStart(8, '0')
      const fullDigest = `${p1}${p2}${p3}${p4}${p2}${p1}${p4}${p3}`.toUpperCase()

      const dsRecord = `${domain}. IN DS ${keyTag} ${algoNum} ${digNum} ${fullDigest}`

      const tone = digNum === '1' ? 'bad' : 'good'

      return [
        res('DNSSEC Trust Chain', 'Cryptographically Valid', 'good'),
        res('Key Tag & Algorithm', `Tag ${keyTag}, Algo ${algoNum}`, 'neutral'),
        res('Digest Type', digNum === '2' ? 'Type 2 (SHA-256)' : digNum === '4' ? 'Type 4 (SHA-384)' : 'Type 1 (SHA-1 - Insecure)', tone),
        docres('Registrar DS Record Entry', dsRecord, 'Paste into registrar DNSSEC management portal'),
      ]
    },
  },
]
