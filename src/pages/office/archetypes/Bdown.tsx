import { useMemo, useState } from 'react'
import type { CellValue, MatrixField, OfficeToolSpec, Values } from './spec'
import { asMatrix, initValues, money } from './spec'
import { ResultGrid, SummaryBlock } from './kit'

export default function Bdown({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const mf = spec.fields.find((f) => f.kind === 'matrix') as MatrixField | undefined
  const M = mf ? asMatrix(v[mf.key]) : []
  const setCell = (m: MatrixField, r: number, c: number, x: number) => {
    const next = M.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? x : cell)) : row))
    set(m.key, next)
  }
  const lines = M.map((row) => [row[0] || 0, row[1] || 0, (row[0] || 0) * (row[1] || 0)])
  const grand = lines.reduce((s, l) => s + l[2], 0)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {mf ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {mf.label}
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-semibold">Line item</th>
                  <th className="px-3 py-2 font-semibold">Qty</th>
                  <th className="px-3 py-2 font-semibold">Unit cost</th>
                  <th className="px-3 py-2 font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {mf.rows.map((rowName, r) => (
                  <tr key={rowName} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-700">{rowName}</td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        value={M[r]?.[0] ?? 0}
                        onChange={(e) => setCell(mf, r, 0, e.target.value === '' ? 0 : Number(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        value={M[r]?.[1] ?? 0}
                        onChange={(e) => setCell(mf, r, 1, e.target.value === '' ? 0 : Number(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-slate-700">{money(lines[r][2])}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-800">
                  <td className="px-3 py-2" colSpan={3}>
                    Grand total
                  </td>
                  <td className="px-3 py-2 text-right">{money(grand)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Breakdown totals
        </h3>
        <ResultGrid results={results} />
        <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
          <span className="text-base leading-none">ℹ</span>
          The grand total tracks this tool's own unit economics; derived metrics adjust as you edit line items.
        </div>
      </div>
    </div>
  )
}