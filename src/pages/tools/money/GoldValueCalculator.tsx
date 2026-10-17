import { useMemo, useState } from 'react'
import { Gem, Scale, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, toNumber } from '../../../lib/numbers'

const KARATS = [
  { k: 24, purity: 1, label: '24k — pure gold' },
  { k: 22, purity: 0.9167, label: '22k — 91.67%' },
  { k: 21, purity: 0.875, label: '21k — 87.50%' },
  { k: 18, purity: 0.75, label: '18k — 75.00%' },
]

const UNITS: Record<string, number> = { gram: 1, ounce: 28.3495, tola: 11.6638 }

export default function GoldValueCalculator() {
  const [karat, setKarat] = useState('24')
  const [weight, setWeight] = useState('5')
  const [unit, setUnit] = useState('gram')
  const [rate, setRate] = useState('60')

  const result = useMemo(() => {
    const k = KARATS.find((x) => String(x.k) === karat) ?? KARATS[0]
    const w = toNumber(weight)
    const perGram = toNumber(rate)
    const grams = Number.isFinite(w) && w > 0 ? w * UNITS[unit] : 0
    const pureGold = grams * k.purity
    const value = Number.isFinite(perGram) ? pureGold * perGram : 0
    const totalValue = grams * perGram
    return { k, grams, pureGold, value, totalValue, perGram: clamp(perGram, 0, Infinity) }
  }, [karat, weight, unit, rate])

  return (
    <>
      <Seo title="Gold Value Calculator - vimz Tools" description="Find the current value of gold by weight and purity." />
      <ToolShell
        title="Gold Value Calculator"
        description="Find the current value of gold by weight and purity."
        icon={<Gem className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Pick karat and weight to find today's estimated gold value."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Gold details</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Karat (purity)">
                <Select value={karat} onChange={(e) => setKarat(e.target.value)}>
                  {KARATS.map((x) => (
                    <option key={x.k} value={String(x.k)}>{x.label}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Weight">
                  <TextInput type="number" min={0} step={0.01} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Unit">
                  <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="gram">Gram</option>
                    <option value="ounce">Ounce (oz)</option>
                    <option value="tola">Tola</option>
                  </Select>
                </Field>
              </div>
              <Field label="Gold price per gram ($)">
                <TextInput type="number" min={0} step={0.5} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" />
              </Field>
            </div>
            <div className="mt-5 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
              <p className="flex items-center gap-1.5 font-semibold text-slate-600"><Scale className="h-3.5 w-3.5" /> {money(result.grams, 3)} g total weight in {unit}</p>
              <p className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Pure gold content: {money(result.pureGold, 3)} g</p>
              <p className="flex items-center gap-1.5">Total value if it were pure: ${money(result.totalValue)}</p>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">Estimated value ({result.k.k}k)</p>
              <p className="mt-1 text-5xl font-extrabold text-amber-800">${money(result.value)}</p>
              <p className="mt-2 text-xs text-amber-600">
                {money(result.grams, 3)} g at {money(result.perGram)}/g × {Math.round(result.k.purity * 100)}% purity
              </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Purity reference</h3>
              <div className="space-y-2">
                {KARATS.map((x) => (
                  <div key={x.k} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${karat === String(x.k) ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-semibold text-slate-700">{x.k}k</span>
                    <span className="text-xs text-slate-400">{x.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}