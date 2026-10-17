import { useMemo, useState } from 'react'
import { Stethoscope } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { toNumber } from '../../../lib/numbers'

export default function Curb65Score() {
  const [confusion, setConfusion] = useState(false)
  const [urea, setUrea] = useState('6')
  const [rr, setRr] = useState('20')
  const [sbp, setSbp] = useState('120')
  const [dbp, setDbp] = useState('76')
  const [age, setAge] = useState('60')

  const result = useMemo(() => {
    const u = toNumber(urea)
    const r = toNumber(rr)
    const s = toNumber(sbp)
    const d = toNumber(dbp)
    const a = toNumber(age)
    const valid = [u, r, s, d, a].every((v) => Number.isFinite(v))
    if (!valid) return null
    let score = 0
    score += confusion ? 1 : 0
    score += u > 7 ? 1 : 0
    score += r >= 30 ? 1 : 0
    score += s <= 90 || d <= 60 ? 1 : 0
    score += a >= 65 ? 1 : 0
    const rec =
      score <= 1
        ? { label: 'Low severity - often managed outside hospital', color: 'text-emerald-600' }
        : score === 2
          ? { label: 'Moderate - consider hospital assessment', color: 'text-amber-600' }
          : { label: 'High severity - urgent assessment advised', color: 'text-rose-600' }
    return { score, rec }
  }, [confusion, urea, rr, sbp, dbp, age])

  return (
    <>
      <Seo
        title="CURB-65 Pneumonia Severity Score - vimz Tools"
        description="Estimate pneumonia severity with the CURB-65 criteria - educational use only."
      />
      <ToolShell
        title="CURB-65 Pneumonia Severity Score"
        description="Scores five simple criteria - Confusion, Urea, Respiratory rate, Blood pressure and Age - to estimate pneumonia severity. Educational tool for healthcare learners."
        icon={<Stethoscope className="h-6 w-6" />}
        breadcrumb="Health / Medical Scores"
        instruction="Enter the five values; each contributes 1 point to a 0-5 score."
        guideSteps={[
          { title: 'Tick confusion', text: 'Was there new mental confusion?' },
          { title: 'Enter the lab values', text: 'Urea (mmol/L), respiratory rate and blood pressure.' },
          { title: 'Enter age', text: '65 or older adds a point. Your score and band appear live.' },
        ]}
        guideTips={[
          'CURB-65 is a triage aid for clinicians - it is not a self-diagnosis tool.',
          'Never delay seeking medical care based on a calculator result.',
          'Each of the five criteria earns 1 point, so the score runs from 0 to 5.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">CURB-65 criteria</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={confusion} onChange={(e) => setConfusion(e.target.checked)} className="h-4 w-4 accent-rose-600" />
                C - New confusion
              </label>
              <Field label="Urea (mmol/L)">
                <TextInput type="number" min={0} step={0.1} value={urea} onChange={(e) => setUrea(e.target.value)} />
              </Field>
              <Field label="Respiratory rate (breaths/min)">
                <TextInput type="number" min={0} value={rr} onChange={(e) => setRr(e.target.value)} />
              </Field>
              <Field label="Systolic BP (mmHg)">
                <TextInput type="number" min={0} value={sbp} onChange={(e) => setSbp(e.target.value)} />
              </Field>
              <Field label="Diastolic BP (mmHg)">
                <TextInput type="number" min={0} value={dbp} onChange={(e) => setDbp(e.target.value)} />
              </Field>
              <Field label="Age (years)">
                <TextInput type="number" min={0} value={age} onChange={(e) => setAge(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">CURB-65 score</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{result ? `${result.score}/5` : '—'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result ? (result.score <= 1 ? 'bg-emerald-500' : result.score === 2 ? 'bg-amber-400' : 'bg-rose-500') : 'bg-slate-300'}`} />
                <span className={result ? result.rec.color : 'text-slate-400'}>
                  {result ? result.rec.label : 'Waiting for inputs'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">What the score suggests</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {result
                  ? result.rec.label + '. If you or someone near you has breathing difficulty, chest pain, high fever or confusion, seek medical attention immediately regardless of any score.'
                  : 'Enter all values to see a score. If any value is missing, the tool stays inactive.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}