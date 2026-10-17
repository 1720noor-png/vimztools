import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, ShieldAlert } from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import {
  asBoolList,
  initCyberValues,
  type Field as SpecField,
  type Tone,
  type ToolResult,
  type Values,
} from '../../cyber-security/specs/cyberSpec'
import { getCyberSpec } from '../../cyber-security/specs'

const TONE_UI: Record<Tone, string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-900/20 dark:text-emerald-300',
  warn: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-300',
  bad: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700/50 dark:bg-rose-900/20 dark:text-rose-300',
  neutral: 'border-rose-100 bg-rose-50/50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-900/20 dark:text-rose-300',
}

const TONE_LABEL: Record<Tone, string> = {
  good: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
  bad: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
  neutral: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
}

export default function CyberSecurityToolPage() {
  const { tool, toolSlug } = useParams<{ tool?: string; toolSlug?: string }>()
  const id = tool || toolSlug || ''
  const spec = getCyberSpec(id)

  if (!spec) {
    return <NotFoundPage />
  }

  return <CyberSecurityWorkspace spec={spec} />
}

function CyberSecurityWorkspace({ spec }: { spec: ReturnType<typeof getCyberSpec> & object }) {
  const [values, setValues] = useState<Values>(() => initCyberValues(spec.fields))
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
          title: 'Execution Error',
          value: (e as Error).message || 'Calculation failed',
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
        title={`${spec.name} — Cybersecurity & Privacy Suite`}
        description={spec.blurb}
      />

      <ToolShell
        title={spec.name}
        description={spec.blurb}
        icon={<ShieldAlert className="h-6 w-6 text-rose-600" />}
        breadcrumb="Cybersecurity & Privacy Suite"
        instruction="All computations and cryptographic operations run locally on your device with 0 network uploads."
        guideSteps={spec.usage.map((u, i) => ({ title: `Step ${i + 1}`, text: u }))}
        guideTips={[spec.tip]}
        tipsTitle="Security Architect's Pro Tip"
      >
        <div className="rounded-2xl border border-rose-100 bg-white p-5 sm:p-7 dark:border-rose-900/30 dark:bg-slate-900 shadow-sm">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Input Configuration Panel */}
            <div className="space-y-5 lg:col-span-5 border-b pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6 border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                  Input Parameters
                </h3>
                <span className="text-xs text-slate-400">Client-Side Isolated</span>
              </div>

              {spec.fields.map((f: SpecField) => {
                if (f.kind === 'number') {
                  const val = values[f.key] as number
                  return (
                    <Field key={f.key} label={f.label}>
                      <TextInput
                        type="number"
                        min={f.min}
                        max={f.max}
                        step={f.step ?? 1}
                        value={isNaN(val) ? '' : val}
                        onChange={(e) => setValue(f.key, parseFloat(e.target.value) || 0)}
                      />
                    </Field>
                  )
                }

                if (f.kind === 'select') {
                  return (
                    <Field key={f.key} label={f.label}>
                      <Select
                        value={(values[f.key] as string) ?? f.options[0]}
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
                  return (
                    <Field key={f.key} label={f.label}>
                      <TextArea
                        rows={f.lines ?? 3}
                        value={(values[f.key] as string) ?? ''}
                        onChange={(e) => setValue(f.key, e.target.value)}
                        className="font-mono text-xs"
                      />
                    </Field>
                  )
                }

                if (f.kind === 'checklist') {
                  const bools = asBoolList(values, f.key, f.items.length)
                  return (
                    <div key={f.key} className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {f.label}
                      </label>
                      <div className="space-y-1.5">
                        {f.items.map((item, idx) => (
                          <label
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={bools[idx]}
                              onChange={(e) => {
                                const next = [...bools]
                                next[idx] = e.target.checked
                                setValue(f.key, next)
                              }}
                              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
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

            {/* Real-Time Results Workspace */}
            <div className="space-y-5 lg:col-span-7">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                  Cryptographic Analysis &amp; Findings
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ● 100% Private Client-Side
                </span>
              </div>

              <div className="space-y-4">
                {results.map((res, i) => {
                  const tone = res.tone ?? 'neutral'
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 transition-all ${TONE_UI[tone]}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {res.title}
                          </div>
                          {res.isCode ? (
                            <div className="relative mt-2">
                              <pre className="max-h-72 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 font-mono">
                                <code>{res.value}</code>
                              </pre>
                              <button
                                onClick={() => copyToClipboard(res.value, `res-${i}`)}
                                className="absolute top-2 right-2 flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                              >
                                {copiedKey === `res-${i}` ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                              {res.value}
                            </div>
                          )}
                        </div>

                        {res.badge && (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE_LABEL[tone]}`}
                          >
                            {res.badge}
                          </span>
                        )}
                      </div>

                      {res.pct !== undefined && (
                        <div className="mt-3">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className="h-full rounded-full bg-rose-600 dark:bg-rose-500 transition-all duration-300"
                              style={{ width: `${res.pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {res.note && (
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {res.note}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}
