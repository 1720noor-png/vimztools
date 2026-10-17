import { useMemo, useState } from 'react'
import { TextAlignStart, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type Type = 'descriptive' | 'quantitative' | 'qualitative' | 'review'

const STEMS: Record<Type, string> = {
  descriptive: 'Research suggests that {topic} can be meaningfully understood by examining its most salient features.',
  quantitative: 'Drawing on recent quantitative evidence, this study found a measurable relationship between variables related to {topic}.',
  qualitative: 'Interviews with participants revealed several recurring themes that together shed light on {topic}.',
  review: 'A growing body of work across disciplines suggests that {topic} is best approached as a layered phenomenon.',
}

export default function AbstractGenerator() {
  const [type, setType] = useState<Type>('descriptive')
  const [topic, setTopic] = useState('')
  const [method, setMethod] = useState('')
  const [findings, setFindings] = useState('')
  const [ran, setRan] = useState(false)

  const abstract = useMemo(() => {
    void ran
    const t = topic.trim()
    if (!t) return ''
    const stem = STEMS[type].replace('{topic}', t.toLowerCase())
    const methodS = method.trim() ? `A ${type === 'qualitative' ? 'qualitative' : 'systematic'} approach was used: ${method.trim()} ` : ''
    const findingsS = findings.trim() ? `Key findings indicate that ${findings.trim()} ` : ''
    return `${stem} ${methodS}${findingsS}These results offer practical guidance for future work in this area.`
  }, [type, topic, method, findings, ran])

  return (
    <>
      <Seo
        title="Abstract Generator - vimz Tools"
        description="Draft a concise, structured abstract for papers and proposals from three quick fields."
      />
      <ToolShell
        title="Abstract Generator"
        description="Compose a compact, structured abstract from your topic, method and findings."
        icon={<TextAlignStart className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Fill in the three prompts - the abstract assembles itself in one paragraph."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Type of study">
              <Select value={type} onChange={(e) => setType(e.target.value as Type)}>
                <option value="descriptive">Descriptive</option>
                <option value="quantitative">Quantitative</option>
                <option value="qualitative">Qualitative</option>
                <option value="review">Literature review</option>
              </Select>
            </Field>
            <Field label="Topic">
              <TextInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. water conservation in urban Ghana" />
            </Field>
            <Field label="Method / design">
              <TextArea rows={2} value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. 120 household surveys analysed with descriptive statistics" />
            </Field>
            <Field label="Key findings">
              <TextArea rows={3} value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="e.g. households reduced usage by a third after metering" />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!topic.trim()}>
              <Wand2 className="h-4 w-4" /> Write abstract
            </Button>
          </div>

          <div className="space-y-4">
            {abstract ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm leading-relaxed text-slate-700">{abstract}</p>
                </div>
                <CodeBlock title="Copyable abstract" code={abstract} lang="plain" />
                <p className="text-xs text-slate-400">
                  Aim for roughly 150 words in the final version and trim
                </p>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your abstract will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}