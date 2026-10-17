import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, Leaf } from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import {
  asBoolList,
  initGreenValues,
  type Field as SpecField,
  type Tone,
  type ToolResult,
  type Values,
} from '../../green-energy/specs/greenSpec'
import { getGreenEnergySpec } from '../../green-energy/specs'

const TONE_UI: Record<Tone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300',
  bad: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/20 dark:text-rose-300',
  neutral: 'border-emerald-100 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300',
}

const TONE_LABEL: Record<Tone, string> = {
  good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  bad: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
  neutral: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
}

export default function GreenEnergyToolPage() {
  const { tool, toolSlug } = useParams<{ tool?: string; toolSlug?: string }>()
  const id = tool || toolSlug || ''
  const spec = getGreenEnergySpec(id)

  if (!spec) {
    return <NotFoundPage />
  }

  return <GreenEnergyWorkspace spec={spec} />
}

function GreenEnergyWorkspace({ spec }: { spec: ReturnType<typeof getGreenEnergySpec> & object }) {
  const [values, setValues] = useState<Values>(() => initGreenValues(spec.fields))
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const setValue = (key: string, val: Values[string]) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const results = useMemo<ToolResult[]>(() => {
    try {
      return spec.compute(values)
    } catch (e) {
      return [
        {
          title: 'Calculation Error',
          value: (e as Error).message || 'Computation failed',
          tone: 'bad',
        },
      ]
    }
  }, [spec, values])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  return (
    <>
      <Seo
        title={`${spec.name} — Clean Tech & Climate Suite`}
        description={spec.blurb}
      />

      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<Leaf className="h-6 w-6 text-emerald-600" />}
        breadcrumb="Clean Energy & Climate Suite"
        instruction="All thermodynamic, electrical, and carbon calculations execute strictly in your browser with 0 network uploads."
        guideSteps={spec.usage.map((u, i) => ({ title: `Step ${i + 1}`, text: u }))}
        guideTips={[spec.tip]}
        tipsTitle="Clean Tech Engineer's Pro Tip"
      >
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-7 dark:border-emerald-900/30 dark:bg-slate-900 shadow-sm">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Input Configuration Panel */}
            <div className="space-y-5 lg:col-span-5 border-b pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6 border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Input Parameters
                </h3>
                <span className="text-xs text-slate-400">Client-Side Isolated</span>
              </div>

              {spec.fields.map((f: SpecField) => {
                if (f.kind === 'number') {
                  const numVal = typeof values[f.key] === 'number' ? (values[f.key] as number) : f.def ?? 0
                  return (
                    <Field key={f.key} label={f.label}>
                      <div className="space-y-1">
                        <div className="relative">
                          <TextInput
                            type="number"
                            value={String(numVal)}
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value)
                              setValue(f.key, isNaN(parsed) ? 0 : parsed)
                            }}
                            min={f.min}
                            max={f.max}
                            step={f.step ?? 1}
                          />
                          {f.suffix && (
                            <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-slate-400">
                              {f.suffix}
                            </span>
                          )}
                        </div>
                        {f.hint && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {f.hint}
                          </p>
                        )}
                      </div>
                    </Field>
                  )
                }

                if (f.kind === 'select') {
                  const selVal = typeof values[f.key] === 'string' ? (values[f.key] as string) : f.def ?? f.options[0]
                  return (
                    <Field key={f.key} label={f.label}>
                      <Select
                        value={selVal}
                        onChange={(e) => setValue(f.key, e.target.value)}
                      >
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  )
                }

                if (f.kind === 'text') {
                  const txtVal = typeof values[f.key] === 'string' ? (values[f.key] as string) : f.def ?? ''
                  return (
                    <Field key={f.key} label={f.label}>
                      {f.lines && f.lines > 1 ? (
                        <TextArea
                          rows={f.lines}
                          value={txtVal}
                          onChange={(e) => setValue(f.key, e.target.value)}
                        />
                      ) : (
                        <TextInput
                          type="text"
                          value={txtVal}
                          onChange={(e) => setValue(f.key, e.target.value)}
                        />
                      )}
                    </Field>
                  )
                }

                if (f.kind === 'checklist') {
                  const checks = asBoolList(values, f.key, f.items.length)
                  return (
                    <div key={f.key} className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {f.label}
                      </label>
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        {f.items.map((item, idx) => (
                          <label
                            key={item}
                            className="flex cursor-pointer items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <input
                              type="checkbox"
                              checked={checks[idx]}
                              onChange={(e) => {
                                const next = [...checks]
                                next[idx] = e.target.checked
                                setValue(f.key, next)
                              }}
                              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                }

                return null
              })}
            </div>

            {/* Live Calculation Output Results */}
            <div className="space-y-5 lg:col-span-7">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Engineering Results &amp; Environmental Impact
                </h3>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Real-Time Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.map((resItem, idx) => {
                  const toneKey = resItem.tone ?? 'neutral'
                  const toneClass = TONE_UI[toneKey]
                  const labelClass = TONE_LABEL[toneKey]

                  if (resItem.isCode) {
                    return (
                      <div
                        key={idx}
                        className="col-span-full rounded-xl border border-slate-200 bg-slate-900 p-4 text-slate-100 dark:border-slate-800"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">
                            {resItem.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(resItem.value, `res-${idx}`)}
                            className="flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white"
                          >
                            {copiedKey === `res-${idx}` ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto text-xs font-mono text-emerald-300">
                          {resItem.value}
                        </pre>
                        {resItem.note && (
                          <p className="mt-2 text-xs text-slate-400">{resItem.note}</p>
                        )}
                      </div>
                    )
                  }

                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all ${toneClass}`}
                    >
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold opacity-75">
                            {resItem.title}
                          </span>
                          {resItem.badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${labelClass}`}
                            >
                              {resItem.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-black tracking-tight">
                          {resItem.value}
                        </p>
                      </div>

                      {resItem.pct !== undefined && (
                        <div className="mt-3">
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-500"
                              style={{ width: `${Math.min(100, Math.max(0, resItem.pct))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {resItem.note && (
                        <p className="mt-2 text-xs opacity-80 leading-relaxed">
                          {resItem.note}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Methodology Explainer */}
              {spec.method && spec.method.length > 0 && (
                <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Governing Physics &amp; Methodology
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {spec.method.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}
