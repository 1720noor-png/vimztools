import { useMemo, useState } from 'react'
import { MessagesSquare, Shuffle, ChevronRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

type Difficulty = 'Easy' | 'Medium' | 'Hard'
type Q = { role: string; d: Difficulty; q: string }

const ROLES = ['Software Engineer', 'Designer', 'Project Manager', 'Sales', 'General'] as const
const DIFFS = ['Easy', 'Medium', 'Hard'] as const

const QUESTIONS: Q[] = [
  { role: 'Software Engineer', d: 'Easy', q: 'Walk me through a project you built. What did you do and why?' },
  { role: 'Software Engineer', d: 'Easy', q: 'How do you approach debugging an issue you cannot reproduce?' },
  { role: 'Software Engineer', d: 'Medium', q: 'Describe a time a pull request you wrote was rejected. What happened next?' },
  { role: 'Software Engineer', d: 'Medium', q: 'How would you design a rate limiter for a public API?' },
  { role: 'Software Engineer', d: 'Hard', q: 'Explain a distributed system concept you used and the trade-offs you made.' },
  { role: 'Software Engineer', d: 'Hard', q: 'How do you balance shipping speed with code quality on a deadline?' },
  { role: 'Designer', d: 'Easy', q: 'Walk me through your portfolio and the process behind your favourite project.' },
  { role: 'Designer', d: 'Easy', q: 'How do you gather requirements before starting a design?' },
  { role: 'Designer', d: 'Medium', q: 'Tell me about a time a stakeholder rejected your design. How did you respond?' },
  { role: 'Designer', d: 'Medium', q: 'How do you measure whether your design solved the problem?' },
  { role: 'Designer', d: 'Hard', q: 'Describe a design system decision you made and its long-term impact.' },
  { role: 'Designer', d: 'Hard', q: 'How do you handle usability tests that contradict your assumptions?' },
  { role: 'Project Manager', d: 'Easy', q: 'How do you keep a project on schedule when scope creeps?' },
  { role: 'Project Manager', d: 'Easy', q: 'How do you prioritise competing requests from stakeholders?' },
  { role: 'Project Manager', d: 'Medium', q: 'Tell me about a project that failed. What did you learn?' },
  { role: 'Project Manager', d: 'Medium', q: 'How do you communicate a delayed milestone to leadership?' },
  { role: 'Project Manager', d: 'Hard', q: "How do you decide when to push back on an executive's priority?" },
  { role: 'Project Manager', d: 'Hard', q: 'Describe how you handled a conflict between two senior engineers.' },
  { role: 'Sales', d: 'Easy', q: 'Walk me through your approach to a cold call.' },
  { role: 'Sales', d: 'Easy', q: 'How do you build rapport with a skeptical prospect?' },
  { role: 'Sales', d: 'Medium', q: 'Tell me about a deal you lost. What would you do differently?' },
  { role: 'Sales', d: 'Medium', q: 'How do you qualify whether a prospect is a good fit?' },
  { role: 'Sales', d: 'Hard', q: 'How would you sell to a customer who already uses a cheaper competitor?' },
  { role: 'Sales', d: 'Hard', q: 'How do you keep pipeline momentum during a slow quarter?' },
  { role: 'General', d: 'Easy', q: 'Tell me about yourself and why you are here.' },
  { role: 'General', d: 'Easy', q: "What are your strengths and one thing you're working on?" },
  { role: 'General', d: 'Medium', q: 'Describe a time you handled feedback that felt unfair.' },
  { role: 'General', d: 'Medium', q: 'Why do you want to leave your current role?' },
  { role: 'General', d: 'Hard', q: 'What would your last manager say is your biggest blind spot?' },
  { role: 'General', d: 'Hard', q: 'Where do you see yourself in five years, and why?' },
]

export default function InterviewQuestionGenerator() {
  const [role, setRole] = useState<string>(ROLES[0])
  const [diff, setDiff] = useState<string>('All')
  const [index, setIndex] = useState(0)

  const pool = useMemo(() => QUESTIONS.filter((q) => q.role === role && (diff === 'All' || q.d === diff)), [role, diff])

  const shuffle = () => setIndex(Math.floor(Math.random() * Math.max(1, pool.length)))
  const next = () => setIndex((i) => (pool.length ? (i + 1) % pool.length : 0))
  const cur = pool[index] ?? pool[0]

  return (
    <>
      <Seo title="Interview Question Generator - vimz Tools" description="Generate realistic interview questions to practice with." />
      <ToolShell
        title="Interview Question Generator"
        description="Generate realistic interview questions to practice with."
        icon={<MessagesSquare className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Pick a role to generate practice interview questions."
      >
        <div className="mx-auto max-w-2xl">
          <section className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
            <Select value={role} onChange={(e) => { setRole(e.target.value); setIndex(0) }}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select value={diff} onChange={(e) => { setDiff(e.target.value); setIndex(0) }}>
              <option value="All">All difficulties</option>
              {DIFFS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </section>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <MessagesSquare className="h-7 w-7" />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{role}</span>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{cur?.d ?? '—'}</span>
            </div>
            <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-800">{cur?.q ?? 'No questions match these filters.'}</p>
          </div>

          <div className="mt-5 flex justify-center gap-3">
            <Button variant="secondary" onClick={next}>
              <ChevronRight className="h-4 w-4" /> Next question
            </Button>
            <Button onClick={shuffle} disabled={pool.length === 0}>
              <Shuffle className="h-4 w-4" /> Shuffle
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">{pool.length} question{pool.length === 1 ? '' : 's'} in the current pool</p>
        </div>
      </ToolShell>
    </>
  )
}