import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, Cpu, GraduationCap } from 'lucide-react'
import { create as createQrSymbol } from 'qrcode'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import {
  asBoolList,
  initValues,
  type Field as SpecField,
  type Tone,
  type Values,
} from '../../office/archetypes/spec'
import type { StudentResult, StudentSpec } from '../../students/specs/studentSpec'
import { getStudentSpec } from '../../students/specs'

function QrPreview({ data, ec }: { data: string; ec: 'L' | 'M' | 'Q' | 'H' }) {
  const symbol = useMemo(() => {
    try {
      return createQrSymbol(data || ' ', { errorCorrectionLevel: ec })
    } catch {
      return null
    }
  }, [data, ec])
  if (!symbol) {
    return (
      <p className="mt-3 text-xs text-rose-300">
        That payload cannot be encoded as a QR code — shorten it or remove characters it cannot store.
      </p>
    )
  }
  const { size, modules } = { size: symbol.modules.size, modules: symbol.modules }
  const quiet = 4
  const cells: string[] = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (modules.get(row, col)) cells.push(`M${row} ${col} h1v1h-1z`)
    }
  }
  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${size + quiet * 2} ${size + quiet * 2}`}
        className="h-52 w-52 rounded-lg bg-white p-1"
        shapeRendering="crispEdges"
        role="img"
        aria-label="QR code preview"
      >
        <rect width={size + quiet * 2} height={size + quiet * 2} fill="#ffffff" />
        <path d={cells.join(' ')} transform={`translate(${quiet} ${quiet})`} fill="#0f172a" />
      </svg>
      <p className="text-[11px] text-slate-400">
        Version {symbol.version} · error correction {String(symbol.errorCorrectionLevel)} · {size}×{size} modules
      </p>
    </div>
  )
}

function BarsPreview({ modules, caption }: { modules: boolean[]; caption: string }) {
  const n = modules.length
  const runs: string[] = []
  let i = 0
  while (i < n) {
    if (!modules[i]) {
      i++
      continue
    }
    let j = i
    while (j < n && modules[j]) j++
    runs.push(`M${i} 0h${j - i}v28h-${j - i}z`)
    i = j
  }
  return (
    <div className="mt-3 overflow-x-auto rounded-lg bg-white p-3">
      <svg viewBox={`0 0 ${n} 28`} className="h-24 w-full min-w-[28rem]" shapeRendering="crispEdges" role="img" aria-label="Barcode preview">
        <rect width={n} height={28} fill="#ffffff" />
        <path d={runs.join(' ')} fill="#0f172a" />
      </svg>
      <p className="mt-1 text-center text-[11px] font-mono tracking-[0.35em] text-slate-500">{caption}</p>
    </div>
  )
}

const TONE_UI: Record<Tone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300',
  bad: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/20 dark:text-rose-300',
  neutral: 'border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-900/20 dark:text-indigo-300',
}

const TONE_LABEL: Record<Tone, string> = {
  good: 'Good',
  warn: 'Watch',
  bad: 'Action',
  neutral: 'Info',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      },
      () => undefined,
    )
  }
  return (
    <button
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition hover:border-indigo-400 hover:text-indigo-800 dark:border-indigo-700 dark:bg-slate-800 dark:text-indigo-300"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ResultCard({
  label,
  value,
  tone = 'neutral',
  hint,
  raw,
  pct,
  qr,
  bars,
}: {
  label: string
  value: string
  tone?: Tone
  hint?: string
  raw?: string
  pct?: number
  qr?: StudentResult['qr']
  bars?: StudentResult['bars']
}) {
  const multiline = raw !== undefined || value.includes('\n')
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm dark:border-indigo-900/30 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <div className="flex items-center gap-2">
          {!multiline && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONE_UI[tone]}`}
            >
              {TONE_LABEL[tone]}
            </span>
          )}
          {raw !== undefined && <CopyButton text={raw} />}
        </div>
      </div>
      {multiline ? (
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 dark:bg-slate-950">
          {raw !== undefined ? raw : value}
        </pre>
      ) : (
        <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">{value}</p>
      )}
      {typeof pct === 'number' && !multiline && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
      )}
      {qr && <QrPreview data={qr.data} ec={qr.ec} />}
      {bars && <BarsPreview modules={bars.modules} caption={bars.caption} />}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>}
    </div>
  )
}

