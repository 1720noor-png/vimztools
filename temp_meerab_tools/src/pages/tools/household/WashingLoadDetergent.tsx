import { useMemo, useState } from 'react'
import { Droplets } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const FILLS = [
  { label: 'Light load (40%)', factor: 0.4 },
  { label: 'Half load (60%)', factor: 0.6 },
  { label: 'Full load (90%)', factor: 0.9 },
  { label: 'Bulky load (105%)', factor: 1.05 },
]

const SOILS = [
  { label: 'Light', ml: 8 },
  { label: 'Normal', ml: 12 },
  { label: 'Heavy', ml: 18 },
]

const HARDNESS = ['Soft', 'Medium', 'Hard']

export default function WashingLoadDetergent() {
  const [capacity, setCapacity] = useState('7')
  const [fill, setFill] = useState(2)
  const [actualWeight, setActualWeight] = useState('')
  const [soil, setSoil] = useState(1)
  const [machine, setMachine] = useState('front')
  const [hardness, setHardness] = useState(1)
  const [fabric, setFabric] = useState('normal')

  const calc = useMemo(() => {
    const cap = toNumber(capacity)
    const aw = toNumber(actualWeight)
    if (!Number.isFinite(cap) || cap <= 0) return null
    const loadKg = Number.isFinite(aw) && aw > 0 ? aw : cap * FILLS[fill].factor
    let base = loadKg * SOILS[soil].ml
    if (machine === 'top') base *= 2
    if (HARDNESS[hardness] === 'Hard') base *= 1.25
    if (fabric === 'delicates') base *= 0.6
    const dose = clamp(round(base), 15, 250)
    const teaspoons = round(dose / 5)
    const scoops = round(dose / 30)
    const fillPct = clamp((loadKg / cap) * 100, 0, 100)
    return { loadKg, dose, teaspoons, scoops, fillPct, loadsPerLitre: 1000 / dose }
  }, [capacity, actualWeight, fill, soil, machine, hardness, fabric])

  return (
    <>
      <Seo
        title="Washing Load Detergent Calculator - vimz Tools"
        description="Work out the right detergent dose for your washing machine load based on soil level, machine type and water hardness."
      />
      <ToolShell
        title="Washing Load Detergent"
        description="Find the right detergent dose for your washing machine load."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Enter your drum size and load details to get the detergent dose."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Wash details</h3>
            <div className="space-y-3">
              <Field label="Drum capacity (kg)">
                <TextInput type="number" min={0} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 7" />
              </Field>
              <Field label="Load fill">
                <Select value={fill} onChange={(e) => setFill(Number(e.target.value))}>
                  {FILLS.map((f, i) => (
                    <option key={f.label} value={i}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Actual load weight (kg, optional)">
                <TextInput type="number" min={0} value={actualWeight} onChange={(e) => setActualWeight(e.target.value)} placeholder="leave blank to estimate" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Soil level">
                  <Select value={soil} onChange={(e) => setSoil(Number(e.target.value))}>
                    {SOILS.map((s, i) => (
                      <option key={s.label} value={i}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Machine type">
                  <Select value={machine} onChange={(e) => setMachine(e.target.value)}>
                    <option value="front">High-efficiency front load</option>
                    <option value="top">Regular top load</option>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Water hardness">
                  <Select value={hardness} onChange={(e) => setHardness(Number(e.target.value))}>
                    {HARDNESS.map((h, i) => (
                      <option key={h} value={i}>
                        {h}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fabric">
                  <Select value={fabric} onChange={(e) => setFabric(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="delicates">Delicates</option>
                  </Select>
                </Field>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Drum fill for this load</span>
                <span>{calc ? `${round(calc.loadKg, 1)} kg` : '—'}</span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${calc && calc.fillPct > 80 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-sky-400 to-sky-600'}`}
                  style={{ width: `${calc ? calc.fillPct : 0}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Keep loads below 80% of drum capacity for the cleanest wash.
              </p>
              <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                {calc ? (
                  <>
                    Estimated load is {round(calc.loadKg, 1)} kg from a {FILLS[fill].factor * 100}% fill
                    {Number.isFinite(toNumber(actualWeight)) && toNumber(actualWeight) > 0 ? ' using the actual weight' : ''}.
                  </>
                ) : (
                  'Enter a drum capacity to see the fill meter.'
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <Droplets className="h-5 w-5 text-sky-600" />
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-600">
                  {machine === 'front' ? 'High-efficiency front load' : 'Regular top load'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-600">{SOILS[soil].label} soil</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-600">{HARDNESS[hardness]} water</span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-sky-500">Detergent dose</p>
              <p className="mt-1 text-6xl font-extrabold text-sky-700">{calc ? calc.dose : '—'}</p>
              <p className="mt-1 text-sm text-sky-500">ml per wash</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{calc ? calc.teaspoons : '—'} tsp</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{calc ? calc.scoops : '—'} powder scoops</span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Bottle coverage</h3>
              <p className="text-2xl font-extrabold text-slate-800">
                {calc ? `${calc.loadsPerLitre.toFixed(1)}` : '—'}{' '}
                <span className="text-base font-semibold text-slate-400">loads per 1L bottle</span>
              </p>
              <div className="mt-3 flex items-end gap-1">
                {calc &&
                  Array.from({ length: Math.min(10, Math.ceil(calc.loadsPerLitre)) }).map((_, i) => (
                    <div key={i} className="w-4 rounded-t-sm bg-sky-400" style={{ height: `${16 + i * 4}px` }} />
                  ))}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}