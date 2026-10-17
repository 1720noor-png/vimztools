import { useMemo, useState, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { TextInput, Select, Field } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fin } from '../../../lib/health/guard'

export type HealthTone = 'good' | 'ok' | 'warn' | 'danger'

export interface HealthField {
  key: string
  label: string
  type: 'number' | 'bool' | 'select' | 'date'
  placeholder?: string
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  half?: boolean
}

export interface HealthResult {
  title: string
  value: string
  unit?: string
  tone: HealthTone
  badge: string
  note?: string
  pct?: number
}

export interface HealthToolConfig {
  id: string
  title: string
  description: string
  icon: ReactNode
  breadcrumb: string
  instruction: string
  sub: string
  emoji: string
  accent: string
  fields: HealthField[]
  compute: (values: Record<string, number | null>) => HealthResult | null
  howItWorks: { title: string; text: string }[]
  tips: string[]
}

const TONE_STYLES: Record<HealthTone, { badge: string; bar: string; ring: string }> = {
  good: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', bar: 'bg-emerald-400', ring: 'ring-emerald-200' },
  ok: { badge: 'bg-sky-100 text-sky-800 border-sky-300', bar: 'bg-sky-400', ring: 'ring-sky-200' },
  warn: { badge: 'bg-amber-100 text-amber-800 border-amber-300', bar: 'bg-amber-400', ring: 'ring-amber-200' },
  danger: { badge: 'bg-rose-100 text-rose-800 border-rose-300', bar: 'bg-rose-500', ring: 'ring-rose-200' },
}

export default function HealthGenericTool({ config }: { config: HealthToolConfig }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)

  const setValue = (key: string, v: string) => {
    setTouched(true)
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  const reset = () => {
    setValues({})
    setTouched(false)
  }

  const numeric = useMemo(() => {
    const out: Record<string, number | null> = {}
    for (const f of config.fields) {
      const raw = values[f.key] ?? ''
      if (f.type === 'bool') out[f.key] = raw === '1' ? 1 : 0
      else if (f.type === 'date') {
        const p = Date.parse(raw)
        out[f.key] = Number.isFinite(p) ? p : null
      } else out[f.key] = fin(raw)
    }
    return out
  }, [values, config.fields])

  const result = useMemo(() => config.compute(numeric), [config, numeric])
  const tone = result ? TONE_STYLES[result.tone] : undefined
  const pct = result?.pct !== undefined ? Math.max(0, Math.min(100, result.pct)) : null

  return (
    <>
      <Seo title={`${config.title} - vimz Tools`} description={config.description} />
      <ToolShell
        title={config.title}
        description={config.description}
        icon={config.icon}
        breadcrumb={config.breadcrumb}
        instruction={config.instruction}
        guideSteps={config.howItWorks}
        guideTips={config.tips}
        tipsTitle="Health Tips & Next Steps"
      >
        <div className="rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm dark:border-rose-900/30 dark:bg-slate-900 sm:p-5">
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${config.accent}`}>
            <span aria-hidden="true">{config.emoji}</span>
            {config.sub}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Your details</h2>
                {touched && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {config.fields.map((f) =>
                  f.type === 'bool' ? (
                    <label
                      key={f.key}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:bg-rose-50 has-checked:bg-rose-50 has-checked:border-rose-300"
                    >
                      <input
                        type="checkbox"
                        checked={values[f.key] === '1'}
                        onChange={(e) => setValue(f.key, e.target.checked ? '1' : '0')}
                        className="mt-0.5 h-4 w-4 accent-rose-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{f.label}</span>
                    </label>
                  ) : f.type === 'select' ? (
                    <Field key={f.key} label={f.label}>
                      <Select value={values[f.key] ?? ''} onChange={(e) => setValue(f.key, e.target.value)}>
                        <option value="">Select…</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
) : f.type === 'date' ? (
                    <Field key={f.key} label={f.label}>
                      <TextInput type="date" value={values[f.key] ?? ''} onChange={(e) => setValue(f.key, e.target.value)} />
                    </Field>
                  ) : (
                    <Field key={f.key} label={f.label}>
                      <TextInput
                        type="number"
                        inputMode="decimal"
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        value={values[f.key] ?? ''}
                        onChange={(e) => setValue(f.key, e.target.value)}
                        placeholder={f.placeholder ?? 'e.g. 70'}
                      />
                    </Field>
                  ),
                )}
              </div>
            </section>

            <section className="lg:col-span-2">
              <div className={`rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800/60 ${result && tone ? `ring-4 ${tone.ring}` : ''}`}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  {result ? result.title : 'Instant visual result'}
                </p>

                {result ? (
                  <>
                    <div className="mt-3 flex items-baseline justify-center gap-2">
                      <span className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">{result.value}</span>
                      {result.unit && <span className="text-lg font-semibold text-slate-400">{result.unit}</span>}
                    </div>
                    <span className={`mt-4 inline-block rounded-full border px-4 py-1.5 text-sm font-bold ${tone?.badge}`}>
                      {result.badge}
                    </span>
                    {pct !== null && (
                      <div className="mx-auto mt-5 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div className={`h-full rounded-full transition-all duration-500 ${tone?.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    {result.note && <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-slate-500 dark:text-slate-300">{result.note}</p>}
                  </>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <span className="text-5xl text-slate-200">—</span>
                    <p className="mt-3 text-sm text-slate-400">Enter your details to see your instant result.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}