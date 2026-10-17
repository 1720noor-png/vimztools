import { useMemo, useState } from 'react'
import type { CellValue, OfficeToolSpec, Values } from './spec'
import { asNum, asStr, initValues } from './spec'
import { Ctrl, NumInput, ResultGrid, SelInput, TextAreaInput, SummaryBlock } from './kit'

export default function Fmt({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {spec.fields.map((f) => {
          switch (f.kind) {
            case 'number':
              return (
                <Ctrl key={f.key} label={f.label} hint={f.hint}>
                  <NumInput
                    value={asNum(v[f.key])}
                    onChange={(x) => set(f.key, x)}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    suffix={f.suffix}
                  />
                </Ctrl>
              )
            case 'text':
              return (
                <Ctrl key={f.key} label={f.label}>
                  <TextAreaInput value={asStr(v[f.key])} lines={f.lines} onChange={(x) => set(f.key, x)} />
                </Ctrl>
              )
            case 'select':
              return (
                <Ctrl key={f.key} label={f.label}>
                  <SelInput value={asStr(v[f.key]) || ''} options={f.options} onChange={(x) => set(f.key, x)} />
                </Ctrl>
              )
            case 'checklist': {
              const items = f.items
              const vals = (v[f.key] as boolean[]) ?? []
              return (
                <div key={f.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="mb-2 block text-sm font-medium text-slate-700">{f.label}</span>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {items.map((it, i) => (
                      <label key={it} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                          checked={vals[i] ?? false}
                          onChange={() => set(f.key, vals.map((c, j) => (i === j ? !c : c)))}
                        />
                        {it}
                      </label>
                    ))}
                  </div>
                </div>
              )
            }
            default:
              return null
          }
        })}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Output document
        </h3>
        <ResultGrid results={results} />
      </div>
    </div>
  )
}