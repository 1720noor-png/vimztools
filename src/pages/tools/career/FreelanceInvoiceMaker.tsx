import { useMemo, useState } from 'react'
import { Receipt, Plus, Trash } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber, uid } from '../../../lib/numbers'

type Line = { id: string; desc: string; rate: string; qty: string }

export default function FreelanceInvoiceMaker() {
  const [me, setMe] = useState({ name: '', email: '', number: 'INV-001' })
  const [client, setClient] = useState({ name: '', email: '' })
  const [lines, setLines] = useState<Line[]>([{ id: uid(), desc: '', rate: '', qty: '' }])
  const [taxPct, setTaxPct] = useState('0')

  const addLine = () => setLines((p) => [...p, { id: uid(), desc: '', rate: '', qty: '' }])
  const removeLine = (id: string) => setLines((p) => p.filter((x) => x.id !== id))
  const updLine = (id: string, key: keyof Line, value: string) =>
    setLines((p) => p.map((x) => (x.id === id ? { ...x, [key]: value } : x)))

  const result = useMemo(() => {
    const items = lines
      .filter((x) => x.desc.trim())
      .map((x) => {
        const rate = toNumber(x.rate)
        const qty = toNumber(x.qty)
        return { desc: x.desc, rate, qty, amount: (Number.isFinite(rate) ? rate : 0) * (Number.isFinite(qty) ? qty : 0) }
      })
    const subtotal = items.reduce((s, x) => s + (Number.isFinite(x.amount) ? x.amount : 0), 0)
    const tax = Number.isFinite(toNumber(taxPct)) ? (subtotal * toNumber(taxPct)) / 100 : 0
    return { items, count: items.length, subtotal, tax, total: subtotal + tax }
  }, [lines, taxPct])

  return (
    <>
      <Seo title="Freelance Invoice Maker - vimz Tools" description="Generate clean invoices for freelance clients." />
      <ToolShell
        title="Freelance Invoice Maker"
        description="Generate clean invoices for freelance clients."
        icon={<Receipt className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Add line items and get a billable invoice total."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Parties</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Your name / business">
                  <TextInput value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} placeholder="Jane Cooper Design" />
                </Field>
                <Field label="Your email">
                  <TextInput value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })} placeholder="jane@studio.com" />
                </Field>
                <Field label="Client name">
                  <TextInput value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Acme Inc." />
                </Field>
                <Field label="Invoice no.">
                  <TextInput value={me.number} onChange={(e) => setMe({ ...me, number: e.target.value })} />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Line items</h3>
              <div className="space-y-3">
                {lines.map((x) => (
                  <div key={x.id} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="min-w-[150px] flex-1">
                      <TextInput value={x.desc} onChange={(e) => updLine(x.id, 'desc', e.target.value)} placeholder="Description" />
                    </div>
                    <div className="w-24">
                      <TextInput type="number" min={0} value={x.rate} onChange={(e) => updLine(x.id, 'rate', e.target.value)} placeholder="Rate" />
                    </div>
                    <div className="w-20">
                      <TextInput type="number" min={0} value={x.qty} onChange={(e) => updLine(x.id, 'qty', e.target.value)} placeholder="hrs" />
                    </div>
                    <button onClick={() => removeLine(x.id)} className="mb-1 rounded-md p-2 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-3" onClick={addLine}>
                <Plus className="h-4 w-4" /> Add line item
              </Button>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Tax %">
                  <TextInput type="number" min={0} value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
                </Field>
              </div>
            </section>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6">
              <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">{me.name || 'Your Business'}</p>
                    <p className="text-xs text-slate-500">{me.email || 'email'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase text-slate-400">Invoice</p>
                    <p className="text-sm font-bold text-slate-800">{me.number}</p>
                    <p className="text-xs text-slate-500">Bill to: {client.name || 'Client'}</p>
                  </div>
                </div>
              </div>
              <div className="px-8 py-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-400">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-right">Rate</th>
                      <th className="pb-2 text-right">Hrs</th>
                      <th className="pb-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((it, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2.5 text-slate-700">{it.desc}</td>
                        <td className="py-2.5 text-right text-slate-600">{money(it.rate)}</td>
                        <td className="py-2.5 text-right text-slate-600">{Number.isFinite(it.qty) ? it.qty : '—'}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-800">{money(it.amount)}</td>
                      </tr>
                    ))}
                    {result.items.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-xs text-slate-400">Add line items to populate this invoice.</td></tr>
                    )}
                  </tbody>
                </table>
                <div className="mt-5 ml-auto w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{money(result.subtotal)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Tax ({taxPct}%)</span><span>{money(result.tax)}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-primary-700">
                    <span>Total due</span><span>{money(result.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs">
                <p className="text-slate-400">Items</p>
                <p className="mt-0.5 text-lg font-extrabold text-slate-800">{result.count}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs">
                <p className="text-slate-400">Subtotal</p>
                <p className="mt-0.5 text-lg font-extrabold text-slate-800">{money(result.subtotal)}</p>
              </div>
              <div className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center text-xs">
                <p className="text-primary-500">Total</p>
                <p className="mt-0.5 text-lg font-extrabold text-primary-800">{money(result.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}