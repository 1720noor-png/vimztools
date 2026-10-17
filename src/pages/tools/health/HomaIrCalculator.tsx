import { useMemo, useState } from 'react'
import { Droplets } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

export default function HomaIrCalculator() {
  const [insulin, setInsulin] = useState('8')
  const [glucose, setGlucose] = useState('92')
  const [unit, setUnit] = useState('mg')

  const result = useMemo(() => {
    const i = toNumber(insulin)
    const g = toNumber(glucose)
    if (!Number.isFinite(i) || !Number.isFinite(g) || i <= 0 || g <= 0) return null
    const gMg = unit === 'mmol' ? g * 18.0155 : g
    const homa = (i * gMg) / 405
    const band =
      homa < 1
        ? { label: 'Optimal', color: 'text-emerald-600' }
        : homa < 2
          ? { label: 'Early insulin resistance', color: 'text-amber-600' }
          : homa < 3
            ? { label: 'Moderate insulin resistance', color: 'text-orange-600' }
            : { label: 'Elevated', color: 'text-rose-600' }
    return { homa, band }
  }, [insulin, glucose, unit])

  return (
    <>
      <Seo
        title="HOMA-IR Insulin Resistance Calculator - vimz Tools"
        description="Estimate insulin resistance from fasting insulin and fasting glucose using HOMA-IR."
      />
      <ToolShell
        title="HOMA-IR Insulin Resistance Calculator"
        description="Estimates insulin resistance using the HOMA-IR formula: fasting insulin × fasting glucose / 405."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Health / Diabetes"
        instruction="Enter fasting insulin and fasting glucose to estimate HOMA-IR."
        guideSteps={[
          { title: 'Enter fasting insulin', text: 'In µU/mL (or mU/L) - this is after at least 8 hours without food.' },
          { title: 'Enter fasting glucose', text: 'In mg/dL or mmol/L - pick the unit your lab report uses.' },
          { title: 'Read your HOMA-IR', text: 'A single number with a colour-coded interpretation band.' },
        ]}
        guideTips={[
          'HOMA-IR is a research and educational tool - it is not a diagnostic test on its own.',
          'Both values must be fasting samples for the estimate to be meaningful.',
          'Reference ranges vary between labs; interpret alongside a clinician.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your fasting results</h3>
            <div className="space-y-3">
              <Field label="Fasting insulin (µU/mL)">
                <TextInput type="number" min={0} step={0.1} value={insulin} onChange={(e) => setInsulin(e.target.value)} />
              </Field>
              <Field label="Fasting glucose unit">
                <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="mg">mg/dL</option>
                  <option value="mmol">mmol/L</option>
                </Select>
              </Field>
              <Field label="Fasting glucose">
                <TextInput type="number" min={0} step={0.1} value={glucose} onChange={(e) => setGlucose(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your HOMA-IR</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{result ? round(result.homa, 2) : '—'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result ? (result.homa < 1 ? 'bg-emerald-500' : result.homa < 2 ? 'bg-amber-400' : result.homa < 3 ? 'bg-orange-500' : 'bg-rose-500') : 'bg-slate-300'}`} />
                <span className={result ? result.band.color : 'text-slate-400'}>
                  {result ? result.band.label : 'Waiting for inputs'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Interpretation bands</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><span className="font-semibold text-emerald-600">&lt; 1.0</span> - Optimal</li>
                <li><span className="font-semibold text-amber-600">1.0 - 1.9</span> - Early insulin resistance</li>
                <li><span className="font-semibold text-orange-600">2.0 - 2.9</span> - Moderate insulin resistance</li>
                <li><span className="font-semibold text-rose-600">3.0+</span> - Elevated resistance</li>
              </ul>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}