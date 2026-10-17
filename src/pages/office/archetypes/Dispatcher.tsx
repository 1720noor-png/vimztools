import type { OfficeToolSpec } from './spec'
import Est from './Est'
import Index from './Index'
import Matrix from './Matrix'
import Checklist from './Checklist'
import Scorecard from './Scorecard'
import Tier from './Tier'
import Fmt from './Fmt'
import Timeline from './Timeline'
import Log from './Log'
import Conv from './Conv'
import Bdown from './Bdown'
import Tracker from './Tracker'

export default function ArchetypeRenderer({ spec }: { spec: OfficeToolSpec }) {
  switch (spec.archetype) {
    case 'index':
      return <Index spec={spec} />
    case 'matrix':
      return <Matrix spec={spec} />
    case 'checklist':
      return <Checklist spec={spec} />
    case 'scorecard':
      return <Scorecard spec={spec} />
    case 'tier':
      return <Tier spec={spec} />
    case 'fmt':
      return <Fmt spec={spec} />
    case 'timeline':
      return <Timeline spec={spec} />
    case 'log':
      return <Log spec={spec} />
    case 'conv':
      return <Conv spec={spec} />
    case 'bdown':
      return <Bdown spec={spec} />
    case 'tracker':
      return <Tracker spec={spec} />
    case 'est':
    default:
      return <Est spec={spec} />
  }
}