import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, TimerReset } from 'lucide-react'
import { TemplateShell, btnGhostCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

export function TimerTrackerTemplate({ tool }: { tool: RegistryTool }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      ref.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    }
    return () => {
      if (ref.current) window.clearInterval(ref.current)
    }
  }, [running])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <TemplateShell tool={tool}>
      <div className="flex flex-col items-center py-6">
        <div className="font-mono text-6xl font-bold tabular-nums tracking-tight text-slate-900">
          {mm}:{ss}
        </div>
        <p className="mt-2 text-sm text-slate-400">{running ? 'Counting…' : seconds > 0 ? 'Paused' : 'Start the timer'}</p>
        <div className="mt-6 flex gap-3">
          <button className={btnGhostCls} onClick={() => setRunning((r) => !r)}>
            <Play className="h-4 w-4" /> {running ? 'Pause' : 'Start'}
          </button>
          <button className={btnGhostCls} onClick={() => setSeconds(0)}>
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
        <button
          className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
          onClick={() => {
            setSeconds(0)
            setRunning(false)
          }}
        >
          <TimerReset className="h-4 w-4" /> Reset and stop
        </button>
      </div>
    </TemplateShell>
  )
}