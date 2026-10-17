import { useMemo, useState } from 'react'
import { Droplets } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

export default function BloodSugarConverter() {
  const [mode, setMode] = useState('hba1c')
  const [value, setValue] = useState('6.0')

  const result = useMemo<
    { a1c?: number; mmol?: number; eagMg?: number; eagMmol?: number; note: string } | null
  >(() => {
    const v = toNumber(value)
    if (!Number.isFinite(v) || v <= 0) return null
    if (mode === 'hba1c') {
      const eagMg = 28.7 * v - 46.7
      return {
        eagMg,
        eagMmol: eagMg / 18.0155,
        note: 'Estimated average glucose (eAG) from HbA1c using the ADAG formula.',
      }
    }
    if (mode === 'mg') {
      const mmol = v / 18.0155
      const a1c = (v + 46.7) / 28.7
      return { mmol, a1c, note: 'Blood sugar in mg/dL converted to mmol/L and estimated HbA1c.' }
    }
    const mg = v * 18.0155
    const a1c = (mg + 46.7) / 28.7
    return { mmol: v, a1c, note: 'Blood sugar in mmol/L converted to mg/dL and estimated HbA1c.' }
  }, [mode, value])

  return (
    <>
      <Seo
        title="Blood Sugar & HbA1c Converter - vimz Tools"
        description="Convert between HbA1c, eAG (mg/dL, mmol/L) and blood sugar units instantly."
      />
      <ToolShell
        title="Blood Sugar & HbA1c Converter"
        description="Converts between HbA1c (%), estimated average glucose (eAG) and blood sugar readings expressed in mg/dL or mmol/L."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Health / Diabetes"
        instruction="Choose what you measured, enter the value, and get the equivalents."
        guideSteps={[
          { title: 'Select your unit', text: 'HbA1c %, blood sugar in mg/dL, or blood sugar in mmol/L.' },
          { title: 'Enter your reading', text: 'Type the value exactly as it appears on your test result.' },
          { title: 'Read the equivalents', text: 'See the same result expressed in the other units.' },
        ]}
        guideTips={[
          'HbA1c reflects average glucose over roughly 2-3 months, not a single moment.',
          'This tool is for education - discuss your values with your care team.',
          'Home meters can vary; confirm important results with a lab test.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your reading</h3>
            <div className="space-y-3">
              <Field label="What did you measure?">
                <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="hba1c">HbA1c (%)</option>
                  <option value="mg">Blood sugar (mg/dL)</option>
                  <option value="mmol">Blood sugar (mmol/L)</option>
                </Select>
              </Field>
              <Field label="Value">
                <TextInput type="number" min={0} step={0.1} value={value} onChange={(e) => setValue(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'HbA1c', value: result ? (mode !== 'hba1c' ? `${round(result.a1c ?? 0, 1)} %` : round(toNumber(value), 1) + ' %') : '—' },
                { label: 'eAG / glucose', value: result ? `${round(mode === 'mg' ? toNumber(value) : mode === 'mmol' ? (result.mmol ?? 0) * 18.0155 : (result.eagMg ?? 0), 1)} mg/dL` : '—' },
                { label: 'Glucose (SI)', value: result ? `${round(mode === 'mmol' ? toNumber(value) : mode === 'mg' ? (result.mmol ?? 0) : (result.eagMmol ?? 0), 2)} mmol/L` : '—' },
              ].map((t) => (
                <section key={t.label} className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t.label}</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800">{t.value}</p>
                </section>
              ))}
            </div>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">About this conversion</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {result ? result.note : 'Enter a value to see the conversion.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}