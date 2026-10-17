import { useMemo, useState } from 'react'
import { BadgeDollarSign, Plus, Trash2, Coins, ReceiptText } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber, uid } from '../../../lib/numbers'

type Row = { id: string; name: string; cost: string; used: string }

const SEED: Row[] = [
  { id: 'a', name: 'Chicken breast', cost: '6', used: '0.7' },
  { id: 'b', name: 'Rice', cost: '2', used: '0.25' },
  { id: 'c', name: 'Broccoli', cost: '2.5', used: '0.5' },
]

export default function RecipeCostCalculator() {
  const [rows, setRows] = useState<Row[]>(SEED)
  const [servings, setServings] = useState('4')
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [used, setUsed] = useState('1')

  const lineCost = (r: Row) => {
    const c = toNumber(r.cost)
    const u = toNumber(r.used)
    return Number.isFinite(c) && Number.isFinite(u) ? c * u : 0
  }

  const result = useMemo(() => {
    const total = rows.reduce((s, r) => s + lineCost(r), 0)
    const sv = toNumber(servings)
    const per = Number.isFinite(sv) && sv > 0 ? total / sv : NaN
    const biggest = rows.length ? rows.reduce((a, b) => (lineCost(a) > lineCost(b) ? a : b)) : null
    return { total, per: Number.isFinite(per) ? per : NaN, biggest }
  }, [rows, servings])

  const add = () => {
    if (!name.trim()) return
    setRows((r) => [...r, { id: uid(), name: name.trim(), cost, used }])
    setName('')
    setCost('')
    setUsed('1')
  }

  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id))

  const maxCost = useMemo(() => Math.max(1, ...rows.map(lineCost)), [rows])

  return (
    <>
      <Seo
        title="Recipe Cost Calculator - vimz Tools"
        description="Work out exactly what a recipe costs per serving. Free recipe pricing calculator."
      />
      <ToolShell
        title="Recipe Cost Calculator"
        description="Work out exactly what a recipe costs per serving."
        icon={<BadgeDollarSign className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Enter ingredient costs to price a recipe per serving."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add an ingredient</h3>
              <div className="space-y-3">
                <Field label="Ingredient">
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Olive oil" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cost of item ($)">
                    <TextInput inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} />
                  </Field>
                  <Field label="Portion used">
                    <TextInput inputMode="decimal" value={used} onChange={(e) => setUsed(e.target.value)} />
                  </Field>
                </div>
                <Button onClick={add} className="w-full">
                  <Plus className="h-4 w-4" /> Add ingredient
                </Button>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <Field label="Servings in recipe">
                  <TextInput inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
                </Field>
                <p className="mt-2 text-[11px] text-slate-400">
                  'Portion used' is the fraction of the item the recipe needs (0–1).
                </p>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Ingredients</h3>
            {rows.length === 0 ? (
              <p className="text-xs text-slate-400">Add ingredients to cost out this recipe.</p>
            ) : (
              <div className="space-y-2.5">
                {rows.map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                        <p className="text-[11px] text-slate-400">
                          ${r.cost || '—'} × {r.used || '—'} used
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-700">${money(lineCost(r))}</p>
                      <button onClick={() => remove(r.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                        style={{ width: `${(lineCost(r) / maxCost) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <ReceiptText className="mx-auto mb-2 h-5 w-5 text-slate-500" />
            <p className="text-xs font-semibold uppercase text-slate-400">Recipe total</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800">${money(result.total)}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <BadgeDollarSign className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-xs font-semibold uppercase text-emerald-500">Per serving</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-700">
              ${Number.isFinite(result.per) ? money(result.per) : '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
            <Coins className="mx-auto mb-2 h-5 w-5 text-primary-600" />
            <p className="text-xs font-semibold uppercase text-primary-500">Biggest cost</p>
            <p className="mt-1 truncate text-sm font-extrabold text-primary-800">
              {result.biggest ? result.biggest.name : '—'}
            </p>
            <p className="text-[11px] text-primary-600">
              {result.biggest ? `$${money(lineCost(result.biggest))}` : ''}
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}