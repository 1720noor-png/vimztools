import { useMemo, useState } from 'react'
import { ClipboardCheck, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { percent } from '../../../lib/numbers'

type Item = { id: string; label: string; tip: string }

const ITEMS: Item[] = [
  { id: 'contact', label: 'Contact info at the top', tip: 'Add email, phone and location in the header.' },
  { id: 'summary', label: 'A clear professional summary', tip: 'Lead with your strongest selling point in 2–3 lines.' },
  { id: 'quantified', label: 'Quantified bullet points', tip: 'Add numbers: %, $ revenue, or time saved.' },
  { id: 'verbs', label: 'Action verbs to start bullets', tip: 'Use led, built, shipped, launched — not responsible for.' },
  { id: 'keywords', label: 'Keywords that match the role', tip: 'Mirror exact phrasing from the job description.' },
  { id: 'dates', label: 'Dates on every role', tip: 'Include months + years for each position.' },
  { id: 'length', label: 'Fits on one page', tip: 'Trim older roles to a single line each.' },
  { id: 'links', label: 'Portfolio or LinkedIn links', tip: 'Link straight to proof of your work.' },
]

const GRADE: { min: number; label: string; color: string }[] = [
  { min: 0.9, label: 'Excellent — strong chance of an interview', color: 'text-emerald-600' },
  { min: 0.75, label: 'Good — a few quick fixes will polish it', color: 'text-sky-600' },
  { min: 0.5, label: 'Fair — address the tips below', color: 'text-amber-600' },
  { min: 0, label: 'Needs work — start with the basics', color: 'text-rose-600' },
]

export default function ResumeChecker() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }))

  const result = useMemo(() => {
    const done = ITEMS.filter((i) => checked[i.id]).length
    const total = ITEMS.length
    const score = (done / total) * 100
    const grade = GRADE.find((g) => score / 100 >= g.min) ?? GRADE[GRADE.length - 1]
    const tips = ITEMS.filter((i) => !checked[i.id])
    return { done, total, score, grade, tips }
  }, [checked])

  return (
    <>
      <Seo title="Resume Checker - vimz Tools" description="Scan your resume against a quick quality checklist." />
      <ToolShell
        title="Resume Checker"
        description="Scan your resume against a quick quality checklist."
        icon={<ClipboardCheck className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Score your resume against a quick quality checklist."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-2 text-sm font-bold text-slate-800">Quality checklist</h3>
            <p className="mb-4 text-xs text-slate-400">Tick each item your resume already passes.</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {ITEMS.map((i) => {
                const on = !!checked[i.id]
                return (
                  <button
                    key={i.id}
                    onClick={() => toggle(i.id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${on ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${on ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${on ? 'text-slate-700' : 'text-slate-700'}`}>{i.label}</p>
                      {on && <p className="text-xs text-emerald-600">{i.tip}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center lg:sticky lg:top-6">
              <ClipboardCheck className="mx-auto mb-2 h-7 w-7 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-primary-500">Resume score</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">{percent(result.score, 0)}</p>
              <p className="mt-3 text-sm font-bold text-slate-700">{result.done}/{result.total} checks passed</p>
              <p className={`mt-1 text-sm font-semibold ${result.grade.color}`}>{result.grade.label}</p>
              <div className="mt-4 h-3 rounded-full bg-white">
                <div className={`h-3 rounded-full ${result.score === 100 ? 'bg-emerald-500' : 'bg-primary-500'} transition-all`} style={{ width: `${result.score}%` }} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-3 text-sm font-bold text-slate-800">Improve next ({result.tips.length})</h4>
              {result.tips.length === 0 ? (
                <p className="text-sm text-emerald-600">All checks passed. You're ready to apply!</p>
              ) : (
                <ul className="space-y-2.5">
                  {result.tips.map((t) => (
                    <li key={t.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                      <p className="text-sm font-semibold text-slate-700">{t.label}</p>
                      <p className="text-xs leading-relaxed text-slate-500">{t.tip}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}