import { useMemo, useState } from 'react'
import { ArrowLeftRight, Calculator, Percent, Repeat } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

type Mode = 'pOfN' | 'nOfM' | 'change' | 'marks'
const TABS: { id: Mode; label: string; icon: typeof Percent }[] = [
  { id: 'pOfN', label: 'P% of N', icon: Percent },
  { id: 'nOfM', label: 'N as % of M', icon: ArrowLeftRight },
  { id: 'change', label: '% change', icon: Repeat },
  { id: 'marks', label: 'Marks', icon: Calculator },
]

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>('pOfN')
  const [first, setFirst] = useState('')
  const [second, setSecond] = useState('')
  const [third, setThird] = useState('')

  const res = useMemo(() => {
    const x = toNumber(first)
    const y = toNumber(second)
    const z = toNumber(third)
    let value = NaN
    let desc = ''
    if (mode === 'pOfN' && Number.isFinite(x) && Number.isFinite(y)) {
      value = (x / 100) * y
      desc = `${first}% of ${second}`
    }
    if (mode === 'nOfM' && Number.isFinite(x) && Number.isFinite(y)) {
      value = y === 0 ? NaN : (x / y) * 100
      desc = `${first} as a share of ${second}`
    }
    if (mode === 'change' && Number.isFinite(x) && Number.isFinite(y)) {
      value = x === 0 ? NaN : ((y - x) / x) * 100
      desc = `${first} → ${second}`
    }
    if (mode === 'marks' && Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
      value = y === 0 ? NaN : (x / y) * z
      desc = `${first}/${second} scaled to ${third}`
    }
    const isPercent = mode === 'nOfM' || mode === 'change'
    return { value, desc, ready: Number.isFinite(value), isPercent }
  }, [mode, first, second, third])

  return (
    <>
      <Seo title="Percentage Calculator - vimz Tools" description="Calculate percentages, marks conversion and percent change instantly." />
      <ToolShell
        title="Percentage Calculator"
        description="Calculate percentages, marks and score conversions."
        icon={<Percent className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Compute percentage, marks conversion and percent change."
      >
        <div className="mx-auto max-w-4xl space-y-5">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${mode === t.id ? 'bg-primary-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mode === 'pOfN' && (
                <>
                  <Field label="Percentage (P)">
                    <TextInput type="number" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="e.g. 15" />
                  </Field>
                  <Field label="Number (N)">
                    <TextInput type="number" value={second} onChange={(e) => setSecond(e.target.value)} placeholder="e.g. 200" />
                  </Field>
                </>
              )}
              {mode === 'nOfM' && (
                <>
                  <Field label="Value (N)">
                    <TextInput type="number" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="e.g. 30" />
                  </Field>
                  <Field label="Total (M)">
                    <TextInput type="number" value={second} onChange={(e) => setSecond(e.target.value)} placeholder="e.g. 120" />
                  </Field>
                </>
              )}
              {mode === 'change' && (
                <>
                  <Field label="From (A)">
                    <TextInput type="number" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="e.g. 50" />
                  </Field>
                  <Field label="To (B)">
                    <TextInput type="number" value={second} onChange={(e) => setSecond(e.target.value)} placeholder="e.g. 65" />
                  </Field>
                </>
              )}
              {mode === 'marks' && (
                <>
                  <Field label="Marks scored">
                    <TextInput type="number" value={first} onChange={(e) => setFirst(e.target.value)} placeholder="e.g. 42" />
                  </Field>
                  <Field label="Out of">
                    <TextInput type="number" value={second} onChange={(e) => setSecond(e.target.value)} placeholder="e.g. 50" />
                  </Field>
                  <Field label="New total">
                    <TextInput type="number" value={third} onChange={(e) => setThird(e.target.value)} placeholder="e.g. 60" />
                  </Field>
                </>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {res.ready ? res.desc : 'Enter the values above to see the result'}
            </p>
            <p className={`mt-3 text-5xl font-extrabold ${res.ready ? 'text-primary-700' : 'text-slate-300'}`}>
              {res.ready ? `${round(res.value, res.isPercent ? 1 : 2)}${res.isPercent ? '%' : ''}` : '—'}
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}