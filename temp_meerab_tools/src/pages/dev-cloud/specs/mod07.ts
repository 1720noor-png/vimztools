import {
  asNum,
  asSel,
  asStr,
  docres,
  n,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Web Security & HTTP Headers'

export const MOD07_SPECS: DevCloudSpec[] = [
  {
    id: 'content-security-policy-csp-builder',
    name: 'Content Security Policy (CSP) Directives Builder',
    subject: SUBJECT,
    blurb: 'Build hardened Content-Security-Policy HTTP headers to mitigate XSS attacks and unauthorized iframe embeds.',
    tip: 'Avoid `\'unsafe-inline\'` and `\'unsafe-eval\'` in production; use nonce-based or hash-based script execution.',
    usage: [
      'Configure allowed origins for scripts, styles, images, and API connects.',
      'Choose whether to allow iframing or enforce `frame-ancestors \'none\'`.',
      'Copy the production CSP header value for Nginx, Cloudflare, or Vercel.',
    ],
    method: [
      'Constructs W3C Content Security Policy Level 3 directives.',
    ],
    fields: [
      sel('scriptPolicy', 'Script-Src Policy', ["Strict 'self' (No external scripts)", "'self' + Google Analytics / Tag Manager", "'self' + Cloudflare Insights / CDNs", "'self' 'unsafe-inline' (Permissive)"]),
      sel('stylePolicy', 'Style-Src Policy', ["'self' + 'unsafe-inline' (Tailwind / Emotion)", "'self' only (Strict external CSS)", "'self' + Google Fonts"]),
      sel('frameAncestors', 'Frame-Ancestors (Clickjacking defense)', ["'none' (Block all iframes - Maximum security)", "'self' (Only embed on same origin)", "'none' + Whitelisted partner domain"]),
      txt('apiConnect', 'Connect-Src Extra Endpoints', 'https://api.example.com https://vitals.vercel-insights.com', 2),
    ],
    compute: (v) => {
      const script = asSel(v, 'scriptPolicy', "Strict 'self'")
      const style = asSel(v, 'stylePolicy', "'self' + 'unsafe-inline'")
      const frame = asSel(v, 'frameAncestors', "'none'")
      const api = asStr(v, 'apiConnect', '').trim()

      const directives: string[] = ["default-src 'self'"]

      if (script.startsWith('Strict')) {
        directives.push("script-src 'self'")
      } else if (script.includes('Google')) {
        directives.push("script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com")
      } else if (script.includes('Cloudflare')) {
        directives.push("script-src 'self' https://static.cloudflareinsights.com")
      } else {
        directives.push("script-src 'self' 'unsafe-inline'")
      }

      if (style.includes('unsafe-inline')) {
        directives.push("style-src 'self' 'unsafe-inline'")
      } else if (style.includes('Google Fonts')) {
        directives.push("style-src 'self' 'unsafe-inline' https://fonts.googleapis.com")
      } else {
        directives.push("style-src 'self'")
      }

      directives.push(`connect-src 'self' ${api}`.trim())
      directives.push("img-src 'self' data: https:")

      if (frame.startsWith("'none' (Block")) {
        directives.push("frame-ancestors 'none'")
      } else if (frame.startsWith("'self'")) {
        directives.push("frame-ancestors 'self'")
      } else {
        directives.push("frame-ancestors 'none'")
      }

      directives.push("base-uri 'self'")
      directives.push("form-action 'self'")

      const cspHeader = directives.join('; ')

      return [
        res('Security Rating', script.includes('unsafe-inline') ? 'Standard Protection' : 'Hardened High Security', script.includes('unsafe-inline') ? 'warn' : 'good'),
        res('Clickjacking Defense', frame.startsWith("'none'") ? 'Complete Iframe Blocking' : 'Same-Origin Embed Allowed', 'good'),
        docres('Content-Security-Policy Header', `Content-Security-Policy: ${cspHeader}`, 'Configure on origin or reverse proxy'),
      ]
    },
  },
  {
    id: 'cors-origin-rule-validator',
    name: 'CORS Origin & Preflight Headers Formatter',
    subject: SUBJECT,
    blurb: 'Generate secure Cross-Origin Resource Sharing (CORS) headers and preflight caching rules to stop credential leakage.',
    tip: 'Never return `Access-Control-Allow-Origin: *` when `Access-Control-Allow-Credentials: true` is enabled; browsers will reject the response.',
    usage: [
      'Enter allowed client origins (comma-separated or single domain).',
      'Select supported HTTP methods and credentials policy.',
      'Copy the Nginx or Node.js CORS headers.',
    ],
    method: [
      'Implements WHATWG CORS standard response headers with OPTIONS preflight max-age caching.',
    ],
    fields: [
      txt('origins', 'Allowed Origins', 'https://app.example.com, https://admin.example.com', 1),
      sel('credentials', 'Allow Credentials (Cookies / Auth)', ['true (Allow cookies / JWT)', 'false (Stateless token in header)']),
      n('maxAge', 'Preflight Cache Max-Age (seconds)', 86400, 60, 604800, 3600),
    ],
    compute: (v) => {
      const orig = asStr(v, 'origins', 'https://app.example.com').trim()
      const cred = asSel(v, 'credentials', 'true')
      const maxAge = asNum(v, 'maxAge', 86400)

      const isCred = cred.startsWith('true')

      const nginxConfig = `# Nginx CORS Configuration\n` +
        `if ($http_origin ~* ^(${orig.split(',').map((s) => s.trim().replace(/\./g, '\\.')).join('|')})$) {\n` +
        `    add_header 'Access-Control-Allow-Origin' "$http_origin" always;\n` +
        `    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;\n` +
        `    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, X-Requested-With' always;\n` +
        (isCred ? `    add_header 'Access-Control-Allow-Credentials' 'true' always;\n` : '') +
        `    add_header 'Access-Control-Max-Age' '${maxAge}' always;\n` +
        `}\n` +
        `if ($request_method = 'OPTIONS') {\n` +
        `    return 204;\n` +
        `}`

      return [
        res('Origin Strategy', orig.includes('*') ? 'Wildcard Origin (Insecure with auth)' : 'Dynamic Whitelist Origin', orig.includes('*') ? 'bad' : 'good'),
        res('Preflight Cache Duration', `${maxAge} seconds (${maxAge / 3600} hours)`, 'good', 'Reduces redundant OPTIONS requests'),
        docres('Production Nginx Server Block', nginxConfig, 'Paste inside server {} or location / {}'),
      ]
    },
  },
]
