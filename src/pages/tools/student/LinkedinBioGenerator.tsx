import { useMemo, useState } from 'react'
import { AtSign, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type Tone = 'professional' | 'short' | 'leadership'

export default function LinkedinBioGenerator() {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [skills, setSkills] = useState('')
  const [years, setYears] = useState('3')
  const [claim, setClaim] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [ran, setRan] = useState(false)

  const bio = useMemo(() => {
    void ran
    const r = role.trim()
    if (!r) return { headline: '', about: '' }
    const skillList = skills.trim() || 'growing my craft'
    const y = years.trim() || '3'
    const claimS = claim.trim()
    const headline =
      tone === 'short'
        ? `${r} | ${skillList}`
        : tone === 'leadership'
          ? `${r} helping teams ship ${skillList}`
          : `${r} · ${y} yrs experience · ${skillList}`
    const about =
      tone === 'short'
        ? `Currently ${r.toLowerCase()}. I help projects move forward with ${skillList}.${claimS ? ` ${claimS}.` : ''} Always open to good conversations.`
        : tone === 'leadership'
          ? `For ${y} years I have led work in ${skillList}, building teams that deliver and learn together. ${claimS ? `${claimS}. ` : ''}My focus is impact: clear goals, honest feedback and momentum.\n\nInterested in ${r.toLowerCase()} roles where I can bring that experience to bear.`
          : `I am a ${r.toLowerCase()} with ${y} years of hands-on experience across ${skillList}. ${claimS ? `${claimS}. ` : ''}I care about doing the work well, communicating clearly, and helping the people around me succeed.\n\nCurrently exploring roles in ${r.toLowerCase()} and related fields.`
    const headline2 = `${r} | ${skillList}`
    return {
      headline,
      headline2,
      about,
      activity: `Sharing lessons learned in ${r.toLowerCase()}\nReposting useful tips on ${skillList}\nCelebrating wins and useful failures in ${r.toLowerCase()}`,
    }
  }, [role, skills, years, claim, tone, ran])

  return (
    <>
      <Seo
        title="LinkedIn Bio Generator - vimz Tools"
        description="Create a polished LinkedIn profile, about and activity summary in three tones."
      />
      <ToolShell
        title="LinkedIn Bio Generator"
        description="Craft a polished headline, About section and content ideas for LinkedIn."
        icon={<AtSign className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter your role and skills; choose a tone to get copy-ready sections."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Current role">
                <TextInput value={role} onChange={(e) => setRole(e.target.value)} />
              </Field>
            </div>
            <Field label="Skills (comma separated)">
              <TextArea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="product analytics, A/B testing, user research" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Years of experience">
                <TextInput value={years} onChange={(e) => setYears(e.target.value)} />
              </Field>
              <Field label="Tone">
                <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                  <option value="professional">Professional</option>
                  <option value="short">Short & punchy</option>
                  <option value="leadership">Leadership</option>
                </Select>
              </Field>
            </div>
            <Field label="One standout claim (optional)">
              <TextArea rows={2} value={claim} onChange={(e) => setClaim(e.target.value)} placeholder="e.g. Grew user retention 24% in a year" />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!role.trim()}>
              <Wand2 className="h-4 w-4" /> Generate bio
            </Button>
          </div>

          <div className="space-y-4">
            {bio.headline ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Headline</p>
                  <p className="text-sm font-semibold text-slate-800">{bio.headline}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">About</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{bio.about}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Content ideas</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{bio.activity}</p>
                </div>
                <CodeBlock title="Copyable block" code={`Headline: ${bio.headline}\n\nAbout:\n${bio.about}`} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your bio sections will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}