import { useMemo, useState } from 'react'
import { Dumbbell } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, round, toNumber } from '../../../lib/numbers'

const BANDS = [
  { name: 'Below average', min: 14, max: 18, seg: 25, fill: 'bg-slate-400' },
  { name: 'Average', min: 18, max: 20, seg: 12.5, fill: 'bg-sky-500' },
  { name: 'Above average', min: 20, max: 22, seg: 12.5, fill: 'bg-emerald-500' },
  { name: 'Excellent', min: 22, max: 23, seg: 6.25, fill: 'bg-amber-500' },
  { name: 'Superior', min: 23, max: 26, seg: 18.75, fill: 'bg-orange-500' },
  { name: 'Suspicious', min: 26, max: 30, seg: 25, fill: 'bg-violet-500' },
]

export default function LeanBodyMassFfmi() {
  const [weight, setWeight] = useState('')
  const [bf, setBf] = useState('')
  const [height, setHeight] = useState('')

  const calc = useMemo(() => {
    const w = toNumber(weight)
    const b = toNumber(bf)
    const ht = toNumber(height)
    if (![w, b, ht].every(Number.isFinite) || w <= 0 || ht <= 0 || b < 0 || b >= 100) return null
    const lbm = w * (1 - b / 100)
    const hm = ht / 100
    const ffmi = lbm / (hm * hm)
    const norm = ffmi + 6.1 * (1.8 - hm)
    return { lbm, ffmi, norm }
  }, [weight, bf, height])

  const marker = calc ? clamp(calc.norm, 14, 30) : 14
  const pct = ((marker - 14) / 16) * 100

  return (
    <>
      <Seo
        title="Lean Body Mass (LBM) & FFMI Calculator - vimz Tools"
        description="Calculates muscle mass index (FFMI) and fat-free mass weight."
      />
      <ToolShell
        title="Lean Body Mass (LBM) & FFMI Calculator"
        description="Calculates fat-free mass and the Fat-Free Mass Index (FFMI) with a normalized score for your height."
        icon={<Dumbbell className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter weight, body fat and height to get LBM and FFMI."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your stats</h3>
            <div className="space-y-3">
              <Field label="Weight (kg)">
                <TextInput type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 80" />
              </Field>
              <Field label="Body fat (%)">
                <TextInput type="number" min={0} value={bf} onChange={(e) => setBf(e.target.value)} placeholder="e.g. 18" />
              </Field>
              <Field label="Height (cm)">
                <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 180" />
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Fat-free mass', value: calc ? `${round(calc.lbm, 1)} kg` : '—' },
                { label: 'FFMI', value: calc ? round(calc.ffmi, 1) : '—' },
                { label: 'Normalized FFMI', value: calc ? round(calc.norm, 1) : '—' },
              ].map((t) => (
                <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">{t.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{t.value}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Normalized FFMI scale</h3>
              <div className="relative">
                <div className="flex h-3 overflow-hidden rounded-full">
                  {BANDS.map((b) => (
                    <div key={b.name} className={b.fill} style={{ width: `${b.seg}%` }} />
                  ))}
                </div>
                {calc && (
                  <div className="absolute -top-7 z-10" style={{ left: `${pct}%` }}>
                    <div className="-translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                      {round(calc.norm, 1)}
                    </div>
                    <div className="mx-auto h-2 w-0.5 bg-slate-900" />
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
                {BANDS.map((b) => (
                  <p key={b.name} className="text-[10px] font-semibold text-slate-500">
                    {b.min}-{b.max}: {b.name}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Golden natural limit</p>
              <p className="mt-1 text-sm leading-relaxed text-amber-800">
                Most men stall near an FFMI of 25-26 at lean. Values above 26 are rare for natural athletes.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}