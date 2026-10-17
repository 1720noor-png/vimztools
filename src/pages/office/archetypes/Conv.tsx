import { useMemo, useState } from 'react'
import type { CellValue, OfficeToolSpec, SelectField, Values } from './spec'
import { asNum, asStr, initValues } from './spec'
import { Ctrl, NumInput, ResultGrid, SelInput, SummaryBlock } from './kit'

export default function Conv({ spec }: { spec: OfficeToolSpec }) {
  const [v, setV] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(v), [spec, v])
  const set = (key: string, val: CellValue) => setV((p) => ({ ...p, [key]: val }))
  const numField = spec.fields.find((f) => f.kind === 'number')
  const fromField = (spec.fields.find((f) => f.kind === 'select' && f.key.endsWith('from')) as SelectField | undefined) ?? null
  const toField = (spec.fields.find((f) => f.kind === 'select' && f.key.endsWith('to')) as SelectField | undefined) ?? null
  const leading = results[0]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          {numField ? (
            <Ctrl label={numField.label}>
              <NumInput
                value={asNum(v[numField.key])}
                onChange={(x) => set(numField.key, x)}
                min={numField.min}
                max={numField.max}
                step={numField.step}
              />
            </Ctrl>
          ) : null}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fromField ? (
              <Ctrl label={fromField.label}>
                <SelInput value={asStr(v[fromField.key]) || ''} options={fromField.options} onChange={(x) => set(fromField.key, x)} />
              </Ctrl>
            ) : null}
            {toField ? (
              <Ctrl label={toField.label}>
                <SelInput value={asStr(v[toField.key]) || ''} options={toField.options} onChange={(x) => set(toField.key, x)} />
              </Ctrl>
            ) : null}
          </div>
        </div>
        <SummaryBlock results={results} blurb={spec.blurb} />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Converter
        </h3>
        {leading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {leading.label}
            </span>
            <p className="mt-1 break-words text-3xl font-black tracking-tight text-slate-900">
              {leading.value}
            </p>
            {leading.hint ? <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">{leading.hint}</p> : null}
          </div>
        ) : null}
        <ResultGrid results={results.slice(1)} />
        <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500">
          <span className="text-base leading-none">ℹ</span>
          Conversion factors for {asStr(v[fromField?.key ?? ''])} are baked into this tool's own logic.
        </div>
      </div>
    </div>
  )
}