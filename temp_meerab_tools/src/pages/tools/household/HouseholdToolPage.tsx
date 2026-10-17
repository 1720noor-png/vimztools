import { useMemo, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, Home, RotateCcw, Wrench } from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import {
  type Field as SpecField,
  type HouseholdSpec,
  type Tone,
  type Values,
  asBoolList,
  initHouseholdValues,
} from '../../household/specs/householdSpec'
import { getHouseholdSpec } from '../../household/specs'

const TONE_UI: Record<Tone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300',
  bad: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300',
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/30 dark:text-sky-300',
  neutral: 'border-amber-100 bg-amber-50/50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300',
}

const TONE_LABEL: Record<Tone, string> = {
  good: 'Good',
  warn: 'Attention',
  bad: 'Alert',
  info: 'Info',
  neutral: 'Result',
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      },
      () => undefined,
    )
  }, [text])

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:border-amber-400 hover:text-amber-900 dark:border-amber-800 dark:bg-slate-800 dark:text-amber-300"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

function ResultCard({
  label,
  value,
  tone = 'neutral',
  hint,
  raw,
}: {
  label: string
  value: string
  tone?: Tone
  hint?: string
  raw?: string
}) {
  const multiline = raw !== undefined || value.includes('\n')
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-amber-900/30 dark:bg-slate-900">
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
          {raw !== undefined ? (
            <CopyButton text={raw} label="Copy Output" />
          ) : (
            <CopyButton text={`${label}: ${value}`} />
          )}
        </div>
      </div>
      {multiline ? (
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:bg-slate-950">
          {raw !== undefined ? raw : value}
        </pre>
      ) : (
        <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">{value}</p>
      )}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{hint}</p>}
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
    <div className="overflow-x-auto rounded-xl border border-amber-200 dark:border-amber-900/40">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-amber-50 dark:bg-amber-950/40">
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
            <tr key={r} className="border-t border-amber-100 dark:border-amber-900/40">
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
                    className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
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
    const rows = field.lines ?? 2
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
  if (field.kind === 'checkbox') {
    const isChecked = Boolean(value)
    return (
      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-amber-400 dark:border-amber-900/40 dark:bg-slate-900 dark:text-slate-200">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-amber-600 accent-amber-600"
        />
        <span className="select-none font-medium">{field.label}</span>
      </label>
    )
  }
  if (field.kind === 'checklist') {
    const picks = asBoolList(value)
    return (
      <div className="space-y-2">
        {field.items.map((item, i) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-amber-300 dark:border-amber-900/40 dark:bg-slate-900 dark:text-slate-200"
          >
            <input
              type="checkbox"
              checked={picks[i] ?? false}
              onChange={(e) => {
                const next = field.items.map((_, ix) => (ix === i ? e.target.checked : picks[ix] ?? false))
                onChange(next)
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 accent-amber-600"
            />
            <span className="select-none">{item}</span>
          </label>
        ))}
      </div>
    )
  }
  return <MatrixInput field={field} value={value} onChange={onChange} />
}

function HouseholdToolView({ spec }: { spec: HouseholdSpec }) {
  const [values, setValues] = useState<Values>(() => initHouseholdValues(spec.fields))
  const results = useMemo(() => spec.compute(values), [spec, values])

  const update = (key: string) => (next: Values[string]) => {
    setValues((prev) => ({ ...prev, [key]: next }))
  }

  const resetDefaults = useCallback(() => {
    setValues(initHouseholdValues(spec.fields))
  }, [spec.fields])

  const summaryText = useMemo(() => {
    const lines = [
      `=== ${spec.name} ===`,
      `Category: Household > ${spec.sub}`,
      '',
      '--- Inputs ---',
    ]
    for (const f of spec.fields) {
      const val = values[f.key]
      if (f.kind === 'checklist') {
        const bools = asBoolList(val)
        const selected = f.items.filter((_, i) => bools[i])
        lines.push(`${f.label}: ${selected.length > 0 ? selected.join(', ') : 'None'}`)
      } else if (f.kind === 'matrix') {
        lines.push(`${f.label}: [Table Data]`)
      } else {
        lines.push(`${f.label}: ${String(val ?? '')}`)
      }
    }
    lines.push('', '--- Results ---')
    for (const r of results) {
      if (r.raw) {
        lines.push(`${r.label}:\n${r.raw}`)
      } else {
        lines.push(`${r.label}: ${r.value}${r.hint ? ` (${r.hint})` : ''}`)
      }
    }
    lines.push('', `Tip: ${spec.tip}`)
    return lines.join('\n')
  }, [spec, values, results])

  return (
    <>
      <Seo title={`${spec.name} - Household Helpers | vimz Tools`} description={spec.blurb} />
      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<Home className="h-6 w-6 text-amber-500" />}
        breadcrumb={`Household \u00B7 ${spec.sub}`}
        instruction={'Adjust the inputs below \u2014 calculations and recommendations update in real time.'}
        guideSteps={spec.usage.map((u, i) => ({ title: `Step ${i + 1}`, text: u }))}
        guideTips={[spec.tip]}
        tipsTitle="Household Pro Tip"
      >
        <div className="rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-900/30 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 bg-amber-50/70 px-5 py-3.5 dark:border-amber-900/30 dark:bg-amber-950/30">
            <div>
              <p className="text-sm font-bold text-amber-950 dark:text-amber-200">{spec.name}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">{spec.sub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-amber-400 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                Reset Defaults
              </button>
              <CopyButton text={summaryText} label="Copy Summary" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Your inputs
                </p>
                <span className="text-[11px] text-slate-400">Auto-calculates</span>
              </div>
              {spec.fields.map((f) => (
                <Field key={f.key} label={f.kind === 'checkbox' ? '' : f.label}>
                  <SpecInput field={f} value={values[f.key]} onChange={update(f.key)} />
                </Field>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Calculated Results
                </p>
                <span className="text-[11px] text-slate-400">{results.length} outputs</span>
              </div>
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 py-14 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
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
                  />
                ))
              )}
            </div>
          </div>

          <div className="rounded-b-2xl border-t border-amber-100 bg-amber-50/40 px-5 py-5 dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Formula &amp; Practical Logic
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{spec.blurb}</p>
            <ul className="mt-3 space-y-1.5">
              {spec.method.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
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

export default function HouseholdToolPage() {
  const { toolSlug, tool } = useParams<{ toolSlug?: string; tool?: string }>()
  const slug = toolSlug || tool
  const spec = slug ? getHouseholdSpec(slug) : undefined
  if (!spec) return <NotFoundPage />
  return <HouseholdToolView key={spec.id} spec={spec} />
}
