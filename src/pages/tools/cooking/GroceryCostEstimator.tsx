import { useMemo, useState } from 'react'
import { ShoppingCart, Plus, Trash2, ReceiptText, Percent } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber, uid } from '../../../lib/numbers'

type Item = { id: string; name: string; qty: string; price: string }

export default function GroceryCostEstimator() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('')
  const [tax, setTax] = useState('8')
  const [taxOn, setTaxOn] = useState(true)
  const [error, setError] = useState('')

  const addItem = () => {
    const p = toNumber(price)
    const q = toNumber(qty)
    if (!name.trim() || !Number.isFinite(p) || p < 0 || !Number.isFinite(q) || q <= 0) {
      setError('Enter a name, a quantity and a price.')
      return
    }
    setError('')
    setItems((arr) => [...arr, { id: uid(), name: name.trim(), qty, price }])
    setName('')
    setQty('1')
    setPrice('')
  }

  const remove = (id: string) => setItems((arr) => arr.filter((i) => i.id !== id))

  const lineTotal = (i: Item) => {
    const p = toNumber(i.price)
    const q = toNumber(i.qty)
    return Number.isFinite(p) && Number.isFinite(q) ? p * q : 0
  }

  const result = useMemo(() => {
    let raw = 0
    for (const i of items) {
      const p = toNumber(i.price)
      const q = toNumber(i.qty)
      if (Number.isFinite(p) && Number.isFinite(q)) raw += p * q
    }
    const taxPct = toNumber(tax)
    const pct = Number.isFinite(taxPct) ? Math.max(0, taxPct) : 0
    const taxAmt = taxOn ? raw * (pct / 100) : 0
    return { subtotal: raw, taxAmt, total: raw + taxAmt }
  }, [items, tax, taxOn])

  return (
    <>
      <Seo
        title="Grocery Cost Estimator - vimz Tools"
        description="Estimate the total cost of your grocery list. Free grocery total calculator with tax."
      />
      <ToolShell
        title="Grocery Cost Estimator"
        description="Estimate the total cost of your grocery list."
        icon={<ShoppingCart className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Add items with prices to estimate your grocery total."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add an item</h3>
            <div className="space-y-3">
              <Field label="Item">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Eggs" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Qty">
                  <TextInput inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
                </Field>
                <Field label="Unit price ($)">
                  <TextInput inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </Field>
              </div>
              {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={taxOn} onChange={(e) => setTaxOn(e.target.checked)} className="h-4 w-4 accent-primary-600" />
                Apply sales tax
              </label>
              {taxOn && (
                <div className="mt-3">
                  <Field label="Tax rate (%)">
                    <TextInput inputMode="decimal" value={tax} onChange={(e) => setTax(e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your list ({items.length})</h3>
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">No items yet — add a few groceries above.</p>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {i.qty} × ${i.price}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">${money(lineTotal(i))}</p>
                    <button onClick={() => remove(i.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-slate-500" />
            <p className="text-xs font-semibold uppercase text-slate-400">Subtotal</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.subtotal)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <Percent className="mx-auto mb-2 h-5 w-5 text-slate-500" />
            <p className="text-xs font-semibold uppercase text-slate-400">Estimated tax</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">${money(result.taxAmt)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <ReceiptText className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-xs font-semibold uppercase text-emerald-500">Estimated total</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700">${money(result.total)}</p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}