function MatrixInput({
  field,
  value,
  onChange,
}: {
  field: Extract<SpecField, { kind: 'matrix' }>
  value: Values[string]
  onChange: (next: Values[string]) => void
}) {
  const grid = Array.isArray(value)
    ? (value as number[][])
    : field.rows.map(() => field.columns.slice(1).map(() => 0))
  return (
    <div className="overflow-x-auto rounded-xl border border-indigo-100 dark:border-indigo-900/40">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-indigo-50 dark:bg-indigo-950/40">
            <th className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300" />
            {field.columns.slice(1).map((c) => (
              <th key={c} className="px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {field.rows.map((r, ri) => (
            <tr key={r} className="border-t border-indigo-100 dark:border-indigo-900/40">
              <th className="px-3 py-2 font-medium text-slate-600 dark:text-slate-300">{r}</th>
              {field.columns.slice(1).map((_, ci) => (
                <td key={ci} className="px-2 py-1.5">
                  <input
                    type="number"
                    value={grid[ri]?.[ci] ?? 0}
                    onChange={(e) => {
                      const next = grid.map((row, r2) =>
                        r2 === ri ? row.map((cell, c2) => (c2 === ci ? Number(e.target.value) : cell)) : row,
                      )
                      onChange(next)
                    }}
                    className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SpecInput({
  field,
  value,
  onChange,
}: {
  field: SpecField
  value: Values[string]
  onChange: (next: Values[string]) => void
}) {
  if (field.kind === 'number') {
    return (
      <TextInput
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={typeof value === 'number' ? value : field.def ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    )
  }
  if (field.kind === 'select') {
    return (
      <Select value={typeof value === 'string' ? value : field.options[0]} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    )
  }
  if (field.kind === 'text') {
    const rows = field.lines ?? 1
    return (
      <TextArea
        rows={rows}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  if (field.kind === 'date') {
    return (
      <TextInput
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  if (field.kind === 'checklist') {
    const picks = asBoolList(value)
    return (
      <div className="space-y-2">
        {field.items.map((item, i) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-indigo-300 dark:border-indigo-900/40 dark:bg-slate-900 dark:text-slate-200"
          >
            <input
              type="checkbox"
              checked={picks[i] ?? false}
              onChange={(e) => {
                const next = field.items.map((_, ix) => (ix === i ? e.target.checked : picks[ix] ?? false))
                onChange(next)
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    )
  }
  return <MatrixInput field={field} value={value} onChange={onChange} />
}

function StudentAcademicsView({ spec }: { spec: StudentSpec }) {
  const [values, setValues] = useState<Values>(() => initValues(spec.fields))
  const results = useMemo(() => spec.compute(values), [spec, values])

  const update = (key: string) => (next: Values[string]) => {
    setValues((prev) => ({ ...prev, [key]: next }))
  }

  return (
    <>
      <Seo title={`${spec.name} - vimz Tools`} description={spec.blurb} />
      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<GraduationCap className="h-6 w-6" />}
        breadcrumb="Students & Academics"
        instruction={'Adjust the inputs below \u2014 results and the student\u2019s pro tip update instantly.'}
        guideSteps={spec.usage.map((u, i) => ({ title: `Step ${i + 1}`, text: u }))}
        guideTips={[spec.tip]}
        tipsTitle="Student's Pro Tip"
      >
        <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm dark:border-indigo-900/30 dark:bg-slate-900">
          <div className="border-b border-indigo-100 bg-indigo-50/60 px-5 py-3.5 dark:border-indigo-900/30 dark:bg-indigo-950/30">
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{spec.name}</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">{spec.subject}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Your inputs
              </p>
              {spec.fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  <SpecInput field={f} value={values[f.key]} onChange={update(f.key)} />
                </Field>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Instant results
              </p>
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 py-14 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                    Adjust the inputs above to see your results.
                  </p>
                </div>
              ) : (
                results.map((r, i) => (
                  <ResultCard
                    key={`${r.label}-${i}`}
                    label={r.label}
                    value={r.value}
                    tone={r.tone}
                    hint={r.hint}
                    raw={r.raw}
                    pct={(r as { pct?: number }).pct}
                    qr={r.qr}
                    bars={r.bars}
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-b-2xl border-t border-indigo-100 bg-indigo-50/50 px-5 py-5 dark:border-indigo-900/30 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Tool Logic &amp; Methodology
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{spec.blurb}</p>
            <ul className="mt-3 space-y-1.5">
              {spec.method.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ToolShell>
    </>
  )
}

export default function StudentAcademicsToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const spec = toolSlug ? getStudentSpec(toolSlug) : undefined
  if (!spec) return <NotFoundPage />
  return <StudentAcademicsView key={spec.id} spec={spec} />
}
