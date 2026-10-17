import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Baby, CalendarDays, Clock } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const trimesters = [
  { name: 'First Trimester', range: [1, 13], desc: 'Weeks 1–13. The baby\u2019s organs begin to form.' },
  { name: 'Second Trimester', range: [14, 27], desc: 'Weeks 14–27. Growth spurt and first movements.' },
  { name: 'Third Trimester', range: [28, 40], desc: 'Weeks 28–40. Final growth and brain development.' },
]

export default function PregnancyCalculator() {
  const [lmpDate, setLmpDate] = useState('')
  const [cycleLen, setCycleLen] = useState(28)

  const result = useMemo(() => {
    if (!lmpDate) return null
    const lmp = dayjs(lmpDate)
    if (!lmp.isValid()) return null
    const cycle = Math.max(21, Math.min(45, cycleLen))
    const gestDays = 280 + (cycle - 28)
    const edd = lmp.add(gestDays, 'day')
    const today = dayjs()
    const totalDays = today.diff(lmp, 'day')
    if (totalDays < 0) return { kind: 'error' as const, message: 'LMP cannot be in the future.' }
    const w = Math.floor(totalDays / 7)
    const d = totalDays % 7
    const tri = trimesters.find((t) => w >= t.range[0] && w <= t.range[1]) ?? trimesters[0]

    const milestones: { label: string; date: string; passed: boolean }[] = [
      { label: 'Quickening (first movements)', date: lmp.add(18, 'week').format('MMM D, YYYY'), passed: totalDays >= 18 * 7 },
      { label: 'Viability (24 weeks)', date: lmp.add(24, 'week').format('MMM D, YYYY'), passed: totalDays >= 24 * 7 },
      { label: 'Full term', date: lmp.add(37, 'week').format('MMM D, YYYY'), passed: totalDays >= 37 * 7 },
      { label: 'Estimated due date', date: edd.format('MMM D, YYYY'), passed: totalDays >= gestDays },
    ]

    const conception = lmp.add(14, 'day')
    return { kind: 'ok' as const, edd, w, d, tri, conception, milestones, daysLeft: Math.max(0, gestDays - totalDays), gestationDays: gestDays }
  }, [lmpDate, cycleLen])

  const trimesterProgress = Math.min(100, Math.round((((result && result.kind === 'ok' ? result.w : 0) / 40)) * 100))
  const handleDate = (v: string) => setLmpDate(v)

  return (
    <>
      <Seo
        title="Pregnancy Due Date & Trimester Calculator - vimz Tools"
        description="Compute your estimated due date (EDD), current trimester and weekly pregnancy milestones easily with this free browser calculator."
      />
      <ToolShell
        title="Pregnancy Due Date & Trimester Calculator"
        description="Enter your last menstrual period (LMP) to instantly get the estimated due date, your current trimester and upcoming milestones."
        icon={<Baby className="h-6 w-6" />}
        breadcrumb="Health & Life"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800">Enter details</h3>
            <Field label="First day of last menstrual period (LMP)">
              <input type="date" value={lmpDate} onChange={(e) => handleDate(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" />
            </Field>
            <Field label={`Cycle length: ${cycleLen} days`}>
              <input type="range" min={21} max={45} value={cycleLen} onChange={(e) => setCycleLen(Number(e.target.value))} className="w-full accent-primary-600" />
            </Field>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {result && result.kind === 'error' ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-medium text-rose-700">
                {result.message}
              </div>
            ) : result === null ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center">
                <Baby className="h-10 w-10 text-slate-300" />
                <p className="mt-4 text-sm font-medium text-slate-500">Pick a date to see your pregnancy timeline.</p>
                <p className="mt-1 text-xs text-slate-400">Optionally adjust your typical cycle length for a personalized EDD.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">Estimated due date</p>
                    <p className="mt-2 text-2xl font-extrabold text-primary-800">{result.edd.format('MMM D, YYYY')}</p>
                    <p className="mt-1 text-xs text-primary-500">{result.gestationDays}-day pregnancy (cycle-adjusted)</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">You are</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-800">
                      {result.w}w {result.d}d
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">{trimesterProgress}% of pregnancy complete</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Conception date (est.)</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-800">{result.conception.format('MMM D, YYYY')}</p>
                    <p className="mt-1 text-xs text-slate-400">Approx. ovulation window</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Clock className="h-4 w-4 text-primary-600" /> Current trimester
                  </h3>
                  <p className="mt-2 text-xl font-bold text-slate-900">{result.tri.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{result.tri.desc}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all" style={{ width: `${trimesterProgress}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-primary-700">{trimesterProgress}%</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CalendarDays className="h-4 w-4 text-primary-600" /> Milestones
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {result.milestones.map((m) => (
                      <li key={m.label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${m.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {m.passed ? '✓' : ''}
                          </span>
                          <span className={`text-sm ${m.passed ? 'text-slate-700' : 'text-slate-500'}`}>{m.label}</span>
                        </div>
                        <span className={`text-xs font-semibold ${m.passed ? 'text-emerald-600' : 'text-slate-400'}`}>{m.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
                  Disclaimer: estimates only. Always confirm with your healthcare provider.
                </div>
              </>
            )}

            {result && (
              <Button variant="secondary" onClick={() => setLmpDate('')}>
                Reset calculator
              </Button>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}