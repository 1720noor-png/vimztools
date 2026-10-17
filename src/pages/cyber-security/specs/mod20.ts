import {
  asSel,
  docres,
  res,
  sel,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Privacy Frameworks & GDPR'

export const MOD20_SPECS: CyberSpec[] = [
  {
    id: 'gdpr-data-retention-sanitization-planner',
    name: 'GDPR / CCPA Data Retention & Erasure Schedule Planner',
    subject: SUBJECT,
    blurb: 'Map personal data categories against legal retention obligations (GDPR Art. 17, CCPA, HIPAA) and automate scheduled cryptographic erasure windows.',
    tip: 'GDPR Article 17 mandates that personal data must be erased within 30 calendar days upon receipt of a valid Data Subject Access Request (DSAR).',
    usage: [
      'Select personal data category (Marketing, User Account, Financial/Billing, Special Category).',
      'Select applicable regulatory framework (GDPR, CCPA/CPRA, HIPAA).',
      'Review legal retention maximums, erasure deadlines, and audit requirements.',
    ],
    method: [
      'Maps statutory retention limits under GDPR Article 5(1)(e) storage limitation principles.',
    ],
    fields: [
      sel('category', 'Data Classification Category', ['User Account Credentials & Profiles', 'Billing Records & Payment Invoices (Financial)', 'Marketing Analytics & Web Cookies', 'Special Category (Biometrics / Health Data)']),
      sel('regulation', 'Primary Privacy Framework', ['GDPR (EU General Data Protection Regulation)', 'CCPA / CPRA (California Consumer Privacy Act)', 'HIPAA (Health Insurance Portability & Accountability)']),
    ],
    compute: (v) => {
      const cat = asSel(v, 'category', 'User Account')
      const reg = asSel(v, 'regulation', 'GDPR')

      let retentionPeriod = ''
      let erasureDeadline = ''
      let method = ''

      if (cat.startsWith('Billing')) {
        retentionPeriod = '7 Years (Mandatory Tax & Statutory Legal Requirement)'
        erasureDeadline = 'Exempt from immediate erasure during statutory tax audit window'
        method = 'Restricted access: isolate in encrypted cold archive with immutable audit trail.'
      } else if (cat.startsWith('Marketing')) {
        retentionPeriod = '13 Months Maximum (ePrivacy Cookie Directive)'
        erasureDeadline = 'Immediate: within 30 days of consent withdrawal'
        method = 'Permanent purge: delete tracking cookies, advertising IDs, and analytics IP addresses.'
      } else if (cat.startsWith('Special Category')) {
        retentionPeriod = 'Strict Necessity Only (Explicit User Consent Mandatory)'
        erasureDeadline = 'Immediate: within 14 days of consent revocation'
        method = 'Cryptographic shredding: zero out encryption keys to render ciphertexts permanently unrecoverable.'
      } else {
        retentionPeriod = 'Duration of active user contract + 30 days'
        erasureDeadline = '30 Days upon valid Right-to-be-Forgotten request (GDPR Art. 17)'
        method = 'Soft delete -> 30-day grace period -> permanent automated hard DB deletion.'
      }

      return [
        res('Regulatory Maximum Retention', retentionPeriod, 'good'),
        res('DSAR Erasure Deadline', erasureDeadline, 'neutral'),
        res('Governing Regulation', reg.split('(')[0].trim(), 'good'),
        docres('Technical Sanitization Specification', method, 'Compliant purge mechanism'),
      ]
    },
  },
]
