import { useEffect, useMemo, useRef, useState } from 'react'
import { Timer, Play, Pause, RotateCcw, Trophy } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, fmtCountdown, toNumber, uid } from '../../../lib/numbers'

type Session = { id: string; room: string; seconds: number }
type Preset = { room: string; minutes: number }

const PRESETS: Preset[] = [
  { room: 'Kitchen', minutes: 15 },
  { room: 'Bathroom', minutes: 20 },
  { room: 'Bedroom', minutes: 10 },
  { room: 'Living room', minutes: 12 },
  { room: 'Garage', minutes: 30 },
  { room: 'Office', minutes: 8 },
]

export default function RoomCleaningTimer() {
  const [room, setRoom] = useState('Kitchen')
  const [customMin, setCustomMin] = useState('')
  const [total, setTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState<Session[]>([])
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    interval.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          setDone((prev) => [...prev, { id: uid(), room, seconds: total }])
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [running, room, total])

  const selectPreset = (p: Preset) => {
    const secs = p.minutes * 60
    setRoom(p.room)
    setTotal(secs)
    setRemaining(secs)
    setRunning(false)
    setCustomMin('')
  }

  const startCustom = () => {
    const m = toNumber(customMin)
    if (Number.isNaN(m) || m <= 0) return
    const secs = clamp(m, 1, 180) * 60
    setRoom(room === 'Kitchen' ? 'Custom room' : room)
    setTotal(secs)
    setRemaining(secs)
    setRunning(true)
  }

  const startPause = () => {
    if (remaining <= 0) {
      setRemaining(total)
    }
    setRunning((r) => !r)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(0)
  }

  const progress = useMemo(() => (total ? Math.round(((total - remaining) / total) * 100) : 0), [total, remaining])

  return (
    <>
      <Seo
        title="Room Cleaning Timer - vimz Tools"
        description="Time yourself cleaning each room with a built-in timer."
      />
      <ToolShell
        title="Room Cleaning Timer"
        description="Time yourself cleaning each room with a built-in timer."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Pick a room and race the timer to a sparkling clean."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Preset rooms</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESETS.map((p) => (
                <button
                  key={p.room}
                  onClick={() => selectPreset(p)}
                  className={`rounded-xl border px-3 py-3 text-center transition ${room === p.room && total === p.minutes * 60 ? 'border-primary-400 bg-primary-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <p className="text-sm font-bold text-slate-700">{p.room}</p>
                  <p className="text-[11px] text-slate-400">{p.minutes} min</p>
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-end gap-3">
              <div className="flex-1">
                <Field label="Custom minutes (1–180)">
                  <TextInput type="number" min={1} max={180} value={customMin} onChange={(e) => setCustomMin(e.target.value)} placeholder="e.g. 25" />
                </Field>
              </div>
              <Button onClick={startCustom}>
                <Timer className="h-4 w-4" /> Set
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">Now cleaning</p>
            <p className="mb-4 text-center text-2xl font-extrabold text-slate-800">{room}</p>
            <p className={`text-center font-mono text-6xl font-black tabular-nums ${progress >= 100 ? 'text-emerald-600' : remaining <= total * 0.25 && total ? 'text-rose-500' : 'text-slate-800'}`}>
              {fmtCountdown(remaining)}
            </p>
            <div className="mx-auto mt-4 h-2.5 max-w-xs rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-primary-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={reset} className="px-3 py-2" disabled={total === 0}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button onClick={startPause} variant={running ? 'secondary' : 'primary'} className="min-w-32" disabled={total === 0}>
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {running ? 'Pause' : 'Start'}
              </Button>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Trophy className="h-4 w-4 text-amber-500" /> Completed sprints
          </h3>
          {done.length === 0 ? (
            <p className="text-xs text-slate-400">No sprints finished yet — beat the clock on a room.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {done.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-700">{s.room}</span>
                  <span className="text-xs font-bold text-emerald-600">{fmtCountdown(s.seconds)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </ToolShell>
    </>
  )
}