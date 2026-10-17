import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, History, Info, Library, RefreshCw, Save, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import CodeBlock from '../../../components/ui/CodeBlock'
import {
  createLiteratureReview,
  deleteLiteratureReview,
  listLiteratureReviews,
  type LiteratureReview,
} from '../../../lib/studentApi'

export default function LiteratureReviewHelper() {
  const [reloadTick, setReloadTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<LiteratureReview[]>([])
  const [result, setResult] = useState<LiteratureReview | null>(null)
  const [formError, setFormError] = useState('')

  const [title, setTitle] = useState('')
  const [area, setArea] = useState('Climate adaptation')
  const [themes, setThemes] = useState('Coastal resilience, Urban infrastructure, Community response')
  const [sourceCount, setSourceCount] = useState('20')
  const [purpose, setPurpose] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const rows = await listLiteratureReviews()
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
    const themeList = themes.split(',').map((t) => t.trim()).filter(Boolean)
    if (themeList.length === 0) {
      setFormError('List at least one theme.')
      return
    }
    const count = parseInt(sourceCount, 10)
    if (!Number.isFinite(count) || count < 4 || count > 80) {
      setFormError('Source count must be between 4 and 80.')
      return
    }
    setBusy(true)
    createLiteratureReview({
      title: title.trim() || null,
      research_area: area.trim(),
      themes: themeList,
      source_count: count,
      purpose: purpose.trim() || undefined,
    })
      .then((saved) => {
        setResult(saved)
        setHistory((prev) => [saved, ...prev.filter((h) => h.id !== saved.id)])
        return listLiteratureReviews()
      })
      .then((rows) => setHistory(rows))
      .catch(() => {
        setOffline(true)
        setFormError('The review could not be generated - the server is unreachable.')
      })
      .finally(() => setBusy(false))
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this literature review?')) return
    try {
      await deleteLiteratureReview(id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
      setResult((prev) => (prev?.id === id ? null : prev))
    } catch {
      setOffline(true)
    }
  }

  const sectionKeys = result ? Object.keys(result.sections) : []

  return (
    <>
      <Seo
        title="Literature Review Helper - vimz Tools"
        description="Draft a thematically organised literature review in markdown from your research area."
      />
      <ToolShell
        title="Literature Review Helper"
        description="Draft a structured, thematic literature review built from your research area."
        icon={<Library className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Describe your research area, pick themes and source count, then build the review."
      >
        {offline && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                The review server is unreachable, so drafts cannot be built right now.
              </p>
            </div>
            <Button variant="secondary" className="px-3 py-2 text-xs" onClick={retry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry connection
            </Button>
          </div>
        )}

        {loading ? (
          <HybridLoader label="Loading saved literature reviews…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="space-y-4">
              <form onSubmit={build} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Library className="h-4 w-4 text-primary-600" /> Review spec
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    thematic draft
                  </span>
                </div>

                <Field label="Title (optional)">
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Literature Review draft" />
                </Field>
                <Field label="Research area">
                  <TextInput value={area} onChange={(e) => setArea(e.target.value)} />
                </Field>
                <Field label="Themes (comma separated)">
                  <TextInput value={themes} onChange={(e) => setThemes(e.target.value)} />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Source count (4-80)">
                    <TextInput type="number" min={4} max={80} value={sourceCount} onChange={(e) => setSourceCount(e.target.value)} />
                  </Field>
                  <Field label="Purpose (optional)">
                    <TextInput value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. justify the study" />
                  </Field>
                </div>

                {formError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <p className="text-xs text-rose-700">{formError}</p>
                  </div>
                )}

                <Button type="submit" variant="primary" className="mt-4 w-full" disabled={busy || offline}>
                  <Save className="h-4 w-4" /> {busy ? 'Building…' : 'Build & save review'}
                </Button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <History className="h-4 w-4 text-primary-600" /> Saved reviews
                </h3>
                {history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                    No saved reviews yet - build one above and it appears here.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                    {history.slice(0, 15).map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{h.title ?? h.research_area}</p>
                          <p className="text-[11px] text-slate-400">
                            {h.research_area} · {h.themes.length} themes · {h.source_count} sources · {h.created_at.slice(0, 10)}
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
                  <Library className="h-4 w-4 text-primary-600" /> Review preview
                </h3>
                {!result ? (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <Library className="mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-400">Build a review to see its sections and markdown here.</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Section map</p>
                      {sectionKeys.length === 0 ? (
                        <p className="text-xs text-slate-400">No sections returned.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {sectionKeys.map((k) => (
                            <li key={k} className="text-sm text-slate-700">· {k}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <CodeBlock title="Review markdown" code={result.review_markdown} lang="markdown" maxHeight={340} />
                    <p className="mt-1 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Drafts are a starting scaffold - replace placeholders with your own sources and citations.
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