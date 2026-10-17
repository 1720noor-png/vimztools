import { useMemo, useState } from 'react'
import { Lightbulb, Users, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, round, toNumber, uid } from '../../../lib/numbers'

type Bill = { id: string; name: string; amount: number; mode: 'equal' | 'occupancy'; sharers: number }

export default function UtilityBillSplitter() {
  const [people, setPeople] = useState(3)
  const [bills, setBills] = useState<Bill[]>([])
  const [name, setName] = useState('Electricity')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<'equal' | 'occupancy'>('equal')

  const addBill = () => {
    const amt = toNumber(amount)
    if (Number.isNaN(amt) || amt <= 0) return
    setBills((prev) => [...prev, { id: uid(), name, amount: amt, mode, sharers: people }])
    setAmount('')
  }

  const remove = (id: string) => setBills((prev) => prev.filter((b) => b.id !== id))

  const result = useMemo(() => {
    const total = bills.reduce((a, b) => a + b.amount, 0)
    const perPerson = bills.reduce(
      (acc, b) => acc + (b.mode === 'equal' ? b.amount / people : b.amount / Math.max(1, b.sharers)),
      0,
    )
    const equalShare = bills.filter((b) => b.mode === 'equal').reduce((a, b) => a + b.amount / people, 0)
    const weightedShare = bills
      .filter((b) => b.mode !== 'equal')
      .reduce((a, b) => a + b.amount / Math.max(1, b.sharers), 0)
    const fairnessGap = round(equalShare - weightedShare, 2)
    return { total, perPerson, equalShare, weightedShare, fairnessGap }
  }, [bills, people])

  const BLIST = ['Electricity', 'Water', 'Internet', 'Gas']

  return (
    <>
      <Seo
        title="Utility Bill Splitter - vimz Tools"
        description="Split electricity, water and internet bills between housemates."
      />
      <ToolShell
        title="Utility Bill Splitter"
        description="Split electricity, water and internet bills between housemates."
        icon={<Lightbulb className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Split electric, water and internet bills between housemates."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <div className="md:col-span-1">
              <Field label="Bill">
                <Select value={name} onChange={(e) => setName(e.target.value)}>
                  {BLIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="Amount ($)">
                <TextInput type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="Weighting">
                <Select value={mode} onChange={(e) => setMode(e.target.value as 'equal' | 'occupancy')}>
                  <option value="equal">Equal</option>
                  <option value="occupancy">Occupancy</option>
                </Select>
              </Field>
            </div>
            <div className="md:col-span-1">
              <Field label="Housemates">
                <Select value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex items-end md:col-span-1">
              <Button onClick={addBill} className="w-full">
                <Lightbulb className="h-4 w-4" /> Add bill
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Bills added</h3>
            {bills.length === 0 ? (
              <p className="text-xs text-slate-400">Add your first utility bill above.</p>
            ) : (
              <ul className="space-y-2">
                {bills.map((b) => (
                  <li key={b.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                      <p className="text-[11px] text-slate-400">{b.mode === 'equal' ? `equal · 1/${people} each` : `occupancy · shared by ${b.sharers}`}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{money(b.amount)}</span>
                    <button onClick={() => remove(b.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-emerald-500">Same as equal</p>
                <p className="text-lg font-extrabold text-emerald-700">{money(result.equalShare)}</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase text-amber-500">Occupancy share</p>
                <p className="text-lg font-extrabold text-amber-700">{money(result.weightedShare)}</p>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">Monthly total</p>
              <p className="mt-1 text-4xl font-black text-primary-800">{money(result.total)}</p>
              <p className="mt-1 text-sm font-semibold text-primary-600">≈ {money(result.perPerson)} per person</p>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Users className="h-4 w-4 text-slate-400" /> Per-person monthly share
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-3">Person</th>
                      <th className="py-2 pr-3">Equal split</th>
                      <th className="py-2 pr-3">Occupancy weighted</th>
                      <th className="py-2">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: people }, (_, i) => i).map((p) => (
                      <tr key={p} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 font-semibold text-slate-800">Person {p + 1}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{money(result.equalShare)}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{money(result.weightedShare)}</td>
                        <td className={`py-2.5 text-xs font-bold ${result.fairnessGap > 0 ? 'text-emerald-600' : result.fairnessGap < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {result.fairnessGap > 0 ? `saves ${money(result.fairnessGap)}` : result.fairnessGap < 0 ? `pays ${money(Math.abs(result.fairnessGap))} more` : 'even'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Occupancy bills divide by the number of people sharing that service instead of splitting evenly across everyone.</p>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}