import { useMemo, useState } from 'react'
import { TextCursorInput, Copy, RotateCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { TextArea } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'

export default function WordCounter() {
  const [text, setText] = useState('')
  const { toast } = useToast()

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const sentences = text.trim() ? text.trim().split(/[.!?]+/).filter((s) => s.trim()).length : 0
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter((p) => p.trim()).length : Math.min(1, text.length ? 1 : 0)
    const wpm = 225
    const readingMin = words / wpm
    const speakingMin = words / 130
    const readingTime = readingMin < 1 ? '< 1' : Math.ceil(readingMin) === 1 ? '1' : String(Math.ceil(readingMin))
    const speakingTime = speakingMin < 1 ? '< 1' : String(Math.ceil(speakingMin))
    const lines = text.split('\n').length
    return { words, chars, charsNoSpace, sentences, paragraphs, lines, readingTime, speakingTime }
  }, [text])

  const transform = (fn: (s: string) => string) => setText(fn(text))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied to clipboard!')
    } catch {
      toast('Could not copy.', 'error')
    }
  }

  return (
    <>
      <Seo
        title="Word Counter & Case Converter - vimz Tools"
        description="Count words, characters, sentences, paragraphs and reading time in real time, plus UPPER, lower and Title case conversion."
      />
      <ToolShell
        title="Word Counter & Case Converter"
        description="Real-time word count, character count, reading time and instant UPPER / lower / Title case conversion. Everything processed locally."
        icon={<TextCursorInput className="h-6 w-6" />}
        breadcrumb="Student Tools"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: 'Words', value: stats.words },
            { label: 'Characters', value: stats.chars },
            { label: 'No spaces', value: stats.charsNoSpace },
            { label: 'Sentences', value: stats.sentences },
            { label: 'Paragraphs', value: stats.paragraphs },
            { label: 'Lines', value: stats.lines },
            { label: 'Read time', value: `${stats.readingTime} min` },
            { label: 'Speak time', value: `${stats.speakingTime} min` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-xl font-extrabold text-primary-800">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button onClick={() => transform((s) => s.toUpperCase())} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">UPPERCASE</button>
          <button onClick={() => transform((s) => s.toLowerCase())} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">lowercase</button>
          <button onClick={() => transform((s) => s.replace(/\b\w/g, (c) => c.toUpperCase()))} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">Title Case</button>
          <button onClick={() => transform((s) => s.split(/\s+/).filter(Boolean).map((w) => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(' '))} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">camelCase</button>
          <button onClick={() => transform((s) => s.split(/\s+/).filter(Boolean).map((w) => w[0] ? w[0].toUpperCase() + w.slice(1) : w).join(''))} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">PascalCase</button>
          <button onClick={() => transform((s) => s.replace(/[_\s-]+/g, '-').toLowerCase())} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">kebab-case</button>
          <button onClick={() => transform((s) => s.replace(/[_\s-]+/g, '_').toLowerCase())} className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">snake_case</button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          {text && (
            <>
              <button onClick={copy} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700">
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button onClick={() => setText('')} className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50">
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            </>
          )}
        </div>

        <TextArea
          rows={16}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="mt-4 min-h-[360px] font-mono text-base leading-relaxed"
        />
      </ToolShell>
    </>
  )
}