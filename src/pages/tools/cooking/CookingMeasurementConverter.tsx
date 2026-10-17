import { useMemo, useState } from 'react'
import { Ruler, ArrowLeftRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { toNumber, round } from '../../../lib/numbers'

type UnitKey = 'cup' | 'tbsp' | 'tsp' | 'ml' | 'floz' | 'g'

const UNITS: Record<UnitKey, { label: string; short: string; ml: number }> = {
  cup: { label: 'Cup', short: 'cup', ml: 240 },
  tbsp: { label: 'Tablespoon', short: 'tbsp', ml: 15 },
  tsp: { label: 'Teaspoon', short: 'tsp', ml: 5 },
  ml: { label: 'Milliliter', short: 'ml', ml: 1 },
  floz: { label: 'Fluid ounce', short: 'fl oz', ml: 29.5735 },
  g: { label: 'Gram (water)', short: 'g', ml: 1 },
}

const PRIORITY: UnitKey[] = ['cup', 'tbsp', 'tsp', 'ml', 'floz', 'g']

export default function CookingMeasurementConverter() {
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState<UnitKey>('cup')
  const [to, setTo] = useState<UnitKey>('ml')

  const result = useMemo(() => {
    const v = toNumber(amount)
    if (!Number.isFinite(v)) return '—'
    return round((v * UNITS[from].ml) / UNITS[to].ml, 2)
  }, [amount, from, to])

  const extra = useMemo(() => {
    if (UNITS[from].ml === 1 || UNITS[to].ml === 1) return null
    const v = toNumber(amount)
    if (!Number.isFinite(v)) return null
    return `${round(v * UNITS[from].ml, 1)} ml`
  }, [amount, from, to])

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <>
      <Seo
        title="Cooking Measurement Converter - vimz Tools"
        description="Switch between cups, tablespoons, teaspoons, ml and grams. Free kitchen measurement converter."
      />
      <ToolShell
        title="Cooking Measurement Converter"
        description="Switch between cups, tablespoons, teaspoons, ml and grams."
        icon={<Ruler className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Convert between cups, spoons, ml and grams."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Amount</h3>
            <Field label="Quantity">
              <TextInput inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1.5" />
            </Field>
            <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <Field label="From">
                <Select value={from} onChange={(e) => setFrom(e.target.value as UnitKey)}>
                  {PRIORITY.map((u) => (
                    <option key={u} value={u}>
                      {UNITS[u].label}
                    </option>
                  ))}
                </Select>
              </Field>
              <button
                onClick={swap}
                className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:border-primary-500 hover:text-primary-600"
                aria-label="Swap units"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
              <Field label="To">
                <Select value={to} onChange={(e) => setTo(e.target.value as UnitKey)}>
                  {PRIORITY.map((u) => (
                    <option key={u} value={u}>
                      {UNITS[u].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                {amount || '0'} {UNITS[from].short} = 
              </p>
              <p className="mt-2 text-4xl font-extrabold text-primary-800">
                {result === '—' ? '—' : result} {UNITS[to].short}
              </p>
              {extra && <p className="mt-2 text-sm font-medium text-primary-600">≈ {extra}</p>}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Quick reference</h3>
              <div className="divide-y divide-slate-100 text-sm text-slate-600">
                <p className="flex justify-between py-2"><span>1 cup</span><span className="font-semibold text-slate-900">240 ml</span></p>
                <p className="flex justify-between py-2"><span>1 tablespoon</span><span className="font-semibold text-slate-900">15 ml</span></p>
                <p className="flex justify-between py-2"><span>1 teaspoon</span><span className="font-semibold text-slate-900">5 ml</span></p>
                <p className="flex justify-between py-2"><span>1 fluid ounce</span><span className="font-semibold text-slate-900">29.6 ml</span></p>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}