import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'OWASP Top 10 & AppSec'

export const MOD06_SPECS: CyberSpec[] = [
  {
    id: 'owasp-top-10-vulnerability-matrix',
    name: 'OWASP Top 10 Security Architecture Matrix',
    subject: SUBJECT,
    blurb: 'Interactive risk assessment and mitigation engine for the OWASP Top 10 Application Security Vulnerabilities.',
    tip: 'A01: Broken Access Control is the #1 vulnerability on the modern web; never rely on UI button hiding to enforce authorization.',
    usage: [
      'Select target OWASP vulnerability category (e.g. A01 Broken Access Control, A03 Injection).',
      'Review real-world attack scenarios and CWE classifications.',
      'Copy the verified defense checklist.',
    ],
    method: [
      'Catalogs OWASP Top 10 2021/2024 framework specifications.',
    ],
    fields: [
      sel('category', 'OWASP Vulnerability Category', ['A01:2021 - Broken Access Control', 'A02:2021 - Cryptographic Failures', 'A03:2021 - Injection (SQLi / Command / LDAP)', 'A04:2021 - Insecure Design', 'A05:2021 - Security Misconfiguration', 'A07:2021 - Identification and Authentication Failures', 'A08:2021 - Software and Data Integrity Failures', 'A10:2021 - Server-Side Request Forgery (SSRF)']),
    ],
    compute: (v) => {
      const cat = asSel(v, 'category', 'A01:2021 - Broken Access Control')

      let cwes = ''
      let impact = ''
      let defense = ''

      if (cat.startsWith('A01')) {
        cwes = 'CWE-200 (Exposure of Sensitive Info), CWE-284 (Improper Access Control), IDOR'
        impact = 'Attackers bypass authorization checks to view, edit, or delete unauthorized records (e.g. altering `userId` in URL parameters).'
        defense = '1. Deny access by default.\n2. Enforce record-level ownership checks on server controllers.\n3. Disable directory listing on web servers.\n4. Log access control failures and alert on repeated anomalies.'
      } else if (cat.startsWith('A02')) {
        cwes = 'CWE-259 (Hardcoded Password), CWE-327 (Broken Crypto), CWE-330 (Weak PRNG)'
        impact = 'Sensitive data in transit or at rest is exposed due to plaintext transmission, weak ciphers, or compromised keys.'
        defense = '1. Enforce TLS 1.3 across all endpoints with HSTS.\n2. Encrypt all sensitive data at rest using AES-256-GCM.\n3. Never use MD5, SHA-1, or DES.\n4. Store passwords with Argon2id or Bcrypt.'
      } else if (cat.startsWith('A03')) {
        cwes = 'CWE-89 (SQL Injection), CWE-78 (OS Command Injection), CWE-79 (Cross-Site Scripting)'
        impact = 'Hostile data sent to an interpreter tricks the server into executing unintended database queries or shell commands.'
        defense = '1. Use parameterized prepared statements / ORMs exclusively.\n2. Avoid string concatenation in queries.\n3. Use automated DAST scanners and SAST static analysis in CI/CD.'
      } else if (cat.startsWith('A10')) {
        cwes = 'CWE-918 (Server-Side Request Forgery)'
        impact = 'Web server fetches a remote resource without validating user-supplied URL, allowing attackers to access internal cloud metadata (169.254.169.254).'
        defense = '1. Sanitize and validate all client-supplied URLs.\n2. Block access to private IP ranges (127.0.0.1, 10.0.0.0/8, 169.254.169.254).\n3. Enforce URL schema allowlists (http/https only).\n4. Disable HTTP redirections on server HTTP clients.'
      } else {
        cwes = 'CWE-16 (Configuration), CWE-611 (XXE), CWE-306 (Missing Authentication)'
        impact = 'Default accounts, open cloud storage buckets, unpatched dependencies, or missing security headers.'
        defense = '1. Implement automated infrastructure-as-code hardening.\n2. Disable unnecessary features, services, and ports.\n3. Implement Content Security Policy and modern security headers.'
      }

      return [
        res('OWASP Category', cat.split('-')[0].trim(), 'good'),
        res('Associated CWEs', cwes, 'neutral'),
        res('Exploit Impact', impact, 'warn'),
        docres('Hardened Defense Checklist', defense, 'Implement in code and architecture'),
      ]
    },
  },
  {
    id: 'xss-contextual-output-encoding-selector',
    name: 'XSS Contextual Output Encoding Matrix',
    subject: SUBJECT,
    blurb: 'Determine the exact contextual encoding rules required to stop Cross-Site Scripting (XSS) depending on where untrusted input is reflected in HTML.',
    tip: 'HTML entity encoding is insufficient when reflecting data inside `<script>` blocks or `href` attributes; each context demands unique escaping.',
    usage: [
      'Select the target HTML injection context (HTML Body, Attribute, JavaScript String, URI).',
      'Paste sample untrusted user input string.',
      'Copy the safely sanitized and contextually encoded output.',
    ],
    method: [
      'Applies OWASP XSS Prevention Cheat Sheet contextual rules.',
    ],
    fields: [
      sel('context', 'HTML Reflection Context', ['HTML Body (<div>...</div>)', 'HTML Attribute (<input value="...">)', 'JavaScript Variable (<script>let x = "...";</script>)', 'URL Parameter (<a href="/path?q=...">)']),
      txt('input', 'Untrusted User String', '<script>alert("XSS")</script>&foo=\'bar\'', 2),
    ],
    compute: (v) => {
      const ctx = asSel(v, 'context', 'HTML Body')
      const raw = asStr(v, 'input', '')

      let encoded = ''
      let rule = ''

      if (ctx.startsWith('HTML Body')) {
        encoded = raw
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
        rule = 'HTML Entity Encoding: Converts &, <, >, ", \' to named character references.'
      } else if (ctx.startsWith('HTML Attribute')) {
        encoded = raw
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/`/g, '&#x60;')
        rule = 'Attribute Encoding: Strictly quotes attribute values and escapes backticks and double quotes.'
      } else if (ctx.startsWith('JavaScript')) {
        encoded = JSON.stringify(raw).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
        rule = 'JavaScript Unicode Escaping: Serializes via JSON.stringify() with `<` and `>` replaced with Unicode escapes to prevent script tag breakout.'
      } else {
        encoded = encodeURIComponent(raw)
        rule = 'URI Component Encoding: Converts non-alphanumeric characters to %XX percent-encoding.'
      }

      return [
        res('Active Sink Context', ctx.split('(')[0].trim(), 'good'),
        res('Sanitization Strategy', rule, 'neutral'),
        docres('Contextually Encoded Output', encoded, 'Safe for injection into specified context'),
      ]
    },
  },
]
