import { useEffect, useState } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function StudentPomodoroTimer() {
  const [workMin, setWorkMin] = useState(25)
  const [breakMin, setBreakMin] = useState(5)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(25 * 60)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (mode === 'work') {
            setCycles((c) => c + 1)
            setMode('break')
            return breakMin * 60
          }
          setMode('work')
          return workMin * 60
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, mode, workMin, breakMin])

  const reset = () => {
    setRunning(false)
    setMode('work')
    setRemaining(workMin * 60)
  }

  const pct = mode === 'work' ? (remaining / (workMin * 60)) * 100 : (remaining / (breakMin * 60)) * 100
  const ring = `conic-gradient(#7c3aed ${pct}%, #e2e8f0 ${pct}%)`

  return (
    <>
      <Seo
        title="Pomodoro Timer - vimz Tools"
        description="Work and break timer with cycle tracking to keep your study sessions focused."
      />
      <ToolShell
        title="Pomodoro Timer"
        description="Focus in timed work sessions with automatic break cycles."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Set your lengths, press Start, and let the timer rotate work and breaks."
      >
        <div className="mx-auto max-w-md space-y-5">
          <div className="flex justify-center gap-3">
            <Field label="Work (min)">
              <select
                value={workMin}
                onChange={(e) => { const v = Number(e.target.value); setWorkMin(v); if (mode === 'work') setRemaining(v * 60) }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {[15, 20, 25, 30, 40, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
            <Field label="Break (min)">
              <select
                value={breakMin}
                onChange={(e) => { const v = Number(e.target.value); setBreakMin(v); if (mode === 'break') setRemaining(v * 60) }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </div>

          <div
            className="mx-auto flex h-56 w-56 items-center justify-center rounded-full transition-all"
            style={{ background: ring }}
          >
            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-full bg-white">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${mode === 'work' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {mode === 'work' ? 'Focus' : 'Break'}
              </span>
              <span className="mt-2 font-mono text-5xl font-extrabold text-slate-900">{fmt(remaining)}</span>
              <span className="mt-1 text-xs font-semibold text-slate-400">{cycles} cycles completed</span>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <Button onClick={() => setRunning((r) => !r)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400">
            Cycles, work and break lengths update on the fly - just press Reset to realign.
          </p>
        </div>
      </ToolShell>
    </>
  )
}