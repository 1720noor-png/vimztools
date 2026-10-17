import { useState } from 'react'
import { BookCheck, CheckCircle2, Circle, ShieldAlert } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const APA = [
  'Authors listed in correct order',
  'Publication year in parentheses',
  'Book titles in sentence case',
  'DOI or URL included',
  'In-text citation matches the entry',
  'Italics on journal and book titles',
]

const MLA = [
  'Author last name comes first',
  'Article titles inside quotation marks',
  'Container title italicized',
  'Page range is present',
  'Access date for web sources',
  'In-text citation matches the entry',
]

type StyleKey = 'apa' | 'mla'

const fresh = (): Record<StyleKey, boolean[]> => ({ apa: APA.map(() => false), mla: MLA.map(() => false) })

export default function CitationChecklist() {
  const [checks, setChecks] = useState<Record<StyleKey, boolean[]>>(fresh)

  const toggle = (style: StyleKey, index: number) =>
    setChecks((p) => ({ ...p, [style]: p[style].map((v, i) => (i === index ? !v : v)) }))

  const done = [...checks.apa, ...checks.mla].filter(Boolean).length
  const total = APA.length + MLA.length
  const pct = total ? Math.round((done / total) * 100) : 0
  const zone = pct >= 80 ? 'Ready to submit' : pct >= 50 ? 'Almost there' : 'Needs revision'
  const zoneStyle =
    pct >= 80 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : pct >= 50 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-rose-200 bg-rose-50 text-rose-700'

  return (
    <>
      <Seo title="Citation Checklist - vimz Tools" description="Verify every reference is formatted before submitting with APA and MLA checklists." />
      <ToolShell
        title="Citation Checklist"
        description="Verify every reference is formatted before submitting."
        icon={<BookCheck className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Run through citation checks before you submit."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Overall readiness</h3>
              <ShieldAlert className="h-5 w-5 text-slate-300" />
            </div>
            <p className="mt-1 text-4xl font-extrabold text-slate-800">{pct}%</p>
            <div className="mt-2 h-2.5 rounded-full bg-slate-100">
              <div
                className={`h-2.5 rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-400">{done} of {total} checks passed</p>
            <div className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold ${zoneStyle}`}>
              <CheckCircle2 className="h-4 w-4" /> {zone}
            </div>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => setChecks(fresh())}>
              Reset checklists
            </Button>
          </section>

          {[
            { key: 'apa' as StyleKey, title: 'APA checklist', items: APA },
            { key: 'mla' as StyleKey, title: 'MLA checklist', items: MLA },
          ].map((col) => (
            <section key={col.key} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">{col.title}</h3>
                <span className="text-xs font-bold text-primary-600">
                  {checks[col.key].filter(Boolean).length}/{col.items.length}
                </span>
              </div>
              <ul className="space-y-2">
                {col.items.map((label, i) => {
                  const checked = checks[col.key][i]
                  return (
                    <li key={label}>
                      <button
                        onClick={() => toggle(col.key, i)}
                        className="flex w-full items-start gap-2.5 rounded-lg border border-slate-100 px-3 py-2.5 text-left transition hover:bg-slate-50"
                      >
                        {checked ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                        <span className={`text-sm ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </ToolShell>
    </>
  )
}