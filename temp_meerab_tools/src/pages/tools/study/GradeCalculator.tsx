import { useMemo, useState } from 'react'
import { AlertTriangle, Award, Target } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, percent, round, toNumber } from '../../../lib/numbers'

const letter = (n: number) => (n >= 90 ? 'A' : n >= 80 ? 'B' : n >= 70 ? 'C' : n >= 60 ? 'D' : 'F')

export default function GradeCalculator() {
  const [current, setCurrent] = useState('')
  const [weight, setWeight] = useState('')
  const [target, setTarget] = useState('')

  const res = useMemo(() => {
    const cur = toNumber(current)
    const w = toNumber(weight)
    const tg = toNumber(target)
    const valid = [cur, w, tg].every((v) => Number.isFinite(v)) && w > 0 && w < 100
    let needed = NaN
    let status: 'secure' | 'reach' | 'stretch' = 'reach'
    if (valid) {
      needed = (tg - (cur * (100 - w)) / 100) / (w / 100)
      status = needed <= 0 ? 'secure' : needed > 100 ? 'stretch' : 'reach'
    }
    return { cur, w, tg, valid, needed, status }
  }, [current, weight, target])

  const bar = res.valid ? clamp((res.needed / 100) * 100, 0, 100) : 0
  const neededPct = Number.isFinite(res.needed) ? percent(res.needed, 1) : '—'

  const msg = !res.valid
    ? 'Enter current mark, final weight and target to calculate the grade you need.'
    : res.status === 'secure'
      ? `You've already secured a ${letter(res.cur)} overall — the final can't drop you below your target.`
      : res.status === 'stretch'
        ? 'That target is out of reach on the final alone — consider the exam is a big hurdle.'
        : `Aim for ${neededPct} on the final (${letter(res.needed)}) to finish at ${percent(res.tg, 1)}.`

  const statusStyle =
    res.status === 'secure'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : res.status === 'stretch'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-amber-200 bg-amber-50 text-amber-700'

  return (
    <>
      <Seo title="Grade Calculator - vimz Tools" description="Work out the grade you need on your final to hit a target score." />
      <ToolShell
        title="Grade Calculator"
        description="Work out the grade you need to hit a target final score."
        icon={<Target className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Enter your current marks to find the grade you need to pass."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your numbers</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Current mark (%)">
                <TextInput type="number" min={0} max={100} step={1} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="e.g. 72" />
              </Field>
              <Field label="Weight of the final (%)">
                <TextInput type="number" min={1} max={99} step={1} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 20" />
              </Field>
              <Field label="Target final mark (%)">
                <TextInput type="number" min={0} max={100} step={1} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 75" />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Grade you need on the final</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="text-6xl font-extrabold text-primary-700">{res.valid ? round(res.needed, 1) : '—'}</p>
              {res.valid && (
                <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-extrabold text-primary-700">
                  <Award className="h-4 w-4" /> {letter(res.needed)}
                </span>
              )}
            </div>
            <div className="mt-4 h-3 rounded-full bg-slate-100">
              <div className={`h-3 rounded-full transition-all ${res.status === 'secure' ? 'bg-emerald-500' : res.status === 'stretch' ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${bar}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">Needed final mark on a 0–100 scale</p>
            <div className={`mt-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold ${statusStyle}`}>
              {res.status === 'secure' ? <Award className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{msg}</span>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}