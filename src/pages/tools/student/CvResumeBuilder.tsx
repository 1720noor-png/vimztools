import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, BriefcaseBusiness, GraduationCap, History, IdCard, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import CodeBlock from '../../../components/ui/CodeBlock'
import {
  createCvResume,
  deleteCvResume,
  listCvResumes,
  type CvResume,
} from '../../../lib/studentApi'

interface ExpRow {
  id: number
  role: string
  company: string
  period: string
  bullets: string
}

interface EduRow {
  id: number
  degree: string
  school: string
  year: string
}

export default function CvResumeBuilder() {
  const [reloadTick, setReloadTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<CvResume[]>([])
  const [result, setResult] = useState<CvResume | null>(null)
  const [formError, setFormError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [skills, setSkills] = useState('')
  const [expRows, setExpRows] = useState<ExpRow[]>([{ id: 1, role: '', company: '', period: '', bullets: '' }])
  const [eduRows, setEduRows] = useState<EduRow[]>([{ id: 1, degree: '', school: '', year: '' }])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const rows = await listCvResumes()
        if (cancelled) return
        setHistory(rows)
        setOffline(false)
      } catch {
        if (!cancelled) setOffline(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [reloadTick])

  const retry = () => {
    setOffline(false)
    setLoading(true)
    setReloadTick((t) => t + 1)
  }

  const build = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    if (!name.trim()) {
      setFormError('Your name is required.')
      return
    }
    setBusy(true)
    const experience = expRows
      .filter((r) => r.role.trim() || r.company.trim())
      .map((r) => ({
        role: r.role.trim() || r.company.trim(),
        company: r.company.trim(),
        period: r.period.trim() || undefined,
        bullets: r.bullets.split('\n').map((b) => b.trim()).filter(Boolean),
      }))
    const education = eduRows
      .filter((r) => r.degree.trim())
      .map((r) => ({
        degree: r.degree.trim(),
        school: r.school.trim(),
        year: r.year.trim() || undefined,
      }))
    const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean)
    createCvResume({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      location: location.trim() || null,
      headline: headline.trim() || null,
      summary: summary.trim() || null,
      experience,
      education,
      skills: skillList,
    })
      .then((saved) => {
        setResult(saved)
        setHistory((prev) => [saved, ...prev.filter((h) => h.id !== saved.id)])
        return listCvResumes()
      })
      .then((rows) => setHistory(rows))
      .catch(() => {
        setOffline(true)
        setFormError('The CV could not be generated - the server is unreachable.')
      })
      .finally(() => setBusy(false))
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this saved CV?')) return
    try {
      await deleteCvResume(id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
      setResult((prev) => (prev?.id === id ? null : prev))
    } catch {
      setOffline(true)
    }
  }

  return (
    <>
      <Seo
        title="CV / Resume Builder - vimz Tools"
        description="Assemble a clean, markdown-ready CV with experience, education and skills from the server."
      />
      <ToolShell
        title="CV / Resume Builder"
        description="Assemble your experience, education and skills into a clean markdown CV."
        icon={<IdCard className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Fill in each section - the server composes a tidy resume and saves it."
      >
        {offline && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                The CV builder server is unreachable, so resumes cannot be composed right now.
              </p>
            </div>
            <Button variant="secondary" className="px-3 py-2 text-xs" onClick={retry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry connection
            </Button>
          </div>
        )}

        {loading ? (
          <HybridLoader label="Loading saved CVs…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="space-y-4">
              <form onSubmit={build} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <IdCard className="h-4 w-4 text-primary-600" /> CV details
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    markdown output
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Full name">
                    <TextInput value={name} onChange={(e) => setName(e.target.value)} />
                  </Field>
                  <Field label="Title / headline">
                    <TextInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Student Data Analyst" />
                  </Field>
                  <Field label="Email">
                    <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </Field>
                  <Field label="Location">
                    <TextInput value={location} onChange={(e) => setLocation(e.target.value)} />
                  </Field>
                </div>
                <Field label="Professional summary (optional)">
                  <TextArea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
                </Field>

                <h4 className="mb-2 mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <BriefcaseBusiness className="h-3.5 w-3.5" /> Experience
                </h4>
                <div className="space-y-3">
                  {expRows.map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <TextInput value={r.role} onChange={(e) => setExpRows((v) => v.map((x) => (x.id === r.id ? { ...x, role: e.target.value } : x)))} placeholder="Role" />
                        <TextInput value={r.company} onChange={(e) => setExpRows((v) => v.map((x) => (x.id === r.id ? { ...x, company: e.target.value } : x)))} placeholder="Company" />
                        <div className="flex gap-2">
                          <TextInput value={r.period} onChange={(e) => setExpRows((v) => v.map((x) => (x.id === r.id ? { ...x, period: e.target.value } : x)))} placeholder="Period" />
                          <button
                            type="button"
                            onClick={() => setExpRows((v) => v.filter((x) => x.id !== r.id))}
                            className="shrink-0 self-center text-slate-300 transition hover:text-rose-500"
                            aria-label="Remove experience"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <TextArea rows={2} value={r.bullets} onChange={(e) => setExpRows((v) => v.map((x) => (x.id === r.id ? { ...x, bullets: e.target.value } : x)))} placeholder="One achievement per line" />
                    </div>
                  ))}
                </div>
                <Button type="button" variant="secondary" className="mt-2 text-xs" onClick={() => setExpRows((v) => [...v, { id: Date.now(), role: '', company: '', period: '', bullets: '' }])}>
                  <Plus className="h-3.5 w-3.5" /> Add experience
                </Button>

                <h4 className="mb-2 mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5" /> Education
                </h4>
                <div className="space-y-2">
                  {eduRows.map((r) => (
                    <div key={r.id} className="grid grid-cols-[1fr_1fr_80px_36px] items-center gap-2">
                      <TextInput value={r.degree} onChange={(e) => setEduRows((v) => v.map((x) => (x.id === r.id ? { ...x, degree: e.target.value } : x)))} placeholder="Degree" />
                      <TextInput value={r.school} onChange={(e) => setEduRows((v) => v.map((x) => (x.id === r.id ? { ...x, school: e.target.value } : x)))} placeholder="School" />
                      <TextInput value={r.year} onChange={(e) => setEduRows((v) => v.map((x) => (x.id === r.id ? { ...x, year: e.target.value } : x)))} placeholder="Year" />
                      <button
                        type="button"
                        onClick={() => setEduRows((v) => v.filter((x) => x.id !== r.id))}
                        className="text-slate-300 transition hover:text-rose-500"
                        aria-label="Remove education"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="secondary" className="mt-2 text-xs" onClick={() => setEduRows((v) => [...v, { id: Date.now(), degree: '', school: '', year: '' }])}>
                  <Plus className="h-3.5 w-3.5" /> Add education
                </Button>

                <div className="mt-4">
                  <Field label="Skills (comma separated)">
                    <TextInput value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="SQL, Python, Excel" />
                  </Field>
                </div>

                {formError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <p className="text-xs text-rose-700">{formError}</p>
                  </div>
                )}

                <Button type="submit" variant="primary" className="mt-4 w-full" disabled={busy || offline}>
                  <Save className="h-4 w-4" /> {busy ? 'Composing…' : 'Build & save CV'}
                </Button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <History className="h-4 w-4 text-primary-600" /> Saved CVs
                </h3>
                {history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                    No saved CVs yet - build one above and it appears here.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                    {history.slice(0, 15).map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{h.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {h.headline ?? 'Resume'} · {h.skills.length} skills · {h.created_at.slice(0, 10)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => setResult(h)}
                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => void remove(h.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <IdCard className="h-4 w-4 text-primary-600" /> Resume preview
                </h3>
                {!result ? (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <IdCard className="mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-400">Build a CV to see its markdown here.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-lg font-extrabold text-slate-900">{result.name}</p>
                      {result.headline && <p className="text-sm font-semibold text-violet-700">{result.headline}</p>}
                      <p className="mt-1 text-[11px] text-slate-500">
                        {[result.email, result.phone, result.location].filter(Boolean).join(' · ') || 'No contact details'}
                      </p>
                      {result.summary && <p className="mt-2 text-sm leading-relaxed text-slate-600">{result.summary}</p>}
                    </div>
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Experience ({result.experience.length})</p>
                      <ul className="space-y-1.5 text-sm text-slate-600">
                        {result.experience.map((x, i) => (
                          <li key={i}>{x.role}{x.company ? ` at ${x.company}` : ''}{x.period ? ` · ${x.period}` : ''}</li>
                        ))}
                      </ul>
                      <p className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Education ({result.education.length})</p>
                      <ul className="space-y-1.5 text-sm text-slate-600">
                        {result.education.map((x, i) => (
                          <li key={i}>{x.degree}{x.school ? ` · ${x.school}` : ''}{x.year ? ` · ${x.year}` : ''}</li>
                        ))}
                      </ul>
                    </div>
                    <CodeBlock title="Resume markdown" code={result.resume_markdown} lang="markdown" maxHeight={300} />
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}