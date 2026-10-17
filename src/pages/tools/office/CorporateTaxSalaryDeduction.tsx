import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  History,
  Info,
  Landmark,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  createSalaryTaxBreakdown,
  deleteSalaryTaxBreakdown,
  getTaxBrackets,
  listSalaryTaxBreakdowns,
  OFFICE_COUNTRIES,
  type SalaryTaxBreakdown,
} from '../../../lib/officeApi'

const CURRENCY_SYMBOL: Record<string, string> = { GHS: 'GH₵', USD: '$' }

function amt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'
}

function amt2(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'
}

interface SlabRow {
  from_amount: number
  to_amount: number | null
  rate: number
}

interface BracketUnit {
  country_code: string
  currency: string
}

interface BracketState {
  unit: BracketUnit | null
  rows: SlabRow[]
}

function emptyBracket(): BracketState {
  return { unit: null, rows: [] }
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}

export default function CorporateTaxSalaryDeduction() {
  const [country, setCountry] = useState('gh')
  const [reloadTick, setReloadTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [brackets, setBrackets] = useState<BracketState>(emptyBracket())
  const [history, setHistory] = useState<SalaryTaxBreakdown[]>([])
  const [result, setResult] = useState<SalaryTaxBreakdown | null>(null)
  const [formError, setFormError] = useState('')

  const [label, setLabel] = useState('')
  const [grossMonthly, setGrossMonthly] = useState('8000')
  const [pensionRate, setPensionRate] = useState('5.5')
  const [employerPensionRate, setEmployerPensionRate] = useState('13.5')
  const [employerLevyRate, setEmployerLevyRate] = useState('3.5')
  const [exemption, setExemption] = useState('0')

  const currency = useMemo(() => {
    const c = OFFICE_COUNTRIES.find((x) => x.code === country)
    return c?.currency ?? 'USD'
  }, [country])
  const symbol = CURRENCY_SYMBOL[currency] ?? currency + ' '

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [b, rows] = await Promise.all([getTaxBrackets(country), listSalaryTaxBreakdowns()])
        if (cancelled) return
        setBrackets({
          unit: { country_code: b.country_code, currency: b.currency },
          rows: b.slabs,
        })
        setHistory(rows)
        setOffline(false)
      } catch {
        if (!cancelled) setOffline(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [country, reloadTick])

  const changeCountry = (code: string) => {
    if (code === country) return
    setCountry(code)
    setLoading(true)
    setResult(null)
    setFormError('')
  }

  const retry = () => {
    setOffline(false)
    setLoading(true)
    setReloadTick((t) => t + 1)
  }

  const calc = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    const gross = parseFloat(grossMonthly)
    if (!Number.isFinite(gross) || gross <= 0) {
      setFormError('Enter a gross monthly salary above zero.')
      return
    }
    if (brackets.rows.length === 0) {
      setFormError('No tax slabs are loaded. Reconnect and retry.')
      return
    }
    setBusy(true)
    const payload = {
      label: label.trim() || 'Salary estimate',
      country_code: country,
      currency,
      gross_monthly: gross,
      pension_rate: parseFloat(pensionRate) || 0,
      employer_pension_rate: parseFloat(employerPensionRate) || 0,
      employer_levy_rate: parseFloat(employerLevyRate) || 0,
      non_taxable_exemption: parseFloat(exemption) || 0,
    }
    createSalaryTaxBreakdown(payload)
      .then((saved) => {
        setResult(saved)
        setHistory((prev) => [saved, ...prev.filter((h) => h.id !== saved.id)])
        return listSalaryTaxBreakdowns()
      })
      .then((rows) => setHistory(rows))
      .catch(() => {
        setOffline(true)
        setFormError('The calculation could not be saved - the server is unreachable.')
      })
      .finally(() => setBusy(false))
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this saved calculation?')) return
    try {
      await deleteSalaryTaxBreakdown(id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
      setResult((prev) => (prev?.id === id ? null : prev))
    } catch {
      setOffline(true)
    }
  }

  return (
    <>
      <Seo
        title="Corporate Tax & Salary Deduction Breakdown - vimz Tools"
        description="Compute PAYE income tax, pension and corporate retention from live tax slabs, and review every saved calculation."
      />
      <ToolShell
        title="Corporate Tax & Salary Deduction Breakdown"
        description="Model a salary: the server applies the country tax brackets to gross pay and returns income tax, pension and employer contribution totals."
        icon={<Landmark className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Enter gross monthly pay, pick a country registry and calculate against live tax slabs"
      >
        {offline && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                The live salary database is unreachable, so slabs cannot be loaded right now.
              </p>
            </div>
            <Button variant="secondary" className="px-3 py-2 text-xs" onClick={retry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry connection
            </Button>
          </div>
        )}

        {loading ? (
          <HybridLoader label="Loading tax brackets and saved calculations…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="space-y-4">
              <form onSubmit={calc} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Calculator className="h-4 w-4 text-primary-600" /> Salary inputs
                  </h3>
                  {brackets.unit && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                      registry {brackets.unit.country_code.toUpperCase()} · {brackets.unit.currency}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Reference label">
                      <TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Salary estimate" />
                    </Field>
                  </div>
                  <Field label="Country tax registry">
                    <Select value={country} onChange={(e) => changeCountry(e.target.value)}>
                      {OFFICE_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={`Gross monthly (${currency})`}>
                    <TextInput type="number" min={0} step="any" value={grossMonthly} onChange={(e) => setGrossMonthly(e.target.value)} />
                  </Field>
                  <Field label="Employee pension (%)">
                    <TextInput type="number" min={0} max={50} step="any" value={pensionRate} onChange={(e) => setPensionRate(e.target.value)} />
                  </Field>
                  <Field label="Employer pension (%)">
                    <TextInput type="number" min={0} max={50} step="any" value={employerPensionRate} onChange={(e) => setEmployerPensionRate(e.target.value)} />
                  </Field>
                  <Field label="Employer levy (%)">
                    <TextInput type="number" min={0} max={50} step="any" value={employerLevyRate} onChange={(e) => setEmployerLevyRate(e.target.value)} />
                  </Field>
                  <Field label="Annual non-taxable exemption">
                    <TextInput type="number" min={0} step="any" value={exemption} onChange={(e) => setExemption(e.target.value)} />
                  </Field>
                </div>

                {formError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <p className="text-xs text-rose-700">{formError}</p>
                  </div>
                )}

                <Button type="submit" variant="primary" className="mt-4 w-full" disabled={busy || offline}>
                  <Save className="h-4 w-4" /> {busy ? 'Calculating…' : 'Calculate & save breakdown'}
                </Button>

                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Tax brackets in use</p>
                  <ul className="space-y-0.5">
                    {brackets.rows.map((r) => (
                      <li key={r.from_amount} className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-mono">
                          {amt(r.from_amount)} - {r.to_amount === null ? '∞' : amt(r.to_amount)}
                        </span>
                        <span className="font-bold">{r.rate}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <History className="h-4 w-4 text-primary-600" /> Saved calculations
                </h3>
                {history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                    No saved calculations yet - run one above and it appears here.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                    {history.slice(0, 15).map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{h.label ?? 'Salary estimate'}</p>
                          <p className="text-[11px] text-slate-400">
                            {h.country_code.toUpperCase()} · gross {symbol}
                            {amt(h.gross_monthly)}/mo · tax {symbol}
                            {amt(h.income_tax_monthly)}/mo · net {symbol}
                            {amt(h.net_monthly)}/mo
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setResult(h)}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => void remove(h.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" /> Latest breakdown
                  </h3>
                  {result && (
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
                      {result.label ?? 'Salary estimate'}
                    </span>
                  )}
                </div>
                {!result ? (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <Landmark className="mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-400">Run a calculation to see the full tax and pension breakdown here.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                      <Stat label="Gross annual" value={`${symbol}${amt(result.gross_annual)}`} sub={`${symbol}${amt2(result.gross_monthly)} / month`} />
                      <Stat label="Income tax" value={`${symbol}${amt(result.income_tax_annual)}`} sub={`${symbol}${amt2(result.income_tax_monthly)} / month`} />
                      <Stat label="Effective rate" value={`${result.effective_tax_rate.toFixed(2)}%`} sub="tax over gross" />
                      <Stat label="Net pay" value={`${symbol}${amt(result.net_annual)}`} sub={`${symbol}${amt2(result.net_monthly)} / month`} />
                      <Stat label="Pension (emp / er)" value={`${symbol}${amt(result.pension_emp_annual)} / ${symbol}${amt(result.pension_er_annual)}`} sub="per year" />
                      <Stat label="Employer total cost" value={`${symbol}${amt(result.employer_total_cost_annual)}`} sub={`${symbol}${amt2(result.employer_total_cost_monthly)} / month`} />
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Progressive tax slabs applied</p>
                      {result.slabs.length === 0 ? (
                        <p className="text-xs text-slate-400">Taxable income fell into the exempt band.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-400">
                                <th className="py-1.5 pr-2">Band</th>
                                <th className="py-1.5 pr-2 text-right">Rate</th>
                                <th className="py-1.5 pr-2 text-right">Taxable in band</th>
                                <th className="py-1.5 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.slabs.map((s, i) => (
                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                  <td className="py-1.5 pr-2 font-mono text-slate-600">
                                    {amt(s.from_amount)} - {s.to_amount === null ? '∞' : amt(s.to_amount)}
                                  </td>
                                  <td className="py-1.5 pr-2 text-right font-bold text-slate-700">{s.rate}%</td>
                                  <td className="py-1.5 pr-2 text-right font-mono text-slate-600">{amt(s.band_income)}</td>
                                  <td className="py-1.5 text-right font-mono text-slate-800">{amt(s.amount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Figures follow the progressive brackets and rates stored in the database for the selected registry.
                      They are estimates - always confirm with your payroll or tax advisor.
                    </p>
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}