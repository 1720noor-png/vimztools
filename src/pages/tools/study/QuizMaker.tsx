import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, FileQuestion, Play, Plus, RotateCcw, Trash2, XCircle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Question = { id: string; q: string; a: string }

export default function QuizMaker() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [phase, setPhase] = useState<'build' | 'quiz'>('build')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState<Record<string, 'got' | 'missed'>>({})

  const addQ = () => {
    if (!q.trim()) return
    setQuestions((p) => [...p, { id: uid(), q: q.trim(), a: a.trim() }])
    setQ('')
    setA('')
  }

  const removeQ = (id: string) => {
    setQuestions((p) => p.filter((x) => x.id !== id))
    setResults((p) => {
      const next = { ...p }
      delete next[id]
      return next
    })
  }

  const start = () => {
    setIndex(0)
    setRevealed(false)
    setAnswer('')
    setResults({})
    setPhase('quiz')
  }

  const grade = (outcome: 'got' | 'missed') => {
    const cur = questions[index]
    if (!cur) return
    setResults((p) => ({ ...p, [cur.id]: outcome }))
    setRevealed(false)
    setAnswer('')
    if (index < questions.length - 1) setIndex((i) => i + 1)
  }

  const answered = Object.keys(results).length
  const got = Object.values(results).filter((r) => r === 'got').length
  const score = answered ? Math.round((got / answered) * 100) : 0
  const current = questions[index]
  const finished = questions.length > 0 && answered === questions.length

  return (
    <>
      <Seo title="Quiz Maker - vimz Tools" description="Build practice quizzes and grade yourself instantly." />
      <ToolShell
        title="Quiz Maker"
        description="Build practice quizzes and grade yourself instantly."
        icon={<FileQuestion className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Write questions and quiz yourself with instant grading."
      >
        {phase === 'build' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Write a question</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Question">
                  <TextArea rows={3} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. What does CSS stand for?" />
                </Field>
                <Field label="Answer">
                  <TextInput value={a} onChange={(e) => setA(e.target.value)} placeholder="e.g. Cascading Style Sheets" />
                </Field>
                <Button onClick={addQ}>
                  <Plus className="h-4 w-4" /> Add question
                </Button>
              </div>
              <Button className="mt-4 w-full" variant="success" disabled={questions.length === 0} onClick={start}>
                <Play className="h-4 w-4" /> Start quiz ({questions.length})
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Question bank ({questions.length})</h3>
              {questions.length === 0 ? (
                <p className="text-xs text-slate-400">No questions yet — add your first one.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {questions.map((x, i) => (
                    <div key={x.id} className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{x.q}</p>
                        <p className="truncate text-[11px] text-slate-400">Answer: {x.a || '—'}</p>
                      </div>
                      <button onClick={() => removeQ(x.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            <div className="flex items-center justify-between">
              {!finished && current && (
                <span className="text-xs font-bold text-slate-400">
                  Question {index + 1} of {questions.length} · {answered} answered
                </span>
              )}
              <span className="ml-auto inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                Score {got}/{answered} · {score}%
              </span>
            </div>

            {finished ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Round complete</p>
                <p className="mt-2 text-6xl font-extrabold text-primary-700">{score}%</p>
                <p className="mt-2 text-sm text-slate-500">
                  {got} of {questions.length} correct ({score >= 70 ? 'great job!' : score >= 50 ? 'decent — keep reviewing' : 'worth another pass'})
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => setPhase('build')}>
                    Edit questions
                  </Button>
                  <Button variant="success" onClick={start}>
                    <RotateCcw className="h-4 w-4" /> Try again
                  </Button>
                </div>
              </section>
            ) : (
              current && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-bold text-slate-800">{current.q}</h3>
                  <div className="mt-4">
                    <TextArea rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer here…" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => setRevealed((r) => !r)}>
                      {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {revealed ? 'Hide answer' : 'Show answer'}
                    </Button>
                    {revealed && (
                      <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                        Model answer: {current.a || 'No answer provided'}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="danger" onClick={() => grade('missed')}>
                      <XCircle className="h-4 w-4" /> Missed it
                    </Button>
                    <Button variant="success" onClick={() => grade('got')}>
                      <CheckCircle2 className="h-4 w-4" /> Got it
                    </Button>
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </ToolShell>
    </>
  )
}