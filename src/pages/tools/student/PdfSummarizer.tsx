import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, FileDown, History, Info, RefreshCw, Save, Trash2, Upload } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  createPdfSummary,
  deletePdfSummary,
  listPdfSummaries,
  type PdfSummary,
} from '../../../lib/studentApi'

export default function PdfSummarizer() {
  const [reloadTick, setReloadTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<PdfSummary[]>([])
  const [result, setResult] = useState<PdfSummary | null>(null)
  const [formError, setFormError] = useState('')

  const [label, setLabel] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [maxSentences, setMaxSentences] = useState('6')
  const [focus, setFocus] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const rows = await listPdfSummaries()
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

  const summarize = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    if (!file) {
      setFormError('Choose a PDF file to summarise.')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Only PDF files are accepted.')
      return
    }
    if (file.size > 16 * 1024 * 1024) {
      setFormError('The file is larger than 16 MB - upload a smaller PDF.')
      return
    }
    const sentences = parseInt(maxSentences, 10)
    if (!Number.isFinite(sentences) || sentences < 2 || sentences > 15) {
      setFormError('Summary length must be between 2 and 15 sentences.')
      return
    }
    const form = new FormData()
    form.append('label', label.trim() || 'Untitled summary')
    form.append('file', file)
    form.append('max_sentences', String(sentences))
    if (focus.trim()) form.append('focus', focus.trim())
    setBusy(true)
    createPdfSummary(form)
      .then((saved) => {
        setResult(saved)
        setHistory((prev) => [saved, ...prev.filter((h) => h.id !== saved.id)])
        return listPdfSummaries()
      })
      .then((rows) => setHistory(rows))
      .catch(() => {
        setOffline(true)
        setFormError('The file could not be processed - the summariser server is unreachable.')
      })
      .finally(() => setBusy(false))
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this saved summary?')) return
    try {
      await deletePdfSummary(id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
      setResult((prev) => (prev?.id === id ? null : prev))
    } catch {
      setOffline(true)
    }
  }

  const stats = useMemo(
    () =>
      result
        ? [
            { label: 'Pages', value: String(result.page_count) },
            { label: 'Words', value: String(result.word_count) },
            { label: 'Characters', value: String(result.char_count) },
          ]
        : [],
    [result],
  )

  return (
    <>
      <Seo
        title="PDF Summarizer - vimz Tools"
        description="Upload a PDF and get a condensed extractive summary with key concepts, saved on the server."
      />
      <ToolShell
        title="PDF Summarizer"
        description="Upload a PDF and the server condenses it into a focused summary with key concepts."
        icon={<FileDown className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Attach a PDF (up to 16 MB), set the summary length, and summarise it against live text extraction."
      >
        {offline && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                The summariser database is unreachable, so summaries cannot be created right now.
              </p>
            </div>
            <Button variant="secondary" className="px-3 py-2 text-xs" onClick={retry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry connection
            </Button>
          </div>
        )}

        {loading ? (
          <HybridLoader label="Loading saved summaries…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="space-y-4">
              <form onSubmit={summarize} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Upload className="h-4 w-4 text-primary-600" /> PDF inputs
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    server-side extraction
                  </span>
                </div>

                <Field label="Reference label">
                  <TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Chapter 4 summary" />
                </Field>
                <Field label="PDF file">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm font-medium text-slate-500 transition hover:border-violet-300 hover:text-violet-600">
                    <Upload className="h-5 w-5" />
                    {file ? file.name : 'Click to choose a PDF (max 16 MB)'}
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Summary length (sentences 2-15)">
                    <TextInput type="number" min={2} max={15} value={maxSentences} onChange={(e) => setMaxSentences(e.target.value)} />
                  </Field>
                  <Field label="Focus (optional)">
                    <TextInput value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. photosynthesis" />
                  </Field>
                </div>

                {formError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <p className="text-xs text-rose-700">{formError}</p>
                  </div>
                )}

                <Button type="submit" variant="primary" className="mt-4 w-full" disabled={busy || offline}>
                  <Save className="h-4 w-4" /> {busy ? 'Summarising…' : 'Summarise & save'}
                </Button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <History className="h-4 w-4 text-primary-600" /> Saved summaries
                </h3>
                {history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                    No saved summaries yet - summarise a PDF above and it appears here.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                    {history.slice(0, 15).map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{h.label ?? 'Untitled summary'}</p>
                          <p className="text-[11px] text-slate-400">
                            {h.file_name} · {h.word_count} words · {h.created_at.slice(0, 10)}
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
                  <FileDown className="h-4 w-4 text-primary-600" /> Latest summary
                </h3>
                {!result ? (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <FileDown className="mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-400">Summarise a PDF to see the extractive summary here.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {stats.map((s) => (
                        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
                          <p className="mt-0.5 text-xl font-extrabold text-slate-900">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Extractive summary</p>
                      <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>
                    </div>
                    {result.key_concepts.length > 0 && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Key concepts</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.key_concepts.map((k) => (
                            <span key={k} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Summaries are produced by the server from the extracted text. Review them before use in any submission.
                    </p>
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