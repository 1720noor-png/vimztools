import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Network Security & Port Scanning'

export const MOD05_SPECS: CyberSpec[] = [
  {
    id: 'firewall-ufw-iptables-rule-builder',
    name: 'Linux UFW & Iptables Hardened Firewall Rule Builder',
    subject: SUBJECT,
    blurb: 'Generate production Uncomplicated Firewall (UFW) and raw iptables rules for rate-limiting SSH, whitelisting admin IPs, and mitigating DDoS SYN floods.',
    tip: 'Always enable SSH rate-limiting (`ufw limit 22/tcp`) to deny IP addresses that make 6 or more connection attempts within 30 seconds.',
    usage: [
      'Select administrative SSH access policy (Open vs Whitelist IP).',
      'Select web traffic policy (HTTP/HTTPS enabled).',
      'Copy the shell script to configure and enable UFW or iptables.',
    ],
    method: [
      'Enforces default deny incoming, default allow outgoing best practice.',
    ],
    fields: [
      sel('sshPolicy', 'SSH Port 22 Policy', ['Rate Limited Public SSH (ufw limit 22/tcp)', 'Strict Whitelist IP Only (Lockdown)', 'Custom Non-Standard Port (e.g. 2222)']),
      txt('adminIp', 'Admin Whitelist IP (if applicable)', '203.0.113.50', 1),
      sel('webPorts', 'Web Traffic Ingress', ['Enable HTTP (80) & HTTPS (443)', 'HTTPS Only (443 - Strict SSL)', 'No Public Web Ports']),
    ],
    compute: (v) => {
      const ssh = asSel(v, 'sshPolicy', 'Rate Limited Public SSH')
      const ip = asStr(v, 'adminIp', '203.0.113.50').trim()
      const web = asSel(v, 'webPorts', 'Enable HTTP (80) & HTTPS (443)')

      let rules = `# 1. Reset & Set Default Policy\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\n\n# 2. SSH Access Rule\n`

      if (ssh.startsWith('Rate Limited')) {
        rules += `sudo ufw limit 22/tcp comment "Rate-limit SSH against brute force"\n`
      } else if (ssh.startsWith('Strict Whitelist')) {
        rules += `sudo ufw allow from ${ip} to any port 22 proto tcp comment "Admin SSH Whitelist"\n`
      } else {
        rules += `sudo ufw limit 2222/tcp comment "Non-standard SSH port"\n`
      }

      rules += `\n# 3. Web Ingress Rules\n`
      if (web.includes('HTTP (80)')) {
        rules += `sudo ufw allow 80/tcp comment "Public HTTP"\nsudo ufw allow 443/tcp comment "Public HTTPS"\n`
      } else if (web.includes('HTTPS Only')) {
        rules += `sudo ufw allow 443/tcp comment "Strict HTTPS Only"\n`
      }

      rules += `\n# 4. Enable Firewall & Reload\nsudo ufw enable\nsudo ufw status verbose`

      return [
        res('Default Inbound Stance', 'Deny All Incoming', 'good', 'Zero open ports by default'),
        res('SSH Hardening', ssh.split('(')[0].trim(), 'good'),
        docres('UFW Hardening Bash Script', rules, 'Execute as root on Ubuntu / Debian server'),
      ]
    },
  },
  {
    id: 'port-vulnerability-mapper',
    name: 'Common Port Vulnerability & Attack Surface Mapper',
    subject: SUBJECT,
    blurb: 'Lookup standard TCP/UDP networking ports to analyze common exploits, CVE attack vectors, and exposure risks if left open to the internet.',
    tip: 'Ports like 3389 (RDP), 445 (SMB), 6379 (Redis), and 27017 (MongoDB) should NEVER be publicly exposed to the internet.',
    usage: [
      'Select or type target port number (e.g. 22, 445, 3389, 6379).',
      'Inspect common protocols and security risks.',
      'Review remediation and firewall lockdown advice.',
    ],
    method: [
      'Catalogs IANA service port definitions and MITRE ATT&CK exposure profiles.',
    ],
    fields: [
      sel('portSelect', 'Target Service Port', ['445 / TCP (SMB - EternalBlue / Ransomware)', '3389 / TCP (RDP - BlueKeep / Brute-force)', '6379 / TCP (Redis - Unauthenticated RCE)', '22 / TCP (SSH - Brute-force / Credential stuffing)', '21 / TCP (FTP - Plaintext credentials / Anonymous login)', '3306 / TCP (MySQL - Database exposure)', '5432 / TCP (PostgreSQL - Database exposure)']),
    ],
    compute: (v) => {
      const p = asSel(v, 'portSelect', '445')

      let risk = 'CRITICAL'
      let tone: 'good' | 'warn' | 'bad' = 'bad'
      let vector = ''
      let action = ''

      if (p.includes('445')) {
        risk = 'CRITICAL EXPLOIT RISK'
        vector = 'Server Message Block (SMB). Vulnerable to EternalBlue (MS17-010), WannaCry ransomware worm propagation, and NTLM relay attacks.'
        action = 'Block port 445 at edge firewall immediately. Never permit inbound SMB from public WAN.'
      } else if (p.includes('3389')) {
        risk = 'HIGH RISK'
        vector = 'Microsoft Remote Desktop Protocol (RDP). Primary initial access vector for ransomware gangs via credential stuffing and BlueKeep (CVE-2019-0708).'
        action = 'Place RDP behind an SSL-VPN with mandatory Multi-Factor Authentication (MFA).'
      } else if (p.includes('6379')) {
        risk = 'CRITICAL RISK'
        vector = 'Redis In-Memory Datastore. Default configuration lacks authentication, allowing unauthenticated attackers to write SSH authorized_keys and achieve root RCE.'
        action = 'Bind Redis exclusively to 127.0.0.1 or internal VPC subnet. Enable requirepass with a 64+ char secret.'
      } else if (p.includes('22')) {
        risk = 'MODERATE RISK'
        vector = 'SSH Remote Shell. Constantly probed by automated botnets for default passwords and unpatched OpenSSH versions.'
        action = 'Enforce public key authentication, disable root login (`PermitRootLogin no`), and enable fail2ban.'
        tone = 'warn'
      } else if (p.includes('21')) {
        risk = 'HIGH RISK'
        vector = 'File Transfer Protocol (FTP). Transmits usernames and passwords in cleartext over the network.'
        action = 'Deprecate FTP immediately in favor of SFTP (SSH File Transfer Protocol) or FTPS.'
      } else {
        risk = 'HIGH EXPOSURE RISK'
        vector = 'Database Server Listener. Public exposure exposes database to dictionary attacks and zero-day auth bypasses.'
        action = 'Bind database listener strictly to private VPC CIDR. Require SSH tunneling for developer access.'
      }

      return [
        res('Exposure Threat Level', risk, tone),
        res('Target Port & Service', p.split('(')[0].trim(), 'neutral'),
        res('Primary Attack Vector', vector, tone),
        res('Hardening Remediation', action, 'good'),
      ]
    },
  },
]
