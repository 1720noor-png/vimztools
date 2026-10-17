import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Binary,
  Boxes,
  Clock,
  Cloud,
  EyeOff,
  Flame,
  Globe,
  Key,
  KeyRound,
  Lock,
  Scale,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Smartphone,
  Terminal,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { cyberSpecs } from './specs'

export interface CyberSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  toolIds: string[]
}

export const CYBER_SECURITY_CATEGORY = 'cyber-security'
export const CYBER_SECURITY_CATEGORY_NAME = 'Cybersecurity, Privacy & Cryptography'

export const cyberSubcategories: CyberSubcategory[] = [
  {
    id: 'password-entropy',
    title: 'Password Entropy & Key Derivation',
    tagline: 'NIST SP 800-63B password entropy & Argon2id cost tuning',
    description: 'Calculate Shannon entropy bits and model GPU brute-force crack times against multi-gigahash rigs.',
    icon: KeyRound,
    accent: '#EF4444',
    toolIds: ['password-entropy-crack-time-estimator', 'pbkdf2-argon2-key-derivation-budgeter'],
  },
  {
    id: 'hashing-integrity',
    title: 'Cryptographic Hashing & Checksums',
    tagline: 'SHA-256 / SHA-512 digests & Birthday Paradox collision sizer',
    description: 'Verify cryptographic file checksums and compute mathematical collision probabilities across bit lengths.',
    icon: Binary,
    accent: '#EF4444',
    toolIds: ['sha256-file-integrity-checksum-calculator', 'hash-collision-probability-calculator'],
  },
  {
    id: 'ciphers-encryption',
    title: 'Symmetric & Asymmetric Ciphers',
    tagline: 'AES-256-GCM nonce bounds & RSA vs ECC security equivalent bits',
    description: 'Calculate AES-GCM 96-bit nonce invocation limits and compare RSA vs Ed25519 cryptographic strength.',
    icon: Lock,
    accent: '#EF4444',
    toolIds: ['aes-256-gcm-encryption-tag-sizer', 'rsa-key-strength-factorization-sizer'],
  },
  {
    id: 'tls-certificates',
    title: 'TLS / SSL Certificates & PKI',
    tagline: 'Production OpenSSL commands & X.509 certificate generation',
    description: 'Generate production OpenSSL CLI commands for private keys, CSRs, self-signed certs, and remote inspection.',
    icon: ShieldCheck,
    accent: '#EF4444',
    toolIds: ['openssl-command-generator'],
  },
  {
    id: 'network-firewall',
    title: 'Network Security & Port Scanning',
    tagline: 'Hardened UFW/Iptables rules & port exploit threat mapping',
    description: 'Generate hardened Linux firewall rules and map critical TCP/UDP port attack surfaces.',
    icon: Flame,
    accent: '#EF4444',
    toolIds: ['firewall-ufw-iptables-rule-builder', 'port-vulnerability-mapper'],
  },
  {
    id: 'web-vulnerabilities',
    title: 'OWASP Top 10 & AppSec',
    tagline: 'OWASP 2021/2024 architecture defense & contextual XSS encoding',
    description: 'Assess OWASP Top 10 vulnerabilities and apply contextual output encoding to neutralize cross-site scripting.',
    icon: ShieldAlert,
    accent: '#EF4444',
    toolIds: ['owasp-top-10-vulnerability-matrix', 'xss-contextual-output-encoding-selector'],
  },
  {
    id: 'pii-redaction',
    title: 'PII Sanitization & Data Masking',
    tagline: 'Luhn credit card validation & automatic PII scrubbing',
    description: 'Validate payment card checksums with Luhn Mod-10 and sanitize SSNs, emails, and IPs from production logs.',
    icon: EyeOff,
    accent: '#EF4444',
    toolIds: ['luhn-credit-card-validator-masker', 'pii-text-anonymizer-redactor'],
  },
  {
    id: 'zero-knowledge-zk',
    title: 'Zero-Knowledge & Privacy Protocols',
    tagline: 'Shamir Secret Sharing (k-of-n) & Merkle tree inclusion proofs',
    description: 'Calculate polynomial custodian thresholds for secret recovery and size logarithmic Merkle inclusion proofs.',
    icon: Key,
    accent: '#EF4444',
    toolIds: ['shamir-secret-sharing-threshold-sizer', 'merkle-tree-inclusion-proof-sizer'],
  },
  {
    id: 'cvss-scoring',
    title: 'CVSS Vulnerability Severity',
    tagline: 'Official FIRST CVSS v3.1 Base Score & Vector string calculator',
    description: 'Compute CVSS v3.1 vulnerability base scores from metric vectors and determine critical severity ratings.',
    icon: Activity,
    accent: '#EF4444',
    toolIds: ['cvss-v31-calculator'],
  },
  {
    id: 'two-factor-totp',
    title: 'Two-Factor Authentication',
    tagline: 'RFC 6238 TOTP rolling passcodes & QR enrollment URI builder',
    description: 'Simulate time-based 6-digit rolling OTP passcodes and build standardized otpauth:// enrollment links.',
    icon: Smartphone,
    accent: '#EF4444',
    toolIds: ['totp-rfc6238-token-generator', 'totp-provisioning-uri-builder'],
  },
  {
    id: 'steganography',
    title: 'Digital Steganography & Watermarking',
    tagline: 'LSB concealed payload capacity & forensic watermark robustness',
    description: 'Calculate imperceptible pixel payload capacity and estimate forensic watermark survival against compression.',
    icon: Search,
    accent: '#EF4444',
    toolIds: ['lsb-steganography-capacity-calculator', 'invisible-watermark-robustness-estimator'],
  },
  {
    id: 'dnssec-doh',
    title: 'DNS Security & DoH',
    tagline: 'DNSSEC DS record hashing & cryptographic trust verification',
    description: 'Generate DNSSEC Delegation Signer (DS) records for domain registrars from DNSKEY public keys.',
    icon: Globe,
    accent: '#EF4444',
    toolIds: ['dnssec-ds-record-hasher'],
  },
  {
    id: 'ssh-keys',
    title: 'SSH Hardening & Key Management',
    tagline: 'Ed25519 100-round KDF keys & hardened sshd_config directives',
    description: 'Generate memory-hard Ed25519 private keys and production-grade Linux OpenSSH server configurations.',
    icon: Terminal,
    accent: '#EF4444',
    toolIds: ['ssh-keygen-hardened-command-builder'],
  },
  {
    id: 'malware-forensics',
    title: 'File Integrity & Forensics',
    tagline: 'Binary magic bytes & malicious extension spoofing detection',
    description: 'Identify true file MIME types from header hex signatures and unmask executables disguised as documents.',
    icon: Server,
    accent: '#EF4444',
    toolIds: ['magic-byte-mime-signature-identifier'],
  },
  {
    id: 'cloud-iam-security',
    title: 'Cloud IAM & Privilege Escalation',
    tagline: 'AWS IAM policy least-privilege & wildcard action audit',
    description: 'Scan AWS IAM Policy JSON to detect dangerous `Action: "*"` wildcards and pass-role privilege escalation vectors.',
    icon: Cloud,
    accent: '#EF4444',
    toolIds: ['aws-iam-policy-least-privilege-auditor'],
  },
  {
    id: 'supply-chain',
    title: 'Software Supply Chain & SBOM',
    tagline: 'Dependency typosquatting risk scanner & Levenshtein matching',
    description: 'Detect malicious npm and PyPI typosquatting attempts by calculating edit distance to top open source libraries.',
    icon: Boxes,
    accent: '#EF4444',
    toolIds: ['dependency-typosquatting-risk-scanner'],
  },
  {
    id: 'honeypots-deception',
    title: 'Honeypots & Threat Intelligence',
    tagline: 'Decoy Canary tokens & intrusion tripwire credential generator',
    description: 'Generate realistic decoy AWS access keys and database credentials to catch attackers in unauthorized environments.',
    icon: Shield,
    accent: '#EF4444',
    toolIds: ['canary-token-generator'],
  },
  {
    id: 'incident-response',
    title: 'Incident Response & MTTR',
    tagline: 'Security Operations MTTD, MTTA & MTTR maturity benchmark',
    description: 'Calculate Mean Time to Detect, Acknowledge, and Remediate breaches to benchmark SOC operational readiness.',
    icon: Clock,
    accent: '#EF4444',
    toolIds: ['incident-response-mttd-mttr-sizer'],
  },
  {
    id: 'api-security',
    title: 'API Security & Rate Limiting',
    tagline: 'Token bucket capacity sizer & credential stuffing defense',
    description: 'Size token bucket burst allowances and replenishment intervals to protect authentication endpoints from botnets.',
    icon: Sliders,
    accent: '#EF4444',
    toolIds: ['token-bucket-rate-limiter-sizer'],
  },
  {
    id: 'privacy-compliance',
    title: 'Privacy Frameworks & GDPR',
    tagline: 'GDPR / CCPA retention schedules & Right-to-Erasure workflows',
    description: 'Map regulatory retention obligations under GDPR Article 17 and model automated cryptographic data shredding schedules.',
    icon: Scale,
    accent: '#EF4444',
    toolIds: ['gdpr-data-retention-sanitization-planner'],
  },
]

export function findCyberSubcategory(id: string): CyberSubcategory | undefined {
  return cyberSubcategories.find((s) => s.id === id)
}

export const CYBER_SECURITY_TOOLS: Tool[] = cyberSpecs.map((spec) => {
  const sub = cyberSubcategories.find((s) => s.toolIds.includes(spec.id))
  return {
    id: spec.id,
    name: spec.name,
    categoryId: CYBER_SECURITY_CATEGORY,
    category: CYBER_SECURITY_CATEGORY_NAME,
    description: spec.blurb,
    keywords: [
      'security',
      'privacy',
      'cryptography',
      'cybersecurity',
      ...(sub ? [sub.id, sub.title.toLowerCase()] : []),
      ...spec.name.toLowerCase().split(/\s+/),
    ],
    path: `/cyber-security/${sub?.id ?? 'general'}/${spec.id}`,
    icon: 'Shield',
    subcategory: spec.subject,
  }
})
