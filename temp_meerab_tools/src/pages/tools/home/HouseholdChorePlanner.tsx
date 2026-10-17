import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ClipboardCheck, Plus, Trash2, CheckCircle2, Circle, Users } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Chore = { id: string; name: string; member: string; day: string; done: boolean }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const COLORS = ['bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700']

export default function HouseholdChorePlanner() {
  const [members, setMembers] = useState<string[]>(['Alex', 'Sam', 'Jordan'])
  const [chores, setChores] = useState<Chore[]>([])
  const [name, setName] = useState('')
  const [member, setMember] = useState(members[0])
  const [day, setDay] = useState('Mon')

  const addChore = () => {
    if (!name.trim()) return
    setChores((prev) => [...prev, { id: uid(), name: name.trim(), member, day, done: false }])
    setName('')
  }

  const remove = (id: string) => setChores((prev) => prev.filter((c) => c.id !== id))
  const toggle = (id: string) => setChores((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)))
  const assign = (id: string, m: string) => setChores((prev) => prev.map((c) => (c.id === id ? { ...c, member: m } : c)))

  const addMember = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const input = form.elements.namedItem('newMember') as HTMLInputElement
    const val = input.value.trim()
    if (!val) return
    setMembers((prev) => [...prev, val])
    input.value = ''
  }

  const load = useMemo(() => {
    const counts = members.map((m) => ({ member: m, count: chores.filter((c) => c.member === m && !c.done).length }))
    const max = Math.max(0, ...counts.map((c) => c.count))
    return { counts, max }
  }, [members, chores])

  const activeChores = useMemo(() => chores.filter((c) => !c.done).length, [chores])

  return (
    <>
      <Seo
        title="Household Chore Planner - vimz Tools"
        description="Assign and track household chores by family member and day."
      />
      <ToolShell
        title="Household Chore Planner"
        description="Assign and track household chores by family member and day."
        icon={<ClipboardCheck className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Assign chores to family members and rotate the load."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-40 flex-1">
              <Field label="Chore">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Take out recycling" />
              </Field>
            </div>
            <div className="w-36">
              <Field label="Member">
                <Select value={member} onChange={(e) => setMember(e.target.value)}>
                  {members.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="w-32">
              <Field label="Day">
                <Select value={day} onChange={(e) => setDay(e.target.value)}>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button onClick={addChore}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <form onSubmit={addMember} className="flex items-center gap-2 border-t border-slate-100 pt-4">
            <Users className="h-4 w-4 text-slate-400" />
            <TextInput name="newMember" placeholder="Add a family member…" className="max-w-52 py-2 text-xs" />
            <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
              Add member
            </Button>
          </form>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-1">
            {load.counts.map((c, i) => (
              <div key={c.member} className={`rounded-2xl border border-slate-200 p-4 ${c.count === load.max && load.max > 0 ? 'bg-rose-50' : 'bg-white'}`}>
                <p className={`text-sm font-bold ${c.count === load.max && load.max > 0 ? 'text-rose-700' : 'text-slate-700'}`}>{c.member}</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{c.count} <span className="text-xs font-semibold text-slate-400">open</span></p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                  <div className={`h-1.5 rounded-full ${COLORS[i % COLORS.length]} bg-current`} style={{ width: `${load.max ? (c.count / load.max) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400 sm:col-span-2">{activeChores} active chores this week.</p>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Chore roster</h3>
            {chores.length === 0 ? (
              <p className="text-xs text-slate-400">No chores yet — assign the first one above.</p>
            ) : (
              <ul className="space-y-2">
                {chores.map((c) => (
                  <li key={c.id} className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 ${c.done ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                    <button onClick={() => toggle(c.id)} aria-label="Toggle">
                      {c.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                    </button>
                    <p className={`min-w-32 flex-1 text-sm ${c.done ? 'text-slate-400 line-through' : 'font-semibold text-slate-800'}`}>{c.name}</p>
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{c.day}</span>
                    <Select value={c.member} onChange={(e) => assign(c.id, e.target.value)} className="w-28 py-1.5 text-xs">
                      {members.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                    <button onClick={() => remove(c.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}