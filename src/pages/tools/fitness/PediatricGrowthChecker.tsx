import { useMemo, useState } from 'react'
import { Stethoscope } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const BOYS: [number, number][] = [[2, 16.4], [3, 16.0], [4, 15.8], [5, 15.6], [6, 15.6], [7, 15.8], [8, 16.2], [9, 16.8], [10, 17.4], [11, 18.1], [12, 18.9], [13, 19.7], [14, 20.5], [15, 21.2], [16, 21.8], [17, 22.3], [18, 22.7], [19, 23.0]]
const GIRLS: [number, number][] = [[2, 16.3], [3, 16.0], [4, 15.8], [5, 15.6], [6, 15.8], [7, 15.9], [8, 16.2], [9, 16.8], [10, 17.5], [11, 18.3], [12, 19.2], [13, 20.1], [14, 20.9], [15, 21.6], [16, 22.2], [17, 22.7], [18, 23.0], [19, 23.3]]

function p50(list: [number, number][], age: number) {
  if (age <= list[0][0]) return list[0][1]
  if (age >= list[list.length - 1][0]) return list[list.length - 1][1]
  for (let i = 0; i < list.length - 1; i++) {
    if (age >= list[i][0] && age <= list[i + 1][0]) {
      const t = (age - list[i][0]) / (list[i + 1][0] - list[i][0])
      return list[i][1] + t * (list[i + 1][1] - list[i][1])
    }
  }
  return list[list.length - 1][1]
}
function erf(x: number) {
  const a = Math.abs(x)
  const v = 1 - Math.exp((-a * a) * ((4 / Math.PI + 0.147 * a * a) / (1 + 0.147 * a * a)))
  return Math.sign(x) * Math.sqrt(v)
}
function phi(z: number) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

const BANDS = [
  { name: 'Underweight', min: 0, max: 5, seg: 5, fill: 'bg-rose-400', text: 'text-rose-600' },
  { name: 'Healthy weight', min: 5, max: 85, seg: 80, fill: 'bg-emerald-500', text: 'text-emerald-600' },
  { name: 'Overweight', min: 85, max: 95, seg: 10, fill: 'bg-amber-500', text: 'text-amber-600' },
  { name: 'Obese', min: 95, max: 100, seg: 5, fill: 'bg-rose-600', text: 'text-rose-700' },
]

export default function PediatricGrowthChecker() {
  const [age, setAge] = useState(10)
  const [sex, setSex] = useState('boy')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const calc = useMemo(() => {
    const h = toNumber(height) / 100
    const m = toNumber(weight)
    if (!Number.isFinite(h) || !Number.isFinite(m) || h <= 0 || m <= 0) return null
    const bmi = m / (h * h)
    const median = p50(sex === 'boy' ? BOYS : GIRLS, age)
    const z = (bmi - median) / 2.2
    const pct = clamp(round(100 * phi(z), 0), 1, 99)
    return { bmi, median, pct }
  }, [age, sex, height, weight])

  const band = calc ? BANDS.find((b) => calc.pct >= b.min && calc.pct < b.max) ?? BANDS[0] : null
  const C = 2 * Math.PI * 54

  return (
    <>
      <Seo
        title="Pediatric Growth & Weight Percentile Checker - vimz Tools"
        description="Evaluates child BMI and weight percentiles against WHO growth benchmark charts."
      />
      <ToolShell
        title="Pediatric Growth & Weight Percentile Checker"
        description="Evaluates a child's BMI and weight percentile against WHO growth benchmark charts with an age-based estimate."
        icon={<Stethoscope className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter age, height, weight and sex for a WHO percentile estimate."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Child details</h3>
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Age</label>
                  <span className="text-sm font-bold text-slate-800">{age.toFixed(1)} yrs</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={19}
                  step={0.5}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>
              <Field label="Sex">
                <div className="grid grid-cols-2 gap-2">
                  {['boy', 'girl'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSex(s)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition ${sex === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 138" />
              </Field>
              <Field label="Weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 31" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
                <div className="relative h-40 w-40">
                  {calc && (
                    <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke={band ? (calc.pct < 5 ? '#fb7185' : calc.pct < 85 ? '#10b981' : calc.pct < 95 ? '#f59e0b' : '#e11d48') : '#e2e8f0'}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${(calc.pct / 100) * C} ${C - (calc.pct / 100) * C}`}
                      />
                    </svg>
                  )}
                  {calc && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-center">
                        <span className="block text-3xl font-extrabold text-slate-900">{calc.pct}th</span>
                        <span className="block text-[10px] font-semibold uppercase text-slate-400">percentile</span>
                      </p>
                    </div>
                  )}
                  {!calc && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-300">—</div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Classification</p>
                  <p className={`mt-1 text-2xl font-extrabold ${band ? band.text : 'text-slate-300'}`}>
                    {band ? band.name : 'Add measurements'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {calc ? `BMI ${round(calc.bmi, 1)} vs age median ${round(calc.median, 1)}` : 'WHO BMI-for-age estimate'}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">WHO BMI-for-age percentile band</h3>
              <div className="relative">
                <div className="flex h-3 overflow-hidden rounded-full">
                  {BANDS.map((b) => (
                    <div key={b.name} className={b.fill} style={{ width: `${b.seg}%` }} />
                  ))}
                </div>
                {calc && (
                  <div className="absolute -top-8 z-10" style={{ left: `${calc.pct}%` }}>
                    <div className="-translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">{calc.pct}th</div>
                    <div className="mx-auto h-2 w-0.5 bg-slate-900" />
                  </div>
                )}
              </div>
              <div className="mt-2 flex">
                {BANDS.map((b) => (
                  <p key={b.name} className="text-[10px] font-semibold text-slate-500" style={{ width: `${b.seg}%` }}>
                    {b.name} {b.min}-{b.max}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
              Approximation for guidance only - confirm with a pediatrician. Growth is best judged over repeated
              measurements, not a single snapshot.
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}