import { useMemo, useState } from 'react'
import { HeartPulse } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

export default function HeartHealthScore() {
  const [age, setAge] = useState('35')
  const [systolic, setSystolic] = useState('118')
  const [cholesterol, setCholesterol] = useState('190')
  const [hdl, setHdl] = useState('55')
  const [smoker, setSmoker] = useState('no')
  const [activity, setActivity] = useState('active')
  const [bmi, setBmi] = useState('23')

  const result = useMemo(() => {
    const a = toNumber(age)
    const sys = toNumber(systolic)
    const tc = toNumber(cholesterol)
    const h = toNumber(hdl)
    const b = toNumber(bmi)
    if ([a, sys, tc, h, b].some((v) => !Number.isFinite(v) || v <= 0)) return null

    let loss = 0
    loss += a < 30 ? 0 : a < 40 ? 5 : a < 50 ? 10 : a < 60 ? 15 : 20
    loss += sys < 120 ? 0 : sys < 130 ? 3 : sys < 140 ? 7 : 12
    const ratio = tc / Math.max(h, 1)
    loss += ratio < 3.5 ? 0 : ratio < 4.5 ? 4 : ratio < 5.5 ? 8 : 12
    loss += smoker === 'yes' ? 15 : 0
    loss += activity === 'active' ? 0 : activity === 'moderate' ? 4 : 8
    loss += b >= 18.5 && b <= 24.9 ? 0 : b < 30 ? 4 : 8

    const score = Math.max(25, 100 - loss)
    const band = score >= 85 ? { label: 'Excellent', color: 'text-emerald-600' } : score >= 70 ? { label: 'Good', color: 'text-teal-600' } : score >= 55 ? { label: 'Fair', color: 'text-amber-600' } : { label: 'Pay attention', color: 'text-rose-600' }
    return { score, band, ratio }
  }, [age, systolic, cholesterol, hdl, smoker, activity, bmi])

  return (
    <>
      <Seo
        title="Heart Health Wellness Score - vimz Tools"
        description="Build a simple 0-100 heart wellness score from age, blood pressure, cholesterol and lifestyle."
      />
      <ToolShell
        title="Heart Health Wellness Score"
        description="A simple 0-100 wellness snapshot based on age, blood pressure, cholesterol, smoking, activity and BMI. Higher is better."
        icon={<HeartPulse className="h-6 w-6" />}
        breadcrumb="Health / Heart"
        instruction="Fill in your numbers to see your heart wellness score."
        guideSteps={[
          { title: 'Enter your measurements', text: 'Age, systolic blood pressure, total cholesterol and HDL.' },
          { title: 'Add lifestyle factors', text: 'Smoking status, weekly activity and BMI.' },
          { title: 'Read your score', text: 'See a 0-100 score with a colour-coded band and what it means.' },
        ]}
        guideTips={[
          'This is a wellness awareness tool, not a medical risk assessment or diagnosis.',
          'Know your numbers: blood pressure and cholesterol both matter together.',
          'Talk to a clinician before making decisions based on this score.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your details</h3>
            <div className="space-y-3">
              <Field label="Age (years)">
                <TextInput type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} />
              </Field>
              <Field label="Systolic blood pressure (mmHg)">
                <TextInput type="number" min={1} value={systolic} onChange={(e) => setSystolic(e.target.value)} />
              </Field>
              <Field label="Total cholesterol (mg/dL)">
                <TextInput type="number" min={1} value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} />
              </Field>
              <Field label="HDL cholesterol (mg/dL)">
                <TextInput type="number" min={1} value={hdl} onChange={(e) => setHdl(e.target.value)} />
              </Field>
              <Field label="Do you smoke?">
                <Select value={smoker} onChange={(e) => setSmoker(e.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
              <Field label="Weekly activity">
                <Select value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="active">Active (5+ sessions)</option>
                  <option value="moderate">Moderate (2-4 sessions)</option>
                  <option value="sedentary">Sedentary (0-1 sessions)</option>
                </Select>
              </Field>
              <Field label="BMI">
                <TextInput type="number" min={1} value={bmi} onChange={(e) => setBmi(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your heart wellness score</p>
              <p className="mt-2 text-7xl font-extrabold text-slate-900">{result ? result.score : '—'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result ? (result.score >= 70 ? 'bg-emerald-500' : result.score >= 55 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-slate-300'}`} />
                <span className={result ? result.band.color : 'text-slate-400'}>
                  {result ? result.band.label : 'Waiting for inputs'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Score breakdown</h3>
              <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 transition-all duration-500" style={{ width: `${result ? clamp(result.score, 0, 100) : 0}%` }} />
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                {result
                  ? `From your inputs, the estimated cholesterol ratio is ${round(result.ratio, 1)}:1 (target under 3.5:1). The score balances protective habits (being active, not smoking, healthy weight) against risk factors (age, blood pressure, cholesterol).`
                  : 'Enter your measurements to see a personalised breakdown.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}