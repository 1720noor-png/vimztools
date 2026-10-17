import { useMemo, useState } from 'react'
import { Stethoscope } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

export default function GlasgowComaScale() {
  const [eye, setEye] = useState('4')
  const [verbal, setVerbal] = useState('5')
  const [motor, setMotor] = useState('6')

  const result = useMemo(() => {
    const total = Number(eye) + Number(verbal) + Number(motor)
    const band =
      total >= 13
        ? { label: 'Mild', color: 'text-emerald-600' }
        : total >= 9
          ? { label: 'Moderate', color: 'text-amber-600' }
          : { label: 'Severe', color: 'text-rose-600' }
    return { total, band }
  }, [eye, verbal, motor])

  return (
    <>
      <Seo
        title="Glasgow Coma Scale Calculator - vimz Tools"
        description="Score eye, verbal and motor responses to compute a GCS total (3-15)."
      />
      <ToolShell
        title="Glasgow Coma Scale Calculator"
        description="Computes the GCS total (3-15) from the three standard responses. Educational reference for healthcare students and professionals."
        icon={<Stethoscope className="h-6 w-6" />}
        breadcrumb="Health / Medical Scores"
        instruction="Select the best observed response in each category."
        guideSteps={[
          { title: 'Select eye response', text: 'From spontaneous (4) down to none (1).' },
          { title: 'Select verbal response', text: 'From orientated (5) down to none (1).' },
          { title: 'Select motor response', text: 'From obeys commands (6) down to none (1).' },
        ]}
        guideTips={[
          'The GCS ranges from 3 (deeply unresponsive) to 15 (fully alert).',
          'Only the best response observed is scored.',
          'This tool is for education - use it only under appropriate clinical guidance.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">GCS components</h3>
            <div className="space-y-3">
              <Field label="Eye opening (E)">
                <Select value={eye} onChange={(e) => setEye(e.target.value)}>
                  <option value="4">4 - Spontaneous</option>
                  <option value="3">3 - To speech</option>
                  <option value="2">2 - To pain</option>
                  <option value="1">1 - None</option>
                </Select>
              </Field>
              <Field label="Verbal response (V)">
                <Select value={verbal} onChange={(e) => setVerbal(e.target.value)}>
                  <option value="5">5 - Orientated</option>
                  <option value="4">4 - Confused</option>
                  <option value="3">3 - Inappropriate words</option>
                  <option value="2">2 - Incomprehensible sounds</option>
                  <option value="1">1 - None</option>
                </Select>
              </Field>
              <Field label="Motor response (M)">
                <Select value={motor} onChange={(e) => setMotor(e.target.value)}>
                  <option value="6">6 - Obeys commands</option>
                  <option value="5">5 - Localises pain</option>
                  <option value="4">4 - Withdraws from pain</option>
                  <option value="3">3 - Abnormal flexion</option>
                  <option value="2">2 - Extensor response</option>
                  <option value="1">1 - None</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">GCS total (E+V+M)</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{result.total}/15</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result.total >= 13 ? 'bg-emerald-500' : result.total >= 9 ? 'bg-amber-400' : 'bg-rose-500'}`} />
                <span className={result.band.color}>{result.band.label}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Common severity bands</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><span className="font-semibold text-emerald-600">13 - 15</span> - Mild</li>
                <li><span className="font-semibold text-amber-600">9 - 12</span> - Moderate</li>
                <li><span className="font-semibold text-rose-600">3 - 8</span> - Severe</li>
              </ul>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}