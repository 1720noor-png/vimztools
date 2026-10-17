import { useMemo, useState } from 'react'
import { TrendingUp, Timer, Banknote } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { money, toNumber } from '../../../lib/numbers'

export default function OvertimeCalculator() {
  const [rate, setRate] = useState('25')
  const [regular, setRegular] = useState('40')
  const [overtime, setOvertime] = useState('5')
  const [mult, setMult] = useState('1.5')

  const result = useMemo(() => {
    const r = toNumber(rate)
    const rg = toNumber(regular)
    const ot = toNumber(overtime)
    const m = toNumber(mult)
    const valid = Number.isFinite(r) && r >= 0
    const regPay = valid && Number.isFinite(rg) && rg >= 0 ? r * rg : 0
    const otRate = valid && Number.isFinite(m) ? r * m : 0
    const otPay = valid && Number.isFinite(ot) && ot >= 0 ? otRate * ot : 0
    return { r, regPay, otRate, otPay, total: regPay + otPay }
  }, [rate, regular, overtime, mult])

  return (
    <>
      <Seo title="Overtime Calculator - vimz Tools" description="Calculate overtime pay at 1.5x or 2x your rate." />
      <ToolShell
        title="Overtime Calculator"
        description="Calculate overtime pay at 1.5x or 2x your rate."
        icon={<TrendingUp className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Enter your rate and overtime hours for total pay."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800">Your hours</h3>
            <Field label="Hourly rate ($)">
              <TextInput type="number" min={0} step={0.01} value={rate} onChange={(e) => setRate(e.target.value)} />
            </Field>
            <Field label="Regular hours">
              <TextInput type="number" min={0} value={regular} onChange={(e) => setRegular(e.target.value)} />
            </Field>
            <Field label="Overtime hours">
              <TextInput type="number" min={0} value={overtime} onChange={(e) => setOvertime(e.target.value)} />
            </Field>
            <Field label="Overtime multiplier">
              <Select value={mult} onChange={(e) => setMult(e.target.value)}>
                <option value="1.5">1.5× (standard)</option>
                <option value="2">2× (double time)</option>
              </Select>
            </Field>
          </section>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <Timer className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Regular pay</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{money(result.regPay)}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <TrendingUp className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                <p className="text-[11px] font-semibold uppercase text-amber-500">Overtime pay</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-700">{money(result.otPay)}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <Banknote className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase text-emerald-500">Total pay</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">{money(result.total)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="text-xs text-slate-400">Effective OT rate</p>
                <p className="mt-1 text-lg font-bold text-slate-800">${money(result.otRate)}/hr</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="text-xs text-slate-400">OT premium</p>
                <p className="mt-1 text-lg font-bold text-slate-800">+{money(result.otRate - result.r)}/hr</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="text-xs text-slate-400">Pay multiplier applied</p>
                <p className="mt-1 text-lg font-bold text-primary-700">{Number.isFinite(toNumber(mult)) ? `×${toNumber(mult)}` : '—'}</p>
              </div>
            </div>

            {result.total > 0 && (
              <div className="mt-5 rounded-2xl border border-primary-200 bg-primary-50 p-4">
                <p className="text-xs font-semibold uppercase text-primary-500">Takeaway</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  At ${money(result.r)}/hr, working {overtime || 0} overtime hours earns you an extra{' '}
                  <span className="font-bold text-primary-800">{money(result.otPay)}</span> on top of{' '}
                  <span className="font-bold text-primary-800">{money(result.regPay)}</span> in regular pay.
                </p>
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}