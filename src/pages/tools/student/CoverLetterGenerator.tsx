import { useMemo, useState } from 'react'
import { FilePenLine, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type Focus = 'experience' | 'growth' | 'results'

export default function CoverLetterGenerator() {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [skills, setSkills] = useState('')
  const [achieve, setAchieve] = useState('')
  const [focus, setFocus] = useState<Focus>('experience')
  const [ran, setRan] = useState(false)

  const letter = useMemo(() => {
    const c = company.trim()
    const r = role.trim()
    if (!c || !r) return ''
    const skillList = skills.trim() || 'relevant skills'
    const achiever = achieve.trim()
    const angle =
      focus === 'growth'
        ? `What draws me to ${c} is the chance to grow ${skillList} while working with people who set high standards.`
        : focus === 'results'
          ? `In my previous work I focused on delivering tangible results, and I would bring that discipline to ${r} at ${c}.`
          : `My background has been built around ${skillList}, which maps directly onto what ${r} at ${c} requires.`
    const proof = achiever ? `As an example, ${achiever}. ` : `I have applied these skills on real projects and am always ready to share specific examples. `
    void ran
    return `Dear Hiring Manager,\n\nI am writing to apply for the position of ${r} at ${c}. ${angle} ${proof}\nI work well in teams, communicate clearly, and take ownership of outcomes - qualities that matter in a role like this.\n\nI would welcome the opportunity to discuss how I can contribute to ${c} in more detail.\n\nYours sincerely,\n${name.trim() || '[Your name]'}\n${skills.trim() ? `Core skills: ${skills.trim()}` : ''}`
  }, [company, role, name, skills, achieve, focus, ran])

  return (
    <>
      <Seo
        title="Cover Letter Generator - vimz Tools"
        description="Draft a tailored cover letter for any role with a few quick details."
      />
      <ToolShell
        title="Cover Letter Generator"
        description="Draft a tailored cover letter with a focused angle for any role."
        icon={<FilePenLine className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Fill the company and role at minimum - the letter builds itself from there."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Company">
                <TextInput value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>
              <Field label="Role">
                <TextInput value={role} onChange={(e) => setRole(e.target.value)} />
              </Field>
            </div>
            <Field label="Your name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Skills (comma separated)">
              <TextArea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="team leadership, data analysis, client reporting" />
            </Field>
            <Field label="One achievement (optional)">
              <TextArea rows={2} value={achieve} onChange={(e) => setAchieve(e.target.value)} placeholder="I cut reporting time by half in six months" />
            </Field>
            <Field label="Letter angle">
              <Select value={focus} onChange={(e) => setFocus(e.target.value as Focus)}>
                <option value="experience">Experience-led</option>
                <option value="growth">Growth-led</option>
                <option value="results">Results-led</option>
              </Select>
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!company.trim() || !role.trim()}>
              <Wand2 className="h-4 w-4" /> Write letter
            </Button>
          </div>

          <div className="space-y-4">
            {letter ? (
              <>
                <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 font-sans text-sm leading-relaxed text-slate-700">
                  {letter}
                </pre>
                <CodeBlock title="Copyable letter" code={letter} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your cover letter will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}