import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, Sparkles } from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import {
  asBoolList,
  initAiValues,
  type Field as SpecField,
  type Tone,
  type ToolResult,
  type Values,
} from '../../ai-tools/specs/aiSpec'
import { getAiToolSpec } from '../../ai-tools/specs'

const TONE_UI: Record<Tone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300',
  bad: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/20 dark:text-rose-300',
  neutral: 'border-violet-100 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-900/20 dark:text-violet-300',
}

const TONE_LABEL: Record<Tone, string> = {
  good: 'Optimal',
  warn: 'Watch',
  bad: 'Alert',
  neutral: 'Metric',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function ResultCard({ item }: { item: ToolResult }) {
  const { label, value, tone = 'neutral', hint, raw, pct } = item
  const multiline = raw !== undefined || (typeof value === 'string' && value.includes('\n'))

  return (
    <div className="rounded-xl border border-violet-100 bg-white p-4 shadow-2xs dark:border-violet-900/40 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {tone && (
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
        <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-xs font-mono leading-relaxed text-slate-100 dark:bg-slate-950">
          {raw !== undefined ? raw : value}
        </pre>
      ) : (
        <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">{value}</p>
      )}
      {typeof pct === 'number' && !multiline && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-violet-100 dark:bg-violet-950">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
      )}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>}
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
    const rows = field.lines ?? 3
    return (
      <TextArea
        rows={rows}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  if (field.kind === 'checklist') {
    const picks = asBoolList({ [field.key]: value }, field.key, field.items.length)
    return (
      <div className="space-y-2">
        {field.items.map((item, i) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-violet-100 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-violet-300 dark:border-violet-900/40 dark:bg-slate-900 dark:text-slate-200"
          >
            <input
              type="checkbox"
              checked={picks[i] ?? false}
              onChange={(e) => {
                const next = field.items.map((_, ix) => (ix === i ? e.target.checked : picks[ix] ?? false))
                onChange(next)
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 accent-violet-600"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    )
  }
  return null
}

export default function AiToolPage({ toolId: directToolId }: { toolId?: string } = {}) {
  const params = useParams<{ toolSlug?: string; tool?: string }>()
  const slug = directToolId || params.toolSlug || params.tool

  const spec = useMemo(() => (slug ? getAiToolSpec(slug) : undefined), [slug])
  const [values, setValues] = useState<Values>(() => (spec ? initAiValues(spec.fields) : {}))

  const results = useMemo(() => (spec ? spec.compute(values) : []), [spec, values])

  if (!spec) return <NotFoundPage />

  const update = (key: string) => (next: Values[string]) => {
    setValues((prev) => ({ ...prev, [key]: next }))
  }

  return (
    <>
      <Seo title={`${spec.name} — AI & Machine Learning Tools | vimz Tools`} description={spec.blurb} />
      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<Sparkles className="h-6 w-6 text-violet-600" />}
        breadcrumb="AI & Machine Learning"
        instruction="Adjust the inputs below — results, token formulas, and architectural recommendations recompute instantly."
        guideSteps={spec.usage.map((u, i) => ({ title: `Step ${i + 1}`, text: u }))}
        guideTips={[spec.tip]}
        tipsTitle="AI Engineer's Pro Tip"
      >
        <div className="rounded-2xl border border-violet-100 bg-white shadow-sm dark:border-violet-900/30 dark:bg-slate-900">
          <div className="border-b border-violet-100 bg-violet-50/60 px-5 py-3.5 dark:border-violet-900/30 dark:bg-violet-950/30">
            <p className="text-sm font-bold text-violet-900 dark:text-violet-200">{spec.name}</p>
            <p className="text-xs text-violet-500 dark:text-violet-400">{spec.subject}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500">
                Configuration &amp; Inputs
              </p>
              {spec.fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  <SpecInput field={f} value={values[f.key]} onChange={update(f.key)} />
                </Field>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500">
                Real-Time Computed Outputs
              </p>
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 py-14 text-center dark:border-violet-900/40 dark:bg-violet-950/20">
                  <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">
                    Adjust inputs above to see instant results.
                  </p>
                </div>
              ) : (
                results.map((r, i) => (
                  <ResultCard key={`${r.label}-${i}`} item={r} />
                ))
              )}
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}
