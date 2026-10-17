import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const PRESETS = [
  { fast: 16, eat: 8 },
  { fast: 18, eat: 6 },
  { fast: 20, eat: 4 },
]

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
function fmt(min: number) {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function IntermittentFastingPlanner() {
  const [preset, setPreset] = useState(0)
  const [wake, setWake] = useState('07:00')
  const [offset, setOffset] = useState(3)

  const calc = useMemo(() => {
    const wakeMin = toMin(wake)
    const eatHours = PRESETS[preset].eat
    const start = (wakeMin + offset * 60) % 1440
    const rawEnd = start + eatHours * 60
    const end = rawEnd % 1440
    const wraps = rawEnd > 1440
    return { eatHours, fastHours: PRESETS[preset].fast, start, end, wraps }
  }, [preset, wake, offset])

  const segs = useMemo(() => {
    const { start, end, wraps } = calc
    const eat: [number, number][] = wraps ? [[start, 1440], [0, end]] : [[start, end]]
    const fast: [number, number][] = []
    let cursor = 0
    eat.forEach(([s, e]) => {
      if (s > cursor) fast.push([cursor, s])
      cursor = e
    })
    if (cursor < 1440) fast.push([cursor, 1440])
    return [...fast.map((s) => ({ from: s[0], to: s[1], type: 'fast' })), ...eat.map((s) => ({ from: s[0], to: s[1], type: 'eat' }))].sort((a, b) => a.from - b.from)
  }, [calc])

  return (
    <>
      <Seo
        title="Intermittent Fasting Schedule Planner - vimz Tools"
        description="Generates daily fasting/eating schedule windows (16/8, 18/6, 20/4) based on sleep cycles."
      />
      <ToolShell
        title="Intermittent Fasting Schedule Planner"
        description="Generates daily fasting and eating schedule windows (16/8, 18/6, 20/4) around your wake time and first-meal offset."
        icon={<Clock className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Pick a fasting window and wake time to build your schedule."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PRESETS.map((p, i) => (
              <button
                key={p.fast}
                onClick={() => setPreset(i)}
                className={`rounded-xl border p-3 text-center transition ${preset === i ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
              >
                <p className="text-xl font-extrabold">{p.fast}/{p.eat}</p>
                <p className="text-xs">fast / eat hours</p>
              </button>
            ))}
            <Field label="Wake-up time">
              <TextInput type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
            </Field>
            <Field label="First meal offset">
              <Select value={offset} onChange={(e) => setOffset(Number(e.target.value))}>
                {[1, 2, 3, 4].map((o) => (
                  <option key={o} value={o}>{o} h after waking</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-6 text-sm font-bold text-slate-800">24-hour timeline</h3>
          <div className="relative h-14">
            {segs.map((s, i) => (
              <div
                key={i}
                className={`absolute top-0 flex h-14 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold ${s.type === 'eat' ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-800 text-slate-200'}`}
                style={{ left: `${(s.from / 1440) * 100}%`, width: `${((s.to - s.from) / 1440) * 100}%` }}
              >
                {s.type === 'eat' ? `Eat ${fmt(s.from)}-${fmt(s.to)}` : 'Fast'}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Daily schedule</h3>
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-white">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Fasting window</p>
              <p className="mt-1 text-lg font-extrabold">
                {fmt(calc.end)} → {fmt(calc.start)}{calc.wraps ? ' (same next day)' : ''}
              </p>
              <p className="text-xs text-slate-400">{calc.fastHours} hours of fasting</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] font-semibold uppercase text-emerald-500">Eating window</p>
              <p className="mt-1 text-lg font-extrabold text-emerald-800">
                {fmt(calc.start)} → {fmt(calc.end)}{calc.wraps ? ' (next day)' : ''}
              </p>
              <p className="text-xs text-emerald-600">{calc.eatHours} hours for meals and snacks</p>
            </div>
          </div>
        </section>
      </ToolShell>
    </>
  )
}