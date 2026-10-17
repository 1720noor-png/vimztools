import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, History, Info, PenTool, RefreshCw, Save, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import CodeBlock from '../../../components/ui/CodeBlock'
import {
  createQuestionPaper,
  deleteQuestionPaper,
  listQuestionPapers,
  type QuestionPaper,
} from '../../../lib/studentApi'

export default function QuestionPaperGenerator() {
  const [reloadTick, setReloadTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<QuestionPaper[]>([])
  const [result, setResult] = useState<QuestionPaper | null>(null)
  const [formError, setFormError] = useState('')

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('Biology')
  const [examType, setExamType] = useState('essay')
  const [totalMarks, setTotalMarks] = useState('60')
  const [duration, setDuration] = useState('60')
  const [difficulty, setDifficulty] = useState('medium')
  const [topics, setTopics] = useState('Photosynthesis, Cell division, Genetics')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const rows = await listQuestionPapers()
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
    const marks = parseInt(totalMarks, 10)
    const mins = parseInt(duration, 10)
    if (!Number.isFinite(marks) || marks < 10 || marks > 300) {
      setFormError('Total marks must be between 10 and 300.')
      return
    }
    if (!Number.isFinite(mins) || mins < 10 || mins > 600) {
      setFormError('Duration must be between 10 and 600 minutes.')
      return
    }
    const topicList = topics.split(',').map((t) => t.trim()).filter(Boolean)
    if (topicList.length === 0) {
      setFormError('List at least one topic.')
      return
    }
    setBusy(true)
    createQuestionPaper({
      title: title.trim() || null,
      subject: subject.trim(),
      exam_type: examType,
      total_marks: marks,
      duration_minutes: mins,
      difficulty,
      topics: topicList,
    })
      .then((saved) => {
        setResult(saved)
        setHistory((prev) => [saved, ...prev.filter((h) => h.id !== saved.id)])
        return listQuestionPapers()
      })
      .then((rows) => setHistory(rows))
      .catch(() => {
        setOffline(true)
        setFormError('The paper could not be generated - the server is unreachable.')
      })
      .finally(() => setBusy(false))
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this question paper?')) return
    try {
      await deleteQuestionPaper(id)
      setHistory((prev) => prev.filter((h) => h.id !== id))
      setResult((prev) => (prev?.id === id ? null : prev))
    } catch {
      setOffline(true)
    }
  }

  const info = useMemo(
    () =>
      result
        ? [
            { label: 'Marks', value: `${result.total_marks}` },
            { label: 'Time', value: `${result.duration_minutes} min` },
            { label: 'Difficulty', value: result.difficulty },
          ]
        : [],
    [result],
  )

  return (
    <>
      <Seo
        title="Question Paper Generator - vimz Tools"
        description="Generate structured exam papers with balanced sections from live server templates."
      />
      <ToolShell
        title="Question Paper Generator"
        description="Build a complete exam paper - sections, timing and marks - generated on the server."
        icon={<PenTool className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Set subject, topics, marks and timing, then generate the paper."
      >
        {offline && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                The paper generator database is unreachable, so papers cannot be built right now.
              </p>
            </div>
            <Button variant="secondary" className="px-3 py-2 text-xs" onClick={retry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry connection
            </Button>
          </div>
        )}

        {loading ? (
          <HybridLoader label="Loading saved question papers…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <section className="space-y-4">
              <form onSubmit={build} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <PenTool className="h-4 w-4 text-primary-600" /> Paper spec
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                    server templates
                  </span>
                </div>

                <Field label="Title (optional)">
                  <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="End of Term Examination" />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Subject">
                    <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </Field>
                  <Field label="Exam type">
                    <Select value={examType} onChange={(e) => setExamType(e.target.value)}>
                      <option value="essay">Essay</option>
                      <option value="multiple-choice">Multiple choice</option>
                      <option value="short-answer">Short answer</option>
                      <option value="structured">Structured</option>
                    </Select>
                  </Field>
                  <Field label="Total marks (10-300)">
                    <TextInput type="number" min={10} max={300} value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                  </Field>
                  <Field label="Duration (10-600 min)">
                    <TextInput type="number" min={10} max={600} value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </Field>
                  <Field label="Difficulty">
                    <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </Select>
                  </Field>
                  <Field label="Topics (comma separated)">
                    <TextInput value={topics} onChange={(e) => setTopics(e.target.value)} />
                  </Field>
                </div>

                {formError && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <p className="text-xs text-rose-700">{formError}</p>
                  </div>
                )}

                <Button type="submit" variant="primary" className="mt-4 w-full" disabled={busy || offline}>
                  <Save className="h-4 w-4" /> {busy ? 'Generating…' : 'Generate & save paper'}
                </Button>
              </form>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <History className="h-4 w-4 text-primary-600" /> Saved papers
                </h3>
                {history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                    No saved papers yet - generate one above and it appears here.
                  </p>
                ) : (
                  <ul className="max-h-80 space-y-2 overflow-auto pr-1">
                    {history.slice(0, 15).map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{h.title ?? `${h.subject} paper`}</p>
                          <p className="text-[11px] text-slate-400">
                            {h.subject} · {h.exam_type} · {h.total_marks} marks · {h.created_at.slice(0, 10)}
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
                  <PenTool className="h-4 w-4 text-primary-600" /> Generated paper
                </h3>
                {!result ? (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <PenTool className="mb-2 h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-400">Generate a paper to see its sections and markdown here.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {info.map((s) => (
                        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{s.label}</p>
                          <p className="mt-0.5 text-xl font-extrabold text-slate-900">{s.value}</p>
                        </div>
                      ))}
                    </div>
                    {result.topics.length > 0 && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Topics covered</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.topics.map((t) => (
                            <span key={t} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Sections</p>
                      <ul className="space-y-1.5 text-sm text-slate-600">
                        {result.sections.map((s, i) => (
                          <li key={i} className="flex justify-between">
                            <span>{s.name} ({s.type})</span>
                            <span className="font-mono text-xs">{s.count} × {s.marks_each} = {s.total} marks</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <CodeBlock title="Paper markdown" code={result.paper_markdown} lang="markdown" maxHeight={280} />
                    <p className="mt-1 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Papers are generated deterministically by the server - check them before printing.
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