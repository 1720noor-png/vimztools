import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { TemplateShell, inputCls, btnCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

interface Item {
  id: string
  label: string
  done: boolean
}

function seedItems(t: RegistryTool): Item[] {
  const base = t.name.replace(/tracker|planner|checklist/gi, '').trim()
  return [
    { id: `${t.id}-1`, label: `Review the basics for ${base || t.name}`, done: false },
    { id: `${t.id}-2`, label: 'Fill in the key details', done: false },
    { id: `${t.id}-3`, label: 'Confirm and export', done: false },
  ]
}

export function ChecklistTrackerTemplate({ tool }: { tool: RegistryTool }) {
  const storageKey = `vimz-checklist:${tool.id}`
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as Item[]) : seedItems(tool)
    } catch {
      return seedItems(tool)
    }
  })
  const [label, setLabel] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items))
    } catch {
      /* ignore quota errors */
    }
  }, [items, storageKey])

  function add() {
    const v = label.trim()
    if (!v) return
    setItems((prev) => [...prev, { id: `${Date.now()}`, label: v, done: false }])
    setLabel('')
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const done = items.filter((i) => i.done).length
  const pct = items.length ? Math.round((done / items.length) * 100) : 0

  return (
    <TemplateShell tool={tool}>
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
          <span>Progress</span>
          <span>{done} / {items.length}</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
              item.done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
            }`}
          >
            <button onClick={() => toggle(item.id)} className="shrink-0" aria-label="toggle">
              <CheckCircle2 className={`h-5 w-5 ${item.done ? 'text-emerald-600' : 'text-slate-300'}`} />
            </button>
            <span className={`flex-1 text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item.label}
            </span>
            <button onClick={() => remove(item.id)} className="shrink-0 text-slate-300 transition hover:text-rose-500" aria-label="remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
            No items yet. Add your first one below.
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <input
          className={inputCls}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a new item…"
        />
        <button className={btnCls} onClick={add}>
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </TemplateShell>
  )
}