import { useEffect, useMemo, useState } from 'react'
import { Hourglass, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Exam {
  id: number
  name: string
  date: string
}

const fmtNum = (n: number) => (n < 0 ? n.toLocaleString('en-US') : n.toLocaleString('en-US'))

const DEFAULT_EXAM_DATE = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
const START_NOW = Date.now()

export default function StudentExamCountdown() {
  const [exams, setExams] = useState<Exam[]>([
    { id: 1, name: 'Mathematics final', date: DEFAULT_EXAM_DATE },
  ])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [now, setNow] = useState(START_NOW)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const add = () => {
    if (!name.trim() || !date) return
    setExams((v) => [...v, { id: Date.now(), name: name.trim(), date }])
    setName('')
    setDate('')
  }

  const counts = useMemo(
    () =>
      exams.map((e) => {
        const target = new Date(`${e.date}T00:00:00`).getTime()
        const ms = target - now
        const total = Math.abs(ms)
        const show = {
          days: Math.floor(total / 86400000),
          hours: Math.floor((total % 86400000) / 3600000),
          mins: Math.floor((total % 3600000) / 60000),
          secs: Math.floor((total % 60000) / 1000),
        }
        return { e, ms, show, past: ms < 0 }
      }),
    [exams, now],
  )

  return (
    <>
      <Seo
        title="Exam Countdown - vimz Tools"
        description="Track days, hours and minutes remaining until every upcoming exam."
      />
      <ToolShell
        title="Exam Countdown"
        description="Live countdown to every exam date you add, ticking in real time."
        icon={<Hourglass className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Add a name and date - the countdown starts immediately."
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Exam name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chemistry paper" />
            </Field>
            <Field label="Date">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Button onClick={add} disabled={!name.trim() || !date}>
              <Plus className="h-4 w-4" /> Add exam
            </Button>
          </div>

          {counts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
              Add an exam to start counting down.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {counts.map(({ e, show, past }) => (
              <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900">{e.name}</h3>
                  <button onClick={() => setExams((v) => v.filter((x) => x.id !== e.id))} className="text-slate-300 transition hover:text-rose-500" aria-label="Remove exam">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">{e.date.slice(0, 10)}</p>
                <p className={`mt-3 text-xs font-bold uppercase tracking-wide ${past ? 'text-emerald-500' : 'text-violet-500'}`}>
                  {past ? 'Already passed' : 'Time remaining'}
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                  {[
                    { v: fmtNum(show.days), l: 'days' },
                    { v: fmtNum(show.hours), l: 'hrs' },
                    { v: fmtNum(show.mins), l: 'min' },
                    { v: fmtNum(show.secs), l: 'sec' },
                  ].map((c) => (
                    <div key={c.l} className="rounded-xl bg-slate-50 py-2">
                      <div className="font-mono text-lg font-extrabold text-slate-800">{c.v}</div>
                      <div className="text-[10px] font-semibold uppercase text-slate-400">{c.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ToolShell>
    </>
  )
}