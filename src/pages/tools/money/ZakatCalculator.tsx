import { useMemo, useState } from 'react'
import { Coins, Gem, HandCoins, Scale } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

const SILVER_TO_GOLD = 0.0125

export default function ZakatCalculator() {
  const [cash, setCash] = useState('10000')
  const [goldValue, setGoldValue] = useState('0')
  const [weight, setWeight] = useState('0')
  const [rate, setRate] = useState('60')
  const [nisabMode, setNisabMode] = useState<'gold' | 'silver'>('gold')

  const result = useMemo(() => {
    const cashAmt = toNumber(cash)
    const goldAmt = toNumber(goldValue)
    const grams = toNumber(weight)
    const perGram = toNumber(rate)
    const wealthFromWeight = Number.isFinite(grams) && Number.isFinite(perGram) ? grams * perGram : 0
    const wealth = (Number.isFinite(cashAmt) ? Math.max(0, cashAmt) : 0) + (Number.isFinite(goldAmt) ? Math.max(0, goldAmt) : 0) + wealthFromWeight
    const nisabGrams = nisabMode === 'gold' ? 85 : 595
    const nisabValue = Number.isFinite(perGram) ? nisabGrams * perGram * (nisabMode === 'gold' ? 1 : SILVER_TO_GOLD) : 0
    const above = wealth > nisabValue ? wealth - nisabValue : 0
    const zakat = wealth >= nisabValue ? wealth * 0.025 : 0
    return { wealth, nisabValue, above, zakat, eligible: wealth >= nisabValue, nisabGrams }
  }, [cash, goldValue, weight, rate, nisabMode])

  return (
    <>
      <Seo title="Zakat Calculator - vimz Tools" description="Compute zakat due on wealth above the nisab threshold." />
      <ToolShell
        title="Zakat Calculator"
        description="Compute zakat due on wealth above the nisab threshold."
        icon={<HandCoins className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter your wealth above nisab to compute zakat due at 2.5%."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your wealth</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Cash & bank balance ($)">
                <TextInput type="number" min={0} value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0.00" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gold value ($)">
                  <TextInput type="number" min={0} value={goldValue} onChange={(e) => setGoldValue(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Gold weight (g)">
                  <TextInput type="number" min={0} step={0.1} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" />
                </Field>
              </div>
              <Field label="Gold price per gram ($)">
                <TextInput type="number" min={0} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" />
              </Field>
              <Field label="Nisab standard">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNisabMode('gold')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition ${nisabMode === 'gold' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-500'}`}
                  >
                    <Gem className="h-4 w-4" /> 85 g gold
                  </button>
                  <button
                    onClick={() => setNisabMode('silver')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold transition ${nisabMode === 'silver' ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 bg-white text-slate-500'}`}
                  >
                    <Scale className="h-4 w-4" /> 595 g silver
                  </button>
                </div>
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Wealth vs nisab</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="text-slate-500">Total wealth</span>
                  <span className="font-bold text-slate-800">${money(result.wealth)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="text-slate-500">Nisab ({result.nisabGrams} g)</span>
                  <span className="font-bold text-slate-800">${money(result.nisabValue)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-emerald-600"><Coins className="h-4 w-4" /> Above nisab</span>
                  <span className="font-bold text-emerald-700">${money(result.above)}</span>
                </div>
              </div>
              {!result.eligible && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700">
                  Below nisab — zakat is not due this cycle.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500">Zakat due (2.5%)</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">${money(result.zakat)}</p>
              <p className="mt-2 text-xs text-primary-500">
                {result.eligible ? '2.5% of total wealth held for a full lunar year.' : 'Not obligated at this level.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}