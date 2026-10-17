import { useEffect, useState } from 'react'
import { SquareCheckBig, Plus, Trash2, Check, Filter } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Todo {
  id: number
  text: string
  done: boolean
}

const KEY = 'vimz-student-todos'

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
  } catch {
    return []
  }
}

export default function StudentTodoList() {
  const [todos, setTodos] = useState<Todo[]>(load)
  const [text, setText] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(todos))
    } catch {
      // storage unavailable - keep in memory
    }
  }, [todos])

  const add = () => {
    const t = text.trim()
    if (!t) return
    setTodos((v) => [...v, { id: Date.now(), text: t, done: false }])
    setText('')
  }

  const toggle = (id: number) => setTodos((v) => v.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: number) => setTodos((v) => v.filter((t) => t.id !== id))
  const clearDone = () => setTodos((v) => v.filter((t) => !t.done))

  const visible = todos.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.done : !t.done))
  const remaining = todos.filter((t) => !t.done).length
  const pct = todos.length ? Math.round(((todos.length - remaining) / todos.length) * 100) : 0

  return (
    <>
      <Seo
        title="To-Do List - vimz Tools"
        description="A simple, persistent student to-do list that saves itself in your browser."
      />
      <ToolShell
        title="To-Do List"
        description="A lightweight, auto-saving task list that stays in your browser."
        icon={<SquareCheckBig className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Type a task and press Enter; click a task to complete it."
      >
        <div className="mx-auto max-w-xl space-y-4">
          <div className="flex gap-2">
            <TextInput
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add() }}
              placeholder="Add a task and press Enter..."
            />
            <Button onClick={add} disabled={!text.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs font-semibold text-slate-400">{remaining} of {todos.length} tasks open ({pct}% done)</p>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {(['all', 'active', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${filter === f ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {f}
              </button>
            ))}
            {todos.some((t) => t.done) && (
              <button onClick={clearDone} className="ml-auto text-xs font-semibold text-rose-500 hover:text-rose-700">
                Clear completed
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {visible.length === 0 && (
              <li className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">
                No tasks here yet - add one above.
              </li>
            )}
            {visible.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <button
                  onClick={() => toggle(t.id)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${t.done ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 text-transparent hover:border-violet-400'}`}
                  aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  <Check className="h-3 w-3" />
                </button>
                <span className={`flex-1 text-sm ${t.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.text}</span>
                <button onClick={() => remove(t.id)} className="text-slate-300 transition hover:text-rose-500" aria-label="Delete task">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-center text-xs text-slate-400">Tasks are saved automatically in this browser.</p>
        </div>
      </ToolShell>
    </>
  )
}