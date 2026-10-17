import { useMemo, useState } from 'react'
import { Presentation, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Slide {
  title: string
  bullets: string[]
}

const TAIL = [
  { title: 'Example in practice', bullets: ['Walk through one worked example tied to your audience', 'Show a quick demo, screenshot or short story', 'Connect the example back to the key message'] },
  { title: 'Summary', bullets: ['Restate the single most important takeaway', 'Recap the three ideas from the middle', 'Close with one question to spark discussion'] },
]

export default function PresentationContentGenerator() {
  const [topic, setTopic] = useState('Renewable energy on campus')
  const [slides, setSlides] = useState('8')
  const [audience, setAudience] = useState('class')
  const [ran, setRan] = useState(false)

  const deck = useMemo(() => {
    const n = parseInt(slides, 10)
    const count = Number.isFinite(n) ? Math.max(5, Math.min(12, n)) : 8
    const middle = Math.max(2, count - 4)
    const out: Slide[] = [
      { title: `${topic}`, bullets: ['Welcome the audience and introduce yourself', `Thesis: ${topic.toLowerCase()} matters here and now`, 'Roadmap: context, core ideas, example, action'] },
      { title: 'Why this matters', bullets: ['Frame the problem in one vivid sentence', `Audience hook: what does this mean for a ${audience}?`, 'State the stakes - what changes if we act or ignore it'] },
    ]
    for (let i = 0; i < middle; i++) {
      out.push({
        title: `Key idea ${i + 1}`,
        bullets: [
          `One focused claim about ${topic.toLowerCase()}`,
          'Support it with a fact, stat or short quote',
          'Transition sentence that leads into the next idea',
        ],
      })
    }
    out.push(...TAIL)
    void ran
    return out.slice(0, count)
  }, [topic, slides, audience, ran])

  const outline = useMemo(() => deck.map((s, i) => `${i + 1}. ${s.title}\n${s.bullets.map((b) => `   - ${b}`).join('\n')}`).join('\n\n'), [deck])

  return (
    <>
      <Seo
        title="Presentation Content Generator - vimz Tools"
        description="Outline a complete slide deck with titles and talking points for any topic."
      />
      <ToolShell
        title="Presentation Content Generator"
        description="Sketch a full slide deck - titles and talking points - ready to build in any tool."
        icon={<Presentation className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter a topic and slide count; each card is one slide with speaker notes."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Number of slides">
                <TextInput type="number" min={5} max={12} value={slides} onChange={(e) => setSlides(e.target.value)} />
              </Field>
              <Field label="Audience">
                <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option value="class">Class</option>
                  <option value="committee">Committee</option>
                  <option value="employer">Employer</option>
                  <option value="conference">Conference</option>
                </Select>
              </Field>
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Generate deck
            </Button>
          </div>

          <div className="space-y-4">
            {deck.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your slide outline will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {deck.map((s, i) => (
                    <section key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">{i + 1}. {s.title}</h3>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{i + 1}/{deck.length}</span>
                      </div>
                      <ul className="space-y-1">
                        {s.bullets.map((b, j) => (
                          <li key={j} className="flex gap-2 text-sm text-slate-600">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
                <CodeBlock title="Full outline" code={outline} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}