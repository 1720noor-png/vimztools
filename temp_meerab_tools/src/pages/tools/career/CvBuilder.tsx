import { useMemo, useState } from 'react'
import { FileText, Plus, Trash } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type ExpLine = { id: string; role: string; company: string; period: string }

export default function CvBuilder() {
  const [info, setInfo] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
  })
  const [experience, setExperience] = useState<ExpLine[]>([{ id: uid(), role: '', company: '', period: '' }])

  const setInfoField = (key: keyof typeof info) => (value: string) => setInfo((p) => ({ ...p, [key]: value }))
  const addExp = () => setExperience((p) => [...p, { id: uid(), role: '', company: '', period: '' }])
  const removeExp = (id: string) => setExperience((p) => p.filter((x) => x.id !== id))
  const setExp = (id: string, key: keyof ExpLine, value: string) =>
    setExperience((p) => p.map((x) => (x.id === id ? { ...x, [key]: value } : x)))

  const ready = useMemo(() => experience.filter((x) => x.role || x.company), [experience])

  return (
    <>
      <Seo title="CV Builder - vimz Tools" description="Structure a clean CV with experience, skills and education." />
      <ToolShell
        title="CV Builder"
        description="Structure a clean CV with experience, skills and education."
        icon={<FileText className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Fill in your details and preview a clean CV as you type."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Contact</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <TextInput value={info.name} onChange={(e) => setInfoField('name')(e.target.value)} placeholder="Jane Cooper" />
                </Field>
                <Field label="Job title">
                  <TextInput value={info.title} onChange={(e) => setInfoField('title')(e.target.value)} placeholder="Product Designer" />
                </Field>
                <Field label="Email">
                  <TextInput value={info.email} onChange={(e) => setInfoField('email')(e.target.value)} placeholder="jane@email.com" />
                </Field>
                <Field label="Phone">
                  <TextInput value={info.phone} onChange={(e) => setInfoField('phone')(e.target.value)} placeholder="+1 555 000 1234" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Location">
                    <TextInput value={info.location} onChange={(e) => setInfoField('location')(e.target.value)} placeholder="New York, NY" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Summary">
                    <TextArea rows={3} value={info.summary} onChange={(e) => setInfoField('summary')(e.target.value)} placeholder="Results-driven professional with 5+ years of…" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Skills (comma separated)">
                    <TextArea rows={2} value={info.skills} onChange={(e) => setInfoField('skills')(e.target.value)} placeholder="Figma, TypeScript, UX Research" />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Experience lines</h3>
              <div className="space-y-3">
                {experience.map((x) => (
                  <div key={x.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <TextInput value={x.role} onChange={(e) => setExp(x.id, 'role', e.target.value)} placeholder="Role" />
                      <TextInput value={x.company} onChange={(e) => setExp(x.id, 'company', e.target.value)} placeholder="Company" />
                      <div className="flex gap-2">
                        <TextInput className="flex-1" value={x.period} onChange={(e) => setExp(x.id, 'period', e.target.value)} placeholder="2021 – Present" />
                        {experience.length > 1 && (
                          <button onClick={() => removeExp(x.id)} className="rounded-md p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500" aria-label="Remove">
                            <Trash className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-3" onClick={addExp}>
                <Plus className="h-4 w-4" /> Add experience
              </Button>
            </section>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:sticky lg:top-6">
              <header className="border-b-2 border-primary-700 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">{info.name || 'Your Name'}</h2>
                <p className="mt-0.5 text-sm text-primary-700">{info.title || 'Job Title'}</p>
                <p className="mt-1.5 text-xs text-slate-500">
                  {[info.email, info.phone, info.location].filter(Boolean).join(' · ') || 'email · phone · location'}
                </p>
              </header>
              {info.summary && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Summary</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{info.summary}</p>
                </section>
              )}
              {ready.length > 0 && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Experience</h3>
                  <div className="space-y-3">
                    {ready.map((x) => (
                      <div key={x.id} className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          {x.role || 'Role'} {x.company && <span className="font-normal text-slate-500">· {x.company}</span>}
                        </p>
                        <span className="shrink-0 text-xs text-slate-400">{x.period}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {info.skills && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Skills</h3>
                  <p className="text-sm leading-relaxed text-slate-700">{info.skills}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}