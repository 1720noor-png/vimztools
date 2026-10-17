import { useEffect, useMemo, useState } from 'react'
import { AlarmClock, Gauge, ShieldCheck, SunMedium, Timer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import { clamp, fmtHours } from '../../../lib/numbers'

function parseHM(t: string): number {
  if (!t) return NaN
  const [h, m] = t.split(':').map((x) => Number(x))
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN
}

function fmtHM(minOfDay: number): string {
  const mm = ((minOfDay % 1440) + 1440) % 1440
  return `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`
}

const SPF_OPTIONS = ['15', '30', '50']
const SKIN_TYPES = ['fair', 'medium', 'dark']
const ACTIVITIES = ['none', 'light', 'heavy']

const UV_TIERS = [
  { key: 'low', label: 'Low UV', range: 'UV 0 - 2', desc: 'Generous reapply window, fewer touch-ups.' },
  { key: 'moderate', label: 'Moderate UV', range: 'UV 3 - 7', desc: 'Midday rays wear down protection faster.' },
  { key: 'high', label: 'High UV', range: 'UV 8 - 11', desc: 'Reapply much sooner, shade helps a lot.' },
]

export default function SunscreenReapplicationTimer() {
  const [startTime, setStartTime] = useState('08:00')
  const [uv, setUv] = useState(6)
  const [spf, setSpf] = useState('30')
  const [skinType, setSkinType] = useState('medium')
  const [activity, setActivity] = useState('none')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const reapplyMins = useMemo(() => {
    const base = uv < 3 ? 240 : uv <= 5 ? 180 : uv <= 7 ? 120 : uv <= 10 ? 90 : 60
    let mins = base
    if (activity === 'heavy') mins *= 0.75
    if (skinType === 'fair') mins *= 0.9
    if (Number(spf) >= 50) mins *= 1.2
    return clamp(Math.round(mins), 15, 240)
  }, [uv, activity, skinType, spf])

  const calc = useMemo(() => {
    const startMin = parseHM(startTime)
    if (Number.isNaN(startMin)) return null
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const eff = Math.max(0, nowMin - startMin)
    const into = eff % reapplyMins
    const cycles = Math.floor(eff / reapplyMins)
    return {
      startMin,
      progress: clamp((into / reapplyMins) * 100, 0, 100),
      minsLeft: reapplyMins - into,
      nextAt: startMin + (cycles + 1) * reapplyMins,
    }
  }, [startTime, now, reapplyMins])

  const tier = uv < 3 ? 'low' : uv <= 7 ? 'moderate' : 'high'
  const bar =
    calc && calc.progress >= 85 ? 'bg-rose-500' : calc && calc.progress >= 55 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <>
      <Seo
        title="Sunscreen Reapplication Timer - vimz Tools"
        description="Compute when to reapply sunscreen based on SPF, UV index, skin type and activity."
      />
      <ToolShell
        title="Sunscreen Reapplication Timer"
        description="Compute the ideal reapplication time for your sunscreen based on SPF, UV index, skin type and activity."
        icon={<SunMedium className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Set your SPF, UV level and skin to find your reapply time"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-amber-500" /> Your exposure setup
            </h3>
            <div className="space-y-4">
              <Field label="Applied sunscreen at">
                <TextInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </Field>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">UV index</label>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-700">
                    {uv}.0 - {UV_TIERS.find((t) => t.key === tier)?.label}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={11}
                  step={1}
                  value={uv}
                  onChange={(e) => setUv(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>0</span>
                  <span>3</span>
                  <span>7</span>
                  <span>11</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="SPF">
                  <Select value={spf} onChange={(e) => setSpf(e.target.value)}>
                    {SPF_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        SPF {s}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Skin type">
                  <Select value={skinType} onChange={(e) => setSkinType(e.target.value)}>
                    {SKIN_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Activity">
                  <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
                    {ACTIVITIES.map((a) => (
                      <option key={a} value={a}>
                        {a[0].toUpperCase() + a.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                Heavy sweating cuts your window by 25%, fair skin by 10%, and SPF 50+ extends it by 20% (hard cap of 4
                hours).
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
            {!calc ? (
              <div className="flex h-full min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">Pick a start time to compute your reapplication schedule.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                    <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                      <AlarmClock className="h-4 w-4" /> Reapply at
                    </p>
                    <p className="text-5xl font-black tabular-nums text-amber-700">{fmtHM(calc.nextAt)}</p>
                    <p className="mt-2 text-xs font-semibold text-amber-600">next application time</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      <Timer className="h-4 w-4" /> Protection window
                    </p>
                    <p className="text-3xl font-extrabold text-slate-800">{fmtHours(reapplyMins)}</p>
                    <p className="mt-2 rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-bold text-slate-600">
                      about {fmtHours(calc.minsLeft)} left
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <Gauge className="h-4 w-4" /> Exposure cycle
                  </p>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-3 rounded-full ${bar}`} style={{ width: `${calc.progress}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>applied {fmtHM(calc.startMin)}</span>
                    {calc.minsLeft <= 5 ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-extrabold text-rose-700">
                        Due - reapply now
                      </span>
                    ) : (
                      <span>{Math.round(calc.progress)}% of this cycle used</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Protection tiers</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {UV_TIERS.map((t) => {
              const active = t.key === tier
              return (
                <div
                  key={t.key}
                  className={`rounded-xl border p-4 ${active ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold ${active ? 'text-amber-700' : 'text-slate-700'}`}>{t.label}</p>
                    {active && <ShieldCheck className="h-4 w-4 text-amber-600" />}
                  </div>
                  <p className="text-xs font-bold text-slate-400">{t.range}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.desc}</p>
                </div>
              )
            })}
          </div>
        </section>
      </ToolShell>
    </>
  )
}