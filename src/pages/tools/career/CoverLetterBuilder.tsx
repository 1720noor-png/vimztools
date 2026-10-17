import { useState } from 'react'
import { Mail } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

export default function CoverLetterBuilder() {
  const [l, setL] = useState({
    name: '',
    role: '',
    company: '',
    hook: '',
    skills: '',
    achievement: '',
    closing: '',
  })
  const set = (key: keyof typeof l) => (value: string) => setL((p) => ({ ...p, [key]: value }))
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <Seo title="Cover Letter Builder - vimz Tools" description="Write a structured cover letter for any application." />
      <ToolShell
        title="Cover Letter Builder"
        description="Write a structured cover letter for any application."
        icon={<Mail className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Answer a few prompts to build a structured cover letter."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">Prompts</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Your name">
                <TextInput value={l.name} onChange={(e) => set('name')(e.target.value)} placeholder="Jane Cooper" />
              </Field>
              <Field label="Role you're applying for">
                <TextInput value={l.role} onChange={(e) => set('role')(e.target.value)} placeholder="Product Designer" />
              </Field>
              <Field label="Company">
                <TextInput value={l.company} onChange={(e) => set('company')(e.target.value)} placeholder="Acme Inc." />
              </Field>
              <Field label="Interest / hook">
                <TextInput value={l.hook} onChange={(e) => set('hook')(e.target.value)} placeholder="Why this role excites you" />
              </Field>
              <Field label="Your skills">
                <TextInput value={l.skills} onChange={(e) => set('skills')(e.target.value)} placeholder="e.g. user research, prototyping" />
              </Field>
              <Field label="One achievement">
                <TextInput value={l.achievement} onChange={(e) => set('achievement')(e.target.value)} placeholder="e.g. redesigned onboarding, +30% activation" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Closing line (optional)">
                  <TextInput value={l.closing} onChange={(e) => set('closing')(e.target.value)} placeholder="e.g. Looking forward to discussing how I can contribute…" />
                </Field>
              </div>
            </div>
          </section>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:sticky lg:top-6">
              <p className="text-right text-sm text-slate-500">{date}</p>
              <p className="mt-6 text-sm text-slate-600">Dear Hiring Manager,</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {l.hook
                  ? `I'm writing to apply for the ${l.role || 'open role'} at ${l.company || 'your company'}. ${l.hook}.`
                  : `I'm writing to apply for the ${l.role || 'open role'} at ${l.company || 'your company'}.`}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {l.skills
                  ? `My background in ${l.skills} has prepared me to deliver here. I bring hands-on experience doing this work well, and I'm comfortable owning the details from start to finish.`
                  : `I bring hands-on experience and a habit of learning fast, which I'd put to work from day one.`}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {l.achievement
                  ? `One result I'm proud of: ${l.achievement}. I'd love to bring the same focus to ${l.company || 'your team'}.`
                  : `I'm eager to bring the same focus and energy to ${l.company || 'your team'}.`}
              </p>
              {l.closing && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{l.closing}</p>}
              <p className="mt-6 text-sm text-slate-700">Sincerely,</p>
              <p className="text-sm font-bold text-slate-800">{l.name || 'Your Name'}</p>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}