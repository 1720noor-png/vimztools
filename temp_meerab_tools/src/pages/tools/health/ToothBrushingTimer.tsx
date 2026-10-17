import { useEffect, useRef, useState } from 'react'
import { Smile } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const QUADRANTS = [
  { name: 'Top right', seconds: 30 },
  { name: 'Top left', seconds: 30 },
  { name: 'Bottom right', seconds: 30 },
  { name: 'Bottom left', seconds: 30 },
]

export default function ToothBrushingTimer() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    if (!running) return
    const start = Date.now() - elapsed * 1000
    const tick = () => {
      const sec = Math.min(120, (Date.now() - start) / 1000)
      setElapsed(sec)
      if (sec >= 120) {
        setRunning(false)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [running, elapsed])

  const remaining = Math.max(0, 120 - Math.floor(elapsed))
  const quadrant = Math.min(3, Math.floor(elapsed / 30))
  const qStart = quadrant * 30
  const qProgress = Math.min(100, ((elapsed - qStart) / 30) * 100)

  const reset = () => {
    setRunning(false)
    setElapsed(0)
  }

  return (
    <>
      <Seo
        title="Tooth Brushing Timer - vimz Tools"
        description="A guided 2-minute brushing timer split into four 30-second quadrant cues."
      />
      <ToolShell
        title="Tooth Brushing Timer"
        description="A guided 2-minute brushing timer that coaches you through four 30-second mouth quadrants."
        icon={<Smile className="h-6 w-6" />}
        breadcrumb="Health / Dental"
        instruction="Press start and brush each quadrant as the timer cues you."
        guideSteps={[
          { title: 'Start the timer', text: 'The 2-minute countdown begins immediately.' },
          { title: 'Follow the quadrant cue', text: 'Spend 30 seconds on each of the four areas.' },
          { title: 'Finish with a rinse', text: 'The timer chimes visual completion at 2 minutes.' },
        ]}
        guideTips={[
          'Dentists recommend brushing twice a day for two minutes with a soft brush.',
          'Hold your brush at a 45° angle and use gentle circular motions.',
          'Replace your toothbrush every 3-4 months or sooner if bristles fray.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Time remaining</p>
            <p className="mt-2 text-8xl font-extrabold tabular-nums text-slate-900">
              {Math.floor(remaining / 60)}:{`${Math.floor(remaining % 60)}`.padStart(2, '0')}
            </p>
            <div className="mx-auto mt-4 h-2.5 max-w-md overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-rose-500 transition-all duration-200" style={{ width: `${(elapsed / 120) * 100}%` }} />
            </div>
            <p className="mt-5 text-sm font-bold text-slate-700">
              {elapsed >= 120 ? 'Done - great job! 🎉' : `Now: ${QUADRANTS[quadrant].name}`}
            </p>
            <div className="mt-3 flex justify-center gap-3">
              <Button onClick={() => (running ? setRunning(false) : setRunning(true))}>
                {running ? 'Pause' : elapsed >= 120 ? 'Start again' : elapsed > 0 ? 'Resume' : 'Start'}
              </Button>
              <Button variant="secondary" onClick={reset}>
                Reset
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Quadrant progress</h3>
            <div className="space-y-3">
              {QUADRANTS.map((q, i) => {
                const active = i === quadrant && elapsed < 120
                const done = i < quadrant || elapsed >= 120
                return (
                  <div key={q.name} className={`flex items-center justify-between rounded-xl border p-3 ${active ? 'border-brand bg-brand/5' : done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-sm font-semibold text-slate-700">{q.name}</p>
                    <span className="text-sm font-bold text-slate-500">{done ? '✓' : active ? `${Math.round(qProgress)}%` : '30s'}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}