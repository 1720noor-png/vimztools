import { useMemo, useState } from 'react'
import { Weight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const BF_LEVELS = [6, 10, 15]

export default function MuscleGeneticPotential() {
  const [height, setHeight] = useState('')
  const [wrist, setWrist] = useState('')
  const [ankle, setAnkle] = useState('')

  const calc = useMemo(() => {
    const h = toNumber(height)
    const w = toNumber(wrist)
    const a = toNumber(ankle)
    if (![h, w, a].every(Number.isFinite) || h <= 0 || w <= 0 || a <= 0) return null
    const ratio = (w / h + a / h) / 2
    const frame = ratio < 0.115
      ? { label: 'Small frame', factor: 0.95 }
      : ratio <= 0.135
        ? { label: 'Medium frame', factor: 1.05 }
        : { label: 'Large frame', factor: 1.15 }
    const maxFFM = (h - 100) * frame.factor
    const bodyfats = BF_LEVELS.map((bf) => ({ bf, weight: maxFFM / (1 - bf / 100) }))
    return { ratio, frame, maxFFM, bodyfats }
  }, [height, wrist, ankle])

  return (
    <>
      <Seo
        title="Maximum Muscle Genetic Potential Estimator - vimz Tools"
        description="Estimates maximum natural muscular growth potential based on bone structure."
      />
      <ToolShell
        title="Maximum Muscle Genetic Potential Estimator"
        description="Estimates the maximum natural muscular growth potential for your frame based on height, wrist, and ankle measurements."
        icon={<Weight className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter height, wrist and ankle size to estimate your max frame."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Frame measurements (cm)</h3>
            <div className="space-y-3">
              <Field label="Height">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 180" />
              </Field>
              <Field label="Wrist circumference">
                <TextInput type="number" min={0} value={wrist} onChange={(e) => setWrist(e.target.value)} placeholder="e.g. 17" />
              </Field>
              <Field label="Ankle circumference">
                <TextInput type="number" min={0} value={ankle} onChange={(e) => setAnkle(e.target.value)} placeholder="e.g. 21" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            {calc && (
              <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Frame type</p>
                    <p className="text-xl font-extrabold text-primary-800">{calc.frame.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Bone frame ratio</p>
                    <p className="text-xl font-extrabold text-primary-800">{round(calc.ratio, 3)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Factor</p>
                    <p className="text-xl font-extrabold text-primary-800">x {calc.frame.factor}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Maximum natural lean mass</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{calc ? `${round(calc.maxFFM, 1)} kg` : '—'}</p>
              <p className="mt-1 text-sm text-slate-400">estimated fat-free mass ceiling</p>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {calc ? (
                calc.bodyfats.map((b) => (
                  <div key={b.bf} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-[11px] font-semibold uppercase text-slate-400">At {b.bf}% body fat</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">{round(b.weight, 1)} kg</p>
                    <p className="text-[11px] text-slate-400">total body weight</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
                  Enter your measurements to see target weights at various body fat levels.
                </p>
              )}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
              Disclaimer: an estimate based on bone structure, not a guarantee. Genetics, training, and nutrition vary
              widely between individuals.
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}