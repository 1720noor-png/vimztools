import { useEffect, useMemo, useState } from 'react'
import { Timer, Pause, Play, RotateCcw, CookingPot } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, fmtCountdown, toNumber } from '../../../lib/numbers'

const QUICK = [
  { name: 'Boil eggs', mins: 8 },
  { name: 'Simmer', mins: 20 },
  { name: 'Rest dough', mins: 60 },
]

const STEP_SIZES = [1, 5, 10, 30]

export default function CookingTimer() {
  const [target, setTarget] = useState(8 * 60)
  const [secLeft, setSecLeft] = useState(8 * 60)
  const [running, setRunning] = useState(false)
  const [label, setLabel] = useState('Boil eggs')
  const [mm, setMm] = useState('0')
  const [ss, setSs] = useState('0')

  useEffect(() => {
    if (!running || secLeft <= 0) return
    const t = setInterval(() => setSecLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running, secLeft])

  const pickQuick = (name: string, mins: number) => {
    setLabel(name)
    setTarget(mins * 60)
    setSecLeft(mins * 60)
    setRunning(true)
  }

  const startManual = () => {
    const m = toNumber(mm)
    const s = toNumber(ss)
    const t = (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(s) ? s : 0)
    if (t <= 0) return
    setLabel('Custom step')
    setTarget(t)
    setSecLeft(t)
    setRunning(true)
  }

  const nudge = (dir: 1 | -1) => {
    setSecLeft((s) => clamp(s + dir * 30, 0, target || 3600))
  }

  const pct = useMemo(() => clamp((1 - secLeft / target) * 100, 0, 100), [secLeft, target])

  return (
    <>
      <Seo title="Cooking Timer - vimz Tools" description="Run a simple countdown timer for any cooking step. Free kitchen timer with quick presets." />
      <ToolShell
        title="Cooking Timer"
        description="Run a simple countdown timer for any cooking step."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Set a simple countdown for any cooking step."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Quick steps</h3>
            <div className="space-y-2">
              {QUICK.map((q) => (
                <button
                  key={q.name}
                  onClick={() => pickQuick(q.name, q.mins)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${label === q.name && running ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-semibold text-slate-800">{q.name}</span>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{q.mins} min</span>
                </button>
              ))}
            </div>
            <h3 className="mb-3 mt-6 text-sm font-bold text-slate-800">Custom</h3>
            <div className="flex items-center gap-2">
              <TextInput type="number" min={0} value={mm} onChange={(e) => setMm(e.target.value)} className="text-center" aria-label="Minutes" />
              <span className="text-xs font-semibold text-slate-400">min</span>
              <TextInput type="number" min={0} max={59} value={ss} onChange={(e) => setSs(e.target.value)} className="text-center" aria-label="Seconds" />
              <span className="text-xs font-semibold text-slate-400">sec</span>
            </div>
            <div className="mt-4">
              <Button onClick={startManual} className="w-full">
                Set time
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 lg:col-span-2">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-bold text-slate-700">
                <CookingPot className="h-4 w-4 text-primary-600" /> {label}
              </span>
              <span className="text-xs font-semibold uppercase text-slate-400">
                {running ? 'Counting down' : secLeft <= 0 ? 'Done!' : 'On hold'}
              </span>
            </div>
            <p className={`mt-4 text-center font-mono text-7xl font-extrabold tracking-tight sm:text-9xl ${secLeft <= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
              {fmtCountdown(secLeft)}
            </p>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-primary-500 transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setRunning((r) => !r)} variant={running ? 'secondary' : 'primary'}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? 'Pause' : secLeft > 0 ? 'Resume' : 'Start'}
              </Button>
              <Button variant="ghost" onClick={() => { setRunning(false); setSecLeft(target) }}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button variant="secondary" onClick={() => nudge(1)}>+30s</Button>
              <Button variant="secondary" onClick={() => nudge(-1)}>−30s</Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2">
              {STEP_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setRunning(false); setTarget(s * 60); setSecLeft(s * 60) }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-primary-400 hover:text-primary-600"
                >
                  {s} min
                </button>
              ))}
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}