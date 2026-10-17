import { useMemo, useState } from 'react'
import { AlignLeft, Clock, Hash, ListOrdered, Type } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, percent } from '../../../lib/numbers'

export default function EssayWordCounter() {
  const [text, setText] = useState('')
  const [target, setTarget] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = text.replace(/\s+/g, '').length
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0
    const readSec = Math.ceil((words / 200) * 60)
    return { words, chars, sentences, paragraphs, readSec }
  }, [text])

  const tw = /^\d+$/.test(target.trim()) ? parseInt(target.trim(), 10) : NaN
  const pct = Number.isFinite(tw) && tw > 0 ? clamp((stats.words / tw) * 100, 0, 100) : 0
  const readLabel = stats.readSec < 60 ? `${stats.readSec}s` : stats.readSec < 3600 ? `${Math.ceil(stats.readSec / 60)} min` : `${(stats.readSec / 3600).toFixed(1)} h`

  const tiles = [
    { icon: Type, label: 'Words', value: stats.words, color: 'border-primary-200 bg-primary-50 text-primary-600' },
    { icon: Hash, label: 'Characters', value: stats.chars, color: 'border-violet-200 bg-violet-50 text-violet-600' },
    { icon: AlignLeft, label: 'Paragraphs', value: stats.paragraphs, color: 'border-cyan-200 bg-cyan-50 text-cyan-600' },
    { icon: ListOrdered, label: 'Sentences', value: stats.sentences, color: 'border-amber-200 bg-amber-50 text-amber-600' },
    { icon: Clock, label: 'Reading time', value: readLabel, color: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
  ]

  return (
    <>
      <Seo title="Essay Word Counter - vimz Tools" description="Count words, characters and reading time as you write your essay." />
      <ToolShell
        title="Essay Word Counter"
        description="Count words, characters and reading time as you write."
        icon={<Type className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Paste or type your essay and watch the live word count."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <TextArea
              rows={16}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your essay here…"
              className="font-mono text-sm leading-relaxed"
            />
            <p className="mt-2 text-right text-xs text-slate-400">{text.length} total characters</p>
          </section>

          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Target words</h3>
              <Field label="Word goal">
                <TextInput type="number" min={0} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 1000" />
              </Field>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {Number.isFinite(tw)
                  ? `${stats.words} of ${tw} words (${percent(pct, 0)})`
                  : 'Set a goal to see how close you are.'}
              </p>
            </section>

            <div className="grid grid-cols-2 gap-3">
              {tiles.map((t) => (
                <div key={t.label} className={`rounded-2xl border bg-white p-4 ${t.color.split(' ')[0]}`}>
                  <div className={`mb-2 flex items-center gap-1.5 ${t.color.split(' ')[2]}`}>
                    <t.icon className="h-4 w-4" />
                    <p className="text-[10px] font-semibold uppercase tracking-wide">{t.label}</p>
                  </div>
                  <p className={`text-2xl font-extrabold ${t.color.split(' ')[2]}`}>{t.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}