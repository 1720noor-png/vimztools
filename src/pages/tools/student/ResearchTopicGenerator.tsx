import { useMemo, useState } from 'react'
import { Microscope, Wand2, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

const ANGLES = [
  'The role of',
  'A comparative study of',
  'Barriers to',
  'The impact of',
  'Trends and future directions in',
]

const SCOPE = ['offers a fresh angle on an underexplored problem', 'connects theoretical debates with current practice', 'draws on recent data to test assumptions']

function generate(topic: string, depth: 'undergraduate' | 'graduate' | 'doctoral'): string[] {
  const t = topic.trim()
  if (!t) return []
  const out: string[] = []
  for (let i = 0; i < 5; i++) {
    const angle = ANGLES[i]
    const scope = SCOPE[i % SCOPE.length]
    const wording = depth === 'undergraduate' ? 'a manageable research question' : depth === 'graduate' ? 'a focused empirical study' : 'an original contribution to the field'
    out.push(`${angle} ${t.toLowerCase()} - ${scope}, aiming at ${wording}.`)
  }
  return [...new Set(out)]
}

export default function ResearchTopicGenerator() {
  const [topic, setTopic] = useState('social media and youth mental health')
  const [depth, setDepth] = useState<'undergraduate' | 'graduate' | 'doctoral'>('undergraduate')
  const [ran, setRan] = useState(false)

  const ideas = useMemo(() => (void ran, generate(topic, depth)), [topic, depth, ran])

  return (
    <>
      <Seo
        title="Research Topic Generator - vimz Tools"
        description="Spin a broad interest into five scoped, ready-to-pitch research topics."
      />
      <ToolShell
        title="Research Topic Generator"
        description="Turn a broad interest into several scoped, pitch-ready research topics."
        icon={<Microscope className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter your broad area of interest and the level of study, then generate."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Broad interest">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. urban farming" />
            </Field>
            <Field label="Level">
              <Select value={depth} onChange={(e) => setDepth(e.target.value as typeof depth)}>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="doctoral">Doctoral</option>
              </Select>
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Generate topics
            </Button>
          </div>

          <div className="space-y-4">
            {ideas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Scoped topics will appear here.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {ideas.map((idea, i) => (
                    <div key={i} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                      <p className="text-sm leading-relaxed text-slate-700">{idea}</p>
                    </div>
                  ))}
                </div>
                <CodeBlock title="Copyable topics" code={ideas.map((v, i) => `${i + 1}. ${v}`).join('\n')} lang="plain" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}