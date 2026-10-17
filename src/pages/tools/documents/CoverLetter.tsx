import { useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'
import { Mail, Download, Loader2, RefreshCw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'
import dayjs from 'dayjs'

export default function CoverLetter() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    hiringManager: '',
    intro: '',
    achievement: '',
    close: '',
  })
  const [tone, setTone] = useState<'professional' | 'friendly'>('professional')
  const [busy, setBusy] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const generateLetter = () => {
    const hr = form.hiringManager || 'Hiring Manager'
    const body1 =
      form.intro ||
      (tone === 'professional'
        ? `I am writing to express my strong interest in the ${form.role || 'open'} position at ${form.company || 'your company'}. My skills and experience make me an excellent fit for this opportunity.`
        : `I was thrilled to learn about the ${form.role || 'open'} opening at ${form.company || 'your company'} — it feels like a perfect match for what I love doing.`)
    const body2 =
      form.achievement ||
      (tone === 'professional'
        ? 'Throughout my career, I have consistently delivered measurable results, collaborating with cross-functional teams and driving projects to completion ahead of schedule.'
        : 'I have a passion for learning fast, working with great teams, and seeing real impact from the work I do every day.')
    const body3 =
      form.close ||
      (tone === 'professional'
        ? 'I would welcome the opportunity to discuss how my background can contribute to your team. Thank you for your time and consideration.'
        : 'I would love to chat about what I could bring to your team. Thanks so much for considering my application!')

    return { hr, body1, body2, body3 }
  }

  const content = generateLetter()

  const download = async () => {
    if (!previewRef.current) return
    setBusy(true)
    try {
      await html2pdf()
        .set({
          margin: 12,
          filename: `${form.name.trim() || 'cover-letter'}-${form.role.trim() || 'application'}.pdf`,
          image: { type: 'jpeg', quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(previewRef.current)
        .save()
      toast('Cover letter PDF downloaded!')
    } catch {
      toast('Could not generate PDF.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Seo
        title="Cover Letter Generator - Free Online | vimz Tools"
        description="Write a professional cover letter fast with our structured form and download it as a clean PDF. Free, private and fully in-browser."
      />
      <ToolShell
        title="Cover Letter Generator"
        description="Answer a few questions and get a polished, recruiter-friendly cover letter you can edit or download as a PDF — generated 100% locally."
        icon={<Mail className="h-6 w-6" />}
        breadcrumb="Document Generators"
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
            {(['professional', 'friendly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  tone === t ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button onClick={download} disabled={busy} className="ml-auto">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {busy ? 'Rendering...' : 'Download PDF'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Your details</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <TextInput value={form.name} onChange={set('name')} placeholder="Jane Cooper" />
                </Field>
                <Field label="Email">
                  <TextInput value={form.email} onChange={set('email')} placeholder="jane@email.com" />
                </Field>
                <Field label="Phone">
                  <TextInput value={form.phone} onChange={set('phone')} placeholder="+1 555 000 1234" />
                </Field>
                <Field label="Company">
                  <TextInput value={form.company} onChange={set('company')} placeholder="Acme Inc." />
                </Field>
                <Field label="Job title">
                  <TextInput value={form.role} onChange={set('role')} placeholder="Product Designer" />
                </Field>
                <Field label="Hiring manager name">
                  <TextInput value={form.hiringManager} onChange={set('hiringManager')} placeholder="Ms. Sarah Lee" />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">
                Optional sections <span className="font-normal normal-case text-slate-400">(leave blank for smart defaults)</span>
              </h3>
              <div className="space-y-4">
                <Field label="Opening paragraph">
                  <TextArea rows={3} value={form.intro} onChange={set('intro')} placeholder="Why are you applying for this role?" />
                </Field>
                <Field label="Highlight / achievement">
                  <TextArea rows={3} value={form.achievement} onChange={set('achievement')} placeholder="One standout achievement or skill you want to mention." />
                </Field>
                <Field label="Closing paragraph">
                  <TextArea rows={3} value={form.close} onChange={set('close')} placeholder="Your sign-off message." />
                </Field>
              </div>
            </section>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">Letter preview</p>
              <button
                onClick={() => setForm({ name: '', email: '', phone: '', company: '', role: '', hiringManager: '', intro: '', achievement: '', close: '' })}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-rose-500"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
            <div
              ref={previewRef}
              className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <header className="text-center">
                <h2 className="text-xl font-bold">{form.name || 'Your Full Name'}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {[form.email, form.phone].filter(Boolean).join(' · ') || 'your@email.com · +1 555 000 1234'}
                </p>
              </header>
              <div className="mt-6 space-y-4 text-sm leading-relaxed">
                <p>{dayjs().format('MMMM D, YYYY')}</p>
                <p>
                  {content.hr}
                  <br />
                  {form.company || 'Company Name'}
                  <br />
                  Company Address
                </p>
                <p>Dear {content.hr},</p>
                <p>{content.body1}</p>
                <p>{content.body2}</p>
                <p>{content.body3}</p>
                <p>
                  Sincerely,
                  <br />
                  <span className="font-semibold">{form.name || 'Your Full Name'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}