import { useMemo, useState } from 'react'
import { BriefcaseBusiness, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Bank {
  type: string
  questions: Array<{ q: string; tip: string }>
}

const BANKS: Bank[] = [
  {
    type: 'general',
    questions: [
      { q: 'Tell me about yourself.', tip: 'Give a 2-minute arc: current work, key strengths, why this role.' },
      { q: 'Why do you want this job?', tip: 'Link the role to your goals and to what the company does.' },
      { q: 'What are your strengths?', tip: 'Pick 2-3, each backed by a concrete example.' },
      { q: 'What is your biggest weakness?', tip: 'Choose a real, minor weakness and show how you manage it.' },
      { q: 'Where do you see yourself in five years?', tip: 'Show ambition aligned with the company direction.' },
    ],
  },
  {
    type: 'behavioral',
    questions: [
      { q: 'Tell me about a time you disagreed with a teammate.', tip: 'Use STAR: Situation, Task, Action, Result.' },
      { q: 'Describe a time you failed. What happened?', tip: 'Show ownership, what you learned, and the follow-up.' },
      { q: 'Give an example of a time you showed leadership.', tip: 'You do not need a title - focus on influence.' },
      { q: 'Tell me about a time you met a tight deadline.', tip: 'Explain how you prioritised and communicated.' },
      { q: 'Describe a time you received difficult feedback.', tip: 'Show that you listened and changed behaviour.' },
    ],
  },
  {
    type: 'technical',
    questions: [
      { q: 'Walk me through a recent project from start to finish.', tip: 'Structure: goal, approach, trade-offs, result.' },
      { q: 'How would you debug a problem you cannot reproduce?', tip: 'Think aloud: logs, isolation, hypotheses, testing.' },
      { q: 'How do you decide which library or tool to use?', tip: 'Compare trade-offs: maintenance, community, fit.' },
      { q: 'How would you estimate effort for a new feature?', tip: 'Break it into tasks, add buffer, name assumptions.' },
      { q: 'Explain a technical concept simply.', tip: 'Check understanding, use an analogy, invite questions.' },
    ],
  },
  {
    type: 'leadership',
    questions: [
      { q: 'How do you motivate a struggling team member?', tip: 'Listen first, set clear goals, agree support.' },
      { q: 'How do you handle scope changes mid-project?', tip: 'Re-prioritise openly and re-confirm expectations.' },
      { q: 'How do you give feedback to a senior colleague?', tip: 'Be specific, timely and focused on the work.' },
      { q: 'What does good communication look like to you?', tip: 'Clarity, brevity and matching the audience.' },
      { q: 'How do you decide what not to do?', tip: 'Use priorities and impact; say no with reasons.' },
    ],
  },
]

const TYPE_LABEL: Record<string, string> = { general: 'General', behavioral: 'Behavioural (STAR)', technical: 'Technical', leadership: 'Leadership' }

export default function InterviewQuestionGenerator() {
  const [type, setType] = useState('behavioral')
  const [role, setRole] = useState('')
  const [count, setCount] = useState('8')
  const [ran, setRan] = useState(false)

  const bank = BANKS.find((b) => b.type === type)!
  const deck = useMemo(() => {
    void ran
    const n = parseInt(count, 10)
    const take = Number.isFinite(n) ? Math.max(3, Math.min(12, n)) : 8
    const rotated = [...bank.questions]
    for (let i = 0; i < rotated.length; i++) {
      const j = (i * 7 + 3) % rotated.length
      ;[rotated[i], rotated[j]] = [rotated[j], rotated[i]]
    }
    let out: Array<{ q: string; tip: string }> = []
    let i = 0
    while (out.length < take) {
      out = out.concat(rotated.slice(0, take - out.length))
      i++
    }
    return out.slice(0, take)
  }, [bank, count, ran])

  const text = useMemo(() => deck.map((q, i) => `${i + 1}. ${q.q}\n   Tip: ${q.tip}`).join('\n'), [deck])

  return (
    <>
      <Seo
        title="Interview Question Generator - vimz Tools"
        description="Build a practice question list with answer tips for any interview type."
      />
      <ToolShell
        title="Interview Question Generator"
        description="Build a tailored interview question list with answer tips for practice."
        icon={<BriefcaseBusiness className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Pick a question type, add the role, and generate a practice deck."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Question type">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {BANKS.map((b) => (
                  <option key={b.type} value={b.type}>{TYPE_LABEL[b.type]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Target role">
              <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Junior Data Analyst" />
            </Field>
            <Field label="Number of questions">
              <TextInput type="number" min={3} max={12} value={count} onChange={(e) => setCount(e.target.value)} />
            </Field>
            <Button onClick={() => setRan((r) => !r)}>
              <Wand2 className="h-4 w-4" /> Generate questions
            </Button>
          </div>

          <div className="space-y-4">
            {deck.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your question deck will appear here.
              </div>
            ) : (
              <>
                {role && <h3 className="text-lg font-bold text-slate-900">Practice set: {role}</h3>}
                <div className="space-y-3">
                  {deck.map((q, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-800">{i + 1}. {q.q}</p>
                      <p className="mt-1.5 flex gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-violet-50 px-2 py-0.5 font-semibold text-violet-700">Tip</span>
                        {q.tip}
                      </p>
                    </div>
                  ))}
                </div>
                <CodeBlock title="Copyable deck" code={text} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}