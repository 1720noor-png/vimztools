import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const ZONES = [
  { name: 'Warmup & light fat burn', lo: 50, hi: 60, grad: 'from-sky-400 to-sky-500' },
  { name: 'Fat burn', lo: 60, hi: 70, grad: 'from-emerald-400 to-emerald-500' },
  { name: 'Cardio / aerobic', lo: 70, hi: 80, grad: 'from-amber-400 to-amber-500' },
  { name: 'Anaerobic', lo: 80, hi: 90, grad: 'from-rose-400 to-rose-500' },
  { name: 'Max effort', lo: 90, hi: 100, grad: 'from-violet-400 to-violet-500' },
]

export default function TargetHeartRateZone() {
  const [age, setAge] = useState('')
  const [resting, setResting] = useState('')

  const calc = useMemo(() => {
    const a = toNumber(age)
    const r = toNumber(resting)
    if (!Number.isFinite(a) || !Number.isFinite(r) || a <= 0 || r <= 0) return null
    const max = 220 - a
    const zones = ZONES.map((z) => ({
      ...z,
      low: (max - r) * (z.lo / 100) + r,
      high: (max - r) * (z.hi / 100) + r,
    }))
    return { max, zones }
  }, [age, resting])

  return (
    <>
      <Seo
        title="Target Heart Rate Zone Calculator - vimz Tools"
        description="Determines fat-burning and cardio training heart rate zones based on age and resting HR."
      />
      <ToolShell
        title="Target Heart Rate Zone Calculator"
        description="Determines fat-burning and cardio training heart rate zones using the Karvonen formula based on age and resting HR."
        icon={<Activity className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter your age and resting heart rate to see your training zones."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Age">
              <TextInput type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 30" />
            </Field>
            <Field label="Resting heart rate (bpm)">
              <TextInput type="number" min={0} value={resting} onChange={(e) => setResting(e.target.value)} placeholder="e.g. 60" />
            </Field>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Estimated max HR</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-800">{calc ? `${round(calc.max)} bpm` : '—'}</p>
              <p className="text-[10px] text-slate-400">220 - age</p>
            </div>
          </div>
        </section>

        <div className="mt-5 space-y-3">
          {calc ? (
            calc.zones.map((z, i) => (
              <div
                key={z.name}
                className={`relative flex h-14 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r px-4 text-white ${z.grad} ${i === 1 ? 'ring-2 ring-emerald-600 ring-offset-2' : ''}`}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="h-2 w-2 rounded-full bg-white/80 shadow" />
                  {z.name}
                  {i === 1 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-600">TARGET</span>
                  )}
                </div>
                <span className="text-sm font-extrabold tabular-nums">
                  {round(z.low)}-{round(z.high)} bpm
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
              Enter your age and resting heart rate to reveal your five training zones.
            </p>
          )}
        </div>

        {calc && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Fat-burn highlight</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-800">
              The 60-70% zone burns the highest share of calories from fat while staying sustainable for steady-state cardio.
            </p>
          </div>
        )}
      </ToolShell>
    </>
  )
}