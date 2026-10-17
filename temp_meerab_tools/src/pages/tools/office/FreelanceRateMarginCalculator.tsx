import { useMemo, useState } from 'react'
import { AlertTriangle, CircleDollarSign, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import CodeBlock from '../../../components/ui/CodeBlock'
import { Field, Select, TextInput } from '../../../components/ui/Fields'

function money(cur: string, n: number): string {
  return `${cur} ${Math.round(n).toLocaleString('en-US')}`
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

export default function FreelanceRateMarginCalculator() {
  const [mode, setMode] = useState<'freelance' | 'agency'>('freelance')
  const [currency, setCurrency] = useState('USD')

  const [targetAnnual, setTargetAnnual] = useState('120000')
  const [workWeeks, setWorkWeeks] = useState('46')
  const [hoursPerWeek, setHoursPerWeek] = useState('40')
  const [taxRate, setTaxRate] = useState('25')
  const [overhead, setOverhead] = useState('20')
  const [profitMargin, setProfitMargin] = useState('15')

  const [clientRate, setClientRate] = useState('50')
  const [billableHours, setBillableHours] = useState('160')
  const [salaryMonthly, setSalaryMonthly] = useState('6000')
  const [employerCosts, setEmployerCosts] = useState('18')
  const [targetMargin, setTargetMargin] = useState('25')

  const cur = currency === 'GHS' ? 'GHS' : 'USD'

  const freelance = useMemo(() => {
    const t = Number(targetAnnual) || 0
    const w = Number(workWeeks) || 0
    const h = Number(hoursPerWeek) || 0
    const tx = Number(taxRate) || 0
    const oh = Number(overhead) || 0
    const pm = Number(profitMargin) || 0
    const billableHours = w * h
    const salary = t / (1 - tx / 100)
    const businessCosts = salary * (oh / 100)
    const requiredRevenue = salary + businessCosts
    const price = pm >= 100 ? requiredRevenue : requiredRevenue / (1 - pm / 100)
    const hourlyRate = billableHours > 0 ? price / billableHours : 0
    const monthlyTake = salary / 12
    return {
      billableHours,
      salary,
      businessCosts,
      requiredRevenue,
      price,
      hourlyRate,
      monthlyTake,
      monthlyRev: price / 12,
      cushionPct: requiredRevenue > 0 ? Math.round(((price - requiredRevenue) / requiredRevenue) * 100) : 0,
      valid: billableHours > 0 && t > 0,
    }
  }, [targetAnnual, workWeeks, hoursPerWeek, taxRate, overhead, profitMargin])

  const agency = useMemo(() => {
    const cr = Number(clientRate) || 0
    const hh = Number(billableHours) || 0
    const s = Number(salaryMonthly) || 0
    const ec = Number(employerCosts) || 0
    const tm = Number(targetMargin) || 0
    const monthlyRevenue = cr * hh
    const employerCost = s * (ec / 100)
    const totalCost = s + employerCost
    const margin = monthlyRevenue - totalCost
    const marginPct = monthlyRevenue > 0 ? (margin / monthlyRevenue) * 100 : 0
    const recommended = tm >= 100 ? monthlyRevenue : totalCost / (1 - tm / 100)
    const requiredRate = hh > 0 ? recommended / hh : 0
    const missing = marginPct < tm ? tm - marginPct : 0
    return {
      monthlyRevenue,
      employerCost,
      totalCost,
      margin,
      marginPct,
      requiredRate,
      recommended,
      missing,
      annualRevenue: monthlyRevenue * 12,
      annualCost: totalCost * 12,
      valid: monthlyRevenue > 0 && s > 0 && hh > 0,
    }
  }, [clientRate, billableHours, salaryMonthly, employerCosts, targetMargin])

  const jsonSummary = useMemo(() => {
    if (mode === 'freelance') {
      return JSON.stringify(
        {
          currency: cur,
          targetAnnualTakeHome: Math.round(freelance.salary),
          chargeableHoursPerYear: freelance.billableHours,
          impliedBaseSalary: Math.round(freelance.salary),
          annualBusinessCosts: Math.round(freelance.businessCosts),
          requiredAnnualRevenue: Math.round(freelance.requiredRevenue),
          marginTargetPercent: Number(profitMargin) || 0,
          priceIncludingProfit: Math.round(freelance.price),
          suggestedHourlyRate: Number(freelance.hourlyRate.toFixed(2)),
          estimatedMonthlyTakeHome: Math.round(freelance.monthlyTake),
        },
        null,
        2,
      )
    }
    return JSON.stringify(
      {
        currency: cur,
        clientRatePerHour: Number(clientRate) || 0,
        billableHoursPerMonth: Number(billableHours) || 0,
        monthlyClientBilling: Math.round(agency.monthlyRevenue),
        monthlySalary: Number(salaryMonthly) || 0,
        employerCostShare: Math.round(agency.employerCost),
        monthlyTotalCost: Math.round(agency.totalCost),
        grossMarginPerMonth: Math.round(agency.margin),
        marginPercent: Number(agency.marginPct.toFixed(2)),
        requiredClientRateForTarget: Number(agency.requiredRate.toFixed(2)),
        annualizedRevenue: Math.round(agency.annualRevenue),
        annualizedCost: Math.round(agency.annualCost),
      },
      null,
      2,
    )
  }, [mode, freelance, agency, cur, profitMargin, clientRate, billableHours, salaryMonthly])

  return (
    <>
      <Seo
        title="Freelance & Agency Rate & Margin Calculator - vimz Tools"
        description="Work out a target hourly rate from your annual take-home, and check agency gross margin against a target with a recommended client rate."
      />
      <ToolShell
        title="Freelance & Agency Rate & Margin Calculator"
        description="Price your work: convert a target annual take-home into an hourly rate, or validate an agency deal against a margin target."
        icon={<TrendingUp className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Enter your targets or current rates to get numbers you can negotiate with"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setMode('freelance')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${mode === 'freelance' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Freelance rate
          </button>
          <button
            onClick={() => setMode('agency')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${mode === 'agency' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Agency margin
          </button>
          <div className="ml-auto">
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-28">
              <option value="USD">USD</option>
              <option value="GHS">GHS</option>
            </Select>
          </div>
        </div>

        {mode === 'freelance' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CircleDollarSign className="h-4 w-4 text-primary-600" /> Your assumptions
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Annual take-home you want">
                  <TextInput type="number" min={0} value={targetAnnual} onChange={(e) => setTargetAnnual(e.target.value)} />
                </Field>
                <Field label="Tax rate (%)">
                  <TextInput type="number" min={0} max={100} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                </Field>
                <Field label="Billable weeks per year">
                  <TextInput type="number" min={0} value={workWeeks} onChange={(e) => setWorkWeeks(e.target.value)} />
                </Field>
                <Field label="Hours per week">
                  <TextInput type="number" min={0} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} />
                </Field>
                <Field label="Overhead & costs (%)">
                  <TextInput type="number" min={0} value={overhead} onChange={(e) => setOverhead(e.target.value)} />
                </Field>
                <Field label="Profit margin target (%)">
                  <TextInput type="number" min={0} value={profitMargin} onChange={(e) => setProfitMargin(e.target.value)} />
                </Field>
              </div>
              {!freelance.valid && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <p className="text-xs text-rose-700">Set a take-home amount and at least one billable week to get a rate.</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Suggested hourly rate" value={money(cur, freelance.hourlyRate)} hint="covers salary, costs and profit" />
                <Stat label="Monthly billing" value={money(cur, freelance.monthlyRev)} hint="to hit the annual target" />
                <Stat label="Monthly take-home" value={money(cur, freelance.monthlyTake)} hint="after implied tax" />
                <Stat label="Cushion vs costs" value={`+${freelance.cushionPct}%`} hint="headroom on top of costs" />
              </div>
              <CodeBlock title="Numbers to copy" code={jsonSummary} lang="json" />
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CircleDollarSign className="h-4 w-4 text-primary-600" /> Your deal
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Client rate / hour">
                  <TextInput type="number" min={0} value={clientRate} onChange={(e) => setClientRate(e.target.value)} />
                </Field>
                <Field label="Billable hours / month">
                  <TextInput type="number" min={0} value={billableHours} onChange={(e) => setBillableHours(e.target.value)} />
                </Field>
                <Field label="Developer salary / month">
                  <TextInput type="number" min={0} value={salaryMonthly} onChange={(e) => setSalaryMonthly(e.target.value)} />
                </Field>
                <Field label="Employer costs (%)">
                  <TextInput type="number" min={0} value={employerCosts} onChange={(e) => setEmployerCosts(e.target.value)} />
                </Field>
                <Field label="Target margin (%)">
                  <TextInput type="number" min={0} value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} />
                </Field>
              </div>
              {!agency.valid && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <p className="text-xs text-rose-700">Enter a client rate, hours and a salary to read the margin.</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Monthly billing" value={money(cur, agency.monthlyRevenue)} hint={`${billableHours || 0} h x ${clientRate || 0}`} />
                <Stat label="Gross margin" value={`${agency.marginPct.toFixed(1)}%`} hint={money(cur, agency.margin)} />
                <Stat label="Recommended client rate" value={money(cur, agency.requiredRate)} hint={agency.requiredRate > 0 ? 'to reach target margin' : 'fill in the deal first'} />
                <Stat label="Annualized" value={`${money(cur, agency.annualRevenue)} / ${money(cur, agency.annualCost)}`} hint="billing vs cost" />
              </div>
              {agency.valid && agency.marginPct < (Number(targetMargin) || 0) && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-xs text-amber-800">
                    This deal runs at {agency.marginPct.toFixed(1)}% - {agency.missing.toFixed(1)} points under your {targetMargin || 0}%
                    target. Raise the rate to {money(cur, agency.requiredRate)} per hour to hit target.
                  </p>
                </div>
              )}
              <CodeBlock title="Numbers to copy" code={jsonSummary} lang="json" />
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}