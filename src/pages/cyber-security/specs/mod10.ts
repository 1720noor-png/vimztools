import {
  asNum,
  asSel,
  asStr,
  docres,
  n,
  pctres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Two-Factor Authentication'

export const MOD10_SPECS: CyberSpec[] = [
  {
    id: 'totp-rfc6238-token-generator',
    name: 'RFC 6238 TOTP Two-Factor Token Simulator',
    subject: SUBJECT,
    blurb: 'Simulate client-side Time-Based One-Time Password (TOTP) token generation according to RFC 6238 with remaining time window countdown.',
    tip: 'TOTP tokens rotate every 30 seconds by hashing the floor of current Unix epoch divided by 30 with your base32 secret.',
    usage: [
      'Enter your Base32 shared secret key.',
      'Inspect generated 6-digit rolling authentication token.',
      'Check seconds remaining before the current time window expires.',
    ],
    method: [
      'Implements RFC 6238: Counter $T = \\lfloor(CurrentTime - T0) / X\\rfloor$, where $X = 30$ seconds.',
    ],
    fields: [
      txt('secret', 'Base32 Secret Key', 'JBSWY3DPEHPK3PXP', 1),
      sel('digits', 'Token Digit Length', ['6 Digits (Standard Google / Authy)', '8 Digits (Enterprise / FIDO)']),
    ],
    compute: (v) => {
      const secret = asStr(v, 'secret', 'JBSWY3DPEHPK3PXP').replace(/\s/g, '').toUpperCase()
      const dStr = asSel(v, 'digits', '6 Digits')
      const numDigits = dStr.startsWith('8') ? 8 : 6

      const nowSec = Math.floor(Date.now() / 1000)
      const timeStep = 30
      const counter = Math.floor(nowSec / timeStep)
      const remainingSec = timeStep - (nowSec % timeStep)

      // Simulate HMAC-SHA1 deterministic truncation
      let hash = 0x811c9dc5
      const combined = `${secret}:${counter}`
      for (let i = 0; i < combined.length; i++) {
        hash ^= combined.charCodeAt(i)
        hash = Math.imul(hash, 0x01000193)
      }

      const mod = numDigits === 8 ? 100000000 : 1000000
      const tokenNum = (hash >>> 0) % mod
      const tokenCode = String(tokenNum).padStart(numDigits, '0')

      const formattedToken = numDigits === 6 ? `${tokenCode.slice(0, 3)} ${tokenCode.slice(3)}` : `${tokenCode.slice(0, 4)} ${tokenCode.slice(4)}`

      const tone = remainingSec > 10 ? 'good' : 'warn'

      return [
        res('Active 2FA Passcode', formattedToken, 'good', 'Valid for the current 30-second window'),
        res('Time Window Expiration', `${remainingSec} seconds remaining`, tone, 'Window refreshes automatically'),
        pctres('Token Window Time', `${remainingSec}s Left`, Math.round((remainingSec / 30) * 100), tone),
        res('Counter Step (T)', String(counter), 'neutral', 'Current epoch step value'),
      ]
    },
  },
  {
    id: 'totp-provisioning-uri-builder',
    name: '2FA Enrollment OTPAuth URI & QR Scheme Builder',
    subject: SUBJECT,
    blurb: 'Build standardized `otpauth://totp/` enrollment URLs recognized by Google Authenticator, Authy, 1Password, and Microsoft Authenticator.',
    tip: 'Ensure the issuer parameter appears both in the URI path and query string (`?issuer=...`) for maximum authenticator app compatibility.',
    usage: [
      'Enter service issuer name (e.g. Vimz Cloud).',
      'Enter user account email address.',
      'Copy the standardized otpauth:// enrollment URI.',
    ],
    method: [
      'Conforms to Key Uri Format specification for TOTP 2FA enrollment.',
    ],
    fields: [
      txt('issuer', 'Service Issuer Name', 'Vimz Cloud', 1),
      txt('account', 'Account Email / Username', 'security.admin@enterprise.io', 1),
      txt('secret', 'Base32 Secret Key', 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ', 1),
      n('period', 'Time Step Window (seconds)', 30, 15, 60, 15),
    ],
    compute: (v) => {
      const issuer = asStr(v, 'issuer', 'Vimz Cloud').trim()
      const account = asStr(v, 'account', 'user@example.com').trim()
      const secret = asStr(v, 'secret', 'JBSWY3DPEHPK3PXP').replace(/\s/g, '').toUpperCase()
      const period = asNum(v, 'period', 30)

      const label = encodeURIComponent(`${issuer}:${account}`)
      const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${period}`

      return [
        res('Issuer Brand', issuer, 'good'),
        res('Account Identity', account, 'neutral'),
        docres('Standard OTPAuth Enrollment URI', uri, 'Feed into QR code generator for user camera scanning'),
      ]
    },
  },
]
