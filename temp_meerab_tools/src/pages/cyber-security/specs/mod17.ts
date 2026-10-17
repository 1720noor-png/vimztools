import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Honeypots & Threat Intelligence'

export const MOD17_SPECS: CyberSpec[] = [
  {
    id: 'canary-token-generator',
    name: 'Canary Decoy Token & Intrusion Tripwire Generator',
    subject: SUBJECT,
    blurb: 'Generate tripwire decoy credentials (AWS access keys, fake SQL connection strings, Git secrets) to trigger immediate alerts upon hacker access.',
    tip: 'Plant canary AWS keys in git repositories or developer workstations; if they are ever called in AWS CloudTrail, you have confirmed an active intrusion.',
    usage: [
      'Select canary token archetype (AWS Access Key, Database URL, HTTP Webhook Bug).',
      'Enter alert notification email or webhook URL.',
      'Copy the decoy credentials and place them in decoy environments.',
    ],
    method: [
      'Generates syntactically realistic credentials mapped to monitoring webhook endpoints.',
    ],
    fields: [
      sel('tokenType', 'Canary Decoy Type', ['Fake AWS IAM Access Key (`AKIA...`)', 'Fake PostgreSQL Database URL', 'Fake Stripe Secret API Key (`sk_live_...`)']),
      txt('alertWebhook', 'Alert Webhook URL', 'https://alerts.enterprise.io/canary/intrusions', 1),
    ],
    compute: (v) => {
      const type = asSel(v, 'tokenType', 'Fake AWS IAM Access Key')
      const hook = asStr(v, 'alertWebhook', 'https://alerts.example.com').trim()

      let decoy = ''
      if (type.startsWith('Fake AWS')) {
        decoy = `[default]\naws_access_key_id = AKIA${Math.random().toString(36).slice(2, 18).toUpperCase()}\naws_secret_access_key = ${Math.random().toString(36).slice(2, 22)}${Math.random().toString(36).slice(2, 22)}\nregion = us-east-1`
      } else if (type.startsWith('Fake PostgreSQL')) {
        decoy = `postgres://canary_admin:${Math.random().toString(36).slice(2, 14)}@db-internal.prod.enterprise.io:5432/finance_db?sslmode=require`
      } else {
        decoy = `sk_live_${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`
      }

      return [
        res('Canary Archetype', type.split('(')[0].trim(), 'good'),
        res('Tripwire Alert Destination', hook, 'neutral'),
        docres('Plantable Decoy Secret', decoy, 'Place in mock .env file or test repository to detect unauthorized reads'),
      ]
    },
  },
]
