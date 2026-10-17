import { useMemo, useState } from 'react'
import { Thermometer, Flame } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

type Unit = 'c' | 'f' | 'gas'

const COMMONS = [
  { label: 'Slow', c: 130, f: 266, gas: 1 },
  { label: 'Low', c: 150, f: 300, gas: 2 },
  { label: 'Moderate', c: 180, f: 350, gas: 4 },
  { label: 'Moderately hot', c: 200, f: 400, gas: 6 },
  { label: 'Hot', c: 220, f: 425, gas: 7 },
  { label: 'Very hot', c: 240, f: 475, gas: 9 },
]

function gasFor(c: number): number {
  if (!Number.isFinite(c)) return NaN
  let nearest = COMMONS[0]
  for (const t of COMMONS) {
    if (Math.abs(t.c - c) < Math.abs(nearest.c - c)) nearest = t
  }
  return nearest.gas
}

export default function OvenTemperatureConverter() {
  const [temp, setTemp] = useState('180')
  const [unit, setUnit] = useState<Unit>('c')

  const result = useMemo(() => {
    const v = toNumber(temp)
    if (!Number.isFinite(v)) return null
    let c: number
    if (unit === 'c') c = v
    else if (unit === 'f') c = ((v - 32) * 5) / 9
    else c = COMMONS.find((t) => t.gas === v)?.c ?? (v * 22 + 118)
    const f = (c * 9) / 5 + 32
    return { c: round(c, 0), f: round(f, 0), gas: gasFor(c) }
  }, [temp, unit])

  const label = useMemo(() => {
    if (!result) return ''
    const c = result.c
    if (c <= 135) return 'Slow'
    if (c <= 155) return 'Low'
    if (c <= 190) return 'Moderate'
    if (c <= 210) return 'Hot'
    return 'Very hot'
  }, [result])

  return (
    <>
      <Seo
        title="Oven Temperature Converter - vimz Tools"
        description="Switch oven temperatures between Celsius, Fahrenheit and gas. Free oven heat converter."
      />
      <ToolShell
        title="Oven Temperature Converter"
        description="Switch oven temperatures between Celsius, Fahrenheit and gas."
        icon={<Thermometer className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Convert oven heat between °C, °F and gas mark."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Enter temperature</h3>
            <Field label="Value">
              <TextInput inputMode="decimal" value={temp} onChange={(e) => setTemp(e.target.value)} />
            </Field>
            <div className="mt-3">
              <Field label="Unit">
                <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                  <option value="gas">Gas mark</option>
                </Select>
              </Field>
            </div>
            {result && (
              <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
                <Flame className="h-4 w-4" /> That's a <span className="uppercase">{label}</span> oven
              </p>
            )}
          </section>

          <section className="lg:col-span-2">
            {result ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
                  <p className="text-xs font-semibold uppercase text-rose-500">Celsius</p>
                  <p className="mt-1 text-4xl font-extrabold text-rose-700">{result.c}°C</p>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 text-center">
                  <p className="text-xs font-semibold uppercase text-sky-500">Fahrenheit</p>
                  <p className="mt-1 text-4xl font-extrabold text-sky-700">{result.f}°F</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                  <p className="text-xs font-semibold uppercase text-slate-400">Gas mark</p>
                  <p className="mt-1 text-4xl font-extrabold text-slate-800">{result.gas % 1 === 0 ? result.gas : result.gas.toFixed(1)}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-400">
                Enter a valid temperature above.
              </div>
            )}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Common oven temperatures</h3>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-slate-100 sm:grid-cols-3">
                {COMMONS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => {
                      setTemp(String(t.c))
                      setUnit('c')
                    }}
                    className="bg-white p-3 text-left text-sm transition hover:bg-primary-50"
                  >
                    <p className="font-bold capitalize text-slate-800">{t.label}</p>
                    <p className="text-xs text-slate-500">
                      {t.c}°C · {t.f}°F · gas {t.gas % 1 === 0 ? t.gas : t.gas.toFixed(1)}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          </section>
        </div>
      </ToolShell>
    </>
  )
}