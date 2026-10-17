import { useMemo, useState } from 'react'
import { Sun } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtHours } from '../../../lib/numbers'

const FABRICS = [
  { label: 'Polyester', hours: 1 },
  { label: 'Linen', hours: 2.5 },
  { label: 'Cotton T-shirt', hours: 3 },
  { label: 'Towel', hours: 7 },
  { label: 'Denim', hours: 6 },
  { label: 'Silk', hours: 2 },
  { label: 'Wool', hours: 5 },
  { label: 'Cotton blend', hours: 3.5 },
]

const WEIGHTS = [
  { label: 'Light', factor: 0.8 },
  { label: 'Medium', factor: 1 },
  { label: 'Heavy', factor: 1.5 },
]

const WEATHERS = [
  { label: 'Hot & sunny', factor: 0.5 },
  { label: 'Warm & dry', factor: 0.75 },
  { label: 'Cloudy', factor: 1.2 },
  { label: 'Humid', factor: 1.7 },
  { label: 'Rainy', factor: 2.1 },
  { label: 'Indoor heated', factor: 1.1 },
]

const AIRFLOW = [
  { label: 'Breeze', factor: 0.7 },
  { label: 'Indoor fan', factor: 0.9 },
  { label: 'Closed room', factor: 1.4 },
]

const SPINS = [
  { label: 'No spin', factor: 1.5 },
  { label: 'Low', factor: 1.1 },
  { label: 'High', factor: 0.9 },
]

const TIPS = [
  'Hang heavy items on the edges and light towels in the middle for even airflow.',
  'Stretch and shake each piece before hanging to shorten drying time.',
  'Darker colours dry slower because they absorb less heat from the sun.',
  'A dry spin cycle first can cut drying time by nearly half.',
  'Space items out so air can move between every piece of fabric.',
]

export default function LaundryDryingTime() {
  const [fabric, setFabric] = useState(2)
  const [weight, setWeight] = useState(1)
  const [weather, setWeather] = useState(0)
  const [airflow, setAirflow] = useState(0)
  const [spin, setSpin] = useState(2)
  const [start, setStart] = useState('')

  const calc = useMemo(() => {
    const hours =
      FABRICS[fabric].hours *
      WEIGHTS[weight].factor *
      WEATHERS[weather].factor *
      AIRFLOW[airflow].factor *
      SPINS[spin].factor
    const min = Math.round(hours * 0.8 * 60)
    const max = Math.round(hours * 1.2 * 60)
    let ready = ''
    if (start) {
      const parts = start.split(':')
      const startMin = Number(parts[0]) * 60 + Number(parts[1])
      if (Number.isFinite(startMin)) {
        const rm = (startMin + Math.round(hours * 60)) % 1440
        ready = `${String(Math.floor(rm / 60)).padStart(2, '0')}:${String(rm % 60).padStart(2, '0')}`
      }
    }
    return { hours, min, max, ready }
  }, [fabric, weight, weather, airflow, spin, start])

  return (
    <>
      <Seo
        title="Laundry Drying Time Estimator - vimz Tools"
        description="Estimate how long your laundry takes to dry based on fabric, weather, airflow and spin cycle."
      />
      <ToolShell
        title="Laundry Drying Time"
        description="Estimate how long your laundry takes to dry."
        icon={<Sun className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Choose the fabric and conditions to see a drying time range."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Drying conditions</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fabric">
                  <Select value={fabric} onChange={(e) => setFabric(Number(e.target.value))}>
                    {FABRICS.map((f, i) => (
                      <option key={f.label} value={i}>
                        {f.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Weight">
                  <Select value={weight} onChange={(e) => setWeight(Number(e.target.value))}>
                    {WEIGHTS.map((w, i) => (
                      <option key={w.label} value={i}>
                        {w.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Weather">
                <Select value={weather} onChange={(e) => setWeather(Number(e.target.value))}>
                  {WEATHERS.map((w, i) => (
                    <option key={w.label} value={i}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Airflow">
                  <Select value={airflow} onChange={(e) => setAirflow(Number(e.target.value))}>
                    {AIRFLOW.map((a, i) => (
                      <option key={a.label} value={i}>
                        {a.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Spin cycle">
                  <Select value={spin} onChange={(e) => setSpin(Number(e.target.value))}>
                    {SPINS.map((s, i) => (
                      <option key={s.label} value={i}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Start time (optional)">
                <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-500">Drying time estimate</p>
              <p className="mt-2 text-5xl font-extrabold text-amber-700">
                {calc ? fmtHours(calc.hours * 60) : '—'}
              </p>
              <p className="mt-1 text-sm text-amber-500">typical, ranging ±20% with conditions</p>
              <div className="relative mt-6 h-8">
                <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-amber-200" />
                {calc && (
                  <>
                    <div
                      className="absolute top-1/2 h-6 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600"
                      style={{ left: `${(calc.min / calc.max) * 100}%` }}
                    />
                    <div className="absolute right-0 top-1/2 h-6 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-amber-700" />
                    <span className="absolute left-0 -top-1 text-xs font-semibold text-amber-600" style={{ left: `${Math.max(0, (calc.min / calc.max) * 100 - 8)}%` }}>
                      {fmtHours(calc.min)}
                    </span>
                    <span className="absolute -top-1 right-0 text-xs font-semibold text-amber-600">
                      {fmtHours(calc.max)}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-amber-700">
                {calc ? `Range ${fmtHours(calc.min)} to ${fmtHours(calc.max)}` : 'Pick your conditions to see the range.'}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Ready time</h3>
              {calc && start ? (
                <p className="text-2xl font-extrabold text-slate-800">
                  Ready approximately {calc.ready}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Set a start time to see when the load should be dry.</p>
              )}
              <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">Drying tips</h3>
              <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
                {TIPS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}