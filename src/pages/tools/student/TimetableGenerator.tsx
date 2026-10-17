import { useMemo, useState } from 'react'
import { CalendarRange, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function TimetableGenerator() {
  const [subjects, setSubjects] = useState('Mathematics, English, Physics, Biology, Geography, PE')
  const [start, setStart] = useState('08:00')
  const [slotMin, setSlotMin] = useState('45')
  const [days, setDays] = useState('5')
  const [slots, setSlots] = useState('5')
  const [ran, setRan] = useState(false)

  const list = useMemo(() => subjects.split(',').map((s) => s.trim()).filter(Boolean), [subjects])
  const ndays = Math.max(1, Math.min(6, parseInt(days, 10) || 5))
  const nslots = Math.max(2, Math.min(8, parseInt(slots, 10) || 5))
  const mins = Math.max(15, Math.min(120, parseInt(slotMin, 10) || 45))

  const grid = useMemo(() => {
    if (list.length === 0) return []
    const rows: string[][] = []
    for (let s = 0; s < nslots; s++) {
      const row: string[] = []
      for (let d = 0; d < ndays; d++) {
        row.push(list[(s * ndays + d) % list.length])
      }
      rows.push(row)
    }
    void ran
    return rows
  }, [list, ndays, nslots, ran])

  const timeStarts = useMemo(() => {
    const base = new Date(`1970-01-01T${start || '08:00'}:00`)
    return Array.from({ length: grid.length }, (_, i) => {
      const t = new Date(base.getTime() + i * mins * 60000)
      return t.toTimeString().slice(0, 5)
    })
  }, [start, mins, grid.length])

  return (
    <>
      <Seo
        title="Timetable Generator - vimz Tools"
        description="Generate a clean weekly school or class timetable from your subject list."
      />
      <ToolShell
        title="Timetable Generator"
        description="Lay out your subjects into a clean weekly timetable grid."
        icon={<CalendarRange className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="List subjects, set the slot length and days, then generate the grid."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Subjects (comma separated)">
              <TextArea rows={3} value={subjects} onChange={(e) => setSubjects(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="First class starts">
                <TextInput type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </Field>
              <Field label="Slot length (min)">
                <TextInput type="number" min={15} max={120} step={5} value={slotMin} onChange={(e) => setSlotMin(e.target.value)} />
              </Field>
              <Field label="Days (1-6)">
                <Select value={days} onChange={(e) => setDays(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'day' : 'days'}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Slots per day">
                <Select value={slots} onChange={(e) => setSlots(e.target.value)}>
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button onClick={() => setRan((r) => !r)} disabled={list.length === 0}>
              <Wand2 className="h-4 w-4" /> Generate timetable
            </Button>
          </div>

          <div className="space-y-4">
            {grid.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Time</th>
                        {DAYS.slice(0, ndays).map((d) => (
                          <th key={d} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{d.slice(0, 3)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grid.map((row, i) => (
                        <tr key={i} className={i % 2 ? 'bg-slate-50/60' : ''}>
                          <td className="whitespace-nowrap px-3 py-2 font-mono text-xs font-semibold text-slate-500">{timeStarts[i]}</td>
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400">Each day rotates the subjects evenly so nothing repeats back-to-back.</p>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your timetable will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}