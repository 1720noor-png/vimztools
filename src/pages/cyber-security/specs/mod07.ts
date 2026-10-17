import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'PII Sanitization & Data Masking'

export const MOD07_SPECS: CyberSpec[] = [
  {
    id: 'luhn-credit-card-validator-masker',
    name: 'Credit Card Luhn Mod-10 Validator & PCI-DSS Masker',
    subject: SUBJECT,
    blurb: 'Validate payment card checksums with the Luhn (Mod-10) algorithm, detect card issuer (Visa, Mastercard, Amex), and format PCI-DSS compliant masked strings.',
    tip: 'PCI-DSS Requirement 3.3 mandates masking PAN (Primary Account Number) when displayed, showing only the first six and last four digits at maximum.',
    usage: [
      'Enter 15 or 16 digit card number (spaces/hyphens allowed).',
      'Select masking pattern (First 6 / Last 4, or Last 4 only).',
      'Inspect checksum validity and copy masked PAN.',
    ],
    method: [
      'Executes Luhn algorithm (doubles every second digit right-to-left, sums digits mod 10).',
    ],
    fields: [
      txt('cardInput', 'Primary Account Number (PAN)', '4111 2222 3333 4444', 1),
      sel('maskFormat', 'PCI-DSS Masking Format', ['Standard: First 6 + Last 4 (4111 22** **** 4444)', 'Strict: Last 4 Digits Only (**** **** **** 4444)', 'Tokenized: Hash Mask (PAN-REDACTED-4444)']),
    ],
    compute: (v) => {
      const raw = asStr(v, 'cardInput', '').replace(/[\s-]/g, '')
      const fmt = asSel(v, 'maskFormat', 'Standard')

      if (raw.length < 13 || raw.length > 19 || !/^\d+$/.test(raw)) {
        return [res('Validation Error', 'Invalid card number length (must be 13-19 digits)', 'bad')]
      }

      // Luhn Check
      let sum = 0
      let shouldDouble = false
      for (let i = raw.length - 1; i >= 0; i--) {
        let digit = parseInt(raw.charAt(i), 10)
        if (shouldDouble) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
        shouldDouble = !shouldDouble
      }

      const isValidLuhn = sum % 10 === 0

      // Identify Issuer
      let issuer = 'Unknown Network'
      if (/^4/.test(raw)) issuer = 'Visa'
      else if (/^5[1-5]/.test(raw) || /^2[2-7]/.test(raw)) issuer = 'Mastercard'
      else if (/^3[47]/.test(raw)) issuer = 'American Express'
      else if (/^6(?:011|5)/.test(raw)) issuer = 'Discover'

      // Masking
      const len = raw.length
      let masked = ''
      if (fmt.startsWith('Standard')) {
        masked = raw.slice(0, 6) + '*'.repeat(len - 10) + raw.slice(-4)
      } else if (fmt.startsWith('Strict')) {
        masked = '*'.repeat(len - 4) + raw.slice(-4)
      } else {
        masked = `PAN-TOKEN-${raw.slice(-4)}`
      }

      const formattedMask = masked.replace(/(.{4})/g, '$1 ').trim()
      const tone = isValidLuhn ? 'good' : 'bad'

      return [
        res('Luhn Mod-10 Checksum', isValidLuhn ? 'Valid Card Checksum' : 'Invalid Checksum', tone),
        res('Detected Card Network', issuer, 'neutral'),
        res('Card Number Length', `${len} digits`, 'neutral'),
        docres('PCI-DSS Compliant Masked String', formattedMask, 'Safe for display and logging without PCI scope expansion'),
      ]
    },
  },
  {
    id: 'pii-text-anonymizer-redactor',
    name: 'PII Text Sanitizer & Privacy Redaction Engine',
    subject: SUBJECT,
    blurb: 'Automatically detect and redact personally identifiable information (PII) including Social Security Numbers (SSN), emails, phone numbers, and IP addresses.',
    tip: 'Sanitizing logs before ingestion into third-party observability providers prevents costly GDPR and HIPAA privacy compliance violations.',
    usage: [
      'Paste log messages, chat transcripts, or customer support tickets.',
      'Review detected PII entities and count of redactions.',
      'Copy sanitized output with redacted placeholder tokens.',
    ],
    method: [
      'Applies regex heuristic scanners for US SSN (XXX-XX-XXXX), RFC 5322 emails, E.164 phone numbers, and IPv4 addresses.',
    ],
    fields: [
      txt('textInput', 'Raw Text Containing Sensitive PII', 'Customer John Doe (SSN: 123-45-6789, email: john.doe@personal.com, phone: 555-839-2019) accessed our billing server at 198.51.100.82 on Monday.', 5),
    ],
    compute: (v) => {
      const raw = asStr(v, 'textInput', '')

      let redacted = raw
      let ssnCount = 0
      let emailCount = 0
      let phoneCount = 0
      let ipCount = 0

      // Redact SSN
      redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, () => {
        ssnCount++
        return '[REDACTED_SSN]'
      })

      // Redact Email
      redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, () => {
        emailCount++
        return '[REDACTED_EMAIL]'
      })

      // Redact Phone
      redacted = redacted.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, () => {
        phoneCount++
        return '[REDACTED_PHONE]'
      })

      // Redact Public IP
      redacted = redacted.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, () => {
        ipCount++
        return '[REDACTED_IP]'
      })

      const totalPii = ssnCount + emailCount + phoneCount + ipCount
      const tone = totalPii > 0 ? 'warn' : 'good'

      return [
        res('PII Scrubbing Status', totalPii > 0 ? `${totalPii} Sensitive Entities Scrubbed` : 'Clean (No PII Detected)', tone),
        res('Scrubbed Breakdown', `${ssnCount} SSNs, ${emailCount} emails, ${phoneCount} phones, ${ipCount} IPs`, 'neutral'),
        docres('Sanitized / Anonymized Text', redacted, 'Safe for export, public sharing, and LLM prompts'),
      ]
    },
  },
]
