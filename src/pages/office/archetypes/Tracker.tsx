import { useMemo, useState } from 'react'
import type { CellValue, OfficeToolSpec, Values } from './spec'
import { asNum, asStr, initValues } from './spec'
import { Ctrl, DateInput, NumInput, ResultGrid, SelInput, SummaryBlock } from './kit'

export default function Tracker({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {spec.fields.map((f) => {
            switch (f.kind) {
              case 'date':
                return (
                  <Ctrl key={f.key} label={f.label}>
                    <DateInput value={asStr(v[f.key])} onChange={(x) => set(f.key, x)} />
                  </Ctrl>
                )
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
              case 'select':
                return (
                  <Ctrl key={f.key} label={f.label}>
                    <SelInput value={asStr(v[f.key]) || ''} options={f.options} onChange={(x) => set(f.key, x)} />
                  </Ctrl>
                )
              default:
                return null
            }
          })}
        </div>
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Milestones & alerts
        </h3>
        <ResultGrid results={results} />
        <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
          <span className="text-base leading-none">ℹ</span>
          All dates are entered by you — nothing depends on the system clock, so the plan is reproducible.
        </div>
      </div>
    </div>
  )
}