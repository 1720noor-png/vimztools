import { useMemo, useState } from 'react'
import { Apple } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const MEN = [
  { name: 'Low risk', max: 0.9, fill: 'bg-emerald-500' },
  { name: 'Moderate risk', max: 1, fill: 'bg-amber-500' },
  { name: 'High risk', max: 1.2, fill: 'bg-rose-500' },
]
const WOMEN = [
  { name: 'Low risk', max: 0.8, fill: 'bg-emerald-500' },
  { name: 'Moderate risk', max: 0.9, fill: 'bg-amber-500' },
  { name: 'High risk', max: 1.2, fill: 'bg-rose-500' },
]

export default function WaistToHipRatio() {
  const [sex, setSex] = useState('male')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')

  const calc = useMemo(() => {
    const w = toNumber(waist)
    const h = toNumber(hip)
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
    const ratio = w / h
    const bands = sex === 'male' ? MEN : WOMEN
    const band = bands.find((b) => ratio < b.max) ?? bands[2]
    const threshold = sex === 'male' ? 0.9 : 0.8
    const shape = ratio >= threshold ? 'Apple (upper body fat)' : 'Pear (lower body fat)'
    return { ratio, band, shape }
  }, [sex, waist, hip])

  const marker = calc ? clamp((calc.ratio - 0.6) / 0.5, 0, 1) * 100 : 0

  return (
    <>
      <Seo
        title="Waist-to-Hip Ratio (WHR) Assessment - vimz Tools"
        description="Evaluates body fat distribution patterns and metabolic syndrome risks."
      />
      <ToolShell
        title="Waist-to-Hip Ratio (WHR) Assessment"
        description="Evaluates body fat distribution patterns and metabolic syndrome risks using the waist-to-hip ratio."
        icon={<Apple className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Measure waist and hips to score your fat distribution risk."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Measurements</h3>
            <div className="space-y-3">
              <Field label="Sex">
                <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
              <Field label="Waist (cm)">
                <TextInput type="number" min={0} value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 85" />
              </Field>
              <Field label="Hips (cm)">
                <TextInput type="number" min={0} value={hip} onChange={(e) => setHip(e.target.value)} placeholder="e.g. 100" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Waist-to-hip ratio</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{calc ? round(calc.ratio, 2) : '—'}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                <Apple className="h-4 w-4" />
                {calc ? calc.shape : 'Body shape appears with values'}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-8 text-sm font-bold text-slate-800">Risk band</h3>
              <div className="relative flex h-4 overflow-hidden rounded-full">
                {(sex === 'male' ? MEN : WOMEN).map((b) => (
                  <div key={b.name} className={`${b.fill} w-1/3`} />
                ))}
                {calc && (
                  <div className="absolute top-1/2 z-10 -translate-y-1/2" style={{ left: `${marker}%` }}>
                    <div className="-translate-x-1/2 h-9 w-1 rounded-full bg-slate-900 shadow" />
                  </div>
                )}
              </div>
              <div className="mt-2 flex">
                {(sex === 'male' ? MEN : WOMEN).map((b) => (
                  <p key={b.name} className="w-1/3 text-center text-[10px] font-semibold text-slate-500">{b.name}</p>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                {sex === 'male' ? 'Cutoffs: 0.90 low, 0.90-0.99 moderate, 1.00+ high.' : 'Cutoffs: 0.80 low, 0.80-0.89 moderate, 0.90+ high.'}
              </p>
            </section>

            {calc && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pattern</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {calc.shape === 'Apple (upper body fat)'
                    ? 'Upper-body fat distribution raises cardiovascular risk more than lower-body fat.'
                    : 'Lower-body fat distribution is generally lower risk for metabolic syndrome.'}
                </p>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}