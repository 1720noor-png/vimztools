import { useMemo, useState } from 'react'
import type { CellValue, OfficeToolSpec, ToolResult, Values } from './spec'
import { clamp, initValues } from './spec'
import { ResultGrid, SummaryBlock, renderCtrl } from './kit'

function parsePercent(r: ToolResult | undefined): number {
  if (!r) return 0
  const m = typeof r.value === 'string' ? r.value.match(/-?\d+(\.\d+)?/) : null
  return m ? Number(m[0]) : 0
}

function Gauge({ pct, label }: { pct: number; label: string }) {
  const c = Math.round(clamp(pct, 0, 100))
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center">
      <div className="relative mx-auto h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="11"
          />
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="#6366f1"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${c * 3.016} 302`}
          />
          <text
            x="60"
            y="70"
            textAnchor="middle"
            className="fill-slate-900"
            style={{ fontSize: 26, fontWeight: 800 }}
          >
            {c}%
          </text>
        </svg>
      </div>
      <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}

export default function Index({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const first = results[0]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {spec.fields.map((f) => renderCtrl(f, v, set))}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Index gauge
        </h3>
        <Gauge pct={parsePercent(first)} label={first?.label ?? 'Index'} />
        <ResultGrid results={results.slice(1)} />
        <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
          <span className="text-base leading-none">ℹ</span>
          The gauge reads this tool's headline rate; supporting metrics refresh live below.
        </div>
      </div>
    </div>
  )
}