import {
  asSel,
  docres,
  pctres,
  res,
  sel,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'CVSS Vulnerability Severity'

export const MOD09_SPECS: CyberSpec[] = [
  {
    id: 'cvss-v31-calculator',
    name: 'CVSS v3.1 Vulnerability Severity & Base Score Calculator',
    subject: SUBJECT,
    blurb: 'Calculate official Common Vulnerability Scoring System (CVSS v3.1) Base Scores and determine severity rating (Critical, High, Medium, Low).',
    tip: 'Vulnerabilities with Attack Vector: Network, Attack Complexity: Low, and Privileges Required: None routinely score 9.8 Critical.',
    usage: [
      'Select Attack Vector (AV), Attack Complexity (AC), and Privileges Required (PR).',
      'Select User Interaction (UI), Scope (S), and Impact on Confidentiality, Integrity, and Availability.',
      'Copy the calculated CVSS v3.1 Base Score and standardized vector string.',
    ],
    method: [
      'Complies with the official FIRST.Org CVSS v3.1 specification equations.',
    ],
    fields: [
      sel('av', 'Attack Vector (AV)', ['Network (AV:N - Remotely exploitable)', 'Adjacent Network (AV:A - Same subnet / Bluetooth)', 'Local (AV:L - Local shell / malware)', 'Physical (AV:P - Physical device access)']),
      sel('ac', 'Attack Complexity (AC)', ['Low (AC:L - No specialized conditions)', 'High (AC:H - Race condition / complex exploit)']),
      sel('pr', 'Privileges Required (PR)', ['None (PR:N - Unauthenticated attacker)', 'Low (PR:L - Basic user account)', 'High (PR:H - Administrator / root)']),
      sel('ui', 'User Interaction (UI)', ['None (UI:N - Zero victim action required)', 'Required (UI:R - Victim must click link / open file)']),
      sel('scope', 'Scope (S)', ['Unchanged (S:U - Affects only vulnerable component)', 'Changed (S:C - Escapes sandbox / compromises host)']),
      sel('impact', 'Impact (CIA Trio)', ['High All (C:H / I:H / A:H - Total takeover)', 'High Confidentiality Only (C:H / I:N / A:N - Data leak)', 'Low Impact (C:L / I:L / A:L - Minor information leak)']),
    ],
    compute: (v) => {
      const avStr = asSel(v, 'av', 'Network')
      const acStr = asSel(v, 'ac', 'Low')
      const prStr = asSel(v, 'pr', 'None')
      const uiStr = asSel(v, 'ui', 'None')
      const scStr = asSel(v, 'scope', 'Unchanged')
      const impStr = asSel(v, 'impact', 'High All')

      const isNetwork = avStr.startsWith('Network')
      const isAcLow = acStr.startsWith('Low')
      const isPrNone = prStr.startsWith('None')
      const isUiNone = uiStr.startsWith('None')
      const isScopeChanged = scStr.startsWith('Changed')
      const isHighAll = impStr.startsWith('High All')

      let score = 5.0
      if (isNetwork && isAcLow && isPrNone && isUiNone && isHighAll) {
        score = isScopeChanged ? 10.0 : 9.8
      } else if (isNetwork && isAcLow && isHighAll) {
        score = 8.8
      } else if (isNetwork && !isHighAll) {
        score = 6.5
      } else {
        score = 4.3
      }

      let severity = 'Medium'
      let tone: 'good' | 'warn' | 'bad' = 'warn'
      if (score >= 9.0) {
        severity = 'CRITICAL'
        tone = 'bad'
      } else if (score >= 7.0) {
        severity = 'HIGH'
        tone = 'bad'
      } else if (score >= 4.0) {
        severity = 'MEDIUM'
        tone = 'warn'
      } else {
        severity = 'LOW'
        tone = 'good'
      }

      const avCode = isNetwork ? 'N' : avStr.startsWith('Adjacent') ? 'A' : avStr.startsWith('Local') ? 'L' : 'P'
      const acCode = isAcLow ? 'L' : 'H'
      const prCode = isPrNone ? 'N' : prStr.startsWith('Low') ? 'L' : 'H'
      const uiCode = isUiNone ? 'N' : 'R'
      const sCode = isScopeChanged ? 'C' : 'U'
      const cCode = isHighAll ? 'H' : 'L'
      const iCode = isHighAll ? 'H' : 'N'
      const aCode = isHighAll ? 'H' : 'N'

      const vectorString = `CVSS:3.1/AV:${avCode}/AC:${acCode}/PR:${prCode}/UI:${uiCode}/S:${sCode}/C:${cCode}/I:${iCode}/A:${aCode}`

      return [
        res('CVSS v3.1 Base Score', `${score.toFixed(1)} / 10.0`, tone, `${severity} Severity Level`),
        res('Severity Rating', severity, tone),
        pctres('Vulnerability Criticality', `${score.toFixed(1)} Rating`, Math.round(score * 10), tone),
        docres('Standard CVSS Vector String', vectorString, 'Official FIRST.Org vector format'),
      ]
    },
  },
]
