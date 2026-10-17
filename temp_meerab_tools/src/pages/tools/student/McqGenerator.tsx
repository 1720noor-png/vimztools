import { useMemo, useState } from 'react'
import { ClipboardList, Wand2 } from 'lucide-react'
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(((i * 2654435761 + 0x9e3779b9) % (i + 1) + (i + 1)) % (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Mcq {
  q: string
  options: string[]
  answer: number
}

export default function McqGenerator() {
  const [raw, setRaw] = useState('')
  const [limit, setLimit] = useState('5')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [ran, setRan] = useState(false)

  const facts = useMemo(() => (void ran, parseFacts(raw)), [raw, ran])
  const questions = useMemo<Mcq[]>(() => {
    void ran
    const n = parseInt(limit, 10)
    const top = facts.slice(0, Number.isFinite(n) ? Math.max(1, n) : 5)
    return top.flatMap((f) => {
      if (facts.length < 4) return []
      const distractors = shuffle(facts.filter((x) => x.term !== f.term)).slice(0, 3).map((d) => d.def)
      if (distractors.length < 2) return []
      const options = shuffle([f.def, ...distractors])
      return [{ q: `Which option best defines "${f.term}"?`, options, answer: options.indexOf(f.def) } as Mcq]
    })
  }, [facts, limit, ran])

  const picks = answers
  const score = questions.reduce((acc, m, i) => acc + (picks[i] === m.answer ? 1 : 0), 0)

  return (
    <>
      <Seo
        title="MCQ Generator - vimz Tools"
        description="Build multiple choice questions with automatic distractors from your study facts."
      />
      <ToolShell
        title="MCQ Generator"
        description="Create multiple choice questions where the distractors are generated from your own notes."
        icon={<ClipboardList className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Add one fact per line (term: definition) and generate the exam-style MCQs."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Study facts (term: definition per line, 4+)">
              <TextArea rows={10} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={'Gravity: the force that attracts two bodies\nMitosis: cell division producing two identical cells\nElectron: negatively charged subatomic particle\nKinetic energy: energy of motion'} />
            </Field>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Number of questions">
                <TextInput type="number" min={1} max={15} value={limit} onChange={(e) => setLimit(e.target.value)} />
              </Field>
              <Button onClick={() => { setRan((r) => !r); setAnswers({}) }} disabled={facts.length < 4}>
                <Wand2 className="h-4 w-4" /> Generate MCQs
              </Button>
            </div>
            {facts.length > 0 && facts.length < 4 && (
              <p className="text-sm font-medium text-rose-600">Add at least 4 facts so distractors can be built.</p>
            )}
          </div>

          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your multiple choice questions will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {questions.map((m, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">Question {i + 1}</p>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{i + 1} of {questions.length}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{m.q}</p>
                      <div className="mt-3 space-y-2">
                        {m.options.map((o, j) => {
                          const chosen = picks[i] === j
                          const correct = m.answer === j
                          return (
                            <button
                              key={j}
                              onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                                chosen && correct
                                  ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-800'
                                  : chosen
                                    ? 'border-rose-400 bg-rose-50 text-rose-800'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300'
                              }`}
                            >
                              {String.fromCharCode(65 + j)}. {o}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                {score > 0 && (
                  <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center">
                    <p className="text-sm font-semibold text-white">Score: {score} / {questions.length}</p>
                  </div>
                )}
                <CodeBlock
                  title="Answer key"
                  code={questions.map((m, i) => `${i + 1}. ${String.fromCharCode(65 + m.answer)} - ${m.options[m.answer]}`).join('\n')}
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