import { Fragment, useMemo, useState } from 'react'
import { CalendarDays, MapPin, Plus } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PERIODS = ['8–9', '9–10', '10–11', '11–12', '2–3', '3–4', '4–5']
const CHIPS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
]

function chipFor(subject: string): string {
  let h = 0
  for (const ch of subject) h = (h + ch.charCodeAt(0)) % 997
  return CHIPS[h % CHIPS.length]
}

type Klass = { id: string; subject: string; day: string; period: string; room: string }

export default function ClassTimetable() {
  const [klasses, setKlasses] = useState<Klass[]>([])
  const [subject, setSubject] = useState('')
  const [day, setDay] = useState('Mon')
  const [period, setPeriod] = useState(PERIODS[0])
  const [room, setRoom] = useState('')

  const subjects = useMemo(() => Array.from(new Set(klasses.map((k) => k.subject))), [klasses])
  const at = (d: string, p: string) => klasses.find((k) => k.day === d && k.period === p)

  const addClass = () => {
    if (!subject.trim() || at(day, period)) return
    setKlasses((p) => [...p, { id: uid(), subject: subject.trim(), day, period, room: room.trim() }])
    setSubject('')
    setRoom('')
  }

  const remove = (id: string) => setKlasses((p) => p.filter((k) => k.id !== id))

  return (
    <>
      <Seo title="Class Timetable - vimz Tools" description="Build and organize your weekly class schedule by day and time." />
      <ToolShell
        title="Class Timetable"
        description="Build and organize your weekly class schedule."
        icon={<CalendarDays className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Place your classes on a weekly grid by day and time."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-5 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Add a class</h3>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Subject">
                  <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Calculus" />
                </Field>
                <Field label="Room">
                  <TextInput value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. B-204" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Day">
                    <Select value={day} onChange={(e) => setDay(e.target.value)}>
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Period">
                    <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Button onClick={addClass}>
                  <Plus className="h-4 w-4" /> Add class
                </Button>
              </div>
            </section>

            {subjects.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-slate-800">Subjects</h3>
                <div className="space-y-2">
                  {subjects.map((s) => (
                    <div key={s} className={`flex items-center justify-between rounded-lg px-3 py-2 ${chipFor(s)}`}>
                      <span className="text-sm font-bold">{s}</span>
                      <span className="text-[11px] opacity-80">{klasses.filter((k) => k.subject === s).length} session(s)</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[64px_repeat(6,1fr)] gap-1">
                    <div />
                    {DAYS.map((d) => (
                      <div key={d} className="py-2 text-center text-xs font-bold text-slate-600">{d}</div>
                    ))}
                    {PERIODS.map((p) => (
                      <Fragment key={p}>
                        <div className="flex items-center justify-center text-[11px] font-semibold text-slate-400">{p}</div>
                        {DAYS.map((d) => {
                          const k = at(d, p)
                          return (
                            <div key={`${d}${p}`} className="min-h-[56px] rounded-lg border border-slate-100 p-1">
                              {k ? (
                                <div className={`flex h-full flex-col justify-between rounded-md px-1.5 py-1 ${chipFor(k.subject)}`}>
                                  <p className="truncate text-[11px] font-bold">{k.subject}</p>
                                  {k.room && (
                                    <p className="flex items-center gap-0.5 truncate text-[9px] opacity-80">
                                      <MapPin className="h-2.5 w-2.5" /> {k.room}
                                    </p>
                                  )}
                                  <button onClick={() => remove(k.id)} className="self-end text-[9px] underline opacity-60 transition hover:opacity-100">
                                    remove
                                  </button>
                                </div>
                              ) : (
                                <p className="flex h-full items-center justify-center text-[10px] text-slate-200">·</p>
                              )}
                            </div>
                          )
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}