import { useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Briefcase, Download, Loader2, Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'

interface Experience {
  id: number
  role: string
  company: string
  period: string
  details: string
}

interface Education {
  id: number
  degree: string
  school: string
  period: string
  detail: string
}

const blankExp = (id: number): Experience => ({ id, role: '', company: '', period: '', details: '' })
const blankEdu = (id: number): Education => ({ id, degree: '', school: '', period: '', detail: '' })

export default function ResumeBuilder() {
  const [personal, setPersonal] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [experiences, setExperiences] = useState<Experience[]>([blankExp(1)])
  const [education, setEducation] = useState<Education[]>([blankEdu(1)])
  const [busy, setBusy] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const setId = (arr: number[]) => (arr.reduce((m, i) => Math.max(m, i), 0) + 1)

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills((p) => [...p, s])
      setSkillInput('')
    }
  }

  const download = async () => {
    if (!previewRef.current) return
    setBusy(true)
    try {
      const el = previewRef.current
      await html2pdf()
        .set({
          margin: 8,
          filename: `${personal.name.trim() || 'resume'}-resume.pdf`,
          image: { type: 'jpeg', quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          ...{ pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } },
        })
        .from(el)
        .save()
      toast('Resume PDF downloaded!')
    } catch (e) {
      console.error(e)
      toast('Could not generate PDF.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo
        title="Free Resume / CV Builder - vimz Tools"
        description="Build a professional resume with a live preview and download it as a clean PDF. 100% free, private and running in your browser."
      />
      <ToolShell
        title="Resume / CV Builder"
        description="Fill in your details and watch a clean, ATS-friendly resume render live. Download it as a polished PDF — generated entirely on your device."
        icon={<Briefcase className="h-6 w-6" />}
        breadcrumb="Document Generators"
      >
        <div className="mb-6 flex justify-end">
          <Button onClick={download} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? 'Rendering PDF...' : 'Download PDF'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Personal details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <TextInput value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} placeholder="Jane Cooper" />
                </Field>
                <Field label="Job title">
                  <TextInput value={personal.title} onChange={(e) => setPersonal({ ...personal, title: e.target.value })} placeholder="Product Designer" />
                </Field>
                <Field label="Email">
                  <TextInput value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} placeholder="jane@email.com" />
                </Field>
                <Field label="Phone">
                  <TextInput value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="+1 555 000 1234" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Location">
                    <TextInput value={personal.location} onChange={(e) => setPersonal({ ...personal, location: e.target.value })} placeholder="New York, USA" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Professional summary">
                    <TextArea rows={4} value={personal.summary} onChange={(e) => setPersonal({ ...personal, summary: e.target.value })} placeholder="Results-driven professional with 5+ years of experience in..." />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Work experience</h3>
              <div className="space-y-4">
                {experiences.map((exp, i) => (
                  <div key={exp.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Position {i + 1}</span>
                      {experiences.length > 1 && (
                        <button onClick={() => setExperiences((p) => p.filter((x) => x.id !== exp.id))} className="text-slate-400 transition hover:text-rose-500" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Role">
                        <TextInput value={exp.role} onChange={(e) => setExperiences((p) => p.map((x) => (x.id === exp.id ? { ...x, role: e.target.value } : x)))} />
                      </Field>
                      <Field label="Company">
                        <TextInput value={exp.company} onChange={(e) => setExperiences((p) => p.map((x) => (x.id === exp.id ? { ...x, company: e.target.value } : x)))} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Period">
                          <TextInput value={exp.period} onChange={(e) => setExperiences((p) => p.map((x) => (x.id === exp.id ? { ...x, period: e.target.value } : x)))} placeholder="Jan 2021 – Present" />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Achievements / responsibilities">
                          <TextArea rows={3} value={exp.details} onChange={(e) => setExperiences((p) => p.map((x) => (x.id === exp.id ? { ...x, details: e.target.value } : x)))} />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-4" onClick={() => setExperiences((p) => [...p, blankExp(setId(p.map((x) => x.id)))] )}>
                <Plus className="h-4 w-4" /> Add position
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Education</h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={edu.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Education {i + 1}</span>
                      {education.length > 1 && (
                        <button onClick={() => setEducation((p) => p.filter((x) => x.id !== edu.id))} className="text-slate-400 transition hover:text-rose-500" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Degree">
                        <TextInput value={edu.degree} onChange={(e) => setEducation((p) => p.map((x) => (x.id === edu.id ? { ...x, degree: e.target.value } : x)))} placeholder="B.Sc. Computer Science" />
                      </Field>
                      <Field label="School / University">
                        <TextInput value={edu.school} onChange={(e) => setEducation((p) => p.map((x) => (x.id === edu.id ? { ...x, school: e.target.value } : x)))} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Period">
                          <TextInput value={edu.period} onChange={(e) => setEducation((p) => p.map((x) => (x.id === edu.id ? { ...x, period: e.target.value } : x)))} placeholder="2015 – 2019" />
                        </Field>
                      </div>
                      <div className="sm:col-span-2">
                        <Field label="Notes (honors, GPA, etc.)">
                          <TextInput value={edu.detail} onChange={(e) => setEducation((p) => p.map((x) => (x.id === edu.id ? { ...x, detail: e.target.value } : x)))} />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-4" onClick={() => setEducation((p) => [...p, blankEdu(setId(p.map((x) => x.id)))] )}>
                <Plus className="h-4 w-4" /> Add education
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Skills</h3>
              <div className="flex gap-2">
                <TextInput value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} placeholder="e.g. TypeScript" />
                <Button variant="secondary" onClick={addSkill} className="shrink-0">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="group inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800">
                      {s}
                      <button onClick={() => setSkills((p) => p.filter((x) => x !== s))} className="text-primary-400 hover:text-rose-500" aria-label={`Remove ${s}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Live preview */}
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-500">Live preview</p>
            <div
              ref={previewRef}
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm [&_*]:bg-transparent [&_*]:text-black"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              <header className="border-b-2 border-primary-700 pb-4 text-center">
                <h2 className="text-2xl font-bold">{personal.name || 'Your Name'}</h2>
                <p className="mt-0.5 text-primary-700">{personal.title || 'Job Title'}</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  {personal.email && (
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{personal.email}</span>
                  )}
                  {personal.phone && (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{personal.phone}</span>
                  )}
                  {personal.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{personal.location}</span>
                  )}
                </div>
              </header>

              {personal.summary && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Summary</h3>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed">{personal.summary}</p>
                </section>
              )}

              {experiences.some((e) => e.role || e.company) && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Experience</h3>
                  <div className="space-y-3">
                    {experiences.filter((e) => e.role || e.company).map((e) => (
                      <div key={e.id}>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-bold">{e.role || 'Role'} {e.company && <span className="font-normal text-slate-500">· {e.company}</span>}</p>
                          <span className="text-[10px] text-slate-500">{e.period}</span>
                        </div>
                        {e.details && <p className="mt-0.5 whitespace-pre-wrap text-[11px] leading-relaxed">{e.details}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education.some((e) => e.degree || e.school) && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Education</h3>
                  <div className="space-y-2">
                    {education.filter((e) => e.degree || e.school).map((e) => (
                      <div key={e.id}>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-bold">{e.degree || 'Degree'} {e.school && <span className="font-normal text-slate-500">· {e.school}</span>}</p>
                          <span className="text-[10px] text-slate-500">{e.period}</span>
                        </div>
                        {e.detail && <p className="text-[11px] text-slate-600">{e.detail}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {skills.length > 0 && (
                <section className="mt-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-widest text-primary-800">Skills</h3>
                  <p className="text-xs leading-relaxed">{skills.join(' · ')}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}