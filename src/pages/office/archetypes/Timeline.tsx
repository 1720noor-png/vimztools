import { useMemo, useState } from 'react'
import type { CellValue, DateField, MatrixField, OfficeToolSpec, Values } from './spec'
import { asMatrix, asStr, initValues } from './spec'
import { Ctrl, DateInput, ResultCard, SummaryBlock } from './kit'

function addDays(iso: string, n: number): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + Math.round(n))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Timeline({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const df = spec.fields.find((f) => f.kind === 'date') as DateField | undefined
  const mf = spec.fields.find((f) => f.kind === 'matrix') as MatrixField | undefined
  const M = mf ? asMatrix(v[mf.key]) : []
  const start = df ? asStr(v[df.key]) : ''
  const setCell = (m: MatrixField, r: number, c: number, x: number) => {
    const next = M.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? x : cell)) : row))
    set(m.key, next)
  }
  const total = M.reduce((s, row) => s + (row[0] || 0), 0)
  const max = Math.max(1, total)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {df ? (
          <Ctrl label={df.label}>
            <DateInput value={start} onChange={(x) => set(df.key, x)} />
          </Ctrl>
        ) : null}
        {mf ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {mf.label}
            </div>
            <ul className="divide-y divide-slate-100">
              {mf.rows.map((rowName, r) => (
                <li key={rowName} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-700">{rowName}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        value={M[r]?.[0] ?? 0}
                        onChange={(e) => setCell(mf, r, 0, e.target.value === '' ? 0 : Number(e.target.value))}
                      />
                      <span className="w-16 text-xs text-slate-500">days{` `}after</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(100, ((M[r]?.[0] ?? 0) / max) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{addDays(start, M[r]?.[0] ?? 0)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Milestones
        </h3>
        {results.map((r, i) => (
          <ResultCard key={i} r={r} />
        ))}
      </div>
    </div>
  )
}