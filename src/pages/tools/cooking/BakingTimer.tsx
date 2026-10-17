import { useEffect, useMemo, useState } from 'react'
import { CakeSlice, Pause, Play, RotateCcw } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, fmtCountdown, toNumber } from '../../../lib/numbers'

const PRESETS = [
  { name: 'Cookies', mins: 10 },
  { name: 'Cupcakes', mins: 18 },
  { name: 'Cake', mins: 30 },
  { name: 'Bread', mins: 40 },
  { name: 'Pizza', mins: 15 },
]

export default function BakingTimer() {
  const [target, setTarget] = useState(600)
  const [secLeft, setSecLeft] = useState(600)
  const [running, setRunning] = useState(false)
  const [mm, setMm] = useState('10')
  const [ss, setSs] = useState('00')
  const [active, setActive] = useState('Cookies')

  useEffect(() => {
    if (!running || secLeft <= 0) return
    const t = setInterval(() => setSecLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running, secLeft])

  const pickPreset = (name: string, mins: number) => {
    setActive(name)
    setMm(String(mins))
    setSs('00')
    setTarget(mins * 60)
    setSecLeft(mins * 60)
    setRunning(true)
  }

  const startCustom = () => {
    const m = toNumber(mm)
    const s = toNumber(ss)
    const t = (Number.isFinite(m) ? m : 0) * 60 + (Number.isFinite(s) ? s : 0)
    if (t <= 0) return
    setActive('Custom')
    setTarget(t)
    setSecLeft(t)
    setRunning(true)
  }

  const progress = useMemo(() => clamp((1 - secLeft / target) * 100, 0, 100), [secLeft, target])

  return (
    <>
      <Seo
        title="Baking Timer - vimz Tools"
        description="Count down baking times with preset oven timings. Free kitchen countdown." 
      />
      <ToolShell
        title="Baking Timer"
        description="Count down baking times with preset oven timings."
        icon={<CakeSlice className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Pick a bake preset or set a custom time and start the countdown."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Bake presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => pickPreset(p.name, p.mins)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    active === p.name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-bold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.mins} min</p>
                </button>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Custom time</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Minutes">
                  <TextInput inputMode="numeric" value={mm} onChange={(e) => setMm(e.target.value)} />
                </Field>
                <Field label="Seconds">
                  <TextInput inputMode="numeric" value={ss} onChange={(e) => setSs(e.target.value)} />
                </Field>
              </div>
              <div className="mt-4">
                <Button onClick={startCustom} className="w-full">
                  Start custom bake
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">{active}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {running ? 'Baking…' : secLeft <= 0 ? 'Time is up!' : 'Paused'}
              </p>
            </div>
            <p
              className={`mt-4 text-center font-mono text-6xl font-extrabold tracking-tight sm:text-8xl ${
                secLeft <= 0 ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {fmtCountdown(secLeft)}
            </p>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-primary-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => setRunning((r) => !r)} variant={running ? 'secondary' : 'success'}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? 'Pause' : secLeft > 0 ? 'Resume' : 'Restart'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setRunning(false)
                  setSecLeft(target)
                }}
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
            <p className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
              Tip: open the timer in a tab and set oven alerts nearby — golden edges every time.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}