import { useMemo, useState } from 'react'
import { Award, Plus, Sigma, Target, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, percent, round, toNumber, uid } from '../../../lib/numbers'

type Sem = { id: string; gpa: string; credits: string }

export default function CgpaCalculator() {
  const [sems, setSems] = useState<Sem[]>([{ id: uid(), gpa: '', credits: '' }])
  const [gpa, setGpa] = useState('')
  const [credits, setCredits] = useState('')
  const [target, setTarget] = useState('3.0')

  const result = useMemo(() => {
    let points = 0
    let units = 0
    let valid = 0
    sems.forEach((s) => {
      const g = toNumber(s.gpa)
      const c = toNumber(s.credits)
      if (Number.isFinite(g) && Number.isFinite(c) && c > 0) {
        points += g * c
        units += c
        valid += 1
      }
    })
    const cgpa = units > 0 ? points / units : NaN
    const t = toNumber(target)
    const pct = Number.isFinite(cgpa) && Number.isFinite(t) && t > 0 ? clamp((cgpa / t) * 100, 0, 200) : 0
    const zone = !Number.isFinite(cgpa) ? '' : cgpa >= 3.5 ? 'Excellent' : cgpa >= 3.0 ? 'Good' : cgpa >= 2.5 ? 'Room to grow' : 'Push your grades up'
    return { cgpa, units, valid, pct, zone }
  }, [sems, target])

  const update = (id: string, key: 'gpa' | 'credits', value: string) =>
    setSems((p) => p.map((s) => (s.id === id ? { ...s, [key]: value } : s)))
  const remove = (id: string) => setSems((p) => p.filter((s) => s.id !== id))

  const submit = () => {
    const g = toNumber(gpa)
    const c = toNumber(credits)
    if (!Number.isFinite(g) || !Number.isFinite(c) || c <= 0) return
    setSems((p) => [...p, { id: uid(), gpa, credits: String(c) }])
    setGpa('')
    setCredits('')
  }

  return (
    <>
      <Seo title="CGPA Calculator - vimz Tools" description="Compute cumulative GPA from per-semester grade points and credits." />
      <ToolShell
        title="CGPA Calculator"
        description="Compute cumulative GPA from semester grade points."
        icon={<Sigma className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Enter per-semester GPAs to calculate your cumulative CGPA."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a semester</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Semester GPA">
                  <TextInput type="number" step={0.1} min={0} max={4} value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 3.6" />
                </Field>
                <Field label="Credits">
                  <TextInput type="number" step={1} min={0} value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="e.g. 18" />
                </Field>
              </div>
              <Button className="mt-3 w-full" onClick={submit}>
                <Plus className="h-4 w-4" /> Add semester
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Semesters ({sems.length})</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {sems.map((s, i) => {
                  const g = toNumber(s.gpa)
                  const c = toNumber(s.credits)
                  const subj = Number.isFinite(g) && Number.isFinite(c) && c > 0 ? g * c : NaN
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                      <span className="w-6 font-semibold text-slate-500">#{i + 1}</span>
                      <input className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm" value={s.gpa} onChange={(e) => update(s.id, 'gpa', e.target.value)} placeholder="GPA" />
                      <input className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm" value={s.credits} onChange={(e) => update(s.id, 'credits', e.target.value)} placeholder="Cr" />
                      <span className={`w-16 text-right text-xs font-bold ${Number.isFinite(subj) ? 'text-slate-600' : 'text-slate-300'}`}>
                        {Number.isFinite(subj) ? round(subj, 1) : '—'} pts
                      </span>
                      <button onClick={() => remove(s.id)} className="p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="space-y-5 lg:col-span-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
                  <Sigma className="mx-auto mb-2 h-6 w-6 text-primary-600" />
                  <p className="text-[11px] font-semibold uppercase text-primary-500">Cumulative GPA</p>
                  <p className="mt-1 text-4xl font-extrabold text-primary-800">{Number.isFinite(result.cgpa) ? result.cgpa.toFixed(2) : '—'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <Target className="mx-auto mb-2 h-6 w-6 text-slate-500" />
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Valid semesters</p>
                  <p className="mt-1 text-4xl font-extrabold text-slate-700">{result.valid}</p>
                  <p className="text-[11px] text-slate-400">{round(result.units, 0)} credits</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <Award className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
                  <p className="text-[11px] font-semibold uppercase text-emerald-500">Standing</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-700">{result.zone || '—'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">Progress toward target GPA</h3>
                <div className="w-24">
                  <TextInput type="number" step={0.1} min={0} max={4} value={target} onChange={(e) => setTarget(e.target.value)} className="py-1.5 text-center" />
                </div>
              </div>
              <div className="mt-3 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${result.pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {Number.isFinite(result.cgpa)
                  ? `${result.cgpa.toFixed(2)} of ${target || '—'} target (${percent(result.pct, 0)})`
                  : 'Enter semester data to see progress.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}