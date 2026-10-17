import { useMemo, useState } from 'react'
import { ChartColumn, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

function sorted(s: string): number[] {
  return s
    .split(/[\s,;]+/)
    .map((t) => parseFloat(t))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
}

function stats(nums: number[]) {
  const arr = nums.length ? [...nums].sort((a, b) => a - b) : []
  const n = arr.length
  const sum = arr.reduce((a, b) => a + b, 0)
  const mean = n ? sum / n : NaN
  const sortedMid = arr
  const range = n ? arr[n - 1] - arr[0] : NaN
  const variance = n ? arr.reduce((a, x) => a + (x - mean) ** 2, 0) / n : NaN
  const min = n ? arr[0] : NaN
  const max = n ? arr[n - 1] : NaN
  const q = (p: number) => {
    if (!n) return NaN
    const pos = (n - 1) * p
    const lo = Math.floor(pos)
    const hi = Math.ceil(pos)
    return arr[lo] + (arr[hi] - arr[lo]) * (pos - lo)
  }
  const q1 = q(0.25)
  const q3 = q(0.75)
  const freq: Record<number, number> = {}
  for (const x of arr) freq[x] = (freq[x] ?? 0) + 1
  const maxF = Math.max(0, ...Object.values(freq))
  const modes = Object.entries(freq).filter(([, f]) => f === maxF && f > 1).map(([k]) => parseFloat(k))
  const sd = Math.sqrt(variance)
  return { n, sum, mean, min, max, range, variance, sd, q1, q3, iqr: q3 - q1, sortedMid, modes }
}

const fmt = (n: number) => (Number.isFinite(n) ? Number(n.toPrecision(6)).toString() : '—')

export default function StatisticsCalculator() {
  const [raw, setRaw] = useState('12, 15, 18, 21, 14, 17, 19')
  const [ran, setRan] = useState(false)

  const nums = useMemo(() => (void ran, sorted(raw)), [raw, ran])
  const s = useMemo(() => stats(nums), [nums])

  const cards = [
    { label: 'Count', value: s.n },
    { label: 'Sum', value: fmt(s.sum) },
    { label: 'Mean', value: fmt(s.mean) },
    { label: 'Median', value: fmt(s.sortedMid.length ? (s.sortedMid[Math.floor((s.sortedMid.length - 1) / 2)] + s.sortedMid[Math.ceil((s.sortedMid.length - 1) / 2)]) / 2 : NaN) },
    { label: 'Mode', value: s.modes.length ? s.modes.join(', ') : 'none' },
    { label: 'Min / Max', value: `${fmt(s.min)} / ${fmt(s.max)}` },
    { label: 'Range', value: fmt(s.range) },
    { label: 'Variance', value: fmt(s.variance) },
    { label: 'Std deviation', value: fmt(s.sd) },
    { label: '1st quartile', value: fmt(s.q1) },
    { label: '3rd quartile', value: fmt(s.q3) },
    { label: 'IQR', value: fmt(s.iqr) },
  ]

  return (
    <>
      <Seo
        title="Statistics Calculator - vimz Tools"
        description="Compute mean, median, mode, variance, quartiles and more from any dataset."
      />
      <ToolShell
        title="Statistics Calculator"
        description="Compute descriptive statistics for any dataset, from counts to quartiles."
        icon={<ChartColumn className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Paste numbers separated by spaces, commas or newlines, then read the summary."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Dataset">
              <TextArea rows={6} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="12, 15, 18, 21, 14" />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={nums.length === 0}>
              <Wand2 className="h-4 w-4" /> Calculate
            </Button>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sorted values</p>
              <p className="font-mono text-sm leading-relaxed text-slate-600">
                {s.sortedMid.length ? s.sortedMid.join(', ') : '—'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {nums.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {cards.map((c) => (
                    <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold text-slate-400">{c.label}</p>
                      <p className="mt-1 font-mono text-lg font-bold text-slate-800">{c.value}</p>
                    </div>
                  ))}
                </div>
                <CodeBlock
                  title="Summary (copyable)"
                  code={cards.map((c) => `${c.label}: ${c.value}`).join('\n')}
                  lang="plain"
                />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Statistics will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}