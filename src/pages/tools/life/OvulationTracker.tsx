import { useMemo, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import dayjs from 'dayjs'
import { CalendarHeart, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

ChartJS.register(ArcElement, Tooltip, Legend)

const phaseColors = [
  '#ef4444', // menstruation - red
  '#f59e0b', // follicular - amber
  '#10b981', // ovulation - emerald
  '#6366f1', // luteal - indigo
]

export default function OvulationTracker() {
  const [lastPeriod, setLastPeriod] = useState('')
  const [cycleLen, setCycleLen] = useState(28)
  const [periodLen, setPeriodLen] = useState(5)

  const result = useMemo(() => {
    if (!lastPeriod) return null
    const start = dayjs(lastPeriod)
    if (!start.isValid()) return null
    const ovDay = cycleLen - 14
    const fertileStart = ovDay - 5
    const fertileEnd = ovDay + 1
    const nextPeriod = start.add(cycleLen, 'day')

    const today = dayjs()
    const currentDay = today.diff(start, 'day')
    const dayInCycle = currentDay >= 0 ? (currentDay % cycleLen) + 1 : 1
    const currentPhase =
      dayInCycle <= periodLen
        ? 'Menstrual'
        : dayInCycle <= ovDay - 2
        ? 'Follicular'
        : dayInCycle <= ovDay + 1
        ? 'Ovulation'
        : 'Luteal'

    const pastPeriods: { start: string; end: string }[] = []
    let p = start
    for (let i = 0; i < 3; i++) {
      pastPeriods.push({ start: p.format('MMM D'), end: p.add(periodLen, 'day').format('MMM D') })
      p = p.add(cycleLen, 'day')
    }

    return {
      nextPeriod,
      ovDate: start.add(ovDay, 'day'),
      fertileStart: start.add(fertileStart, 'day'),
      fertileEnd: start.add(fertileEnd, 'day'),
      currentPhase,
      dayInCycle,
      currentDay: dayInCycle,
      pastPeriods,
      phaseSummary: [
        { label: 'Menstruation', days: periodLen, desc: 'Shedding phase' },
        { label: 'Follicular', days: ovDay - 2 - periodLen, desc: 'Follicles developing' },
        { label: 'Ovulation', days: 3, desc: 'Peak fertility' },
        { label: 'Luteal', days: cycleLen - ovDay - 1, desc: 'Pre-menstruation' },
      ],
    }
  }, [lastPeriod, cycleLen, periodLen])

  const chartData = useMemo(() => {
    if (!result) return null
    const phases = [
      periodLen,
      Math.max(0, (result.phaseSummary[1]?.days ?? 0)),
      3,
      cycleLen - 14 - 1 - periodLen,
    ].filter(Boolean)

    return {
      labels: result.phaseSummary.map((p) => p.label),
      datasets: [
        {
          data: phases,
          backgroundColor: phaseColors.slice(0, phases.length),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    }
  }, [result, periodLen, cycleLen])

  return (
    <>
      <Seo
        title="Ovulation & Period Tracker - vimz Tools"
        description="Visualize your menstrual cycle, ovulation date and fertile window with an interactive chart. Free, private, fully browser-based."
      />
      <ToolShell
        title="Ovulation & Period Tracker"
        description="Plot your next period, peak fertility window and luteal phase on a clean, easy-to-read doughnut chart with cycle day tracking."
        icon={<CalendarHeart className="h-6 w-6" />}
        breadcrumb="Health & Life"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800">Your cycle</h3>
            <Field label="First day of last period">
              <input
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </Field>
            <Field label={`Cycle length: ${cycleLen} days`}>
              <input type="range" min={21} max={40} value={cycleLen} onChange={(e) => setCycleLen(Number(e.target.value))} className="w-full accent-primary-600" />
              <div className="flex justify-between text-[11px] text-slate-400"><span>21</span><span>40</span></div>
            </Field>
            <Field label={`Period length: ${periodLen} days`}>
              <input type="range" min={2} max={10} value={periodLen} onChange={(e) => setPeriodLen(Number(e.target.value))} className="w-full accent-primary-600" />
              <div className="flex justify-between text-[11px] text-slate-400"><span>2</span><span>10</span></div>
            </Field>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {!result ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center">
                <CalendarHeart className="h-10 w-10 text-slate-300" />
                <p className="mt-4 text-sm font-medium text-slate-500">Pick a start date to see your cycle.</p>
                <p className="mt-1 text-xs text-slate-400">Adjust your typical cycle and period length above.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-rose-500">Current phase</p>
                    <p className="mt-1 text-lg font-extrabold text-rose-700">{result.currentPhase}</p>
                    <p className="text-[11px] text-rose-400">Day {result.dayInCycle} of {cycleLen}</p>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-sky-500">Next period</p>
                    <p className="mt-1 text-lg font-extrabold text-sky-700">{result.nextPeriod.format('MMM D')}</p>
                    <p className="text-[11px] text-sky-400">in {Math.max(0, cycleLen - result.dayInCycle)} days</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-emerald-500">Ovulation</p>
                    <p className="mt-1 text-lg font-extrabold text-emerald-700">{result.ovDate.format('MMM D')}</p>
                    <p className="text-[11px] text-emerald-400">Peak fertility</p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-amber-500">Fertile window</p>
                    <p className="mt-1 text-lg font-extrabold text-amber-700">{result.fertileStart.format('MMM D')}–{result.fertileEnd.format('DD')}</p>
                    <p className="text-[11px] text-amber-400">Best days to conceive</p>
                  </div>
                </div>

                {chartData && (
                  <div className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
                    <div className="mx-auto h-48 w-48">
                      <Doughnut
                        data={chartData}
                        options={{
                          cutout: '60%',
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label(ctx) {
                                  return ` ${ctx.label}: ${ctx.raw} days`
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      {result.phaseSummary.map((p, i) => (
                        <div key={p.label} className="flex items-center gap-3">
                          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: phaseColors[i] }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800">{p.label} <span className="text-slate-400">({p.days} days)</span></p>
                            <p className="text-[11px] text-slate-400">{p.desc}</p>
                          </div>
                          {p.label === result.currentPhase && <TrendingUp className="h-4 w-4 shrink-0 text-primary-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}