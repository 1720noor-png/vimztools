import { useMemo, useState } from 'react'
import { LayoutGrid, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { percent } from '../../../lib/numbers'

type Group = { name: string; items: string[] }

const GROUPS: Group[] = [
  { name: 'Home', items: ['Clear headline + one-line value prop', 'Obvious call-to-action on the hero'] },
  { name: 'About', items: ['Professional photo of you', 'Short story: who you are and who you help'] },
  { name: 'Projects', items: ['At least 3 strongest projects', 'A screenshot or demo for each', 'Real results / metrics per project'] },
  { name: 'Case study', items: ['Problem → process → solution walkthrough', 'Impact numbers shown up top'] },
  { name: 'Contact', items: ['Email visible in the header and footer', 'LinkedIn + GitHub / social links'] },
  { name: 'Testimonials', items: ['At least 2 client or manager quotes'] },
]

export default function PortfolioChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }))

  const result = useMemo(() => {
    const all: string[] = []
    GROUPS.forEach((g) => g.items.forEach((it) => all.push(`${g.name}:${it}`)))
    const total = all.length
    const done = all.filter((k) => checked[k]).length
    const perGroup = GROUPS.map((g) => {
      const yes = g.items.filter((it) => checked[`${g.name}:${it}`]).length
      return { name: g.name, done: yes, total: g.items.length, pct: g.items.length ? (yes / g.items.length) * 100 : 0 }
    })
    return { total, done, score: total ? (done / total) * 100 : 0, perGroup, missing: total - done }
  }, [checked])

  return (
    <>
      <Seo title="Portfolio Checklist - vimz Tools" description="Check off everything a strong portfolio should include." />
      <ToolShell
        title="Portfolio Checklist"
        description="Check off everything a strong portfolio should include."
        icon={<LayoutGrid className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Check what your portfolio still needs before sharing it."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {GROUPS.map((g) => (
              <section key={g.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">{g.name}</h3>
                  <span className="text-xs font-bold text-slate-400">
                    {result.perGroup.find((p) => p.name === g.name)?.done ?? 0}/{g.items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {g.items.map((it) => {
                    const key = `${g.name}:${it}`
                    const on = !!checked[key]
                    return (
                      <button
                        key={key}
                        onClick={() => toggle(key)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition ${on ? 'border-emerald-300 bg-emerald-50 text-slate-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${on ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {it}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center lg:sticky lg:top-6">
              <LayoutGrid className="mx-auto mb-2 h-7 w-7 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-primary-500">Readiness score</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">{percent(result.score, 0)}</p>
              <p className="mt-2 text-sm text-primary-600">
                {result.missing === 0 ? 'Ready to share — great work!' : `${result.missing} item${result.missing === 1 ? '' : 's'} still to add`}
              </p>
              <div className="mt-4 h-3 rounded-full bg-white">
                <div className="h-3 rounded-full bg-primary-500 transition-all" style={{ width: `${result.score}%` }} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-3 text-sm font-bold text-slate-800">By section</h4>
              <div className="space-y-3">
                {result.perGroup.map((p) => (
                  <div key={p.name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-slate-600">{p.name}</span>
                      <span className="text-slate-400">{p.done}/{p.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className={`h-1.5 rounded-full transition-all ${p.pct === 100 ? 'bg-emerald-500' : 'bg-primary-400'}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}