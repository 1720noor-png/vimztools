import { useMemo, useState } from 'react'
import { ClipboardPen, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Section {
  heading: string
  questions: string[]
}

const SECTION_TEMPLATES: Record<string, string[]> = {
  demographics: [
    'What is your age group?',
    'What is your gender?',
    'Which is your highest level of education?',
  ],
  behaviour: [
    'How often do you currently engage with the topic?',
    'Which channels do you use most regularly?',
  ],
  attitudes: [
    'To what extent do you agree with the following statements about the topic?',
    'Rate how important the topic is to you personally.',
  ],
  outcomes: [
    'Has the topic changed your habits in the last year?',
    'What is your main reason for getting involved?',
  ],
  challenges: [
    'What is the biggest challenge you face regarding the topic?',
    'How could the situation be improved in your opinion?',
  ],
  followup: ['Is there anything else you would like to share?', 'Would you be willing to be contacted for a follow-up interview?'],
}

export default function QuestionnaireGenerator() {
  const [topic, setTopic] = useState('water conservation behaviour')
  const [goal, setGoal] = useState('understand current practices and barriers')
  const [sections, setSections] = useState('4')
  const [ran, setRan] = useState(false)

  const questionnaire = useMemo(() => {
    const t = topic.trim()
    if (!t) return []
    const n = parseInt(sections, 10)
    const keys = Object.keys(SECTION_TEMPLATES)
    const take = Number.isFinite(n) ? Math.max(2, Math.min(6, n)) : 4
    const chosen = keys.slice(0, take)
    const out: Section[] = chosen.map((k) => ({
      heading: k.charAt(0).toUpperCase() + k.slice(1),
      questions: SECTION_TEMPLATES[k].map((q) => q.replace('the topic', `the topic (${t})`)),
    }))
    void ran
    return out
  }, [topic, sections, ran])

  const fullText = useMemo(() => {
    void ran
    if (!questionnaire.length) return ''
    const intro = `Questionnaire: ${topic}\n\nObjective: ${goal || 'to gather current views'}\n\nThank you for taking part. Your answers are anonymous and will be used for academic purposes only.\n`
    const body = questionnaire.map((s) => `## ${s.heading}\n${s.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`).join('\n\n')
    return `${intro}\n${body}\n\nClosing: Thank you for your time.`
  }, [questionnaire, topic, goal, ran])

  return (
    <>
      <Seo
        title="Questionnaire Generator - vimz Tools"
        description="Assemble a complete research questionnaire with targeted sections in minutes."
      />
      <ToolShell
        title="Questionnaire Generator"
        description="Assembly a complete questionnaire - intro, sections and closing - for any study."
        icon={<ClipboardPen className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Give a topic, objective and number of sections to draft the full questionnaire."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Research topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <Field label="Objective">
              <TextArea rows={2} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. understand current practices and barriers" />
            </Field>
            <Field label="Number of sections">
              <TextInput type="number" min={2} max={6} value={sections} onChange={(e) => setSections(e.target.value)} />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Build questionnaire
            </Button>
          </div>

          <div className="space-y-4">
            {questionnaire.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your questionnaire will appear here.
              </div>
            ) : (
              <>
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 font-sans text-sm leading-relaxed text-slate-700">
                  {fullText}
                </pre>
                <CodeBlock title="Copyable questionnaire" code={fullText} lang="markdown" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}