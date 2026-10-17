import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Copy, Megaphone } from 'lucide-react'
import NotFoundPage from '../../NotFoundPage'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { MKT_BY_ID, type MktField, type MktResult, type MktTool } from './marketingTools'

function ResultRow({ result }: { result: MktResult }) {
  const [copied, setCopied] = useState(false)
  const multiline = result.value.includes('\n')

  const copy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(result.value).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      },
      () => undefined,
    )
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-4 ${
        result.tone === 'warn' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{result.label}</span>
        <button
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:border-primary-400 hover:text-primary-700"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {multiline ? (
        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          {result.value}
        </pre>
      ) : (
        <p
          className={`mt-1.5 text-base font-semibold ${
            result.tone === 'warn' ? 'text-amber-800' : 'text-slate-800'
          }`}
        >
          {result.value}
        </p>
      )}
      {result.hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{result.hint}</p>}
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: MktField
  value: string
  onChange: (value: string) => void
}) {
  if (field.kind === 'textarea') {
    return (
      <TextArea
        rows={4}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  if (field.kind === 'select' && field.options) {
    return (
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    )
  }
  return (
    <TextInput
      type={field.kind === 'number' ? 'number' : 'text'}
      min={field.min}
      step={field.kind === 'number' && field.min != null && field.min.includes('.') ? 'any' : undefined}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function MktToolView({ tool }: { tool: MktTool }) {
  const [tabId, setTabId] = useState<string | undefined>(tool.tabs[0]?.id)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (tool.tabs[0]?.fields ?? []).map((f) => [
        f.key,
        f.kind === 'select' && f.options && f.options.length > 0 ? f.options[0].value : '',
      ]),
    ),
  )

  const tab = tool.tabs.find((t) => t.id === tabId) ?? tool.tabs[0]
  const results = tab ? tab.compute(values) : []

  const update = (key: string) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <Seo title={`${tool.name} - vimz Tools`} description={tool.description} />
      <ToolShell
        title={tool.name}
        description={tool.description}
        icon={<Megaphone className="h-6 w-6" />}
        breadcrumb="Marketers & SEO"
        instruction="Fill in the fields below and the results update instantly."
      >
        {tool.tabs.length > 1 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {tool.tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTabId(t.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab?.id === t.id
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}

        {tab && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {tab.fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  <FieldInput field={f} value={values[f.key] ?? ''} onChange={update(f.key)} />
                </Field>
              ))}
            </div>
            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    Enter the values above to see results.
                  </p>
                </div>
              ) : (
                results.map((r) => <ResultRow key={r.label} result={r} />)
              )}
            </div>
          </div>
        )}
      </ToolShell>
    </>
  )
}

export default function MarketingToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>()
  const tool = toolSlug ? MKT_BY_ID[toolSlug] : undefined

  if (!tool) return <NotFoundPage />

  return <MktToolView key={tool.id} tool={tool} />
}