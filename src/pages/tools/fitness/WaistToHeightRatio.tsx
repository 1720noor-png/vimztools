import { useMemo, useState } from 'react'
import { Gauge } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const BANDS = [
  { name: 'Slim', max: 0.4, fill: 'bg-sky-500', note: 'Low central fat. Keep a balanced diet and stay active.' },
  { name: 'Healthy', max: 0.49, fill: 'bg-emerald-500', note: 'Your waist is well proportioned to your height.' },
  { name: 'Increased risk', max: 0.59, fill: 'bg-amber-500', note: 'Central fat is creeping up. Mind your portions and add cardio.' },
  { name: 'High risk', max: 0.7, fill: 'bg-rose-500', note: 'Strong central obesity signal. A structured plan is a good idea.' },
]

export default function WaistToHeightRatio() {
  const [waist, setWaist] = useState('')
  const [height, setHeight] = useState('')

  const calc = useMemo(() => {
    const w = toNumber(waist)
    const h = toNumber(height)
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
    const ratio = w / h
    const band = BANDS.find((b) => ratio < b.max) ?? BANDS[3]
    return { ratio, band }
  }, [waist, height])

  const marker = calc ? clamp((calc.ratio - 0.3) / 0.4, 0, 1) * 100 : 0

  return (
    <>
      <Seo
        title="Waist-to-Height Ratio (WtHR) Risk Checker - vimz Tools"
        description="Assesses central obesity and cardiovascular health risks."
      />
      <ToolShell
        title="Waist-to-Height Ratio (WtHR) Risk Checker"
        description="Assesses central obesity and cardiovascular health risks using the waist-to-height ratio guideline."
        icon={<Gauge className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Divide your waist by your height to check your risk band."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Measurements</h3>
            <div className="space-y-3">
              <Field label="Waist (cm)">
                <TextInput type="number" min={0} value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 82" />
              </Field>
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 170" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Waist-to-height ratio</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{calc ? round(calc.ratio, 2) : '—'}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {calc ? calc.band.name : 'Enter values to see your risk band'}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-8 text-sm font-bold text-slate-800">Risk band (0.30 to 0.70)</h3>
              <div className="relative flex h-4 overflow-hidden rounded-full">
                {BANDS.map((b) => (
                  <div key={b.name} className={`${b.fill} w-1/4`} />
                ))}
                {calc && (
                  <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${marker}%` }}>
                    <div className="-translate-x-1/2 h-7 w-7 -rotate-45 rounded-sm border-4 border-white bg-slate-900 shadow" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex">
                {BANDS.map((b) => (
                  <p key={b.name} className="w-1/4 text-center text-[10px] font-semibold text-slate-500">
                    {b.name}
                  </p>
                ))}
              </div>
            </section>

            {calc && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Verdict</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{calc.band.note}</p>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}