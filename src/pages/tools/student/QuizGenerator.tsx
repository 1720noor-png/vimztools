import { useMemo, useState } from 'react'
import { ListChecks, Wand2, Eye, EyeOff } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Fact {
  term: string
  def: string
}

function parseFacts(raw: string): Fact[] {
  return raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const colon = l.indexOf(':')
      const pipe = l.indexOf('|')
      const arrow = l.indexOf('->')
      const at = [colon, pipe, arrow].filter((i) => i > 0).sort((a, b) => a - b)[0]
      if (at === undefined) return { term: l, def: l }
      const sep = at === arrow ? 2 : 1
      return { term: l.slice(0, at).trim(), def: l.slice(at + sep).trim() }
    })
    .filter((f) => f.term && f.def)
    .slice(0, 20)
}

export default function QuizGenerator() {
  const [raw, setRaw] = useState('')
  const [limit, setLimit] = useState('8')
  const [ran, setRan] = useState(false)
  const [reveal, setReveal] = useState(false)

  const facts = useMemo(() => (void ran, parseFacts(raw)), [raw, ran])
  const questions = useMemo(() => {
    void ran
    const n = parseInt(limit, 10)
    return facts.slice(0, Number.isFinite(n) ? Math.max(1, n) : 8)
  }, [facts, limit, ran])

  return (
    <>
      <Seo
        title="Quiz Generator - vimz Tools"
        description="Create custom self-assessment quizzes from your notes, right in your browser."
      />
      <ToolShell
        title="Quiz Generator"
        description="Feed in your study facts and get a self-assessment quiz with revealable answers."
        icon={<ListChecks className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Add one fact per line as term: definition, then generate your quiz."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Study facts (term: definition per line)">
              <TextArea rows={10} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'Gravity: the force that attracts two bodies\nMitosis: cell division producing two identical cells\nElectron: negatively charged subatomic particle'} />
            </Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Questions to include">
                <TextInput type="number" min={1} max={20} value={limit} onChange={(e) => setLimit(e.target.value)} />
              </Field>
              <Button onClick={() => setRan((r) => !r)} disabled={facts.length === 0}>
                <Wand2 className="h-4 w-4" /> Generate quiz
              </Button>
              <Button variant="secondary" onClick={() => setReveal((v) => !v)} disabled={questions.length === 0}>
                {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {reveal ? 'Hide answers' : 'Show answers'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your quiz will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {questions.map((f, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-bold text-slate-800">
                        Q{i + 1}. What is <span className="text-violet-700">{f.term}</span>?
                      </p>
                      {reveal && <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{f.def}</p>}
                    </div>
                  ))}
                </div>
                <CodeBlock
                  title="Answer key"
                  code={questions.map((f, i) => `${i + 1}. ${f.term} - ${f.def}`).join('\n')}
                  lang="plain"
                />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}