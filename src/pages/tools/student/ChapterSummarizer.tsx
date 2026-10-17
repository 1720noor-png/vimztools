import { useMemo, useState } from 'react'
import { Book, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Section {
  heading: string
  points: string[]
}

function splitSections(text: string, count: number): Section[] {
  const blocks = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)

  if (blocks.length === 0) return []
  const groups: string[][] = []
  const size = Math.max(1, Math.ceil(blocks.length / count))
  for (let i = 0; i < blocks.length; i += size) {
    groups.push(blocks.slice(i, i + size))
  }

  return groups.map((g, gi) => {
    const terms: Record<string, number> = {}
    const joined = g.join(' ')
    for (const w of joined.toLowerCase().split(/[^a-z']+/)) {
      if (w.length >= 4 && !['with', 'that', 'this', 'from', 'have', 'their', 'which', 'would'].includes(w)) {
        terms[w] = (terms[w] ?? 0) + 1
      }
    }
    const key = Object.entries(terms).sort((a, b) => b[1] - a[1])[0]?.[0]
    const head = key ? key.replace(/^./, (c) => c.toUpperCase()) : 'Point'
    return { heading: `Point ${gi + 1}: ${head}`, points: g }
  })
}

export default function ChapterSummarizer() {
  const [text, setText] = useState('')
  const [sections, setSections] = useState('3')
  const [ran, setRan] = useState(false)

  const results = useMemo(() => {
    void ran
    const n = parseInt(sections, 10)
    const c = Number.isFinite(n) ? Math.max(1, Math.min(6, n)) : 3
    return text.trim() ? splitSections(text, c) : []
  }, [text, sections, ran])

  const flatten = useMemo(() => results.map((s) => `${s.heading}\n${s.points.map((p) => `- ${p}`).join('\n')}`).join('\n\n'), [results])

  return (
    <>
      <Seo
        title="Chapter Summarizer - vimz Tools"
        description="Chunk a long chapter into section-by-section takeaway lists for quick revision."
      />
      <ToolShell
        title="Chapter Summarizer"
        description="Slice a long chapter into named sections with short takeaway lists."
        icon={<Book className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Paste the chapter text, choose how many sections to split into, then summarize."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Chapter text">
              <TextArea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the full chapter here..." />
            </Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Number of sections">
                <TextInput type="number" min={1} max={6} value={sections} onChange={(e) => setSections(e.target.value)} />
              </Field>
              <Button onClick={() => setRan((r) => !r)} disabled={!text.trim()}>
                <Wand2 className="h-4 w-4" /> Summarize
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Section summaries will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {results.map((s, i) => (
                    <section key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="mb-2 text-sm font-bold text-violet-700">{s.heading}</h3>
                      <ul className="space-y-1.5">
                        {s.points.map((p, j) => (
                          <li key={j} className="text-sm leading-relaxed text-slate-700">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
                <CodeBlock title="Full summary" code={flatten} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}