import { useMemo, useState } from 'react'
import { ListChecks, Plus, Trash } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtHours, sum, toNumber, uid } from '../../../lib/numbers'

type Topic = { id: string; topic: string; owner: string; mins: string }

export default function MeetingAgendaMaker() {
  const [target, setTarget] = useState('60')
  const [topics, setTopics] = useState<Topic[]>([])
  const [draft, setDraft] = useState({ topic: '', owner: '', mins: '15' })

  const add = () => {
    if (!draft.topic.trim()) return
    setTopics((p) => [...p, { id: uid(), topic: draft.topic.trim(), owner: draft.owner.trim(), mins: draft.mins }])
    setDraft({ topic: '', owner: '', mins: '15' })
  }
  const remove = (id: string) => setTopics((p) => p.filter((x) => x.id !== id))

  const result = useMemo(() => {
    const rows = topics
      .filter((t) => t.topic.trim())
      .map((t) => ({ ...t, value: toNumber(t.mins) }))
    const total = sum(rows.map((r) => (Number.isFinite(r.value) ? Math.max(0, r.value) : 0)))
    const goal = toNumber(target)
    const diff = Number.isFinite(goal) ? total - goal : 0
    return { rows, total, goal, diff }
  }, [topics, target])

  const over = result.diff > 0
  const pct = result.goal > 0 ? Math.min(100, (result.total / result.goal) * 100) : 0

  return (
    <>
      <Seo title="Meeting Agenda Maker - vimz Tools" description="Build clear agendas with topics, owners and time slots." />
      <ToolShell
        title="Meeting Agenda Maker"
        description="Build clear agendas with topics, owners and time slots."
        icon={<ListChecks className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Add agenda topics with owners and time slots."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Add a topic</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_110px_auto]">
                <TextInput value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} placeholder="Topic" />
                <TextInput value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} placeholder="Owner" />
                <TextInput type="number" min={1} value={draft.mins} onChange={(e) => setDraft({ ...draft, mins: e.target.value })} placeholder="Minutes" />
                <Button onClick={add}><Plus className="h-4 w-4" /> Add</Button>
              </div>
            </section>

            {result.rows.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Agenda</h3>
                <div className="space-y-2">
                  {result.rows.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className="w-16 shrink-0 rounded-lg bg-primary-50 px-2 py-1 text-center text-xs font-bold text-primary-700">
                        {Number.isFinite(r.value) ? `${r.value}m` : '—'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{r.topic}</p>
                        <p className="truncate text-xs text-slate-400">{r.owner || 'No owner'}</p>
                      </div>
                      <button onClick={() => remove(r.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <Field label="Meeting length (minutes)">
                <TextInput type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} />
              </Field>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <ListChecks className="mx-auto mb-2 h-6 w-6 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-slate-400">Total agenda time</p>
              <p className="mt-1 text-4xl font-extrabold text-slate-800">{fmtHours(result.total * 60)}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full transition-all ${over ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`mt-3 text-sm font-semibold ${over ? 'text-rose-600' : result.total === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                {result.total === 0
                  ? 'Add topics to fill the agenda'
                  : over
                    ? `${fmtHours(result.diff * 60)} over the target`
                    : `Fits within the meeting with ${fmtHours(Math.abs(result.diff) * 60)} spare`}
              </p>
            </section>

            {result.rows.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-sm font-bold text-slate-800">Time share</h4>
                <div className="space-y-2.5">
                  {result.rows.map((r) => {
                    const share = result.total > 0 ? (Math.max(0, r.value) / result.total) * 100 : 0
                    return (
                      <div key={r.id}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-slate-600">{r.topic}</span>
                          <span className="text-slate-400">{Math.round(share)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100">
                          <div className="h-1.5 rounded-full bg-sky-400" style={{ width: `${share}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}