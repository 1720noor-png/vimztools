import { useMemo, useState } from 'react'
import { ListChecks, Plus, Trash2, ShoppingBasket, CheckCircle2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, uid } from '../../../lib/numbers'

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Pantry']

type Item = { id: string; name: string; cat: string; bought: boolean }

export default function KitchenShoppingList() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [cat, setCat] = useState('Produce')

  const add = () => {
    if (!name.trim()) return
    setItems((arr) => [...arr, { id: uid(), name: name.trim(), cat, bought: false }])
    setName('')
  }

  const toggle = (id: string) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, bought: !i.bought } : i)))

  const remove = (id: string) => setItems((arr) => arr.filter((i) => i.id !== id))

  const stats = useMemo(() => {
    const total = items.length
    const bought = items.filter((i) => i.bought).length
    return { total, bought, pct: total ? clamp((bought / total) * 100, 0, 100) : 0 }
  }, [items])

  const byCat = useMemo(
    () => CATEGORIES.map((c) => ({ cat: c, list: items.filter((i) => i.cat === c) })),
    [items],
  )

  return (
    <>
      <Seo
        title="Kitchen Shopping List - vimz Tools"
        description="Build a categorized list of kitchen essentials to buy. Free categorized grocery checklist."
      />
      <ToolShell
        title="Kitchen Shopping List"
        description="Build a categorized list of kitchen essentials to buy."
        icon={<ListChecks className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Build a categorized list before you head to the store."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px_auto]">
            <Field label="Item">
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') add()
                }}
                placeholder="e.g. Bell peppers"
              />
            </Field>
            <Field label="Category">
              <Select value={cat} onChange={(e) => setCat(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex items-end">
              <Button onClick={add}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{stats.bought} of {stats.total} items bought</span>
              <span>{Math.round(stats.pct)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${stats.pct}%` }} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {byCat.map(({ cat: c, list }) => (
            <section key={c} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-800">{c}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                  {list.filter((i) => !i.bought).length}
                </span>
              </div>
              {list.length === 0 ? (
                <p className="text-xs text-slate-300">Empty</p>
              ) : (
                <ul className="space-y-1.5">
                  {list.map((i) => (
                    <li key={i.id} className="group flex items-center gap-2">
                      <button onClick={() => toggle(i.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                            i.bought ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 group-hover:border-emerald-400'
                          }`}
                        >
                          {i.bought && <CheckCircle2 className="h-3 w-3" />}
                        </span>
                        <span className={`truncate text-sm ${i.bought ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                          {i.name}
                        </span>
                      </button>
                      <button
                        onClick={() => remove(i.id)}
                        className="hidden rounded p-0.5 text-slate-300 transition group-hover:inline hover:text-rose-500"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          <ShoppingBasket className="h-4 w-4 shrink-0 text-primary-600" />
          {stats.total === 0
            ? 'Your list is empty — add items above to get started.'
            : stats.pct >= 100
              ? 'All done — enjoy the kitchen.'
              : `${stats.total - stats.bought} item${stats.total - stats.bought === 1 ? '' : 's'} left to find.`}
        </p>
      </ToolShell>
    </>
  )
}