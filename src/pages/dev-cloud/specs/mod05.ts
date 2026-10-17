import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Git Workflows & CI/CD Pipelines'

export const MOD05_SPECS: DevCloudSpec[] = [
  {
    id: 'semver-release-version-calculator',
    name: 'Semantic Versioning (SemVer) & Conventional Commits Sizer',
    subject: SUBJECT,
    blurb: 'Calculate next SemVer tag (e.g. v2.1.0 -> v3.0.0) based on Conventional Commits (feat!, fix, feat, chore, perf).',
    tip: 'Commits with `feat!:` or `BREAKING CHANGE:` in the body trigger a MAJOR bump; `feat:` triggers MINOR; `fix:` triggers PATCH.',
    usage: [
      'Enter current release tag (e.g. v1.4.2).',
      'Select highest impact commit type in the upcoming release.',
      'Copy the calculated next version tag and npm bump command.',
    ],
    method: [
      'Complies with SemVer 2.0.0 specification rules (MAJOR.MINOR.PATCH).',
    ],
    fields: [
      txt('currentTag', 'Current Version Tag', 'v1.4.2', 1),
      sel('commitType', 'Highest Impact Commit Type', ['feat!: Breaking API change (MAJOR bump)', 'feat: New feature or capability (MINOR bump)', 'fix: Bug fix or security patch (PATCH bump)', 'chore/docs: Non-production maintenance (NO bump)']),
      sel('prerelease', 'Release Channel', ['Production Stable (no prerelease suffix)', 'Alpha (-alpha.1)', 'Beta (-beta.1)', 'Release Candidate (-rc.1)']),
    ],
    compute: (v) => {
      const rawTag = asStr(v, 'currentTag', 'v1.4.2').trim()
      const commit = asSel(v, 'commitType', 'feat: New feature')
      const channel = asSel(v, 'prerelease', 'Production Stable')

      const cleanTag = rawTag.replace(/^v/, '')
      const parts = cleanTag.split('.').map(Number)
      let major = parts[0] || 1
      let minor = parts[1] || 0
      let patch = parts[2] || 0

      let bumpType = 'PATCH'
      if (commit.startsWith('feat!')) {
        major += 1
        minor = 0
        patch = 0
        bumpType = 'MAJOR'
      } else if (commit.startsWith('feat:')) {
        minor += 1
        patch = 0
        bumpType = 'MINOR'
      } else if (commit.startsWith('fix:')) {
        patch += 1
        bumpType = 'PATCH'
      } else {
        bumpType = 'NONE'
      }

      let suffix = ''
      if (channel.startsWith('Alpha')) suffix = '-alpha.1'
      else if (channel.startsWith('Beta')) suffix = '-beta.1'
      else if (channel.startsWith('Release Candidate')) suffix = '-rc.1'

      const nextVersion = `${major}.${minor}.${patch}${suffix}`
      const nextTag = `v${nextVersion}`

      return [
        res('Calculated Next Tag', nextTag, 'good', `Bumped via ${bumpType}`),
        res('Current Tag', rawTag, 'neutral'),
        res('Bump Level', bumpType, bumpType === 'MAJOR' ? 'warn' : 'good'),
        docres('CLI Release Commands', `git tag -a ${nextTag} -m "Release ${nextTag}"\ngit push origin ${nextTag}\nnpm version ${nextVersion} --no-git-tag-version`, 'Run in terminal root'),
      ]
    },
  },
  {
    id: 'github-actions-runner-minutes-budgeter',
    name: 'GitHub Actions Runner Minutes & CI Billing Budgeter',
    subject: SUBJECT,
    blurb: 'Calculate monthly CI/CD runner billable minutes across Linux, Windows (2x multiplier), and macOS (10x multiplier) runners.',
    tip: 'Offload heavy unit tests to Ubuntu Linux runners; reserve macOS runners strictly for Xcode code signing.',
    usage: [
      'Enter weekly runs and average build duration per platform.',
      'Select GitHub Plan tier (Free, Team, Enterprise).',
      'Inspect monthly billable minutes and overage cost.',
    ],
    method: [
      'GitHub billing multipliers: Linux = 1x, Windows = 2x, macOS = 10x.',
      'Subtracts plan included minutes (Free: 2,000, Team: 3,000, Enterprise: 50,000).',
    ],
    fields: [
      n('linuxMinutes', 'Linux Minutes / Run', 8, 1, 120, 1),
      n('macMinutes', 'macOS Minutes / Run', 0, 0, 120, 1),
      n('winMinutes', 'Windows Minutes / Run', 0, 0, 120, 1),
      n('runsPerWeek', 'Total CI Workflow Runs / Week', 120, 1, 5000, 10),
      sel('planTier', 'GitHub Organization Plan', ['Team (3,000 included minutes)', 'Free (2,000 included minutes)', 'Enterprise (50,000 included minutes)']),
    ],
    compute: (v) => {
      const lMin = asNum(v, 'linuxMinutes', 8)
      const mMin = asNum(v, 'macMinutes', 0)
      const wMin = asNum(v, 'winMinutes', 0)
      const runs = asNum(v, 'runsPerWeek', 120)
      const plan = asSel(v, 'planTier', 'Team')

      let included = 3000
      if (plan.startsWith('Free')) included = 2000
      else if (plan.startsWith('Enterprise')) included = 50000

      const monthlyRuns = runs * 4.33
      const billedPerRun = (lMin * 1) + (wMin * 2) + (mMin * 10)
      const totalBilledMinutes = Math.round(monthlyRuns * billedPerRun)

      const overageMinutes = Math.max(0, totalBilledMinutes - included)
      const overageCost = overageMinutes * 0.008 // $0.008 per minute standard overage

      const tone = overageMinutes === 0 ? 'good' : 'warn'

      return [
        res('Monthly Billable Minutes', `${fmtNum(totalBilledMinutes)} minutes`, tone, `Multipliers applied: Linux 1x, Win 2x, Mac 10x`),
        res('Plan Quota Utilization', `${fmtNum(included)} included minutes`, 'neutral', `${plan} tier`),
        pctres('Quota Consumed', `${Math.min(100, Math.round((totalBilledMinutes / included) * 100))}%`, Math.min(100, Math.round((totalBilledMinutes / included) * 100)), tone),
        res('Est. Monthly Overage Bill', fmtMoney(overageCost), overageCost > 0 ? 'warn' : 'good', `${fmtNum(overageMinutes)} excess minutes @ $0.008/min`),
      ]
    },
  },
]
