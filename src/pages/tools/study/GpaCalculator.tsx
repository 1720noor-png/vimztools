import { useMemo, useState } from 'react'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber, uid } from '../../../lib/numbers'

const GRADES = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
const POINTS: Record<string, number> = { A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0.0 }

type Row = { id: string; name: string; grade: string; credits: string }

export default function GpaCalculator() {
  const [rows, setRows] = useState<Row[]>([])
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('A')
  const [credits, setCredits] = useState('')

  const result = useMemo(() => {
    const valid: { name: string; pts: number; cr: number }[] = []
    rows.forEach((r) => {
      const cr = toNumber(r.credits)
      if (POINTS[r.grade] !== undefined && Number.isFinite(cr) && cr > 0) valid.push({ name: r.name, pts: POINTS[r.grade], cr })
    })
    let totalPts = 0
    let totalCr = 0
    valid.forEach((v) => {
      totalPts += v.pts * v.cr
      totalCr += v.cr
    })
    const gpa = totalCr > 0 ? totalPts / totalCr : NaN
    const maxContribution = valid.length ? Math.max(...valid.map((v) => v.pts * v.cr)) : 1
    return { valid, totalPts, totalCr, gpa, maxContribution }
  }, [rows])

  const add = () => {
    if (!name.trim()) return
    setRows((p) => [...p, { id: uid(), name: name.trim(), grade, credits }])
    setName('')
    setCredits('')
  }

  const remove = (id: string) => setRows((p) => p.filter((r) => r.id !== id))

  const zone = !Number.isFinite(result.gpa) ? 'text-slate-300' : result.gpa >= 3.5 ? 'text-emerald-600' : result.gpa >= 3.0 ? 'text-primary-600' : result.gpa >= 2.0 ? 'text-amber-600' : 'text-rose-500'

  return (
    <>
      <Seo title="GPA Calculator - vimz Tools" description="Calculate your GPA from grades and credit hours for each class." />
      <ToolShell
        title="GPA Calculator"
        description="Calculate your GPA from grades and credit hours."
        icon={<GraduationCap className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Enter grades and credits to compute your GPA."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a class</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                <Field label="Class name">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Calculus" />
                </Field>
                <Field label="Grade">
                  <Select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-24">
                    {GRADES.map((g) => (
                      <option key={g} value={g}>{g} · {POINTS[g]}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Credits">
                  <TextInput type="number" min={0} step={0.5} value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="3" className="w-24" />
                </Field>
              </div>
              <Button className="mt-2" onClick={add}>
                <Plus className="h-4 w-4" /> Add class
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Classes ({rows.length})</h3>
              {rows.length === 0 ? (
                <p className="text-xs text-slate-400">No classes yet — add one above.</p>
              ) : (
                <div className="space-y-4">
                  {rows.map((r) => {
                    const cr = toNumber(r.credits)
                    const pts = POINTS[r.grade] !== undefined && Number.isFinite(cr) && cr > 0 ? POINTS[r.grade] * cr : 0
                    return (
                      <div key={r.id}>
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                            <p className="text-[11px] text-slate-400">{r.grade} · {cr || 0} credits</p>
                          </div>
                          <span className="text-sm font-bold text-slate-600">{round(pts, 1)} pts</span>
                          <button onClick={() => remove(r.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${(pts / result.maxContribution) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <div>
            <section className="rounded-2xl border border-primary-200 bg-white p-8 text-center">
              <GraduationCap className="mx-auto mb-3 h-8 w-8 text-primary-600" />
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Your GPA</p>
              <p className={`mt-2 text-7xl font-extrabold ${zone}`}>{Number.isFinite(result.gpa) ? result.gpa.toFixed(2) : '—'}</p>
              <p className="mt-3 text-xs text-slate-400">{round(result.totalCr, 0)} credits · {result.valid.length} graded class(es)</p>
              <div className="mt-5 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-primary-500" style={{ width: `${Number.isFinite(result.gpa) ? (result.gpa / 4) * 100 : 0}%` }} />
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}