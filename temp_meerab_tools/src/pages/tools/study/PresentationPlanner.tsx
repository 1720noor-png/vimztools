import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Plus, Presentation, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, fmtCountdown, sum, toNumber, uid } from '../../../lib/numbers'

type Slide = { id: string; title: string; points: string; seconds: string }

const secondsOf = (s: string) => {
  const v = toNumber(s)
  return Number.isFinite(v) && v >= 0 ? v : 0
}

export default function PresentationPlanner() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [title, setTitle] = useState('')
  const [points, setPoints] = useState('')
  const [seconds, setSeconds] = useState('')
  const [target, setTarget] = useState('3600')

  const total = useMemo(() => sum(slides.map((s) => secondsOf(s.seconds))), [slides])
  const targetSec = useMemo(() => {
    const v = toNumber(target)
    return Number.isFinite(v) && v >= 0 ? v : NaN
  }, [target])
  const diffMin = Number.isFinite(targetSec) ? (total - targetSec) / 60 : NaN
  const pct = Number.isFinite(targetSec) && targetSec > 0 ? clamp((total / targetSec) * 100, 0, 300) : 0
  const over = Number.isFinite(diffMin) && diffMin > 0

  const add = () => {
    if (!title.trim()) return
    setSlides((p) => [...p, { id: uid(), title: title.trim(), points: points.trim(), seconds }])
    setTitle('')
    setPoints('')
    setSeconds('')
  }

  const update = (id: string, patch: Partial<Slide>) => setSlides((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const remove = (id: string) => setSlides((p) => p.filter((s) => s.id !== id))

  const msg = !Number.isFinite(diffMin)
    ? 'Set a target talk time to check your pacing.'
    : over
      ? `Over budget by ${Math.ceil(diffMin)} min — trim some slides.`
      : `Within budget with ${Math.floor(-diffMin)} min to spare.`

  return (
    <>
      <Seo title="Presentation Planner - vimz Tools" description="Structure slides, timing and talking points for a talk." />
      <ToolShell
        title="Presentation Planner"
        description="Structure slides, timing and talking points for a talk."
        icon={<Presentation className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Outline slides with an estimated speaking time each."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a slide</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Slide title">
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Results" />
                </Field>
                <Field label="Talking points">
                  <TextInput value={points} onChange={(e) => setPoints(e.target.value)} placeholder="e.g. Sales up 40%, key drivers" />
                </Field>
                <Field label="Estimated time (seconds)">
                  <TextInput type="number" min={0} value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="e.g. 90" />
                </Field>
                <Button onClick={add}>
                  <Plus className="h-4 w-4" /> Add slide
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">Pacing check</h3>
                <div className="w-24">
                  <TextInput type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} className="py-1.5 text-center" />
                  <p className="mt-0.5 text-center text-[10px] text-slate-400">target (sec)</p>
                </div>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className={`h-2.5 rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${over ? 'text-rose-600' : 'text-emerald-600'}`}>
                {over ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {msg}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Total: {fmtCountdown(total)}</p>
            </section>
          </div>

          <div className="space-y-3 lg:col-span-3">
            {slides.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
                No slides yet — outline your deck on the left.
              </p>
            ) : (
              slides.map((s, i) => {
                const cum = sum(slides.slice(0, i + 1).map((x) => secondsOf(x.seconds)))
                return (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-extrabold text-primary-700">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">{s.title || 'Untitled slide'}</p>
                        <p className="truncate text-[11px] text-slate-400">{s.points || 'No talking points'}</p>
                      </div>
                      <div className="w-20">
                        <TextInput
                          type="number"
                          min={0}
                          value={s.seconds}
                          onChange={(e) => update(s.id, { seconds: e.target.value })}
                          className="py-1.5 text-center"
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-bold text-slate-500">{fmtCountdown(secondsOf(s.seconds))}</span>
                      <span className="w-14 text-right text-[10px] font-semibold text-slate-400">cum {fmtCountdown(cum)}</span>
                      <button onClick={() => remove(s.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}