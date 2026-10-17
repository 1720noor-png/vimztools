import { useMemo, useState } from 'react'
import { PenLine, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const OPENERS = {
  argumentative: 'In recent years a growing number of voices have debated',
  descriptive: 'Few subjects repay careful attention as richly as',
  expository: 'This essay examines the key questions raised by',
  narrative: 'Looking back, few experiences shaped my understanding of',
}

const BODY_SEEDS: Record<string, string[]> = {
  argumentative: [
    'Opponents often argue that the case rests on emotion rather than evidence.',
    'Supporters, by contrast, point to measurable outcomes that speak for themselves.',
    'On balance, the strongest position weighs consequences as well as intentions.',
  ],
  descriptive: [
    'At first glance the topic appears straightforward, yet detail reveals its depth.',
    'A closer look uncovers patterns that casual readers miss entirely.',
    'Context matters: the same facts look very different in another setting.',
  ],
  expository: [
    'The concept can first be pinned down by defining its core terms.',
    'Evidence from several angles supports a more careful reading.',
    'Distinctions matter here, because imprecise language breeds confusion.',
  ],
  narrative: [
    'The turning point arrived sooner than I expected.',
    'In hindsight the clues had been there all along.',
    'What I carried away was simpler than the experience itself.',
  ],
}

const CLOSERS = [
  'In summary, the evidence invites careful reflection rather than easy conclusions.',
  'Taken together, these points recast the question in a more useful light.',
  'Ultimately, the value lies not in a single answer but in sharper questions.',
]

export default function EssayWriter() {
  const [topic, setTopic] = useState('The role of social media in education')
  const [kind, setKind] = useState<'argumentative' | 'descriptive' | 'expository' | 'narrative'>('argumentative')
  const [keywords, setKeywords] = useState('critical thinking, access, distraction')
  const [paragraphs, setParagraphs] = useState('4')
  const [ran, setRan] = useState(false)

  const essay = useMemo(() => {
    const n = parseInt(paragraphs, 10)
    const count = Number.isFinite(n) ? Math.max(3, Math.min(7, n)) : 4
    const keys = keywords.split(',').map((k) => k.trim()).filter(Boolean)
    const kw = keys.length ? keys.join(', ') : 'the points discussed'
    const body = []
    for (let i = 0; i < count - 2; i++) {
      const seed = BODY_SEEDS[kind][i % BODY_SEEDS[kind].length]
      body.push(`Body paragraph ${i + 1}: ${seed} This is where ${kw} come into play, and a patient reader will notice how ${i + 1 <= 1 ? 'the first claim' : 'this second line'} connects to the central argument about ${topic.toLowerCase()}. Concrete examples and counter-examples bring the point to life without sacrificing clarity.`)
    }
    void ran
    return [
      `Title: Understanding ${topic}`,
      '',
      `Introduction. ${OPENERS[kind]} ${topic.toLowerCase()}. This essay argues that a thoughtful approach must balance opportunity with caution.`,
      '',
      ...body.flatMap((b) => [b, '']),
      `Conclusion. ${CLOSERS[count % CLOSERS.length]} The debate around ${topic.toLowerCase()} is far from settled, but framing it around ${kw} gives students a durable way to enter the conversation.`,
    ].join('\n')
  }, [topic, kind, keywords, paragraphs, ran])

  return (
    <>
      <Seo
        title="Essay Writer - vimz Tools"
        description="Build a structured essay draft with introduction, body paragraphs and conclusion."
      />
      <ToolShell
        title="Essay Writer"
        description="Assemble a structured draft - introduction, body and conclusion - around your topic."
        icon={<PenLine className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter a topic, choose the essay type, and generate a scaffolded draft to edit."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <Field label="Essay type">
              <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
                <option value="argumentative">Argumentative</option>
                <option value="descriptive">Descriptive</option>
                <option value="expository">Expository</option>
                <option value="narrative">Narrative</option>
              </Select>
            </Field>
            <Field label="Keywords to weave in">
              <TextInput value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </Field>
            <Field label="Total paragraphs">
              <TextInput type="number" min={3} max={7} value={paragraphs} onChange={(e) => setParagraphs(e.target.value)} />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Write draft
            </Button>
          </div>

          <div className="space-y-4">
            {essay ? (
              <>
                <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 font-sans text-sm leading-relaxed text-slate-700">
                  {essay}
                </pre>
                <CodeBlock title="Copyable draft" code={essay} lang="markdown" />
              </>
            ) : null}
          </div>
        </div>
      </ToolShell>
    </>
  )
}