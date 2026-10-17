import { useMemo } from 'react'
import { tokenize, type TokType } from '../../lib/highlight'

const META: Record<TokType, string> = {
  kw: 'text-sky-300',
  str: 'text-emerald-300',
  num: 'text-amber-300',
  cmt: 'text-slate-500 italic',
  punct: 'text-slate-400',
  plain: 'text-slate-200',
}

export default function Highlight({ code, lang = 'plain' }: { code: string; lang?: string }) {
  const toks = useMemo(() => tokenize(code, lang), [code, lang])

  return (
    <code className="font-mono text-[13px] leading-relaxed">
      {toks.map((t, i) => (
        <span key={i} className={META[t.type]}>
          {t.text}
        </span>
      ))}
    </code>
  )
}