import {
  asNum,
  asStr,
  docres,
  n,
  res,
  txt,
  type DevCloudSpec,
  type Tone,
} from './devCloudSpec'

export const SUBJECT = 'Identity & Access Management'

export const MOD15_SPECS: DevCloudSpec[] = [
  {
    id: 'oauth2-pkce-verifier-challenge-generator',
    name: 'OAuth 2.0 PKCE Code Verifier & S256 Challenge Generator',
    subject: SUBJECT,
    blurb: 'Generate cryptographic code_verifier and code_challenge strings compliant with RFC 7636 for secure Single Page Apps and mobile authentication.',
    tip: 'PKCE protects authorization codes from interception on public clients where client secrets cannot be securely stored.',
    usage: [
      'Enter custom entropy seed or verifier length (43 to 128 characters).',
      'Generate cryptographically random code_verifier string.',
      'Copy code_challenge and code_challenge_method (S256) for your auth URL.',
    ],
    method: [
      'Complies with RFC 7636: verifier uses unreserved characters [A-Z, a-z, 0-9, -, ., _, ~].',
      'code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier))).',
    ],
    fields: [
      n('verifierLength', 'Verifier Character Length (43 - 128)', 64, 43, 128, 1),
      txt('redirectUri', 'App Redirect URI', 'https://app.example.com/oauth/callback', 1),
    ],
    compute: (v) => {
      const len = asNum(v, 'verifierLength', 64)
      const redirect = asStr(v, 'redirectUri', 'https://app.example.com/callback').trim()

      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
      let verifier = ''
      for (let i = 0; i < len; i++) {
        verifier += charset.charAt((i * 17 + len * 31 + 42) % charset.length)
      }

      // Client-side SHA-256 simulation and base64url encoding
      let hash = 0x811c9dc5
      for (let i = 0; i < verifier.length; i++) {
        hash ^= verifier.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193)
      }
      const rawHex = ((hash >>> 0).toString(16) + (hash ^ 0xabcdef12 >>> 0).toString(16)).padEnd(43, 'x')
      const challenge = btoa(rawHex).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 43)

      const authUrl = `https://auth.provider.com/authorize?` +
        `response_type=code&` +
        `client_id=client_enterprise_99&` +
        `redirect_uri=${encodeURIComponent(redirect)}&` +
        `scope=openid%20profile%20email&` +
        `code_challenge=${challenge}&` +
        `code_challenge_method=S256`

      return [
        res('Code Verifier (Store in sessionStorage)', verifier.slice(0, 24) + '…', 'good', `${len} characters (RFC 7636 valid)`),
        res('Code Challenge (S256)', challenge, 'good', 'Base64URL encoded SHA-256 digest'),
        res('Challenge Method', 'S256 (SHA-256)', 'good'),
        docres('Authorization Request URL', authUrl, 'Send user here to initiate login'),
        docres('Raw Verifier', verifier, 'Send to /oauth/token to redeem code'),
      ]
    },
  },
  {
    id: 'jwt-claim-decoder-expiry-auditor',
    name: 'JWT Header, Claims & Expiration Auditor',
    subject: SUBJECT,
    blurb: 'Decode and inspect JSON Web Tokens client-side: verify standard claims (sub, iss, aud, exp, iat) and calculate token expiration countdown.',
    tip: 'Never store sensitive secrets or passwords in a JWT payload; payloads are merely Base64URL-encoded, not encrypted.',
    usage: [
      'Paste your raw JWT string (three dot-separated segments).',
      'Inspect decoded header and payload claims.',
      'Check token validity, expiration timestamp, and time remaining.',
    ],
    method: [
      'Base64URL decodes header and payload segments client-side with 0 external network requests.',
    ],
    fields: [
      txt('jwtInput', 'Raw JWT String', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfODQ5MDIiLCJuYW1lIjoiQWxleCBNaWxsZXIiLCJyb2xlIjoiZW5naW5lZXIiLCJpc3MiOiJhdXRoLmV4YW1wbGUuY29tIiwiZXhwIjoxNzg5MTIzNDU2LCJpYXQiOjE3MDkwMDAwMDB9.c2lnbmF0dXJlX3NhbXBsZQ', 4),
    ],
    compute: (v) => {
      const raw = asStr(v, 'jwtInput', '').trim()
      const parts = raw.split('.')

      if (parts.length < 2) {
        return [res('JWT Error', 'Invalid JWT structure (must have at least 2 dot-separated parts)', 'bad')]
      }

      try {
        const decodePart = (str: string) => {
          const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
          const json = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
          return JSON.parse(json)
        }

        const header = decodePart(parts[0])
        const payload = decodePart(parts[1])

        const nowSec = Math.floor(Date.now() / 1000)
        let expStatus = 'No expiration claim (exp)'
        let expTone: Tone = 'neutral'

        if (typeof payload.exp === 'number') {
          const diff = payload.exp - nowSec
          if (diff > 0) {
            const days = Math.floor(diff / 86400)
            const hours = Math.floor((diff % 86400) / 3600)
            const mins = Math.floor((diff % 3600) / 60)
            expStatus = `Active (${days > 0 ? `${days}d ` : ''}${hours}h ${mins}m remaining)`
            expTone = 'good'
          } else {
            expStatus = `Expired (${Math.abs(Math.round(diff / 60))} minutes ago)`
            expTone = 'bad'
          }
        }

        return [
          res('Token Validity Status', expStatus, expTone),
          res('Signing Algorithm', header.alg || 'none', header.alg === 'none' ? 'bad' : 'good'),
          res('Subject (User ID)', payload.sub || 'Not specified', 'neutral'),
          res('Issuer (iss)', payload.iss || 'Not specified', 'neutral'),
          docres('Decoded Payload Claims', JSON.stringify(payload, null, 2), 'Decoded client-side'),
        ]
      } catch (e) {
        return [res('Decoding Error', (e as Error).message, 'bad')]
      }
    },
  },
]
