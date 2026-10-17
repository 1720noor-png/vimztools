import {
  asNum,
  n,
  pctres,
  res,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Incident Response & MTTR'

export const MOD18_SPECS: CyberSpec[] = [
  {
    id: 'incident-response-mttd-mttr-sizer',
    name: 'Incident Response MTTD & MTTR Health Sizer',
    subject: SUBJECT,
    blurb: 'Calculate security team incident response metrics: Mean Time to Detect (MTTD), Mean Time to Acknowledge (MTTA), and Mean Time to Remediate (MTTR).',
    tip: 'According to IBM Security, organizations with automated detection containment resolve breaches 108 days faster than average.',
    usage: [
      'Enter average hours to detect unauthorized intrusions (MTTD).',
      'Enter average minutes to triage and acknowledge security alerts (MTTA).',
      'Enter average hours to fully contain and remediate incidents (MTTR).',
    ],
    method: [
      'Assesses SOC response posture against industry benchmark standards.',
    ],
    fields: [
      n('mttdHours', 'Mean Time to Detect (MTTD in Hours)', 4.5, 0.1, 720, 0.5),
      n('mttaMinutes', 'Mean Time to Acknowledge (MTTA in Minutes)', 15, 1, 480, 5),
      n('mttrHours', 'Mean Time to Remediate (MTTR in Hours)', 3.0, 0.1, 240, 0.5),
    ],
    compute: (v) => {
      const mttd = asNum(v, 'mttdHours', 4.5)
      const mtta = asNum(v, 'mttaMinutes', 15)
      const mttr = asNum(v, 'mttrHours', 3.0)

      const totalDwellHours = mttd + (mtta / 60) + mttr

      let rating = 'Elite Security Operations'
      let tone: 'good' | 'warn' | 'bad' = 'good'

      if (totalDwellHours > 72) {
        rating = 'Lagging / High Risk Posture'
        tone = 'bad'
      } else if (totalDwellHours > 24) {
        rating = 'Moderate Incident Dwell Time'
        tone = 'warn'
      }

      return [
        res('Total Attacker Dwell Time', `${totalDwellHours.toFixed(1)} hours`, tone, 'Window between intrusion and containment'),
        res('SOC Posture Rating', rating, tone),
        res('MTTD (Detection Speed)', `${mttd} hours`, mttd < 6 ? 'good' : 'warn'),
        res('MTTA (Triage Speed)', `${mtta} minutes`, mtta < 30 ? 'good' : 'warn'),
        res('MTTR (Remediation Speed)', `${mttr} hours`, mttr < 4 ? 'good' : 'warn'),
        pctres('SOC Operational Maturity', totalDwellHours <= 12 ? '95% Rapid Defense' : totalDwellHours <= 36 ? '70% Standard' : '35% Delayed', totalDwellHours <= 12 ? 95 : totalDwellHours <= 36 ? 70 : 35, tone),
      ]
    },
  },
]
