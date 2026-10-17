import {
  asSel,
  asStr,
  docres,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Linux Systems & Shell Operations'

export const MOD12_SPECS: DevCloudSpec[] = [
  {
    id: 'chmod-octal-symbolic-permission-generator',
    name: 'Linux Chmod Octal & Symbolic Permission Calculator',
    subject: SUBJECT,
    blurb: 'Calculate Linux POSIX file permissions: translate between octal numbers (e.g. 755, 644, 700), symbolic strings (`-rwxr-xr-x`), and chmod commands.',
    tip: 'Executable permissions on directories (`+x`) are required for users to enter (`cd`) and access files inside that directory.',
    usage: [
      'Select User (Owner), Group, and Others permission flags.',
      'Copy the calculated 3-digit octal number or chmod shell command.',
      'Inspect the equivalent symbolic string representation.',
    ],
    method: [
      'Read = 4, Write = 2, Execute = 1 for each tier (Owner, Group, Others).',
    ],
    fields: [
      sel('userPerm', 'Owner / User Permissions', ['Read, Write & Execute (rwx = 7)', 'Read & Write (rw- = 6)', 'Read & Execute (r-x = 5)', 'Read only (r-- = 4)']),
      sel('groupPerm', 'Group Permissions', ['Read & Execute (r-x = 5)', 'Read & Write (rw- = 6)', 'Read only (r-- = 4)', 'No permissions (--- = 0)']),
      sel('otherPerm', 'Others / Public Permissions', ['Read & Execute (r-x = 5)', 'Read only (r-- = 4)', 'No permissions (--- = 0)']),
      txt('targetPath', 'Target File / Directory Path', '/var/www/html/app', 1),
    ],
    compute: (v) => {
      const uStr = asSel(v, 'userPerm', 'Read, Write & Execute (rwx = 7)')
      const gStr = asSel(v, 'groupPerm', 'Read & Execute (r-x = 5)')
      const oStr = asSel(v, 'otherPerm', 'Read & Execute (r-x = 5)')
      const path = asStr(v, 'targetPath', '/var/www/app').trim()

      function parseVal(s: string): { octal: number; sym: string } {
        if (s.includes('= 7')) return { octal: 7, sym: 'rwx' }
        if (s.includes('= 6')) return { octal: 6, sym: 'rw-' }
        if (s.includes('= 5')) return { octal: 5, sym: 'r-x' }
        if (s.includes('= 4')) return { octal: 4, sym: 'r--' }
        return { octal: 0, sym: '---' }
      }

      const u = parseVal(uStr)
      const g = parseVal(gStr)
      const o = parseVal(oStr)

      const octal = `${u.octal}${g.octal}${o.octal}`
      const symbolic = `-${u.sym}${g.sym}${o.sym}`
      const command = `chmod ${octal} ${path}`

      return [
        res('Octal Representation', octal, 'good', 'Standard numeric format'),
        res('Symbolic Representation', symbolic, 'neutral', 'File mode format (ls -la)'),
        docres('Chmod CLI Command', command, `Applied to ${path}`),
      ]
    },
  },
  {
    id: 'systemd-service-unit-generator',
    name: 'Systemd Service Unit File (.service) Generator',
    subject: SUBJECT,
    blurb: 'Generate production-ready Linux systemd `.service` configuration unit files with process isolation, restart policies, and logging.',
    tip: 'Never run systemd services as `root`; always specify `User=www-data` or a dedicated system user to enforce the principle of least privilege.',
    usage: [
      'Enter service description, binary executable command, and working directory.',
      'Select restart policy and process isolation user.',
      'Copy the unit file to `/etc/systemd/system/<name>.service`.',
    ],
    method: [
      'Generates standard Systemd Unit, Service, and Install sections compliant with systemd 240+ specifications.',
    ],
    fields: [
      txt('serviceName', 'Service Identifier', 'api-backend', 1),
      txt('description', 'Service Description', 'Enterprise Node.js Production API Service', 1),
      txt('execStart', 'ExecStart Command', '/usr/bin/node /opt/api/dist/server.js', 1),
      txt('workingDir', 'Working Directory', '/opt/api', 1),
      txt('user', 'Execution User', 'www-data', 1),
    ],
    compute: (v) => {
      const name = asStr(v, 'serviceName', 'api').replace(/[^a-zA-Z0-9_-]/g, '') || 'api'
      const desc = asStr(v, 'description', 'Backend Service').trim()
      const exec = asStr(v, 'execStart', '/usr/bin/node server.js').trim()
      const dir = asStr(v, 'workingDir', '/opt/api').trim()
      const user = asStr(v, 'user', 'www-data').trim()

      const unit = `[Unit]\n` +
        `Description=${desc}\n` +
        `After=network.target\n` +
        `Wants=network-online.target\n\n` +
        `[Service]\n` +
        `Type=simple\n` +
        `User=${user}\n` +
        `Group=${user}\n` +
        `WorkingDirectory=${dir}\n` +
        `ExecStart=${exec}\n` +
        `Restart=always\n` +
        `RestartSec=5s\n` +
        `Environment=NODE_ENV=production\n` +
        `LimitNOFILE=65535\n` +
        `StandardOutput=journal\n` +
        `StandardError=journal\n\n` +
        `[Install]\n` +
        `WantedBy=multi-user.target`

      const instructions = `# 1. Save unit configuration:\nsudo tee /etc/systemd/system/${name}.service > /dev/null\n\n# 2. Reload daemon & start:\nsudo systemctl daemon-reload\nsudo systemctl enable --now ${name}.service\n\n# 3. View live journal logs:\nsudo journalctl -u ${name}.service -f`

      return [
        res('Unit File Name', `${name}.service`, 'good'),
        res('Run User / Group', user, 'good', 'Unprivileged execution'),
        docres('Systemd Unit Configuration', unit, 'Save to /etc/systemd/system/'),
        docres('Deployment Shell Commands', instructions, 'Execute with sudo privileges'),
      ]
    },
  },
]
