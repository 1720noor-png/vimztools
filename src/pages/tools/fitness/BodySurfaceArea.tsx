import { useMemo, useState } from 'react'
import { Maximize2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { avg, round, toNumber } from '../../../lib/numbers'

export default function BodySurfaceArea() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const calc = useMemo(() => {
    const h = toNumber(height)
    const m = toNumber(weight)
    if (!Number.isFinite(h) || !Number.isFinite(m) || h <= 0 || m <= 0) return null
    const mosteller = Math.sqrt((h * m) / 3600)
    const dubois = 0.007184 * Math.pow(h, 0.725) * Math.pow(m, 0.425)
    return { mosteller, dubois, average: avg([mosteller, dubois]) }
  }, [height, weight])

  return (
    <>
      <Seo
        title="Body Surface Area (BSA) Calculator - vimz Tools"
        description="Calculates total body surface area using Mosteller and DuBois equations."
      />
      <ToolShell
        title="Body Surface Area (BSA) Calculator"
        description="Calculates total body surface area in square meters using the Mosteller and DuBois equations."
        icon={<Maximize2 className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter height and weight to compare Mosteller and DuBois BSA."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Measurements</h3>
            <div className="space-y-3">
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 170" />
              </Field>
              <Field label="Weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 70" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Mosteller</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{calc ? round(calc.mosteller, 2) : '—'} m²</p>
                <p className="mt-1 text-[11px] text-slate-400">sqrt(height x weight / 3600)</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">DuBois</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{calc ? round(calc.dubois, 2) : '—'} m²</p>
                <p className="mt-1 text-[11px] text-slate-400">0.007184 x h^0.725 x m^0.425</p>
              </div>
            </div>

            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-600">Average BSA</p>
              <p className="mt-1 text-2xl font-extrabold text-primary-800">
                {calc ? `${round(calc.average, 2)} m²` : '—'}
              </p>
              <p className="text-[11px] text-primary-500">
                A typical adult has a BSA around 1.73 m². BSA is used to index cardiac output and drug dosing.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}