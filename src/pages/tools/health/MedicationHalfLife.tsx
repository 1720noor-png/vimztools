import { useMemo, useState } from 'react'
import { Pill } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

export default function MedicationHalfLife() {
  const [c1, setC1] = useState('100')
  const [c2, setC2] = useState('50')
  const [hours, setHours] = useState('24')

  const result = useMemo(() => {
    const a = toNumber(c1)
    const b = toNumber(c2)
    const t = toNumber(hours)
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(t) || a <= 0 || b <= 0 || b >= a || t <= 0) return null
    const halfLife = (t * Math.LN2) / Math.log(a / b)
    const remaining = (b / a) * 100
    return { halfLife, remaining }
  }, [c1, c2, hours])

  return (
    <>
      <Seo
        title="Medication Half-Life Estimator - vimz Tools"
        description="Estimate a substance half-life from two concentration readings taken hours apart."
      />
      <ToolShell
        title="Medication Half-Life Estimator"
        description="Estimates elimination half-life using two concentration readings: t½ = t × ln(2) / ln(C1/C2)."
        icon={<Pill className="h-6 w-6" />}
        breadcrumb="Health / Medication"
        instruction="Enter two concentration readings and the time between them."
        guideSteps={[
          { title: 'Enter the earlier reading', text: 'The higher of the two concentrations (C1) in any consistent unit.' },
          { title: 'Enter the later reading', text: 'The lower concentration (C2) measured after C1, in the same unit.' },
          { title: 'Add the elapsed time', text: 'Hours between the two readings to estimate the half-life.' },
        ]}
        guideTips={[
          'Both readings must use the same unit for the estimate to be valid.',
          'Half-life is a useful concept for understanding how long a drug stays active.',
          'For actual medication decisions, always ask your pharmacist or doctor.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your readings</h3>
            <div className="space-y-3">
              <Field label="First concentration (C1)">
                <TextInput type="number" min={0} value={c1} onChange={(e) => setC1(e.target.value)} />
              </Field>
              <Field label="Second concentration (C2, lower)">
                <TextInput type="number" min={0} value={c2} onChange={(e) => setC2(e.target.value)} />
              </Field>
              <Field label="Hours between readings">
                <TextInput type="number" min={0} value={hours} onChange={(e) => setHours(e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Estimated half-life</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{result ? `${round(result.halfLife, 1)}` : '—'}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">hours</p>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">What this means</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {result
                  ? `The later reading is about ${round(result.remaining, 1)}% of the first. A half-life of ${round(result.halfLife, 1)} hours means roughly half the substance is eliminated every ${round(result.halfLife, 1)} hours.`
                  : 'Enter a higher first reading, a lower second reading and the elapsed time.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}