import { useMemo, useState } from 'react'
import { ArrowUpDown, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, round, toNumber, uid } from '../../../lib/numbers'

type Row = { id: string; name: string; amount: string }

const SEED: Row[] = [
  { id: 'a', name: 'Pasta', amount: '400 g' },
  { id: 'b', name: 'Tomatoes', amount: '800 g' },
  { id: 'c', name: 'Garlic', amount: '3 cloves' },
  { id: 'd', name: 'Olive oil', amount: '2 tbsp' },
]

export default function RecipeScaler() {
  const [rows, setRows] = useState<Row[]>(SEED)
  const [fromServings, setFromServings] = useState('4')
  const [toServings, setToServings] = useState('6')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const factor = useMemo(() => {
    const f = toNumber(fromServings)
    const t = toNumber(toServings)
    return Number.isFinite(f) && Number.isFinite(t) && f > 0 ? t / f : NaN
  }, [fromServings, toServings])

  const addRow = () => {
    if (!name.trim()) return
    setRows((r) => [...r, { id: uid(), name: name.trim(), amount }])
    setName('')
    setAmount('')
  }

  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id))

  const scaled = (amount: string) => {
    const v = toNumber(amount)
    if (!Number.isFinite(v) || !Number.isFinite(factor)) return '—'
    return round(v * factor, v % 1 === 0 ? 0 : 1)
  }

  const quotientUnits = (amount: string) => amount.replace(/[\d.,\s]+/, '').trim()

  const setTo = (t: string) => setToServings(t)

  return (
    <>
      <Seo
        title="Recipe Scaler - vimz Tools"
        description="Scale any recipe up or down for a new serving count. Free recipe multiplier."
      />
      <ToolShell
        title="Recipe Scaler"
        description="Scale any recipe up or down for a new serving count."
        icon={<ArrowUpDown className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Scale ingredient amounts up or down in one click."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Recipe serves">
              <TextInput inputMode="numeric" value={fromServings} onChange={(e) => setFromServings(e.target.value)} />
            </Field>
            <Field label="You want to serve">
              <TextInput inputMode="numeric" value={toServings} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-center">
              <p className="text-[10px] font-bold uppercase text-primary-500">Scale factor</p>
              <p className="text-xl font-extrabold text-primary-800">
                {Number.isFinite(factor) ? `×${round(factor, 2)}` : '—'}
              </p>
            </div>
            <div className="flex items-end gap-1.5">
              {[0.5, 1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => setTo(String(m * (toNumber(fromServings) || 4)))}
                  className="flex-1 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
                >
                  {m}×
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add ingredient</h3>
            <div className="space-y-3">
              <Field label="Ingredient">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Parmesan" />
              </Field>
              <Field label="Amount (as written)">
                <TextInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100 g" />
              </Field>
              <Button onClick={addRow} className="w-full">
                <Plus className="h-4 w-4" /> Add ingredient
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {fromServings} → {toServings} servings
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {Number.isFinite(factor) ? percent((factor - 1) * 100, 0) : '—'}
              </span>
            </div>
            {rows.length === 0 ? (
              <p className="text-xs text-slate-400">No ingredients yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Ingredient</th>
                      <th className="px-3 py-2.5 font-bold">Original</th>
                      <th className="px-3 py-2.5 font-bold text-primary-600">Scaled</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2.5 font-semibold text-slate-800">{r.name}</td>
                        <td className="px-3 py-2.5 text-slate-500">{r.amount || '—'}</td>
                        <td className="px-3 py-2.5 font-extrabold text-primary-700">
                          {scaled(r.amount) === '—' ? '—' : `${scaled(r.amount)}${quotientUnits(r.amount) ? ` ${quotientUnits(r.amount)}` : ''}`}
                        </td>
                        <td className="px-2">
                          <button onClick={() => remove(r.id)} className="rounded p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}