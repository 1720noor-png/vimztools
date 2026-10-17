import { useMemo, useState } from 'react'
import { Target, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type ClaimType = 'argumentative' | 'analytical' | 'explanatory'
type Scope = 'narrow' | 'balanced' | 'broad'

const POSITIVES = ['important role', 'sharply improves', 'reshapes the field', 'deserves closer study']
const NEGATIVES = ['is often overstated', 'carries hidden costs', 'remains poorly understood']
const CAUTIONS = ['although the effects are context dependent', 'especially when resources are scarce', 'without losing sight of the trade-offs']

function buildStmt(topic: string, type: ClaimType, scope: Scope): { thesis: string; why: string } {
  const t = topic.trim()
  if (!t) return { thesis: '', why: '' }

  const stem =
    type === 'argumentative'
      ? `This paper argues that ${t.toLowerCase()} plays an`
      : type === 'analytical'
        ? `A careful comparison shows that ${t.toLowerCase()} can be understood as a`
        : `The evidence suggests that ${t.toLowerCase()} plays a`

  const scopeMod =
    scope === 'narrow' ? 'specific and testable' : scope === 'broad' ? 'broad and contested' : 'nuanced'

  const tail =
    type === 'argumentative'
      ? POSITIVES[(t.length + type.length) % POSITIVES.length]
      : type === 'analytical'
        ? NEGATIVES[(t.length + scope.length) % NEGATIVES.length]
        : CAUTIONS[(t.length + type.length + scope.length) % CAUTIONS.length]

  const caution = type !== 'explanatory' ? ` ${CAUTIONS[(t.length + 2) % CAUTIONS.length]}` : ''
  const thesis = `${stem} ${scopeMod} ${tail}.${caution}`

  const why =
    type === 'argumentative'
      ? `because the balance of evidence supports this reading`
      : type === 'analytical'
        ? `because the strongest studies converge on this conclusion`
        : `because it explains the most variation in the outcomes observed`

  return { thesis, why }
}

export default function ThesisStatementGenerator() {
  const [topic, setTopic] = useState('the digital divide in rural schools')
  const [type, setType] = useState<ClaimType>('argumentative')
  const [scope, setScope] = useState<Scope>('narrow')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => (void ran, buildStmt(topic, type, scope)), [topic, type, scope, ran])

  return (
    <>
      <Seo
        title="Thesis Statement Generator - vimz Tools"
        description="Craft a clear, arguable thesis statement and guard against weak claims."
      />
      <ToolShell
        title="Thesis Statement Generator"
        description="Craft a clear, arguable thesis and the reasons that back it up."
        icon={<Target className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Describe your topic and choose the claim type and scope, then generate."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Claim type">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ClaimType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="argumentative">Argumentative</option>
                  <option value="analytical">Analytical</option>
                  <option value="explanatory">Explanatory</option>
                </select>
              </Field>
              <Field label="Scope">
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as Scope)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="narrow">Narrow</option>
                  <option value="balanced">Balanced</option>
                  <option value="broad">Broad</option>
                </select>
              </Field>
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Generate thesis
            </Button>
          </div>

          <div className="space-y-4">
            {result.thesis ? (
              <>
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-violet-500">One-sentence thesis</p>
                  <p className="text-sm font-semibold leading-relaxed text-violet-900">{result.thesis}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Why it works</p>
                  <p className="text-sm leading-relaxed text-slate-700">{result.why}. A strong thesis is provable, focused, and arguable - if no reasonable person could disagree, tighten it.</p>
                </div>
                <CodeBlock title="Copyable thesis" code={result.thesis} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your thesis statement will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}