import { useMemo, useState } from 'react'
import type { CellValue, OfficeToolSpec, Values } from './spec'
import { initValues } from './spec'
import { ResultGrid, SummaryBlock, renderCtrl } from './kit'

const TIER_STYLE: Record<string, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
  bad: 'border-rose-200 bg-rose-50 text-rose-800',
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
}

export default function Tier({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const first = results[0]
  const rest = results.slice(1)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {spec.fields.map((f) => renderCtrl(f, v, set))}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Determined tier
        </h3>
        {first ? (
          <div className={`rounded-2xl border px-5 py-6 text-center ${TIER_STYLE[first.tone ?? 'neutral']}`}>
            <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
              {first.label}
            </span>
            <p className="mt-1 text-3xl font-black tracking-tight">{first.value}</p>
            {first.hint ? <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed opacity-80">{first.hint}</p> : null}
          </div>
        ) : null}
        <ResultGrid results={rest} />
        <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
          <span className="text-base leading-none">ℹ</span>
          Tier boundaries and thresholds are specific to this tool's domain and are recomputed live as inputs change.
        </div>
      </div>
    </div>
  )
}