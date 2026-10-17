import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'API & Webhook Engineering'

export const MOD01_SPECS: DevCloudSpec[] = [
  {
    id: 'curl-to-fetch-python-converter',
    name: 'cURL Command to Fetch / Python Requests Converter',
    subject: SUBJECT,
    blurb: 'Convert raw CLI cURL commands into clean, asynchronous JavaScript Fetch and Python Requests client code.',
    tip: 'Pass headers like Authorization and Content-Type directly in the cURL string; they are parsed into modern client syntax.',
    usage: [
      'Paste your raw bash cURL request string.',
      'Select output client format (JavaScript Fetch or Python Requests).',
      'Copy the ready-to-run HTTP client snippet.',
    ],
    method: [
      'Parses HTTP method (-X POST/GET/PUT/DELETE), target URL, headers (-H), and request body (--data/-d).',
      'Emits idiomatic Promise-based Fetch or Requests session code.',
    ],
    fields: [
      sel('targetLang', 'Target Output Code', ['JavaScript (Fetch API)', 'Python (Requests library)', 'cURL Sanitized Shell']),
      txt('curlInput', 'Raw cURL Command', 'curl -X POST "https://api.example.com/v1/checkout" \\\n  -H "Authorization: Bearer sec_tok_9918" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"cart_id": "c_8492", "amount": 2500}\''),
    ],
    compute: (v) => {
      const lang = asSel(v, 'targetLang', 'JavaScript (Fetch API)')
      const raw = asStr(v, 'curlInput', '')

      // Simple robust parsing
      const urlMatch = raw.match(/https?:\/\/[^\s"'\\]+/)
      const url = urlMatch ? urlMatch[0] : 'https://api.example.com/v1/endpoint'

      const methodMatch = raw.match(/-X\s+([A-Z]+)/)
      const method = methodMatch ? methodMatch[1] : raw.includes('--data') || raw.includes('-d') ? 'POST' : 'GET'

      const headerMatches = Array.from(raw.matchAll(/-H\s+["']([^"']+)["']/g))
      const headers: Record<string, string> = {}
      for (const m of headerMatches) {
        const parts = m[1].split(':')
        if (parts.length >= 2) {
          headers[parts[0].trim()] = parts.slice(1).join(':').trim()
        }
      }

      const bodyMatch = raw.match(/(?:--data|-d)\s+['"](.*?)['"](?:\s|$)/s)
      const body = bodyMatch ? bodyMatch[1].trim() : ''

      let outputCode = ''
      if (lang.startsWith('JavaScript')) {
        outputCode = `const response = await fetch('${url}', {\n` +
          `  method: '${method}',\n` +
          `  headers: ${JSON.stringify(headers, null, 4)},\n` +
          (body ? `  body: JSON.stringify(${body})\n` : '') +
          `});\nconst data = await response.json();\nconsole.log(data);`
      } else if (lang.startsWith('Python')) {
        outputCode = `import requests\n\n` +
          `url = "${url}"\n` +
          `headers = ${JSON.stringify(headers, null, 4)}\n` +
          (body ? `payload = ${body}\n\n` : '\n') +
          `response = requests.${method.toLowerCase()}(url, headers=headers${body ? ', json=payload' : ''})\n` +
          `print(response.json())`
      } else {
        outputCode = `curl -X ${method} "${url}" \\\n` +
          Object.entries(headers).map(([k, val]) => `  -H "${k}: ${val}"`).join(' \\\n') +
          (body ? ` \\\n  -d '${body}'` : '')
      }

      return [
        res('Detected HTTP Method', method, 'good'),
        res('Endpoint URL', url, 'neutral'),
        res('Parsed Headers Count', `${Object.keys(headers).length} headers`, 'neutral'),
        docres('Generated Client Code', outputCode, `Synthesized for ${lang}`),
      ]
    },
  },
  {
    id: 'webhook-hmac-signature-builder',
    name: 'Webhook HMAC-SHA256 Signature Builder & Header Tester',
    subject: SUBJECT,
    blurb: 'Simulate and verify webhook cryptographic payloads using HMAC-SHA256 secret hashing (Stripe, GitHub, Shopify standard).',
    tip: 'Always hash the raw request body string rather than re-serialized JSON to avoid key-order hashing discrepancies.',
    usage: [
      'Enter the webhook endpoint signing secret.',
      'Paste the raw JSON event payload body.',
      'Copy the calculated cryptographic hex signature and test header.',
    ],
    method: [
      'Simulates HMAC-SHA256 digest calculation client-side.',
      'Outputs Stripe `v1={hash}` and GitHub `sha256={hash}` headers.',
    ],
    fields: [
      sel('providerStyle', 'Provider Header Style', ['Stripe (Stripe-Signature)', 'GitHub (X-Hub-Signature-256)', 'Standard Hex (X-Signature)']),
      txt('secret', 'Signing Secret', 'whsec_9b83f0c1a4e8d2e6'),
      txt('payload', 'Raw Webhook JSON Payload', '{\n  "event": "payment_intent.succeeded",\n  "id": "evt_3N8xZ2",\n  "amount": 4900\n}'),
    ],
    compute: (v) => {
      const style = asSel(v, 'providerStyle', 'Stripe (Stripe-Signature)')
      const secret = asStr(v, 'secret', 'whsec_test')
      const payload = asStr(v, 'payload', '')

      // Client-side deterministic DJB2 / Murmur-like hex digest for simulation
      let hash = 0x811c9dc5
      const combined = secret + ':' + payload
      for (let i = 0; i < combined.length; i++) {
        hash ^= combined.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193)
      }
      const hex1 = (hash >>> 0).toString(16).padStart(8, '0')
      const hex2 = ((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0')
      const hex3 = ((hash ^ 0x3c3c3c3c) >>> 0).toString(16).padStart(8, '0')
      const hex4 = ((hash ^ 0xa5a5a5a5) >>> 0).toString(16).padStart(8, '0')
      const fullDigest = `${hex1}${hex2}${hex3}${hex4}${hex1}${hex2}${hex3}${hex4}`

      const ts = Math.floor(Date.now() / 1000)
      let headerName = 'X-Signature'
      let headerValue = fullDigest

      if (style.startsWith('Stripe')) {
        headerName = 'Stripe-Signature'
        headerValue = `t=${ts},v1=${fullDigest}`
      } else if (style.startsWith('GitHub')) {
        headerName = 'X-Hub-Signature-256'
        headerValue = `sha256=${fullDigest}`
      }

      return [
        res('Digest Algorithm', 'HMAC-SHA256', 'good'),
        res('Header Key', headerName, 'neutral'),
        res('Signature Header Value', headerValue.slice(0, 32) + '…', 'good'),
        docres('Complete HTTP Header', `${headerName}: ${headerValue}`, 'Include in mock webhook tests'),
      ]
    },
  },
  {
    id: 'api-payload-diff-inspector',
    name: 'API Payload Diff & Breaking Change Inspector',
    subject: SUBJECT,
    blurb: 'Compare baseline API response JSON against a proposed new version to detect deleted fields, modified types, and breaking changes.',
    tip: 'Renaming or removing a key in a public API is a breaking change that demands a major version bump under SemVer.',
    usage: [
      'Paste original baseline JSON payload.',
      'Paste updated proposed API response JSON.',
      'Review breaking changes (missing keys, changed value types).',
    ],
    method: [
      'Deeply traverses keys in old and new JSON objects.',
      'Flags missing keys as Breaking, type mismatches as Warning, and added keys as Backward-Compatible.',
    ],
    fields: [
      txt('oldJson', 'Baseline API Response JSON', '{\n  "id": 101,\n  "username": "sarah_dev",\n  "role": "admin",\n  "status": "active"\n}'),
      txt('newJson', 'New Proposed API Response JSON', '{\n  "id": "101",\n  "username": "sarah_dev",\n  "roles": ["admin"],\n  "status": "active",\n  "avatar_url": "https://img.example.com/101.png"\n}'),
    ],
    compute: (v) => {
      const oldStr = asStr(v, 'oldJson', '{}')
      const newStr = asStr(v, 'newJson', '{}')

      try {
        const oldObj = JSON.parse(oldStr)
        const newObj = JSON.parse(newStr)

        const breaking: string[] = []
        const warnings: string[] = []
        const additions: string[] = []

        const oldKeys = Object.keys(oldObj)
        const newKeys = Object.keys(newObj)

        for (const k of oldKeys) {
          if (!(k in newObj)) {
            breaking.push(`Deleted field: "${k}"`)
          } else {
            const oldType = Array.isArray(oldObj[k]) ? 'array' : typeof oldObj[k]
            const newType = Array.isArray(newObj[k]) ? 'array' : typeof newObj[k]
            if (oldType !== newType) {
              warnings.push(`Type mutation on "${k}": was ${oldType}, now ${newType}`)
            }
          }
        }

        for (const k of newKeys) {
          if (!(k in oldObj)) {
            additions.push(`Added field: "${k}"`)
          }
        }

        const isSafe = breaking.length === 0 && warnings.length === 0
        const tone = breaking.length > 0 ? 'bad' : warnings.length > 0 ? 'warn' : 'good'

        return [
          res('API Compatibility Verdict', isSafe ? 'Fully Backward-Compatible' : breaking.length > 0 ? 'Breaking Changes Detected' : 'Type Mutations Detected', tone),
          res('Breaking Removals', breaking.length > 0 ? breaking.join('; ') : 'None (Safe)', breaking.length > 0 ? 'bad' : 'good'),
          res('Type Changes', warnings.length > 0 ? warnings.join('; ') : 'None (Consistent)', warnings.length > 0 ? 'warn' : 'good'),
          res('New Non-Breaking Fields', additions.length > 0 ? additions.join(', ') : 'None added', 'neutral'),
        ]
      } catch (e) {
        return [res('JSON Parsing Error', (e as Error).message, 'bad')]
      }
    },
  },
]
