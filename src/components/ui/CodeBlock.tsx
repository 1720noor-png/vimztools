import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import Highlight from './Highlight'

export default function CodeBlock({
  title = 'Output',
  code,
  lang = 'plain',
  maxHeight = 420,
}: {
  title?: string
  code: string
  lang?: string
  maxHeight?: number
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2">
        <span className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </span>
        <button
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-800"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-auto p-4 text-slate-200" style={{ maxHeight }}>
        <Highlight code={code} lang={lang} />
      </pre>
    </div>
  )
}