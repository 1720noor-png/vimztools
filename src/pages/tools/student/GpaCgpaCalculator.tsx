import { useMemo, useState } from 'react'
import { Medal, Plus, Trash2, Calculator } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const SCALE4: Record<string, number> = { A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, 'C-': 1.7, D: 1, F: 0 }
const SCALE5: Record<string, number> = { A: 5, 'B+': 4.5, B: 4, 'C+': 3.5, C: 3, D: 2, F: 0 }

interface Course {
  id: number
  name: string
  credits: string
  grade: string
}

function pick(scale: 4 | 5): string[] {
  return Object.keys(scale === 4 ? SCALE4 : SCALE5)
}

export default function GpaCgpaCalculator() {
  const [scale, setScale] = useState<4 | 5>(4)
  const [priorGpa, setPriorGpa] = useState('')
  const [priorCredits, setPriorCredits] = useState('')
  const [courses, setCourses] = useState<Course[]>([{ id: 1, name: 'Mathematics', credits: '3', grade: 'A' }])

  const grades = pick(scale)
  const points = scale === 4 ? SCALE4 : SCALE5

  const update = (id: number, patch: Partial<Course>) =>
    setCourses((v) => v.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const addRow = () =>
    setCourses((v) => [...v, { id: Date.now(), name: '', credits: '3', grade: grades[0] }])

  const result = useMemo(() => {
    const rows = courses
      .map((c) => ({ credits: parseFloat(c.credits), pts: points[c.grade] ?? 0 }))
      .filter((r) => Number.isFinite(r.credits) && r.credits > 0)
    const totalCredits = rows.reduce((a, r) => a + r.credits, 0)
    const weighted = rows.reduce((a, r) => a + r.credits * r.pts, 0)
    const term = totalCredits ? weighted / totalCredits : 0
    const pCred = parseFloat(priorCredits)
    const pGpa = parseFloat(priorGpa)
    const hasPrior = Number.isFinite(pCred) && Number.isFinite(pGpa) && pCred > 0
    const cgpa = hasPrior ? (pCred * pGpa + weighted) / (pCred + totalCredits) : null
    return { term, cgpa, totalCredits, weighted }
  }, [courses, priorGpa, priorCredits, points])

  return (
    <>
      <Seo
        title="GPA / CGPA Calculator - vimz Tools"
        description="Compute your semester GPA and cumulative CGPA on a 4.0 or 5.0 scale."
      />
      <ToolShell
        title="GPA / CGPA Calculator"
        description="Weight course results into a term GPA, then fold in prior history for CGPA."
        icon={<Medal className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Add each course with its credit weight and letter grade, then read your GPA."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Grading scale">
              <Select value={String(scale)} onChange={(e) => setScale(e.target.value === '5' ? 5 : 4)}>
                <option value="4">4.0 scale</option>
                <option value="5">5.0 scale</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prior CGPA">
                <TextInput value={priorGpa} onChange={(e) => setPriorGpa(e.target.value)} placeholder="optional" />
              </Field>
              <Field label="Prior credits earned">
                <TextInput value={priorCredits} onChange={(e) => setPriorCredits(e.target.value)} placeholder="optional" />
              </Field>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[1fr_92px_110px_44px] items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <span>Course</span>
                <span>Credits</span>
                <span>Grade</span>
                <span />
              </div>
              {courses.map((c) => (
                <div key={c.id} className="grid grid-cols-[1fr_92px_110px_44px] items-center gap-2 border-b border-slate-50 px-4 py-2 last:border-0">
                  <TextInput value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} placeholder="Course name" />
                  <TextInput type="number" min={0} step="0.5" value={c.credits} onChange={(e) => update(c.id, { credits: e.target.value })} />
                  <Select value={c.grade} onChange={(e) => update(c.id, { grade: e.target.value })}>
                    {grades.map((g) => (
                      <option key={g} value={g}>{g} ({points[g]})</option>
                    ))}
                  </Select>
                  <button onClick={() => setCourses((v) => v.filter((x) => x.id !== c.id))} className="text-slate-300 transition hover:text-rose-500" aria-label="Remove row">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={addRow}>
              <Plus className="h-4 w-4" /> Add course
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-900 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Term GPA</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-white">{result.term.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">CGPA</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-violet-900">
                  {result.cgpa !== null ? result.cgpa.toFixed(2) : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Credits</p>
                <p className="mt-1 font-mono text-2xl font-extrabold text-slate-800">{result.totalCredits}</p>
              </div>
            </div>
            <ul className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <li className="flex justify-between"><span>Weighted grade points</span><span className="font-mono font-bold">{result.weighted.toFixed(2)}</span></li>
              <li className="flex justify-between"><span>Point values used</span><span className="font-mono font-bold">{scale}.0 scale</span></li>
              <li className="flex justify-between"><span>CGPA basis</span><span className="font-mono font-bold">{result.cgpa !== null ? `${result.totalCredits + (parseFloat(priorCredits) || 0)} credits` : 'term only'}</span></li>
            </ul>
            <CodeBlock
              title="Summary (copyable)"
              code={`Term GPA: ${result.term.toFixed(2)} (${scale}.0 scale)\nCredits this term: ${result.totalCredits}\nCGPA: ${result.cgpa !== null ? result.cgpa.toFixed(2) : 'not provided'}`}
              lang="plain"
            />
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calculator className="h-3.5 w-3.5" /> Rows with empty names are included if they have credits and grade.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}