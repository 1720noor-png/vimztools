import { useMemo, useState } from 'react'
import { Scale } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { avg, round, toNumber } from '../../../lib/numbers'

const FORMULAS = [
  { name: 'Devine', hint: '50 + 2.3 kg per inch over 5ft', men: (h: number) => 50 + 2.3 * (h - 60), women: (h: number) => 45.5 + 2.3 * (h - 60) },
  { name: 'Robinson', hint: '52 + 1.9 kg per inch over 5ft', men: (h: number) => 52 + 1.9 * (h - 60), women: (h: number) => 49 + 1.7 * (h - 60) },
  { name: 'Miller', hint: '56.2 + 1.41 kg per inch over 5ft', men: (h: number) => 56.2 + 1.41 * (h - 60), women: (h: number) => 53.1 + 1.36 * (h - 60) },
  { name: 'Hamwi', hint: '48 + 2.7 kg per inch over 5ft', men: (h: number) => 48 + 2.7 * (h - 60), women: (h: number) => 45.5 + 2.2 * (h - 60) },
]

export default function IdealBodyWeight() {
  const [sex, setSex] = useState('male')
  const [height, setHeight] = useState('')

  const calc = useMemo(() => {
    const cm = toNumber(height)
    if (!Number.isFinite(cm) || cm <= 0) return null
    const inches = cm / 2.54
    const values = FORMULAS.map((f) => ({
      name: f.name,
      hint: f.hint,
      value: sex === 'male' ? f.men(inches) : f.women(inches),
    }))
    return { average: avg(values.map((v) => v.value)), values }
  }, [sex, height])

  return (
    <>
      <Seo
        title="Ideal Body Weight (IBW) Multi-Formula Calculator - vimz Tools"
        description="Compares ideal weight results using Devine, Robinson, Miller, and Hamwi formulas."
      />
      <ToolShell
        title="Ideal Body Weight (IBW) Multi-Formula Calculator"
        description="Compares ideal weight results using the Devine, Robinson, Miller, and Hamwi formulas for your height."
        icon={<Scale className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Pick your sex and height to see four IBW formulas at once."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your details</h3>
            <div className="space-y-3">
              <Field label="Sex">
                <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 175" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {calc ? (
                calc.values.map((v) => (
                  <div key={v.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{v.name}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{round(v.value, 1)} kg</p>
                    <p className="mt-1 text-[11px] text-slate-400">{v.hint}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-400">
                  Enter your height to compare all four formulas.
                </p>
              )}
            </div>

            {calc && (
              <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-primary-600">Average of formulas</p>
                <p className="mt-1 text-2xl font-extrabold text-primary-800">{round(calc.average, 1)} kg</p>
                <p className="text-[11px] text-primary-500">Use the average as a practical middle-ground target.</p>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}