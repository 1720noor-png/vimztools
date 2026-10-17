import { useMemo, useState } from 'react'
import { Scale, ArrowUpRight, ArrowRight, BadgeDollarSign } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, money, round, toNumber } from '../../../lib/numbers'

export default function SalaryNegotiationCalculator() {
  const [offered, setOffered] = useState('85000')
  const [min, setMin] = useState('75000')
  const [max, setMax] = useState('100000')

  const result = useMemo(() => {
    const o = toNumber(offered)
    const lo = toNumber(min)
    const hi = toNumber(max)
    const valid = Number.isFinite(lo) && Number.isFinite(hi) && lo > 0 && hi > lo
    const mid = valid ? (lo + hi) / 2 : 0
    const askBase = valid ? round(mid * 0.97, -2) : 0
    const askMid = valid ? round(mid, -2) : 0
    const askTop = valid ? round(clamp(mid * 1.05, mid, hi), -2) : 0
    const pos = valid && Number.isFinite(o) ? ((o - lo) / (hi - lo)) * 100 : 0
    const status =
      !Number.isFinite(o)
        ? 'Enter the offer to compare it'
        : !valid
          ? 'Set a valid market range first'
          : o < lo
            ? 'Below market'
            : o > hi
              ? 'Above market'
              : o < mid
                ? 'Below the market midpoint'
                : o > mid
                  ? 'Above the market midpoint'
                  : 'Right at the market midpoint'
    const tone =
      status === 'Below market' ? 'text-rose-600 bg-rose-50 border-rose-200'
        : status === 'Above market' ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
          : 'text-primary-700 bg-primary-50 border-primary-200'
    return { o, lo, hi, mid, askBase, askMid, askTop, pos, status, tone, valid }
  }, [offered, min, max])

  return (
    <>
      <Seo title="Salary Negotiation Calculator - vimz Tools" description="Compare offers and calculate a fair ask range." />
      <ToolShell
        title="Salary Negotiation Calculator"
        description="Compare offers and calculate a fair ask range."
        icon={<Scale className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Compare an offer with market range to find a fair ask."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800">Offer & market</h3>
            <Field label="Offered salary ($)">
              <TextInput type="number" min={0} value={offered} onChange={(e) => setOffered(e.target.value)} />
            </Field>
            <Field label="Market range low ($)">
              <TextInput type="number" min={0} value={min} onChange={(e) => setMin(e.target.value)} />
            </Field>
            <Field label="Market range high ($)">
              <TextInput type="number" min={0} value={max} onChange={(e) => setMax(e.target.value)} />
            </Field>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${result.tone}`}>
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">Offer position: {result.status}</p>
                  <p className="text-xs opacity-80">
                    Midpoint is {money(result.mid)} · offer is {money(result.o)} ({Number.isFinite(result.pos) ? `${clamp(result.pos, 0, 100).toFixed(0)}%` : '—'} through the range)
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Base ask</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{money(result.askBase)}</p>
                <p className="text-xs text-slate-400">confident floor</p>
              </div>
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
                <BadgeDollarSign className="mx-auto mb-1 h-5 w-5 text-primary-600" />
                <p className="text-[11px] font-semibold uppercase text-primary-500">Fair ask</p>
                <p className="mt-1 text-2xl font-extrabold text-primary-800">{money(result.askMid)}</p>
                <p className="text-xs text-primary-400">market midpoint</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <ArrowUpRight className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
                <p className="text-[11px] font-semibold uppercase text-emerald-500">Stretch ask</p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">{money(result.askTop)}</p>
                <p className="text-xs text-emerald-400">backed by top-of-range</p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex justify-between text-xs font-semibold text-slate-400">
                <span>Range low {money(result.lo)}</span>
                <span>Range high {money(result.hi)}</span>
              </div>
              <div className="relative h-3 rounded-full bg-slate-100">
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-primary-500" />
                <div
                  className="absolute inset-y-0 w-2 rounded-full bg-slate-800"
                  style={{ left: `${clamp(result.pos, 0, 100)}%`, transform: 'translateX(-50%)' }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">The dark marker shows your offer within the market range.</p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}