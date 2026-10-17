import { useMemo, useState } from 'react'
import type { CellValue, MatrixField, OfficeToolSpec, Values } from './spec'
import { asMatrix, initValues } from './spec'
import { Ctrl, NumInput, ResultGrid, SelInput, SummaryBlock } from './kit'

export default function Matrix({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const mf = spec.fields.find((f) => f.kind === 'matrix') as MatrixField | undefined
  const M = mf ? asMatrix(v[mf.key]) : []
  const setCell = (m: MatrixField, r: number, c: number, x: number) => {
    const next = M.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? x : cell)) : row,
    )
    set(m.key, next)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {mf ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {mf.label}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2 font-semibold">{mf.columns[0] ?? 'Item'}</th>
                    {mf.columns.slice(1).map((col) => (
                      <th key={col} className="px-3 py-2 font-semibold">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mf.rows.map((rowName, r) => (
                    <tr key={rowName} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{rowName}</td>
                      {mf.columns.slice(1).map((_, c) => (
                        <td key={c} className="px-3 py-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            value={M[r]?.[c] ?? 0}
                            onChange={(e) =>
                              setCell(mf, r, c, e.target.value === '' ? 0 : Number(e.target.value))
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {spec.fields.map((f) => {
          if (f.kind === 'matrix') return null
          if (f.kind === 'select') {
            return (
              <Ctrl key={f.key} label={f.label}>
                <SelInput value={(v[f.key] as string) || ''} options={f.options} onChange={(x) => set(f.key, x)} />
              </Ctrl>
            )
          }
          return (
            <Ctrl key={f.key} label={f.label} hint={f.kind === 'number' ? f.hint : undefined}>
              <NumInput
                value={v[f.key] as number}
                onChange={(x) => set(f.key, x)}
                min={f.kind === 'number' ? f.min : undefined}
                max={f.kind === 'number' ? f.max : undefined}
                step={f.kind === 'number' ? f.step : undefined}
                suffix={f.kind === 'number' ? f.suffix : undefined}
              />
            </Ctrl>
          )
        })}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Assessment
        </h3>
        <ResultGrid results={results} />
      </div>
    </div>
  )
}