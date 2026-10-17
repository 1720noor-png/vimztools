import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'SSH Hardening & Key Management'

export const MOD13_SPECS: CyberSpec[] = [
  {
    id: 'ssh-keygen-hardened-command-builder',
    name: 'Hardened SSH Keygen & sshd_config Generator',
    subject: SUBJECT,
    blurb: 'Generate cryptographic Ed25519 SSH keys with 100 rounds of memory-hard KDF, and produce hardened `/etc/ssh/sshd_config` server settings.',
    tip: 'Pass `-a 100` to `ssh-keygen` to force 100 rounds of bcrypt KDF protection on your private key, rendering brute-forcing offline stolen keys 100x slower.',
    usage: [
      'Enter key comment (e.g. your email or machine name).',
      'Select key algorithm (Ed25519 vs RSA-4096).',
      'Copy the hardened key generation command and server configuration.',
    ],
    method: [
      'Applies Mozilla OpenSSH Server Hardening Guide standards.',
    ],
    fields: [
      txt('email', 'Key Comment / Identifier', 'dev@enterprise.io', 1),
      sel('algo', 'SSH Key Algorithm', ['Ed25519 (Modern Curve25519 - Recommended)', 'RSA 4096-bit (FIPS compliance legacy)']),
    ],
    compute: (v) => {
      const email = asStr(v, 'email', 'dev@example.com').trim()
      const algo = asSel(v, 'algo', 'Ed25519')

      const isEd = algo.startsWith('Ed25519')
      const keyCmd = isEd
        ? `ssh-keygen -t ed25519 -a 100 -C "${email}" -f ~/.ssh/id_ed25519`
        : `ssh-keygen -t rsa -b 4096 -a 100 -C "${email}" -f ~/.ssh/id_rsa`

      const sshdConfig = `# Hardened /etc/ssh/sshd_config\n` +
        `PermitRootLogin no\n` +
        `PasswordAuthentication no\n` +
        `PubkeyAuthentication yes\n` +
        `KbdInteractiveAuthentication no\n` +
        `X11Forwarding no\n` +
        `MaxAuthTries 3\n` +
        `ClientAliveInterval 300\n` +
        `ClientAliveCountMax 2\n` +
        `KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512\n` +
        `Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com\n` +
        `MACs hmac-sha2-512-etm@openssh.com`

      return [
        res('Selected Key Algorithm', isEd ? 'Ed25519 (256-bit ECC)' : 'RSA 4096-bit', 'good'),
        res('KDF Protection', '100 Bcrypt Iterations', 'good', 'Deters brute-forcing stolen private keys'),
        docres('Hardened ssh-keygen Command', keyCmd, 'Run locally on workstation'),
        docres('Production /etc/ssh/sshd_config', sshdConfig, 'Deploy to production Linux servers'),
      ]
    },
  },
]
