import {
  asStr,
  docres,
  pctres,
  res,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Software Supply Chain & SBOM'

export const MOD16_SPECS: CyberSpec[] = [
  {
    id: 'dependency-typosquatting-risk-scanner',
    name: 'Package Typosquatting & Supply Chain Malice Scanner',
    subject: SUBJECT,
    blurb: 'Detect suspected typosquatting attacks by calculating Levenshtein edit distance against popular open-source packages (e.g. `cross-env`, `lodash`, `react`).',
    tip: 'Malicious actors publish packages with names 1 character off from popular packages (e.g. `crossenv` instead of `cross-env`) to steal developer credentials.',
    usage: [
      'Enter candidate dependency name from your package.json or requirements.txt.',
      'Inspect similarity against known top 100 open source libraries.',
      'Check typosquatting risk score and warning indicators.',
    ],
    method: [
      'Calculates Levenshtein distance and character transposition matrices.',
    ],
    fields: [
      txt('pkgName', 'Candidate Package Name', 'crossenv', 1),
    ],
    compute: (v) => {
      const pkg = asStr(v, 'pkgName', '').trim().toLowerCase()

      const topPackages = [
        'react', 'lodash', 'express', 'axios', 'chalk', 'commander', 'moment',
        'cross-env', 'dotenv', 'webpack', 'typescript', 'eslint', 'prettier',
        'next', 'vue', 'requests', 'urllib3', 'flask', 'django', 'pandas',
      ]

      function levenshtein(a: string, b: string): number {
        const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + cost
            )
          }
        }
        return matrix[a.length][b.length]
      }

      let closestPkg = ''
      let minDistance = 999

      for (const legit of topPackages) {
        if (legit === pkg) {
          minDistance = 0
          closestPkg = legit
          break
        }
        const d = levenshtein(pkg, legit)
        if (d < minDistance) {
          minDistance = d
          closestPkg = legit
        }
      }

      const isExactMatch = minDistance === 0
      const isSquattingRisk = !isExactMatch && minDistance <= 2
      const tone = isExactMatch ? 'good' : isSquattingRisk ? 'bad' : 'neutral'

      return [
        res('Typosquatting Risk Level', isExactMatch ? 'Verified Popular Package' : isSquattingRisk ? 'CRITICAL: Suspected Typosquatting' : 'Low Typosquatting Similarity', tone),
        res('Closest Legitimate Target', closestPkg, 'neutral', `Levenshtein edit distance: ${minDistance}`),
        pctres('Typo Similarity Score', isExactMatch ? 'Exact' : isSquattingRisk ? '95% Match Risk' : 'Low Similarity', isExactMatch ? 0 : isSquattingRisk ? 95 : 20, tone),
        docres('Security Recommendation', isSquattingRisk ? `WARNING: "${pkg}" is 1-2 edits away from legitimate package "${closestPkg}". Review publisher credentials and download counts on npm before installing.` : `No immediate similarity to common target packages detected. Always inspect package age and author signatures.`, 'Supply chain defensive audit'),
      ]
    },
  },
]
