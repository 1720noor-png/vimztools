import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenLine, CheckCircle2, X, HelpCircle } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { Button, Field, Select, TextArea } from '../../components/ui/Fields'
import { useToast } from '../../components/ui/Toast'
import { blogCategories, saveSubmittedBlog, type SubmittedBlog } from '../../lib/blogs'
import { uid } from '../../lib/utils'

export default function BlogSubmitPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState({
    title: '',
    category: blogCategories[0],
    autor: '',
    email: '',
    tags: '',
    excerpt: '',
    agree: false,
  })
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [submitted, setSubmitted] = useState(false)
  const [draftId, setDraftId] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim() || form.title.trim().length < 10) e.title = 'Title must be at least 10 characters.'
    if (!form.autor.trim()) e.autor = 'Please add your name.'
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.tags.trim()) e.tags = 'Add at least one tag, comma-separated.'
    if (!form.excerpt.trim() || form.excerpt.trim().length < 20) e.excerpt = 'Summary must be at least 20 characters.'
    if (content.trim().length < 50) e.content = 'Write at least 50 characters of content.'
    if (!form.agree) e.agree = 'Please confirm the guidelines.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (!validate()) {
      toast('Please fix the highlighted fields.', 'error')
      return
    }
    const blog: SubmittedBlog = {
      id: uid(),
      title: form.title.trim(),
      category: form.category,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      excerpt: form.excerpt.trim(),
      author: form.autor.trim(),
      content: content.trim(),
      date: new Date().toISOString(),
    }
    saveSubmittedBlog(blog)
    setDraftId(blog.id)
    setSubmitted(true)
    toast('Draft submitted successfully!')
  }

  if (submitted) {
    return (
      <>
        <Seo title="Article Submitted | vimz Tools Blog" />
        <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-24 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Draft received!</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Thanks for writing for vimz Tools. Your draft is saved locally on this device
            (reference: <span className="font-mono text-slate-700">{draftId}</span>) and
            will appear in the Community Drafts queue.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => navigate('/blogs')}>Back to blogs</Button>
            <Button variant="secondary" onClick={() => navigate('/')}>Home</Button>
          </div>
        </div>
      </>
    )
  }

  const inputCls = (err?: string) =>
    `w-full rounded-xl border bg-white/90 px-3.5 py-2.5 text-sm text-slate-800 transition focus:outline-none focus:ring-2 dark:bg-slate-900/90 dark:text-slate-100 ${
      err
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-500/80'
        : 'border-slate-300 focus:border-amber-500 focus:ring-amber-200 dark:border-slate-700 dark:focus:border-amber-400'
    }`

  return (
    <>
      <Seo
        title="Submit an Article | vimz Tools Blog"
        description="Write a draft article for the vimz Tools blog. Share practical how-tos, guides and productivity tips with the community."
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-amber-50/80 p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/30 dark:via-slate-900/40 dark:to-orange-950/20 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-white/80 text-amber-700 shadow-2xs dark:border-amber-800/80 dark:bg-slate-800/90 dark:text-amber-300">
              <PenLine className="h-6 w-6" />
            </span>
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 shadow-2xs dark:border-amber-800/80 dark:bg-slate-800/90 dark:text-amber-300">
                Community Contribution
              </span>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Submit an article draft
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Share any helpful guide, tip or workflow with the community. Drafts are stored
            locally in your browser and queue for editorial review.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850">
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Article details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Title">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls(errors.title)} placeholder="A clear, specific title (10+ chars)" />
                  {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
                </Field>
              </div>
              <Field label="Category">
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {blogCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Tags (comma-separated)">
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls(errors.tags)} placeholder="pdf, tips, workflow" />
                {errors.tags && <p className="mt-1 text-xs text-rose-500">{errors.tags}</p>}
              </Field>
              <div className="sm:col-span-2">
                <Field label="Short summary / excerpt">
                  <TextArea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={`${inputCls(errors.excerpt)}`} placeholder="One or two sentences that make readers click (20+ chars)" />
                  {errors.excerpt && <p className="mt-1 text-xs text-rose-500">{errors.excerpt}</p>}
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850">
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Author</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} className={inputCls(errors.autor)} placeholder="Your name" />
                {errors.autor && <p className="mt-1 text-xs text-rose-500">{errors.autor}</p>}
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls(errors.email)} placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850">
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Article content</h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">You can use simple markdown — #, ##, -, 1., **bold**.</p>
            <div className="mt-4">
              <TextArea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`${inputCls(errors.content)} font-mono`}
                placeholder={`## Introduction\n\nWrite your article here. Keep it practical and helpful.`}
              />
              {errors.content && <p className="mt-1 text-xs text-rose-500">{errors.content}</p>}
            </div>
          </section>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850">
            <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="mt-0.5 h-4 w-4 rounded accent-amber-600" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              I confirm this is my original work, it's not spam or AI-generated filler, and I
              understand drafts are saved locally on this device during review.
            </span>
          </label>
          {errors.agree && <p className="ml-8 text-xs text-rose-500">{errors.agree}</p>}

          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/blogs')} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-700">
              <X className="h-4 w-4" /> Cancel
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
                <HelpCircle className="h-3.5 w-3.5" /> No data ever leaves your browser
              </span>
              <Button onClick={submit}>Submit draft</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}