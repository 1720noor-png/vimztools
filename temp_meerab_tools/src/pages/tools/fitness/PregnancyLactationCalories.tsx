import { useMemo, useState } from 'react'
import { Baby } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const STAGES = [
  { name: '1st trimester', extra: 0, note: 'Maintenance is usually enough.' },
  { name: '2nd trimester', extra: 340, note: 'About +340 kcal per day.' },
  { name: '3rd trimester', extra: 450, note: 'About +450 kcal per day.' },
  { name: 'Lactation (0-6 mo)', extra: 500, note: 'About +500 kcal per day.' },
  { name: 'Lactation (6-12 mo)', extra: 400, note: 'About +400 kcal per day.' },
]

export default function PregnancyLactationCalories() {
  const [stage, setStage] = useState(0)
  const [maintenance, setMaintenance] = useState('')

  const total = useMemo(() => {
    const m = toNumber(maintenance)
    if (Number.isFinite(m) && m > 0) return m + STAGES[stage].extra
    return NaN
  }, [maintenance, stage])

  return (
    <>
      <Seo
        title="Pregnancy & Lactation Calorie Adjuster - vimz Tools"
        description="Calculates supplementary daily caloric needs during pregnancy trimesters and breastfeeding stages."
      />
      <ToolShell
        title="Pregnancy & Lactation Calorie Adjuster"
        description="Calculates the supplementary daily caloric needs for each pregnancy trimester and breastfeeding stage on top of maintenance."
        icon={<Baby className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Select your stage to see extra daily calories needed."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your stage</h3>
            <div className="grid grid-cols-1 gap-2">
              {STAGES.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => setStage(i)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${stage === i ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-xs font-bold">+{s.extra} kcal</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Field label="Pre-pregnancy maintenance (optional, kcal)">
                <TextInput type="number" min={0} value={maintenance} onChange={(e) => setMaintenance(e.target.value)} placeholder="e.g. 2000" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-500">Extra calories needed</p>
              <p className="mt-2 text-6xl font-extrabold text-rose-700">+{STAGES[stage].extra}</p>
              <p className="mt-1 text-sm text-rose-500">kcal per day on top of maintenance</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-rose-700">
                <Baby className="h-4 w-4" /> {STAGES[stage].name}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Estimated daily total</p>
              <p className="mt-2 text-5xl font-extrabold text-slate-900">{Number.isFinite(total) ? round(total) : '—'}</p>
              <p className="mt-1 text-sm text-slate-400">
                {Number.isFinite(total) ? `maintenance + stage extra` : 'Add your maintenance calories to see a daily total'}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">{STAGES[stage].note}</p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}