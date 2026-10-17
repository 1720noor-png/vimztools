import { useMemo, useState } from 'react'
import { FileText, ListChecks, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const STOPS = new Set([
  'the', 'and', 'for', 'are', 'with', 'that', 'this', 'from', 'have', 'has', 'was', 'were',
  'into', 'their', 'these', 'those', 'than', 'then', 'some', 'which', 'while', 'when', 'where',
  'will', 'would', 'could', 'should', 'can', 'may', 'must', 'about', 'after', 'also', 'because',
  'been', 'before', 'both', 'but', 'each', 'had', 'its', 'just', 'like', 'most', 'much', 'not',
  'only', 'other', 'our', 'out', 'over', 'such', 'them', 'there', 'through', 'too', 'very', 'your',
])

function summarize(text: string, count: number): { bullets: string[]; terms: string[] } {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)

  const freq: Record<string, number> = {}
  for (const w of text.toLowerCase().split(/[^a-z']+/)) {
    if (w.length < 3 || STOPS.has(w)) continue
    freq[w] = (freq[w] ?? 0) + 1
  }
  const terms = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w)

  const scored = sentences.map((s, i) => {
    const words = s.toLowerCase().split(/[^a-z']+/)
    let score = words.reduce((acc, w) => acc + (freq[w] ?? 0), 0)
    score += (i / Math.max(sentences.length, 1)) * 1.5
    return { s, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const picks = scored.slice(0, count).sort((a, b) => {
    const ia = sentences.indexOf(a.s)
    const ib = sentences.indexOf(b.s)
    return ia - ib
  })
  const bullets = picks.map((p) => {
    const t = p.s.trim()
    return t.charAt(0).toUpperCase() + t.slice(1)
  })
  return { bullets, terms }
}

export default function NotesSummarizer() {
  const [text, setText] = useState('')
  const [count, setCount] = useState('6')
  const [ran, setRan] = useState(false)

  const result = useMemo(() => {
    void ran
    const n = parseInt(count, 10)
    const c = Number.isFinite(n) ? Math.max(2, Math.min(12, n)) : 6
    return text.trim() ? summarize(text, c) : null
  }, [text, count, ran])

  return (
    <>
      <Seo
        title="Notes Summarizer - vimz Tools"
        description="Condense raw lecture notes into clear, concise bullet points in your browser."
      />
      <ToolShell
        title="Notes Summarizer"
        description="Paste messy lecture notes and get the key points distilled into a tidy summary."
        icon={<FileText className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Paste your notes, pick how many points you want, then generate."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Raw notes">
              <TextArea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your lecture notes here..." />
            </Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Number of points">
                <TextInput type="number" min={2} max={12} value={count} onChange={(e) => setCount(e.target.value)} />
              </Field>
              <Button onClick={() => setRan((r) => !r)} disabled={!text.trim()}>
                <Wand2 className="h-4 w-4" /> Summarize
              </Button>
            </div>
            {result && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <ListChecks className="h-3.5 w-3.5" /> Key terms detected
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.terms.map((t) => (
                    <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {result ? (
              <>
                <div className="space-y-3">
                  {result.bullets.map((b, i) => (
                    <div key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-700">{b}</p>
                    </div>
                  ))}
                </div>
                <CodeBlock title="Plain text summary" code={result.bullets.map((b) => `- ${b}`).join('\n')} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your condensed bullets will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}