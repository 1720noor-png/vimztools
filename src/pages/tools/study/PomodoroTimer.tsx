import { useEffect, useState } from 'react'
import { Brain, Coffee, Pause, Play, RotateCcw, Timer, Trophy } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtCountdown } from '../../../lib/numbers'

const FOCUS = 25 * 60
const BREAK = 5 * 60

export default function PomodoroTimer() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [seconds, setSeconds] = useState(FOCUS)
  const [running, setRunning] = useState(false)
  const [rounds, setRounds] = useState(0)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (seconds > 0) return
    if (mode === 'focus') {
      setRounds((r) => r + 1)
      setMode('break')
      setSeconds(BREAK)
    } else {
      setMode('focus')
      setSeconds(FOCUS)
    }
  }, [seconds, mode])

  const pct = mode === 'focus' ? (1 - seconds / FOCUS) * 100 : (1 - seconds / BREAK) * 100
  const next = mode === 'focus' ? 'Break' : 'Focus'
  const NextIcon = mode === 'focus' ? Coffee : Brain

  return (
    <>
      <Seo title="Pomodoro Timer - vimz Tools" description="Focus in 25-minute sprints with short breaks and count your rounds." />
      <ToolShell
        title="Pomodoro Timer"
        description="Focus in 25-minute sprints with short breaks."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Focus for 25 minutes, break for 5, and count your rounds."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-8 lg:col-span-2">
            <div className="text-center">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${mode === 'focus' ? 'bg-primary-100 text-primary-700' : 'bg-emerald-100 text-emerald-700'}`}
              >
                {mode === 'focus' ? <Brain className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                {mode === 'focus' ? 'Focus session' : 'Break time'}
              </span>
              <p className="mt-6 font-mono text-7xl font-bold tracking-wider text-slate-800 sm:text-8xl">{fmtCountdown(seconds)}</p>
              <div className="mx-auto mt-6 h-2.5 max-w-md rounded-full bg-slate-100">
                <div className={`h-2.5 rounded-full transition-all ${mode === 'focus' ? 'bg-primary-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant={running ? 'secondary' : 'success'} onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRunning(false)
                    setMode('focus')
                    setSeconds(FOCUS)
                  }}
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              </div>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Trophy className="h-4 w-4 text-amber-500" /> Rounds completed
              </h3>
              <p className="text-4xl font-extrabold text-slate-800">{rounds}</p>
              <p className="mt-1 text-xs text-slate-400">{rounds * 25} minutes focused so far</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-2 text-sm font-bold text-slate-800">Next up</h3>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-3">
                <NextIcon className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">{next} session</p>
                  <p className="text-[11px] text-slate-400">{next === 'Break' ? BREAK / 60 : FOCUS / 60} minutes</p>
                </div>
              </div>
            </section>

            <p className="text-xs text-slate-400">
              Sessions auto-switch when the timer hits zero. Your rounds counter adds one after every completed focus sprint.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}