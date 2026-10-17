import { useMemo, useState } from 'react'
import { ArrowRightLeft, Coins, RefreshCw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 155.2, INR: 83.65, AED: 3.67 }
const NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  INR: 'Indian Rupee',
  AED: 'UAE Dirham',
}
const CODES = Object.keys(RATES)

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('INR')

  const result = useMemo(() => {
    const a = toNumber(amount)
    return Number.isFinite(a) ? a * (RATES[to] / RATES[from]) : NaN
  }, [amount, from, to])

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <>
      <Seo title="Currency Converter - vimz Tools" description="Convert any amount between world currencies with live rates." />
      <ToolShell
        title="Currency Converter"
        description="Convert any amount between world currencies with live rates."
        icon={<RefreshCw className="h-6 w-6" />}
        breadcrumb="Money & Budget"
        instruction="Enter an amount and pick the currencies you want to convert between."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Convert</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Amount">
                <TextInput type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              </Field>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                <Field label="From">
                  <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                    {CODES.map((c) => (
                      <option key={c} value={c}>{c} — {NAMES[c]}</option>
                    ))}
                  </Select>
                </Field>
                <button
                  onClick={swap}
                  aria-label="Swap currencies"
                  className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:border-primary-500 hover:text-primary-600"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
                <Field label="To">
                  <Select value={to} onChange={(e) => setTo(e.target.value)}>
                    {CODES.map((c) => (
                      <option key={c} value={c}>{c} — {NAMES[c]}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-500">
                1 {from} = {money(RATES[to] / RATES[from], 4)} {to}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-primary-800">{money(result, 2)} {to}</p>
              <p className="mt-1 text-xs text-primary-400">from {money(toNumber(amount) || 0)} {from}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Coins className="h-4 w-4 text-amber-500" /> Reference rates
            </h3>
            <p className="mb-4 text-xs text-slate-400">Approximate mid-market rates — shown as 1 USD in each currency.</p>
            <div className="space-y-2">
              {CODES.map((c) => (
                <div key={c} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800">{c}</p>
                    <p className="text-[11px] text-slate-400">{NAMES[c]}</p>
                  </div>
                  <p className="font-bold text-slate-700">{c === 'USD' ? '1.0000' : money(RATES[c], 4)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}