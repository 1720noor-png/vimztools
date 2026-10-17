import { useMemo, useState } from 'react'
import { Kanban, Plus, Trash, ChevronLeft, ChevronRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, TextInput, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

const COLUMNS = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'] as const
type Status = (typeof COLUMNS)[number]
type App = { id: string; company: string; role: string; status: Status }

const COLORS: Record<Status, string> = {
  Wishlist: 'border-slate-200 bg-slate-50',
  Applied: 'border-sky-200 bg-sky-50',
  Interview: 'border-amber-200 bg-amber-50',
  Offer: 'border-emerald-200 bg-emerald-50',
  Rejected: 'border-rose-200 bg-rose-50',
}

export default function JobApplicationTracker() {
  const [apps, setApps] = useState<App[]>([])
  const [draft, setDraft] = useState({ company: '', role: '', status: 'Wishlist' as Status })

  const add = () => {
    if (!draft.company.trim() || !draft.role.trim()) return
    setApps((p) => [...p, { id: uid(), company: draft.company.trim(), role: draft.role.trim(), status: draft.status }])
    setDraft({ company: '', role: '', status: 'Wishlist' })
  }
  const move = (id: string, dir: 1 | -1) =>
    setApps((p) =>
      p.map((a) => {
        if (a.id !== id) return a
        const i = COLUMNS.indexOf(a.status)
        const next = COLUMNS[i + dir]
        return next ? { ...a, status: next } : a
      }),
    )
  const remove = (id: string) => setApps((p) => p.filter((x) => x.id !== id))

  const counts = useMemo(() => {
    const c: Record<Status, number> = { Wishlist: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 }
    apps.forEach((a) => { c[a.status] = (c[a.status] ?? 0) + 1 })
    return c
  }, [apps])

  return (
    <>
      <Seo title="Job Application Tracker - vimz Tools" description="Track applications, statuses and follow-up dates." />
      <ToolShell
        title="Job Application Tracker"
        description="Track applications, statuses and follow-up dates."
        icon={<Kanban className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Log applications and move them through each status."
      >
        <section className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
          <TextInput value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} placeholder="Company" />
          <TextInput value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Role" />
          <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })}>
            {COLUMNS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Button onClick={add}><Plus className="h-4 w-4" /> Add</Button>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col} className={`flex min-h-[280px] flex-col rounded-2xl border p-3 ${COLORS[col]}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-700">{col}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500">{counts[col]}</span>
              </div>
              <div className="flex-1 space-y-2">
                {apps.filter((a) => a.status === col).map((a) => (
                  <div key={a.id} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                    <p className="truncate text-sm font-bold text-slate-800">{a.role}</p>
                    <p className="truncate text-xs text-slate-500">{a.company}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          onClick={() => move(a.id, -1)}
                          disabled={col === COLUMNS[0]}
                          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Move back"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => move(a.id, 1)}
                          disabled={col === COLUMNS[COLUMNS.length - 1]}
                          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Move forward"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                      <button onClick={() => remove(a.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {counts[col] === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-400">
                    {col === 'Wishlist' ? 'Start your wishlist' : 'No applications here'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="text-[11px] font-semibold uppercase text-slate-400">In {col}</p>
              <p className="mt-0.5 text-2xl font-extrabold text-slate-800">{counts[col]}</p>
            </div>
          ))}
        </div>
      </ToolShell>
    </>
  )
}