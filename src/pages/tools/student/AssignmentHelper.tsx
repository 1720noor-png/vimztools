import { useMemo, useState } from 'react'
import { ClipboardCheck, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const STRUCTURES: Record<string, { intro: string[]; sections: string[]; closing: string[] }> = {
  analysis: {
    intro: ['Restate the assignment brief in one sentence', 'Define the object or case you are analysing', 'Announce the analytical framework you will use'],
    sections: ['Key theme 1: describe the evidence', 'Key theme 2: compare perspectives', 'Key theme 3: weigh strengths and weaknesses'],
    closing: ['Synthesise the three themes', 'Answer the original question directly', 'Note the limitations of your analysis'],
  },
  reflection: {
    intro: ['Describe the experience or situation you are reflecting on', 'Explain why it mattered to you'],
    sections: ['What happened: describe the event factually', 'So what: what did you learn or feel', 'Now what: how will this change future practice'],
    closing: ['Summarise the learning gained', 'Link it back to course outcomes'],
  },
  report: {
    intro: ['Title page with your details', 'Executive summary with key findings', 'Table of contents'],
    sections: ['Methods: how the work was produced', 'Findings: what the evidence showed', 'Discussion: what the findings mean'],
    closing: ['Conclusions and recommendations', 'References and appendices'],
  },
  'problem-set': {
    intro: ['Copy the problem statement exactly', 'List the assumptions you are allowed to make'],
    sections: ['Step 1: restate the goal in your own words', 'Step 2: outline the approach before calculating', 'Step 3: show every working step, labelled'],
    closing: ['Box the final answer with correct units', 'Check the answer against the original question'],
  },
}

export default function AssignmentHelper() {
  const [kind, setKind] = useState<'analysis' | 'reflection' | 'report' | 'problem-set'>('analysis')
  const [title, setTitle] = useState('')
  const [requirements, setRequirements] = useState('')
  const [ran, setRan] = useState(false)

  const plan = useMemo(() => {
    void ran
    const s = STRUCTURES[kind]
    if (!s) return null
    return {
      intro: s.intro,
      sections: s.sections,
      closing: s.closing,
      brief: requirements.trim()
        ? requirements.split('\n').map((l) => l.trim()).filter(Boolean)
        : ['Word count', 'Deadline', 'Formatting rules'],
    }
  }, [kind, requirements, ran])

  return (
    <>
      <Seo
        title="Assignment Helper - vimz Tools"
        description="Break any assignment down into a structured outline and a ready-to-check checklist."
      />
      <ToolShell
        title="Assignment Helper"
        description="Turn an assignment brief into a concrete structure plus a step-by-step checklist."
        icon={<ClipboardCheck className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Choose the assignment type and note the brief; the plan builds itself."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Assignment type">
              <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
                <option value="analysis">Analysis / essay</option>
                <option value="reflection">Reflective journal</option>
                <option value="report">Report</option>
                <option value="problem-set">Problem set</option>
              </Select>
            </Field>
            <Field label="Assignment title (optional)">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Impact of inflation on SMEs" />
            </Field>
            <Field label="Requirements (one per line, optional)">
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder={'1500 words\nDue Friday\nHarvard references'}
              />
            </Field>
            <Button onClick={() => setRan((r) => !r)}>
              <Wand2 className="h-4 w-4" /> Build plan
            </Button>
          </div>

          <div className="space-y-4">
            {plan && (
              <>
                {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
                <PlanBlock heading="Start here" items={plan.intro} />
                <PlanBlock heading="Middle" items={plan.sections} />
                <PlanBlock heading="Finish" items={plan.closing} />
                <PlanBlock heading="Requirements to confirm" items={plan.brief} tone="amber" />
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}

function PlanBlock({ heading, items, tone = 'violet' }: { heading: string; items: string[]; tone?: 'violet' | 'amber' }) {
  const chip = tone === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-violet-800'
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${chip}`}>{heading}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}