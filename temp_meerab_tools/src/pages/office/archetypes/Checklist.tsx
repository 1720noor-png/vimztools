import { useMemo, useState } from 'react'
import type { CellValue, ChecklistField, OfficeToolSpec, Values } from './spec'
import { asBoolList, clamp, initValues } from './spec'
import { ResultCard, SummaryBlock } from './kit'

export default function Checklist({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const cf = spec.fields.find((f) => f.kind === 'checklist') as ChecklistField | undefined
  const checked = cf ? asBoolList(v[cf.key]) : []
  const done = checked.filter(Boolean).length
  const total = cf?.items.length ?? 0
  const progress = total ? Math.round((done / total) * 100) : 0
  const toggle = (i: number) => {
    const next = checked.map((c, j) => (i === j ? !c : c))
    set(cf!.key, next)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {cf ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {cf.label}
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center gap-3 px-1">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {done}/{total}
                </span>
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {cf.items.map((item, i) => (
                <li key={item}>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-100"
                      checked={checked[i] ?? false}
                      onChange={() => toggle(i)}
                    />
                    <span
                      className={`text-sm ${
                        checked[i] ? 'text-slate-400 line-through' : 'text-slate-700'
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <span className="text-3xl font-black text-slate-800">{clamp(progress, 0, 100)}%</span>
          <div>
            <p className="text-sm font-semibold text-slate-700">Completion</p>
            <p className="text-xs text-slate-500">
              {total - done} item{total - done === 1 ? '' : 's'} still to cover
            </p>
          </div>
        </div>
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Readiness
        </h3>
        <ResultCard r={results[0] ?? { label: 'Readiness', value: '—' }} />
        {results.slice(1).map((r, i) => (
          <ResultCard key={i} r={r} />
        ))}
      </div>
    </div>
  )
}