import { useMemo, useState } from 'react'
import { UserCheck, Minus, Plus, Calculator } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

function fmt(n: number) {
  return Number.isFinite(n) ? Number(n.toFixed(2)).toString() : '—'
}

export default function AttendanceCalculator() {
  const [total, setTotal] = useState('40')
  const [attended, setAttended] = useState('31')
  const [target, setTarget] = useState('75')

  const T = parseFloat(total)
  const A = parseFloat(attended)
  const G = parseFloat(target)

  const r = useMemo(() => {
    if (!Number.isFinite(T) || !Number.isFinite(A) || T <= 0 || A < 0 || A > T) return null
    const pct = (A / T) * 100
    const below = (G ?? 75) > pct
    const need = below ? Math.ceil(((G ?? 75) * T - 100 * A) / (100 - (G ?? 75))) : 0
    const canMiss = !below ? Math.floor((100 * A - (G ?? 75) * T) / (G ?? 75)) : 0
    const afterMiss = below ? null : ((A - canMiss) / T) * 100
    const toReach: Array<{ m: number; p: number }> = []
    if (below) for (let m = 1; m <= Math.min(need, 8); m++) toReach.push({ m, p: ((A + m) / (T + m)) * 100 })
    return { pct, below, need, canMiss, afterMiss, toReach }
  }, [T, A, G])

  return (
    <>
      <Seo
        title="Attendance Calculator - vimz Tools"
        description="Check your attendance percentage, classes you can miss and how many you must attend."
      />
      <ToolShell
        title="Attendance Calculator"
        description="See your attendance percentage, how many classes you can miss, and what is needed."
        icon={<UserCheck className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter classes held, classes attended and the required threshold, then read the plan."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Classes held">
                <TextInput type="number" min={1} value={total} onChange={(e) => setTotal(e.target.value)} />
              </Field>
              <Field label="Classes attended">
                <TextInput type="number" min={0} value={attended} onChange={(e) => setAttended(e.target.value)} />
              </Field>
              <Field label="Threshold %">
                <TextInput type="number" min={0} max={100} value={target} onChange={(e) => setTarget(e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAttended((v) => String(Math.max(0, (parseFloat(v) || 0) + 1)))}>
                <Plus className="h-4 w-4" /> Attended +
              </Button>
              <Button variant="secondary" onClick={() => setAttended((v) => String(Math.max(0, (parseFloat(v) || 0) - 1)))}>
                <Minus className="h-4 w-4" /> Attended −
              </Button>
            </div>
            {r === null && (Number.isFinite(T) && T > 0) && A > T && (
              <p className="text-sm font-medium text-rose-600">Attended cannot exceed classes held.</p>
            )}
          </div>

          <div className="space-y-4">
            {r ? (
              <>
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-500">Attendance</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-sm font-extrabold ${r.below ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {fmt(r.pct)}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                    <div className={`h-full rounded-full transition-all ${r.below ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, r.pct)}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>0</span><span>target {fmt(G)}%</span><span>100</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    {r.below
                      ? `Attend at least the next ${r.need} class${r.need === 1 ? '' : 'es'} to reach ${fmt(G)}%.`
                      : `You can miss up to ${r.canMiss} class${r.canMiss === 1 ? '' : 'es'} and stay at ${fmt(G)}%.`}
                  </p>
                </div>

                {r.toReach.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Climbing back</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.toReach.map((row) => (
                        <span key={row.m} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          +{row.m} &rarr; {fmt(row.p)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <CodeBlock
                  title="Summary"
                  code={`Attendance: ${fmt(r.pct)}%\n${r.below ? `Classes to attend next: ${r.need}` : `Classes you may miss: ${r.canMiss}`}\nAfter that: about ${fmt(r.afterMiss ?? r.pct)}%`}
                  lang="plain"
                />
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calculator className="h-3.5 w-3.5" /> Uses the standard formula: percentage = attended ÷ held × 100.
                </p>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your attendance plan will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}