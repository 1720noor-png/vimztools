import { useMemo, useState } from 'react'
import { Percent, XCircle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, percent, toNumber } from '../../../lib/numbers'

const MEN = [
  { name: 'Essential fat', min: 0, max: 6 },
  { name: 'Athlete', min: 6, max: 14 },
  { name: 'Fitness', min: 14, max: 18 },
  { name: 'Average', min: 18, max: 25 },
  { name: 'Obese', min: 25, max: 60 },
]
const WOMEN = [
  { name: 'Essential fat', min: 0, max: 14 },
  { name: 'Athlete', min: 14, max: 21 },
  { name: 'Fitness', min: 21, max: 25 },
  { name: 'Average', min: 25, max: 32 },
  { name: 'Obese', min: 32, max: 60 },
]

export default function BodyFatUsNavy() {
  const [sex, setSex] = useState('male')
  const [neck, setNeck] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [height, setHeight] = useState('')

  const calc = useMemo(() => {
    const n = toNumber(neck)
    const w = toNumber(waist)
    const h = toNumber(hip)
    const ht = toNumber(height)
    if (![n, w, h, ht].every(Number.isFinite) || n <= 0 || w <= 0 || ht <= 0) return { err: '', bf: NaN }
    if (w <= n) return { err: 'Waist must be larger than neck.', bf: NaN }
    if (sex === 'female' && h <= n) return { err: 'Hips must be larger than neck.', bf: NaN }
    const bf =
      sex === 'male'
        ? 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(ht)) - 450
        : 495 / (1.29579 - 0.35004 * Math.log10(w + h - n) + 0.221 * Math.log10(ht)) - 450
    return { err: '', bf }
  }, [sex, neck, waist, hip, height])

  const cats = sex === 'male' ? MEN : WOMEN
  const bf = calc && Number.isFinite(calc.bf) ? calc.bf : NaN
  const cat = Number.isFinite(bf) ? cats.find((c) => bf >= c.min && bf < c.max) : undefined
  const marker = Number.isFinite(bf) ? Math.round((clamp(bf, 2, 45) / 45) * 100) : 0

  return (
    <>
      <Seo
        title="Body Fat % Estimator (U.S. Navy Method) - vimz Tools"
        description="Estimates body fat percentage using neck, waist, hip, and height measurements."
      />
      <ToolShell
        title="Body Fat % Estimator (U.S. Navy Method)"
        description="Estimates body fat percentage using neck, waist, hip, and height measurements."
        icon={<Percent className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter neck, waist, hip and height to estimate body fat percent."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Measurements (cm)</h3>
            <div className="space-y-3">
              <Field label="Sex">
                <Select value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Neck">
                  <TextInput type="number" min={0} value={neck} onChange={(e) => setNeck(e.target.value)} placeholder="e.g. 38" />
                </Field>
                <Field label="Waist">
                  <TextInput type="number" min={0} value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 90" />
                </Field>
                <Field label="Hip (women)">
                  <TextInput type="number" min={0} value={hip} onChange={(e) => setHip(e.target.value)} placeholder="e.g. 98" />
                </Field>
                <Field label="Height">
                  <TextInput type="number" min={0} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 178" />
                </Field>
              </div>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Estimated body fat</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{percent(bf, 1)}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                {cat ? cat.name : 'Add measurements for a category'}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Category band</h3>
              <div className="flex h-3 overflow-hidden rounded-full">
                {cats.map((c) => (
                  <div key={c.name} className={`flex-1 ${cat === c ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
              </div>
              <div className="mt-2 flex">
                {cats.map((c) => (
                  <p key={c.name} className={`flex-1 text-center text-[10px] font-semibold ${cat === c ? 'text-slate-900' : 'text-slate-500'}`}>
                    {c.name} {c.min}-{Math.min(c.max, 45)}%
                  </p>
                ))}
              </div>
              <div className="relative mt-2 h-1.5 rounded-full bg-slate-100">
                {Number.isFinite(bf) ? (
                  <div className="absolute -top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-rose-600 shadow" style={{ left: `${marker}%` }} />
                ) : null}
              </div>
            </section>

            {calc?.err ? (
              <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {calc.err}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </ToolShell>
    </>
  )
}