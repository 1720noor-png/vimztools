import { useMemo, useState } from 'react'
import { ShoppingCart, Plus, Trash2, CheckCircle2, Circle, Eraser } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Item = { id: string; name: string; done: boolean }

export default function GroceryListMaker() {
  const [items, setItems] = useState<Item[]>([])
  const [value, setValue] = useState('')

  const addItem = () => {
    const name = value.trim()
    if (!name) return
    setItems((prev) => [...prev, { id: uid(), name, done: false }])
    setValue('')
  }

  const toggle = (id: string) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))
  const clearCompleted = () => setItems((prev) => prev.filter((i) => !i.done))

  const remaining = useMemo(() => items.filter((i) => !i.done).length, [items])

  return (
    <>
      <Seo
        title="Grocery List Maker - vimz Tools"
        description="Create and check off a shopping list quickly."
      />
      <ToolShell
        title="Grocery List Maker"
        description="Create and check off a shopping list quickly."
        icon={<ShoppingCart className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Add items and tick them off as you shop."
      >
        <div className="mx-auto max-w-2xl">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Field label={items.length ? `${remaining} to buy · ${items.length - remaining} done` : 'Add an item'}>
                  <TextInput
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addItem()
                    }}
                    placeholder="e.g. Eggs, bread, milk…"
                  />
                </Field>
              </div>
              <Button onClick={addItem} className="mb-px">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">My list ({items.length})</h3>
              {items.some((i) => i.done) && (
                <Button variant="ghost" onClick={clearCompleted} className="px-2 py-1 text-xs">
                  <Eraser className="h-3.5 w-3.5" /> Clear done
                </Button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-slate-400">Your list is empty — add the first item above.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((i) => (
                  <li
                    key={i.id}
                    className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${i.done ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'}`}
                  >
                    <button onClick={() => toggle(i.id)} aria-label="Toggle">
                      {i.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300 hover:text-slate-500" />}
                    </button>
                    <span className={`flex-1 text-sm ${i.done ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}`}>{i.name}</span>
                    <button onClick={() => remove(i.id)} className="rounded-md p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {items.length > 0 && (
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${items.length ? (items.filter((i) => i.done).length / items.length) * 100 : 0}%` }} />
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}