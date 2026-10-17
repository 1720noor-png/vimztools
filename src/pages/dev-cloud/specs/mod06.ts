import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtNum,
  n,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Networking, DNS & CIDR'

export const MOD06_SPECS: DevCloudSpec[] = [
  {
    id: 'ipv4-ipv6-cidr-subnet-calculator',
    name: 'IPv4 CIDR Subnet & Usable Host Range Calculator',
    subject: SUBJECT,
    blurb: 'Calculate network address, broadcast address, netmask, wildcard mask, and usable host count for any IPv4 CIDR block.',
    tip: 'In AWS VPCs, 5 IP addresses per subnet are reserved by default (network, VPC router, DNS, future use, and broadcast).',
    usage: [
      'Enter an IPv4 address (e.g. 10.0.4.0 or 192.168.1.100).',
      'Select CIDR subnet prefix length (/8 through /30).',
      'Inspect network boundaries, broadcast address, and usable host count.',
    ],
    method: [
      'Applies 32-bit bitwise masking to compute network address and broadcast.',
      'Usable host formula: 2^(32 - prefix) - 2.',
    ],
    fields: [
      txt('ip', 'IPv4 Base Address', '10.0.0.0', 1),
      sel('cidr', 'Subnet Mask / Prefix', ['/24 (256 IPs - 254 hosts)', '/16 (65,536 IPs - 65,534 hosts)', '/20 (4,096 IPs - 4,094 hosts)', '/22 (1,024 IPs - 1,022 hosts)', '/28 (16 IPs - 14 hosts)', '/30 (4 IPs - 2 point-to-point hosts)']),
    ],
    compute: (v) => {
      const rawIp = asStr(v, 'ip', '10.0.0.0').trim()
      const cidrStr = asSel(v, 'cidr', '/24')

      const prefixMatch = cidrStr.match(/\/(\d+)/)
      const prefix = prefixMatch ? parseInt(prefixMatch[1], 10) : 24

      const octets = rawIp.split('.').map(Number)
      if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
        return [res('IP Address Error', 'Invalid IPv4 address format', 'bad')]
      }

      const ipNum = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
      const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0

      const networkNum = (ipNum & maskNum) >>> 0
      const broadcastNum = (networkNum | ~maskNum) >>> 0

      function numToIp(n: number): string {
        return [
          (n >>> 24) & 255,
          (n >>> 16) & 255,
          (n >>> 8) & 255,
          n & 255,
        ].join('.')
      }

      const netAddress = numToIp(networkNum)
      const broadcastAddress = numToIp(broadcastNum)
      const netmask = numToIp(maskNum)

      const totalIps = Math.pow(2, 32 - prefix)
      const usableHosts = Math.max(0, totalIps - 2)

      const firstUsable = prefix >= 31 ? netAddress : numToIp(networkNum + 1)
      const lastUsable = prefix >= 31 ? broadcastAddress : numToIp(broadcastNum - 1)

      return [
        res('Network Address', `${netAddress}/${prefix}`, 'good'),
        res('Subnet Mask', netmask, 'neutral'),
        res('Broadcast Address', broadcastAddress, 'neutral'),
        res('Usable Host IP Range', `${firstUsable} — ${lastUsable}`, 'good'),
        res('Total Usable Hosts', `${fmtNum(usableHosts)} assignable IP addresses`, 'good', `${fmtNum(totalIps)} total IPs`),
      ]
    },
  },
  {
    id: 'dns-record-zone-file-builder',
    name: 'DNS Zone File & RFC 1035 Resource Record Builder',
    subject: SUBJECT,
    blurb: 'Generate RFC 1035 standard BIND zone file entries for domain apex, www, mail MX records, SPF, and DMARC.',
    tip: 'Always include a trailing dot for fully-qualified domain names (FQDN) like `mail.example.com.` in BIND zone files to prevent origin appending.',
    usage: [
      'Enter apex root domain (e.g. example.com).',
      'Enter server IPv4, mail host, and SPF directive.',
      'Copy the formatted BIND zone file snippet.',
    ],
    method: [
      'Outputs standardized BIND 9 zone records with TTL and class parameters.',
    ],
    fields: [
      txt('domain', 'Domain Name', 'example.com', 1),
      txt('serverIp', 'Origin Server IPv4 Address', '198.51.100.42', 1),
      txt('mailServer', 'Mail Server Host (MX)', 'mail.example.com.', 1),
      n('ttl', 'Default TTL (seconds)', 3600, 60, 86400, 300),
    ],
    compute: (v) => {
      const domain = asStr(v, 'domain', 'example.com').trim()
      const ip = asStr(v, 'serverIp', '198.51.100.42').trim()
      const mx = asStr(v, 'mailServer', 'mail.example.com.').trim()
      const ttl = asNum(v, 'ttl', 3600)

      const zone = `$ORIGIN ${domain}.\n$TTL ${ttl}\n\n; Apex A Records\n@       IN  A       ${ip}\nwww     IN  CNAME   ${domain}.\n\n; Mail Delivery MX\n@       IN  MX  10  ${mx}\n\n; Email Authentication (SPF & DMARC)\n@       IN  TXT     "v=spf1 mx a include:_spf.google.com ~all"\n_dmarc  IN  TXT     "v=DMARC1; p=reject; rua=mailto:dmarc@${domain}"`

      return [
        res('Target Domain', domain, 'good'),
        res('Record TTL', `${ttl} seconds (${ttl / 60} min)`, 'neutral'),
        docres('BIND Zone File Records', zone, 'RFC 1035 standard syntax'),
      ]
    },
  },
]
