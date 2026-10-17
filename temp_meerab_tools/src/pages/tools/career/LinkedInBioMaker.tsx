import { useMemo, useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'

export default function LinkedInBioMaker() {
  const [d, setD] = useState({ role: '', specialty: '', years: '', skill: '', value: '' })
  const [copied, setCopied] = useState<'headline' | 'about' | null>(null)
  const { toast } = useToast()

  const set = (key: keyof typeof d) => (value: string) => setD((p) => ({ ...p, [key]: value }))

  const headline = useMemo(() => {
    const parts = [
      d.role.trim() || 'Your Role',
      d.specialty.trim() ? `Specialising in ${d.specialty.trim()}` : 'Turning challenges into wins',
      d.years.trim() ? `${d.years.trim()} years of experience` : 'Driven by impact',
      d.skill.trim() ? `Skilled in ${d.skill.trim()}` : 'Always learning',
    ]
    return parts.slice(0, 3).join(' | ')
  }, [d])

  const about = useMemo(() => {
    const role = d.role.trim() || 'a passionate professional'
    const value = d.value.trim() || 'delivering real, measurable results'
    const skill = d.skill.trim() || 'a sharp eye for detail'
    const years = d.years.trim() ? ` over ${d.years.trim()} years` : ''
    return `I'm ${role}${years}, focused on ${value}. Known for ${skill}, I love turning complex problems into simple, lasting solutions. I'm always open to connecting with people who care about doing great work — feel free to reach out.`
  }, [d])

  const copy = async (kind: 'headline' | 'about') => {
    const text = kind === 'headline' ? headline : about
    try {
      await navigator.clipboard.writeText(text)
      toast(kind === 'headline' ? 'Headline copied!' : 'About section copied!')
      setCopied(kind)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      toast('Could not copy.', 'error')
    }
  }

  const merged = `${headline}\n\n${about}`

  return (
    <>
      <Seo title="LinkedIn Bio Maker - vimz Tools" description="Write a punchy LinkedIn headline and about section." />
      <ToolShell
        title="LinkedIn Bio Maker"
        description="Write a punchy LinkedIn headline and about section."
        icon={<Share2 className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Build a headline and about section from quick prompts."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">Quick prompts</h3>
            <Field label="Your role">
              <TextInput value={d.role} onChange={(e) => set('role')(e.target.value)} placeholder="e.g. Frontend developer" />
            </Field>
            <Field label="Your specialty">
              <TextInput value={d.specialty} onChange={(e) => set('specialty')(e.target.value)} placeholder="e.g. accessible UI systems" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Years of experience">
                <TextInput value={d.years} onChange={(e) => set('years')(e.target.value)} placeholder="e.g. 6" />
              </Field>
              <Field label="Key skill">
                <TextInput value={d.skill} onChange={(e) => set('skill')(e.target.value)} placeholder="e.g. TypeScript" />
              </Field>
            </div>
            <Field label="What you deliver">
              <TextInput value={d.value} onChange={(e) => set('value')(e.target.value)} placeholder="e.g. shipping fast products" />
            </Field>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-sky-800">Headline</h3>
                <span className="text-xs font-medium text-sky-600">{headline.length} / 220 chars</span>
              </div>
              <p className="min-h-[60px] text-lg font-bold leading-snug text-slate-800">{headline}</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => copy('headline')}
              >
                {copied === 'headline' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy headline
              </Button>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-800">About section</h3>
                <span className="text-xs font-medium text-emerald-600">{about.length} / 2,600 chars</span>
              </div>
              <p className="min-h-[90px] whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{about}</p>
              <Button
                variant="secondary"
                className="mt-3"
                onClick={() => copy('about')}
              >
                {copied === 'about' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy about
              </Button>
            </section>

            <section className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Merged post</p>
                <p className="text-xs text-slate-400">{merged.length} characters total</p>
              </div>
              <Button onClick={() => copy('about')}>
                <Share2 className="h-4 w-4" /> Copy all
              </Button>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}