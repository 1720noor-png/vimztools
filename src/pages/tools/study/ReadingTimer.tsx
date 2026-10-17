import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock, Layers, Pause, Play, Plus, Timer, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtCountdown, fmtHours, round, sum, toNumber, uid } from '../../../lib/numbers'

type Session = { id: string; sec: number; pages: number }

export default function ReadingTimer() {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [pages, setPages] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  const log = () => {
    const p = toNumber(pages)
    if (!Number.isFinite(p) || p < 0 || (seconds === 0 && p === 0)) return
    setSessions((prev) => [...prev, { id: uid(), sec: seconds, pages: round(p, 1) }])
    setSeconds(0)
    setPages('')
    setRunning(false)
  }

  const remove = (id: string) => setSessions((p) => p.filter((s) => s.id !== id))

  const totals = useMemo(() => {
    const totalPages = sum(sessions.map((s) => s.pages))
    const totalSec = sum(sessions.map((s) => s.sec))
    const pace = totalPages > 0 ? totalSec / 60 / totalPages : NaN
    return { totalPages, totalSec, pace, count: sessions.length }
  }, [sessions])

  const tiles = [
    { icon: BookOpen, label: 'Pages read', value: String(round(totals.totalPages, 1)), color: 'text-primary-600' },
    { icon: Clock, label: 'Total time', value: fmtHours(totals.totalSec / 60), color: 'text-emerald-600' },
    { icon: Layers, label: 'Avg pace', value: Number.isFinite(totals.pace) ? `${round(totals.pace, 1)} min/page` : '—', color: 'text-violet-600' },
    { icon: Timer, label: 'Sessions', value: String(totals.count), color: 'text-amber-600' },
  ]

  return (
    <>
      <Seo title="Reading Timer - vimz Tools" description="Time reading sessions and log the pages you finish." />
      <ToolShell
        title="Reading Timer"
        description="Time reading sessions and log how much you finish."
        icon={<BookOpen className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Time your reading session and log pages finished."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Current session</p>
            <p className="mt-3 text-center font-mono text-6xl font-bold tabular-nums text-slate-800">{fmtCountdown(seconds)}</p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {running ? (
                <Button variant="secondary" onClick={() => setRunning(false)}>
                  <Pause className="h-4 w-4" /> Pause
                </Button>
              ) : (
                <Button onClick={() => setRunning(true)}>
                  <Play className="h-4 w-4" /> Start reading
                </Button>
              )}
              <Field label="Pages finished in this session">
                <TextInput type="number" min={0} step={0.5} value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 12" />
              </Field>
              <Button variant="success" onClick={log}>
                <Plus className="h-4 w-4" /> Log session
              </Button>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {tiles.map((t) => (
                <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                  <t.icon className={`mx-auto mb-2 h-5 w-5 ${t.color}`} />
                  <p className={`text-xl font-extrabold ${t.color}`}>{t.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t.label}</p>
                </div>
              ))}
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Session log</h3>
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400">Nothing logged yet — finish a session and press "Log session".</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {sessions
                    .slice()
                    .reverse()
                    .map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                          {sessions.length - i}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500">{fmtCountdown(s.sec)}</span>
                        <span className="flex-1 text-sm font-semibold text-slate-800">{s.pages} pages</span>
                        <span className="text-[11px] text-slate-400">{round(s.pages ? s.sec / 60 / s.pages : 0, 1)} min/page</span>
                        <button onClick={() => remove(s.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}