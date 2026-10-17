import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'TLS / SSL Certificates & PKI'

export const MOD04_SPECS: CyberSpec[] = [
  {
    id: 'openssl-command-generator',
    name: 'OpenSSL CLI Command & Certificate Generator',
    subject: SUBJECT,
    blurb: 'Generate production OpenSSL commands for generating 2048/4096-bit RSA keys, Ed25519 keys, CSRs, self-signed certs, and inspecting remote SSL.',
    tip: 'Use `-nodes` (no DES) only for automated web server certs; for administrative root CAs, always encrypt the private key with AES-256.',
    usage: [
      'Select required PKI task (e.g. Generate CSR, Create Self-Signed, Inspect Remote SSL).',
      'Enter primary domain name and organization.',
      'Copy the ready-to-run OpenSSL terminal command.',
    ],
    method: [
      'Outputs standardized OpenSSL 1.1.1 / 3.0+ syntax.',
    ],
    fields: [
      sel('task', 'OpenSSL Operation', ['Generate New Private Key + CSR (Production)', 'Create Self-Signed Certificate (Dev/Staging)', 'Inspect Remote Server Certificate (Live Check)', 'Verify Private Key Matches Certificate']),
      txt('domain', 'Common Name / Domain (CN)', 'api.example.com', 1),
      sel('keyType', 'Key Algorithm', ['RSA 2048-bit (Standard)', 'RSA 4096-bit (High Security)', 'Ed25519 (Modern Lightweight)']),
    ],
    compute: (v) => {
      const task = asSel(v, 'task', 'Generate New Private Key + CSR')
      const domain = asStr(v, 'domain', 'api.example.com').trim()
      const key = asSel(v, 'keyType', 'RSA 2048-bit')

      let cmd = ''
      let explanation = ''

      if (task.startsWith('Generate New Private Key + CSR')) {
        cmd = `openssl req -new -newkey ${key.includes('4096') ? 'rsa:4096' : 'rsa:2048'} -nodes \\\n  -keyout ${domain}.key \\\n  -out ${domain}.csr \\\n  -subj "/C=US/ST=California/L=San Francisco/O=Enterprise/CN=${domain}"`
        explanation = 'Generates an unencrypted private key and a Certificate Signing Request (CSR) for your Certificate Authority (Let\'s Encrypt, DigiCert).'
      } else if (task.startsWith('Create Self-Signed')) {
        cmd = `openssl req -x509 -newkey rsa:2048 -nodes -days 365 \\\n  -keyout ${domain}.key \\\n  -out ${domain}.crt \\\n  -subj "/CN=${domain}"`
        explanation = 'Creates a self-signed X.509 certificate valid for 365 days for local development.'
      } else if (task.startsWith('Inspect Remote Server')) {
        cmd = `openssl s_client -connect ${domain}:443 -servername ${domain} -showcerts < /dev/null 2>/dev/null | openssl x509 -noout -text`
        explanation = 'Initiates a live TLS handshake with the remote host and dumps decoded X.509 certificate details and expiration dates.'
      } else {
        cmd = `openssl x509 -noout -modulus -in ${domain}.crt | openssl md5\nopenssl rsa -noout -modulus -in ${domain}.key | openssl md5`
        explanation = 'Verifies that the MD5 checksum of the public and private key moduli match exactly.'
      }

      return [
        res('Selected PKI Operation', task.split('(')[0].trim(), 'good'),
        res('Target Domain', domain, 'neutral'),
        docres('OpenSSL CLI Terminal Command', cmd, explanation),
      ]
    },
  },
]
