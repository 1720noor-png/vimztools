import { useMemo, useState } from 'react'
import { Plus, Tag, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, percent, toNumber, uid } from '../../../lib/numbers'

type Discount = { id: string; pct: number }

export default function SalePriceCalculator() {
  const [price, setPrice] = useState('120')
  const [discounts, setDiscounts] = useState<Discount[]>([{ id: uid(), pct: 10 }])

  const addDiscount = () => setDiscounts((p) => [...p, { id: uid(), pct: 10 }])
  const removeDiscount = (id: string) => setDiscounts((p) => p.filter((d) => d.id !== id))
  const setPct = (id: string, pct: number) => setDiscounts((p) => p.map((d) => (d.id === id ? { ...d, pct: clamp(pct, 0, 95) } : d)))

  const result = useMemo(() => {
    const original = toNumber(price)
    let running = Number.isFinite(original) && original > 0 ? original : 0
    const steps: { pct: number; running: number }[] = []
    discounts.forEach((d) => {
      running = running * (1 - d.pct / 100)
      steps.push({ pct: d.pct, running })
    })
    return { original, steps, final: running, saved: original - running }
  }, [price, discounts])

  const combinedPct = useMemo(() => (result.original > 0 ? (result.saved / result.original) * 100 : 0), [result])

  return (
    <>
      <Seo title="Sale Price Calculator - vimz Tools" description="Work out the final sale price after multiple discounts." />
      <ToolShell
        title="Sale Price Calculator"
        description="Work out the final sale price after multiple discounts."
        icon={<Tag className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Stack multiple discounts to find the true final price."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Stack your discounts</h3>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Original price ($)">
                <TextInput type="number" min={0} step={0.01} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
              </Field>
              <div className="space-y-2">
                {discounts.map((d, i) => (
                  <div key={d.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="w-6 text-xs font-bold text-slate-400">{i + 1}</span>
                    <TextInput
                      type="number"
                      min={0}
                      max={95}
                      value={String(d.pct)}
                      onChange={(e) => setPct(d.id, toNumber(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-xs font-semibold text-slate-400">% off</span>
                    <button onClick={() => removeDiscount(d.id)} aria-label="Remove" className="ml-auto rounded-md p-1 text-slate-300 transition hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" onClick={addDiscount}>
                <Plus className="h-4 w-4" /> Add another discount
              </Button>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Step by step</h3>
              {result.steps.length === 0 ? (
                <p className="text-xs text-slate-400">Add a discount to see the chain.</p>
              ) : (
                <ol className="space-y-2">
                  <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                    <span className="text-slate-500">Start</span>
                    <span className="font-bold text-slate-800">${money(result.original)}</span>
                  </li>
                  {result.steps.map((s, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                      <span className="text-slate-500">After {percent(s.pct, 0)} off</span>
                      <span className="font-bold text-slate-800">${money(s.running)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500">True final price</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">${money(result.final)}</p>
              <p className="mt-2 text-xs text-primary-500">
                <span className="line-through">${money(result.original)}</span> · saved ${money(result.saved)} ({percent(combinedPct, 1)} combined)
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}