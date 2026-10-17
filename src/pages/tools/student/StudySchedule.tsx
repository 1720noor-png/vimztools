import { useMemo, useState } from 'react'
import { CalendarDays, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const SESSION_TYPES = [
  { key: 'Deep work', color: 'bg-violet-600', tip: 'Learn new material, no distractions' },
  { key: 'Review', color: 'bg-emerald-500', tip: 'Re-read notes and flashcards' },
  { key: 'Practice', color: 'bg-sky-500', tip: 'Past questions and problem sets' },
  { key: 'Rest', color: 'bg-amber-400', tip: 'Move, breathe, drink water' },
]

export default function StudySchedule() {
  const [subjects, setSubjects] = useState('Mathematics, Physics, Economics')
  const [hours, setHours] = useState('3')
  const [start, setStart] = useState('17:30')
  const [days, setDays] = useState('5')
  const [ran, setRan] = useState(false)

  const list = useMemo(() => subjects.split(',').map((s) => s.trim()).filter(Boolean), [subjects])
  const perDay = Math.max(1, parseFloat(hours) || 3)
  const ndays = Math.max(1, Math.min(7, parseInt(days, 10) || 5))

  const plan = useMemo(() => {
    if (list.length === 0) return null
    const blocks = []
    const n = Math.min(4, list.length + 1)
    for (let d = 0; d < ndays; d++) {
      const day: Array<{ label: string; type: string; minutes: number }> = []
      const deepMin = Math.round((perDay * 60 * 0.5) / Math.max(1, n))
      const revMin = Math.round((perDay * 60 * 0.25) / Math.max(1, n))
      const pracMin = Math.round((perDay * 60 * 0.25) / Math.max(1, n))
      const total = deepMin + revMin + pracMin
      const drift = perDay * 60 - total
      if (list[0]) day.push({ label: `${list[(d * 2) % list.length]} deep work`, type: 'Deep work', minutes: deepMin + (d === 0 ? drift : 0) })
      if (list[1]) day.push({ label: `Review ${list[(d * 2 + 1) % list.length]}`, type: 'Review', minutes: revMin + (d === 0 ? (drift > 0 ? 0 : drift) : 0) })
      if (list[2]) day.push({ label: `Past questions: ${list[(d * 3 + 2) % list.length]}`, type: 'Practice', minutes: pracMin })
      day.push({ label: 'Break - stretch and hydrate', type: 'Rest', minutes: 15 })
      blocks.push(day)
    }
    void ran
    return { blocks, start }
  }, [list, perDay, ndays, start, ran])

  return (
    <>
      <Seo
        title="Study Schedule - vimz Tools"
        description="Plan a week of balanced study sessions with deep work, review and practice slots."
      />
      <ToolShell
        title="Study Schedule"
        description="Balance a week of study across deep work, review and past-question practice."
        icon={<CalendarDays className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Set subjects, daily hours and start time to build the weekly plan."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Subjects (comma separated)">
              <TextArea rows={3} value={subjects} onChange={(e) => setSubjects(e.target.value)} />
            </Field>
            <Field label="Study hours per day">
              <TextInput type="number" min={1} max={10} step={0.5} value={hours} onChange={(e) => setHours(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time">
                <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Days per week">
                <Select value={days} onChange={(e) => setDays(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'day' : 'days'}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={list.length === 0}>
              <Wand2 className="h-4 w-4" /> Build schedule
            </Button>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Session types</p>
              <div className="flex flex-col gap-2">
                {SESSION_TYPES.map((s) => (
                  <div key={s.key} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="font-semibold">{s.key}</span> - {s.tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {plan ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {plan.blocks.map((day, i) => (
                  <div key={i} className="border-b border-slate-100 px-4 py-3 last:border-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Day {i + 1}</p>
                    <ul className="mt-2 space-y-1.5">
                      {day.map((b, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <span className="w-11 shrink-0 font-mono text-xs font-semibold text-slate-400">{plan.start}</span>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${SESSION_TYPES.find((s) => s.key === b.type)?.color}`} />
                          <span className="flex-1 text-slate-700">{b.label}</span>
                          <span className="text-xs font-semibold text-slate-400">{Math.round(b.minutes)}m</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your weekly plan will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}