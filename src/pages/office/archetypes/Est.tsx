import { useMemo, useState } from 'react'
import type { CellValue, OfficeToolSpec, Values } from './spec'
import { initValues } from './spec'
import { ResultGrid, SummaryBlock, renderCtrl } from './kit'

export default function Est({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {spec.fields.map((f) => renderCtrl(f, v, set))}
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Results
        </h3>
        <ResultGrid results={results} />
      </div>
    </div>
  )
}