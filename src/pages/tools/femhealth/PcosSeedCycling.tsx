import { useMemo, useState } from 'react'
import { CalendarDays, Info, Moon, Sprout, Sun } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextInput } from '../../../components/ui/Fields'

const CYCLE_LENGTHS = Array.from({ length: 12 }, (_, i) => 24 + i)

const DAY_MS = 86400000

function todayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function dayIndex(lastPeriod: string, cycle: number): number {
  const start = new Date(`${lastPeriod}T00:00:00`).getTime()
  if (Number.isNaN(start)) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.floor((now.getTime() - start) / DAY_MS)
  if (diff < 0) return 0
  return (diff % cycle) + 1
}

export default function PcosSeedCycling() {
  const [lastPeriod, setLastPeriod] = useState(todayIso())
  const [cycle, setCycle] = useState(28)

  const today = useMemo(() => dayIndex(lastPeriod, cycle), [lastPeriod, cycle])

  const phaseOf = (day: number): 'follicular' | 'luteal' => (day <= 14 ? 'follicular' : 'luteal')

  const days = useMemo(
    () =>
      Array.from({ length: cycle }, (_, i) => {
        const day = i + 1
        return { day, phase: phaseOf(day) }
      }),
    [cycle],
  )

  const todayPhase = today >= 1 ? phaseOf(today) : null

  return (
    <>
      <Seo
        title="PCOS Seed Cycling Planner - vimz Tools"
        description="Plan a 28-day seed cycling routine with flax, pumpkin, sesame and sunflower seeds across cycle phases."
      />
      <ToolShell
        title="PCOS Seed Cycling Planner"
        description="Build a day-by-day seed cycling plan that pairs lignan-rich and zinc-rich seeds with each half of your cycle."
        icon={<Sprout className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Set your last period date to generate a full-cycle seed routine"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CalendarDays className="h-4 w-4 text-fuchsia-600" /> Cycle settings
              </h3>
              <div className="space-y-4">
                <Field label="Last period start date">
                  <TextInput type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} />
                </Field>
                <Field label="Typical cycle length (days)">
                  <Select value={cycle} onChange={(e) => setCycle(Number(e.target.value))}>
                    {CYCLE_LENGTHS.map((c) => (
                      <option key={c} value={c}>
                        {c} days
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div
                className={`mt-4 rounded-xl border p-4 ${
                  todayPhase === 'follicular'
                    ? 'border-sky-200 bg-sky-50'
                    : todayPhase === 'luteal'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                {today >= 1 ? (
                  <>
                    <p className="text-sm font-extrabold text-slate-800">
                      Today is cycle day {today} - {todayPhase === 'follicular' ? 'follicular phase' : 'luteal phase'}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {todayPhase === 'follicular'
                        ? 'Use flax and pumpkin seeds for days 1-14.'
                        : 'Use sesame and sunflower seeds for days 15-' + cycle + '.'}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-slate-600">
                    Your period start is in the future - the plan below is a preview.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Info className="h-4 w-4" /> If this is news
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                Seed cycling is food-based and low-risk, but evidence is limited. Morning, about one tablespoon of each
                seed, is the flexible recommendation below.
              </p>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Your full-cycle plan</h3>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {days.map((d) => {
                  const isFollicular = d.phase === 'follicular'
                  const isToday = d.day === today
                  return (
                    <div
                      key={d.day}
                      title={`Day ${d.day}: ${isFollicular ? 'flax + pumpkin' : 'sesame + sunflower'}`}
                      className={`flex h-14 flex-col items-center justify-center rounded-lg border text-xs font-bold ${
                        isFollicular ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                      } ${isToday ? 'ring-2 ring-fuchsia-500' : ''}`}
                    >
                      <span className="text-[10px] font-semibold opacity-70">D{d.day}</span>
                      <span className="mt-0.5">{isFollicular ? 'Flax' : 'Sesame'}</span>
                      <span className="text-[10px] opacity-70">{isFollicular ? 'Pumpkin' : 'Sunflower'}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-sky-900">
                  <Sun className="h-4 w-4 text-sky-600" /> Follicular (days 1-14)
                </p>
                <p className="mt-2 text-xs leading-relaxed text-sky-900/80">
                  1 tbsp ground flax + 1 tbsp ground pumpkin seeds daily, in the morning. Flax is rich in lignans and
                  omega-3, pumpkin adds zinc.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                  <Moon className="h-4 w-4 text-amber-600" /> Luteal (days 15-{cycle})
                </p>
                <p className="mt-2 text-xs leading-relaxed text-amber-900/80">
                  1 tbsp ground sesame + 1 tbsp sunflower seeds daily. Sesame adds lignans, sunflower brings magnesium
                  and vitamin E.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Setup notes</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>Grind seeds fresh and keep them refrigerated to avoid rancidity.</li>
                <li>Add to porridge, smoothies, yogurt or salads rather than snacking on the bag.</li>
                <li>Start on your period - cycle day 1 is the first day of full flow.</li>
                <li>Adjust the seed amounts to your calorie budget - the seeds are not very energy-dense at a tablespoon.</li>
              </ul>
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                Informational only. Seed cycling is not a substitute for PCOS treatment - keep your clinician in the loop.
              </p>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}