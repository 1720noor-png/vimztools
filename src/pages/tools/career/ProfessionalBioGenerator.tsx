import { useMemo, useState } from 'react'
import { UserRound, Copy, Check } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'

export default function ProfessionalBioGenerator() {
  const [d, setD] = useState({ name: '', role: '', highlight: '' })
  const [copied, setCopied] = useState<'short' | 'long' | null>(null)
  const { toast } = useToast()

  const set = (key: keyof typeof d) => (value: string) => setD((p) => ({ ...p, [key]: value }))

  const result = useMemo(() => {
    const name = d.name.trim() || 'Your name'
    const role = d.role.trim() || 'a driven professional'
    const hl = d.highlight.trim()
    const short = hl
      ? `${name} is ${role} who ${hl.endsWith('.') ? hl.slice(0, -1) : hl}.`
      : `${name} is ${role} focused on delivering measurable results.`
    const long = `${name} is ${role}. With a track record of ${hl || 'turning complex problems into clear, practical solutions'}, ${name.split(' ')[0] || 'they'} brings both careful thinking and steady execution to every project. ${name.split(' ')[0] || 'They'} enjoy working in teams where good questions lead to better answers, and always aim to leave things better than found.`
    return { name, short, long }
  }, [d])

  const copy = async (kind: 'short' | 'long') => {
    try {
      await navigator.clipboard.writeText(result[kind])
      toast(kind === 'short' ? 'Short bio copied!' : 'Long bio copied!')
      setCopied(kind)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      toast('Could not copy.', 'error')
    }
  }

  return (
    <>
      <Seo title="Professional Bio Generator - vimz Tools" description="Generate short professional bios from a few details." />
      <ToolShell
        title="Professional Bio Generator"
        description="Generate short professional bios from a few details."
        icon={<UserRound className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Answer three prompts to generate a short bio."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800">Three prompts</h3>
            <Field label="Your name">
              <TextInput value={d.name} onChange={(e) => set('name')(e.target.value)} placeholder="Jane Cooper" />
            </Field>
            <Field label="Your role">
              <TextInput value={d.role} onChange={(e) => set('role')(e.target.value)} placeholder="e.g. a product designer" />
            </Field>
            <Field label="One highlight">
              <TextInput value={d.highlight} onChange={(e) => set('highlight')(e.target.value)} placeholder="e.g. ship accessible, research-backed products" />
            </Field>
          </section>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2">
            <section className="flex flex-col rounded-2xl border border-sky-200 bg-sky-50/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-sky-800">Short bio</h3>
                <span className="flex items-center gap-1 text-xs text-sky-600">
                  <Check className="h-3 w-3" /> {result.short.length} chars
                </span>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-slate-700">{result.short}</p>
              <Button variant="secondary" className="mt-4 self-start" onClick={() => copy('short')}>
                {copied === 'short' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy short
              </Button>
            </section>

            <section className="flex flex-col rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-emerald-800">Long bio</h3>
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3 w-3" /> {result.long.length} chars
                </span>
              </div>
              <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{result.long}</p>
              <Button variant="secondary" className="mt-4 self-start" onClick={() => copy('long')}>
                {copied === 'long' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy long
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
              <h4 className="text-sm font-bold text-slate-800">Swap-in checklist</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                <li>Use the short version for speaker intros and social profiles.</li>
                <li>Use the long version for blogs, directories and team pages.</li>
                <li>Adjust the sentences to sound like the way you actually talk.</li>
              </ul>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}