import { useMemo, useState } from 'react'
import { Sparkles, Plus, Trash } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber, uid } from '../../../lib/numbers'

type Deliverable = { id: string; text: string }

export default function FreelanceProposalMaker() {
  const [intro, setIntro] = useState('')
  const [client, setClient] = useState('')
  const [name, setName] = useState('')
  const [timeline, setTimeline] = useState('30')
  const [pricing, setPricing] = useState<'fixed' | 'hourly'>('fixed')
  const [amount, setAmount] = useState('')
  const [hours, setHours] = useState('')
  const [deliverables, setDeliverables] = useState<Deliverable[]>([{ id: uid(), text: '' }])

  const addDel = () => setDeliverables((p) => [...p, { id: uid(), text: '' }])
  const removeDel = (id: string) => setDeliverables((p) => p.filter((x) => x.id !== id))
  const updDel = (id: string, value: string) =>
    setDeliverables((p) => p.map((x) => (x.id === id ? { ...x, text: value } : x)))

  const result = useMemo(() => {
    const list = deliverables.filter((x) => x.text.trim())
    const fee = toNumber(amount)
    const hrs = toNumber(hours)
    const total = pricing === 'fixed' ? fee : Number.isFinite(fee) && Number.isFinite(hrs) ? fee * hrs : 0
    return { list, total, days: toNumber(timeline) }
  }, [deliverables, amount, hours, pricing, timeline])

  return (
    <>
      <Seo title="Freelance Proposal Maker - vimz Tools" description="Draft project proposals with scope and pricing." />
      <ToolShell
        title="Freelance Proposal Maker"
        description="Draft project proposals with scope and pricing."
        icon={<Sparkles className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Draft a project proposal with scope and pricing."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Project</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Client / company">
                    <TextInput value={client} onChange={(e) => setClient(e.target.value)} placeholder="Acme Inc." />
                  </Field>
                  <Field label="Your name">
                    <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Cooper" />
                  </Field>
                </div>
                <Field label="Project intro">
                  <TextArea rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Describe the project, the goal and why it matters…" />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Scope & deliverables</h3>
              <div className="space-y-2">
                {deliverables.map((d) => (
                  <div key={d.id} className="flex items-center gap-2">
                    <TextInput value={d.text} onChange={(e) => updDel(d.id, e.target.value)} placeholder="Deliverable" />
                    {deliverables.length > 1 && (
                      <button onClick={() => removeDel(d.id)} className="rounded-md p-2 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-3" onClick={addDel}>
                <Plus className="h-4 w-4" /> Add deliverable
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Timeline & pricing</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Timeline (days)">
                  <TextInput type="number" min={1} value={timeline} onChange={(e) => setTimeline(e.target.value)} />
                </Field>
                <Field label="Pricing model">
                  <select
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value as 'fixed' | 'hourly')}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="fixed">Fixed fee</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </Field>
                <Field label={pricing === 'fixed' ? 'Fixed fee' : 'Hourly rate'}>
                  <TextInput type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                </Field>
                {pricing === 'hourly' && (
                  <Field label="Estimated hours">
                    <TextInput type="number" min={0} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" />
                  </Field>
                )}
              </div>
            </section>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:sticky lg:top-6">
            <header className="border-b-2 border-primary-700 pb-4">
              <p className="text-xs font-semibold uppercase text-primary-600">Project proposal</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Proposal for {client || '[Client]'}</h2>
              <p className="text-sm font-semibold text-slate-500">Prepared by {name || '[Your name]'}</p>
            </header>
            <section className="mt-4">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Overview</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {intro || 'Add a short intro on the left to describe the project.'}
              </p>
            </section>
            <section className="mt-4">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Deliverables</h3>
              {result.list.length === 0 ? (
                <p className="text-sm text-slate-400">Add deliverables to list them here.</p>
              ) : (
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                  {result.list.map((d) => <li key={d.id}>{d.text}</li>)}
                </ul>
              )}
            </section>
            <section className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-400">Timeline</p>
                <p className="font-bold text-slate-800">{Number.isFinite(result.days) ? `${result.days} days` : '—'}</p>
              </div>
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center">
                <p className="text-xs text-primary-500">{pricing === 'fixed' ? 'Fixed fee' : 'Est. total'}</p>
                <p className="font-extrabold text-primary-800">${money(result.total)}</p>
              </div>
            </section>
            <p className="mt-4 text-xs text-slate-400">Total shown is {pricing === 'fixed' ? 'your fixed fee' : 'rate × estimated hours'} for this scope.</p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}