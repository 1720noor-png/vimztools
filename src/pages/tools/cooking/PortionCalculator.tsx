import { useMemo, useState } from 'react'
import { Percent, Plus, Trash2, Scale, ChevronRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber, uid } from '../../../lib/numbers'

type Row = { id: string; name: string; amount: string }

const SEED: Row[] = [
  { id: 'a', name: 'Flour', amount: '250 g' },
  { id: 'b', name: 'Sugar', amount: '100 g' },
  { id: 'c', name: 'Butter', amount: '125 g' },
  { id: 'd', name: 'Eggs', amount: '2' },
]

export default function PortionCalculator() {
  const [rows, setRows] = useState<Row[]>(SEED)
  const [base, setBase] = useState('4')
  const [target, setTarget] = useState('6')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const scale = useMemo(() => {
    const b = toNumber(base)
    const t = toNumber(target)
    return Number.isFinite(b) && Number.isFinite(t) && b > 0 ? t / b : NaN
  }, [base, target])

  const addRow = () => {
    if (!name.trim()) return
    setRows((r) => [...r, { id: uid(), name: name.trim(), amount }])
    setName('')
    setAmount('')
  }

  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id))

  const scaledText = (amount: string) => {
    const v = toNumber(amount)
    if (!Number.isFinite(v) || !Number.isFinite(scale)) return '—'
    const scaled = round(v * scale, 1)
    const unit = amount.replace(/[\d.,\s]+/, '')
    return `${scaled}${unit ? ` ${unit}` : ''}`
  }

  return (
    <>
      <Seo
        title="Portion Calculator - vimz Tools"
        description="Adjust ingredient amounts to the number of servings. Free recipe portion scaler."
      />
      <ToolShell
        title="Portion Calculator"
        description="Adjust ingredient amounts to the number of servings."
        icon={<Percent className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Scale a recipe's ingredients to the servings you need."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr]">
            <Field label="Serves (original)">
              <TextInput inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} />
            </Field>
            <div className="flex items-end justify-center pb-2">
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
            <Field label="Serves (you want)">
              <TextInput inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} />
            </Field>
          </div>
          <p className="mt-3 rounded-xl bg-primary-50 p-3 text-center text-sm font-bold text-primary-700">
            {Number.isFinite(scale) ? `Scale ×${round(scale, 2)}` : 'Enter valid serving counts'}
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add ingredient</h3>
            <div className="space-y-3">
              <Field label="Ingredient">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Milk" />
              </Field>
              <Field label="Amount for recipe as written">
                <TextInput value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 300 ml" />
              </Field>
              <Button onClick={addRow} className="w-full">
                <Plus className="h-4 w-4" /> Add ingredient
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Ingredients with scaled amounts</h3>
            {rows.length === 0 ? (
              <p className="text-xs text-slate-400">No ingredients yet.</p>
            ) : (
              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Scale className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Original: {r.amount || '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-primary-700">{scaledText(r.amount)}</p>
                      <p className="text-[11px] text-slate-400">for {target || '?'} servings</p>
                    </div>
                    <button onClick={() => remove(r.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}