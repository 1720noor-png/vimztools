import { useEffect, useState } from 'react'
import { Timer, Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Select, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, fmtCountdown, sum } from '../../../lib/numbers'

const PRESETS = [60, 120, 180]
const PROMPTS = [
  'Tell me about yourself and your background in under two minutes.',
  'Describe your proudest professional achievement and the impact it had.',
  'Tell me about a time you failed. What did you learn from it?',
  'Why are you interested in this role and what can you bring to it?',
  'Walk me through a time you navigated a difficult teammate or stakeholder.',
  'Where do you see yourself growing in the next two years?',
]

export default function InterviewTimer() {
  const [duration, setDuration] = useState(120)
  const [left, setLeft] = useState(120)
  const [running, setRunning] = useState(false)
  const [prompt, setPrompt] = useState(PROMPTS[0])
  const [custom, setCustom] = useState('')

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [running])

  useEffect(() => {
    if (left === 0 && running) setRunning(false)
  }, [left, running])

  const pickPreset = (s: number) => {
    setDuration(s)
    setLeft(s)
    setRunning(false)
  }
  const start = () => {
    if (left === 0) setLeft(duration)
    setRunning(true)
  }
  const reset = () => {
    setRunning(false)
    setLeft(duration)
  }
  const next = () => {
    setRunning(false)
    const customTxt = custom.trim()
    if (customTxt) setPrompt(customTxt)
    else setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
    setLeft(duration)
  }

  const used = clamp(duration - left, 0, duration)
  const pct = duration > 0 ? (used / duration) * 100 : 0

  const presets = sum(PRESETS)

  return (
    <>
      <Seo title="Interview Timer - vimz Tools" description="Time your mock interview answers with prompts." />
      <ToolShell
        title="Interview Timer"
        description="Time your mock interview answers with prompts."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Practice answers under timed prompts."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-800">Setup</h3>
            <Field label="Timer length">
              <div className="flex gap-2">
                {PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => pickPreset(s)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${duration === s ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {s / 60}m
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Prompt">
              <Select value={prompt} onChange={(e) => { setPrompt(e.target.value); setRunning(false) }}>
                {PROMPTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="Or write your own prompt">
              <TextInput value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom question…" />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button variant={running ? 'secondary' : 'primary'} onClick={start}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? 'Pause' : 'Start'}
              </Button>
              <Button variant="secondary" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button variant="secondary" onClick={next}>
                <SkipForward className="h-4 w-4" /> Next question
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Time remaining</p>
            <p className={`mt-3 text-6xl font-extrabold tabular-nums ${left <= 15 && left > 0 ? 'text-rose-600' : left === 0 ? 'text-slate-400' : 'text-slate-900'}`}>
              {fmtCountdown(left)}
            </p>
            <div className="mx-auto mt-6 h-3 max-w-sm rounded-full bg-slate-100">
              <div
                className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-rose-500' : 'bg-primary-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Time used</p>
                <p className="font-bold text-slate-800">{fmtCountdown(used)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-400">Target</p>
                <p className="font-bold text-slate-800">{fmtCountdown(duration)}</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase text-primary-500">Current prompt</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{custom.trim() || prompt}</p>
            </div>
          </section>
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">Preset options cover {presets / 60} minutes of practice in total.</p>
      </ToolShell>
    </>
  )
}