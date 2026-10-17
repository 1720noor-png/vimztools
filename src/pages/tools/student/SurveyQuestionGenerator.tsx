import { useMemo, useState } from 'react'
import { TableProperties, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Q {
  text: string
  type: 'likert' | 'mcq' | 'open'
  options?: string[]
}

const LIKERT = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

const STEMS = [
  'Overall, I am satisfied with {topic}.',
  '{Topic} meets my expectations.',
  'I would recommend {topic} to others.',
  'The quality of {topic} is consistent over time.',
  'I find {topic} easy to access and use.',
  'More resources should be put into {topic}.',
  'I understand the value of {topic} to my work.',
]

function build(topic: string, count: number): Q[] {
  const t = topic.trim()
  if (!t) return []
  const tLower = t.charAt(0).toLowerCase() + t.slice(1)
  const tUpper = t.charAt(0).toUpperCase() + t.slice(1)
  const likertQs = STEMS.map((s) => ({ text: s.replace('{topic}', tLower).replace('{Topic}', tUpper), type: 'likert' as const }))
  const mcq: Q = { text: `How would you rate your overall experience with ${tLower}?`, type: 'mcq', options: ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'] }
  const open: Q = { text: `In your own words, what about ${tLower} could be improved most?`, type: 'open' }
  const mixed: Q[] = [mcq, open]
  const loop: Q[] = []
  for (let i = 0; i < count; i++) loop.push(i % 2 === 0 ? likertQs[(i * 2) % likertQs.length] : mixed[i % mixed.length])
  return loop
}

export default function SurveyQuestionGenerator() {
  const [topic, setTopic] = useState('the campus library service')
  const [count, setCount] = useState('8')
  const [ran, setRan] = useState(false)

  const questions = useMemo(() => {
    void ran
    const n = parseInt(count, 10)
    return build(topic, Number.isFinite(n) ? Math.max(3, Math.min(15, n)) : 8)
  }, [topic, count, ran])

  const text = useMemo(() => questions.map((q, i) => `${i + 1}. ${q.text}${q.type === 'likert' ? ' [Likert 1-5]' : q.type === 'mcq' ? ` (${q.options!.join(' / ')})` : ' [Open answer]'}`).join('\n'), [questions])

  return (
    <>
      <Seo
        title="Survey Question Generator - vimz Tools"
        description="Generate balanced Likert, choice and open-ended survey questions for your topic."
      />
      <ToolShell
        title="Survey Question Generator"
        description="Draft a balanced mix of Likert, multiple-choice and open survey questions."
        icon={<TableProperties className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Name your topic and pick how many questions you need for the survey."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Survey topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. the campus library service" />
            </Field>
            <Field label="Number of questions">
              <TextInput type="number" min={3} max={15} value={count} onChange={(e) => setCount(e.target.value)} />
            </Field>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Response key</p>
              <p className="text-xs leading-relaxed text-slate-500">Likert scale: 1 = Strongly disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly agree</p>
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Generate questions
            </Button>
          </div>

          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your survey questions will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{i + 1}. {q.text}</p>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold capitalize text-slate-500">{q.type}</span>
                      </div>
                      {q.type === 'mcq' && q.options && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {q.options.map((o) => (
                            <span key={o} className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">{o}</span>
                          ))}
                        </div>
                      )}
                      {q.type === 'likert' && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {LIKERT.map((o) => (
                            <span key={o} className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-500">{o}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <CodeBlock title="Copyable survey" code={text} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}