import type { ReactNode } from 'react'
import type { CellValue, Field, ToolResult, Values } from './spec'

const TONE_MAP: Record<string, string> = {
  good: 'border-emerald-200 bg-emerald-50/60 text-emerald-800',
  warn: 'border-amber-200 bg-amber-50/60 text-amber-800',
  bad: 'border-rose-200 bg-rose-50/60 text-rose-800',
  neutral: 'border-slate-200 bg-white text-slate-800',
}

export function ResultCard({ r }: { r: ToolResult }) {
  return (
    <div className={`rounded-2xl border p-4 ${TONE_MAP[r.tone ?? 'neutral']}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {r.label}
      </span>
      <p className="mt-1.5 text-xl font-bold leading-tight break-words">{r.value}</p>
      {r.hint ? <p className="mt-1.5 text-xs leading-relaxed opacity-80">{r.hint}</p> : null}
    </div>
  )
}

export function ResultGrid({ results }: { results: ToolResult[] }) {
  return (
    <div className="space-y-3">
      {results.map((r, i) =>
        r.raw ? (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {r.label}
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-slate-800">
              {r.raw}
            </pre>
          </div>
        ) : (
          <ResultCard key={i} r={r} />
        ),
      )}
    </div>
  )
}

export function Ctrl({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

const INPUT_CLS =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'

export function NumInput({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        className={INPUT_CLS}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        min={min}
        max={max}
        step={step ?? 'any'}
      />
      {suffix ? <span className="shrink-0 text-sm text-slate-500">{suffix}</span> : null}
    </div>
  )
}

export function SelInput({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <select className={INPUT_CLS} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function TextAreaInput({
  value,
  lines,
  onChange,
}: {
  value: string
  lines?: number
  onChange: (v: string) => void
}) {
  return (
    <textarea
      className={INPUT_CLS}
      rows={lines ?? 3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="date" className={INPUT_CLS} value={value} onChange={(e) => onChange(e.target.value)} />
}

export function renderCtrl(
  f: Field,
  v: Values,
  set: (key: string, val: CellValue) => void,
): ReactNode | null {
  switch (f.kind) {
    case 'number':
      return (
        <Ctrl key={f.key} label={f.label} hint={f.hint}>
          <NumInput value={v[f.key] as number} onChange={(x) => set(f.key, x)} min={f.min} max={f.max} step={f.step} suffix={f.suffix} />
        </Ctrl>
      )
    case 'select':
      return (
        <Ctrl key={f.key} label={f.label}>
          <SelInput value={(v[f.key] as string) || ''} options={f.options} onChange={(x) => set(f.key, x)} />
        </Ctrl>
      )
    case 'text':
      return (
        <Ctrl key={f.key} label={f.label}>
          <TextAreaInput value={(v[f.key] as string) || ''} lines={f.lines} onChange={(x) => set(f.key, x)} />
        </Ctrl>
      )
    case 'date':
      return (
        <Ctrl key={f.key} label={f.label}>
          <DateInput value={(v[f.key] as string) || ''} onChange={(x) => set(f.key, x)} />
        </Ctrl>
      )
    default:
      return null
  }
}

export function SummaryBlock({ results, blurb }: { results: ToolResult[]; blurb: string }) {
  const numeric = results.filter((r) => !r.raw)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-semibold text-slate-700">Draft summary</span>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
        {blurb}
        {numeric.length ? (
          <>
            {'\n\n'}Key outputs:{'\n'}
            {numeric.map((r) => `  - ${r.label}: ${r.value}`).join('\n')}
          </>
        ) : null}
      </pre>
    </div>
  )
}