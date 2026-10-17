import { useMemo, useState } from 'react'
import { MessagesSquare, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type Kind = 'descriptive' | 'comparative' | 'causal' | 'exploratory'

const FRAME: Record<Kind, { open: string; who: string }> = {
  descriptive: {
    open: 'How are {topic} currently occurring in {context}?',
    who: 'Who are the main actors, and how do they currently behave with respect to {topic}?',
  },
  comparative: {
    open: 'How does {topic} differ between {first} and {second}?',
    who: 'Which group experiences the stronger effect, and why?',
  },
  causal: {
    open: 'What is the effect of {topic} on {outcome} in {context}?',
    who: 'Which mediating factors strengthen or weaken this effect?',
  },
  exploratory: {
    open: 'What factors shape {topic} in {context}?',
    who: 'Which of these factors has been least studied so far?',
  },
}

function build(topic: string, kind: Kind, context: string): string[] {
  if (!topic.trim()) return []
  const t = topic.trim()
  const c = context.trim() || 'your study setting'
  const f = FRAME[kind]
  const q1 = f.open.replaceAll('{topic}', t.toLowerCase()).replaceAll('{context}', c)
  const q2 = f.who.replaceAll('{topic}', t.toLowerCase())
  return [
    `Main research question: ${q1}`,
    `Sub-question 1: ${q2}`,
    `Sub-question 2: What method (survey, interview, experiment, secondary data) suits this question best?`,
    `Sub-question 3: What single measure or indicator would let you answer the main question?`,
  ]
}

export default function ResearchQuestionGenerator() {
  const [topic, setTopic] = useState('remote learning')
  const [kind, setKind] = useState<Kind>('causal')
  const [context, setContext] = useState('secondary schools')
  const [ran, setRan] = useState(false)

  const questions = useMemo(() => (void ran, build(topic, kind, context)), [topic, kind, context, ran])

  return (
    <>
      <Seo
        title="Research Question Generator - vimz Tools"
        description="Draft a main research question plus well-scoped sub-questions for any study."
      />
      <ToolShell
        title="Research Question Generator"
        description="Draft a solid main question and sharply scoped sub-questions."
        icon={<MessagesSquare className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter your topic and context, choose the type of question, and generate."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Research topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. remote learning" />
            </Field>
            <Field label="Question type">
              <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                <option value="descriptive">Descriptive</option>
                <option value="comparative">Comparative</option>
                <option value="causal">Causal / effect</option>
                <option value="exploratory">Exploratory</option>
              </Select>
            </Field>
            <Field label="Context / population">
              <TextArea rows={2} value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. secondary schools in Accra" />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Generate questions
            </Button>
          </div>

          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your research questions will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{i + 1}</span>
                      <p className="text-sm leading-relaxed text-slate-700">{q}</p>
                    </div>
                  ))}
                </div>
                <CodeBlock title="Copyable questions" code={questions.map((q, i) => `${i + 1}. ${q}`).join('\n')} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}