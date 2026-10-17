import { useMemo, useState } from 'react'
import { Route, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Path {
  name: string
  match: string[]
  roles: string[]
  skill: string[]
  step: string
}

const PATHS: Path[] = [
  {
    name: 'Data & Analytics',
    match: ['data', 'analytics', 'statistics', 'numbers', 'sql', 'python', 'analysis'],
    roles: ['Data Analyst', 'BI Analyst', 'Data Scientist', 'Analytics Engineer'],
    skill: ['SQL', 'statistics', 'visualisation', 'Python'],
    step: 'Build 2-3 portfolio dashboards with public datasets, then apply to junior analyst roles.',
  },
  {
    name: 'Software Engineering',
    match: ['code', 'coding', 'programming', 'software', 'developer', 'web', 'app'],
    roles: ['Junior Developer', 'Frontend Engineer', 'Backend Engineer', 'Full-stack Engineer'],
    skill: ['a strong language (e.g. JavaScript or Python)', 'version control', 'APIs'],
    step: 'Ship a public project end-to-end, contribute to one open-source repo, then apply widely.',
  },
  {
    name: 'Design & UX',
    match: ['design', 'ux', 'ui', 'creativity', 'creative', 'visual', 'graphic', 'art'],
    roles: ['Product Designer', 'UX Researcher', 'UI Designer', 'Graphic Designer'],
    skill: ['design thinking', 'Figma', 'portfolio storytelling'],
    step: 'Redesign one well-known app as a case study and publish it as a portfolio piece.',
  },
  {
    name: 'Marketing & Growth',
    match: ['marketing', 'social', 'content', 'brand', 'sales', 'communication', 'copywriting'],
    roles: ['Content Marketer', 'Social Media Manager', 'Growth Marketer', 'Digital Marketer'],
    skill: ['SEO basics', 'analytics', 'copywriting', 'channel strategy'],
    step: 'Run one small campaign or account from scratch to learn the full funnel, then document results.',
  },
  {
    name: 'Finance & Accounting',
    match: ['finance', 'accounting', 'money', 'investment', 'banking', 'audit', 'accountant'],
    roles: ['Finance Analyst', 'Accountant', 'Audit Assistant', 'Investment Analyst'],
    skill: ['spreadsheets', 'financial statements', 'modelling basics'],
    step: 'Pass a spreadsheet test cold, learn the three financial statements, then target entry-level roles.',
  },
  {
    name: 'Education & Teaching',
    match: ['teaching', 'tutor', 'education', 'training', 'training people', 'explain'],
    roles: ['Teaching Assistant', 'Tutor', 'Curriculum Developer', 'Trainer'],
    skill: ['lesson planning', 'assessment design', 'clear communication'],
    step: 'Gain two paid or volunteer teaching experiences, then build a small lesson-portfolio to show style.',
  },
  {
    name: 'Health & Science',
    match: ['health', 'medicine', 'biology', 'biotech', 'laboratory', 'research science', 'chemistry'],
    roles: ['Lab Assistant', 'Research Associate', 'Public Health Officer', 'Quality Assurance'],
    skill: ['lab protocols', 'data recording', 'regulatory basics'],
    step: 'Volunteer in a lab or clinic, take one certification, then apply to assistant-level postings.',
  },
  {
    name: 'Public Sector & NGO',
    match: ['ngo', 'development', 'policy', 'public', 'governance', 'community', 'projects'],
    roles: ['Program Assistant', 'Research Officer', 'Policy Trainee', 'Community Officer'],
    skill: ['report writing', 'stakeholder coordination', 'M&E basics'],
    step: 'Volunteer with one NGO, then target program-assistant roles and build an M&E skill set.',
  },
]

export default function CareerPathFinder() {
  const [interests, setInterests] = useState('data, python, dashboards')
  const [ran, setRan] = useState(false)

  const matches = useMemo(() => {
    void ran
    const terms = interests.toLowerCase().split(/[\s,;]+/).filter(Boolean)
    if (terms.length === 0) return []
    return PATHS.map((p) => ({
      path: p,
      score: terms.reduce((acc, t) => acc + (p.match.some((m) => m.includes(t) || t.includes(m)) ? 1 : 0), 0),
    }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
  }, [interests, ran])

  return (
    <>
      <Seo
        title="Career Path Finder - vimz Tools"
        description="Match your interests and skills to realistic career paths with a concrete first step."
      />
      <ToolShell
        title="Career Path Finder"
        description="Match your interests to realistic career directions and a concrete first step."
        icon={<Route className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="List your interests and skills (comma separated) to see best-fit paths."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Your interests and skills">
              <TextArea rows={3} value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="data, python, dashboards" />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!interests.trim()}>
              <Wand2 className="h-4 w-4" /> Find paths
            </Button>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Focus hint</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Be specific - "data" scores differently from "teaching". The engine matches exact and partial keywords.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Suggested paths will appear here.
              </div>
            ) : (
              <>
                {matches.map(({ path, score }, i) => (
                  <section key={path.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">{path.name}</h3>
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">match {score}</span>
                    </div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Possible roles</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {path.roles.map((r) => (
                        <span key={r} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{r}</span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Skills to build</p>
                    <p className="mt-1 text-sm text-slate-600">{path.skill.join(' · ')}</p>
                    <p className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <Route className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                      {path.step}
                    </p>
                    {i === 0 && <p className="mt-2 text-xs font-semibold text-emerald-600">Top match based on your keywords.</p>}
                  </section>
                ))}
              </>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}