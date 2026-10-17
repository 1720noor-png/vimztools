import { useMemo, useState } from 'react'
import { Clock, Plus, Trash, Banknote } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, TextInput, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtHours, money, toNumber, uid } from '../../../lib/numbers'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type Shift = { id: string; day: string; start: string; end: string; rate: string }

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN
}

export default function WorkHoursCalculator() {
  const [shifts, setShifts] = useState<Shift[]>([{ id: uid(), day: 'Monday', start: '09:00', end: '17:00', rate: '25' }])

  const add = () => setShifts((p) => [...p, { id: uid(), day: 'Monday', start: '09:00', end: '17:00', rate: '25' }])
  const remove = (id: string) => setShifts((p) => p.filter((x) => x.id !== id))
  const upd = (id: string, key: keyof Shift, value: string) =>
    setShifts((p) => p.map((x) => (x.id === id ? { ...x, [key]: value } : x)))

  const result = useMemo(() => {
    const rows = shifts
      .map((s) => {
        const start = toMin(s.start)
        const end = toMin(s.end)
        let mins = Number.isFinite(start) && Number.isFinite(end) ? end - start : 0
        if (mins <= 0) mins += 24 * 60
        const rate = toNumber(s.rate)
        return { day: s.day, hours: mins / 60, pay: (Number.isFinite(rate) ? rate : 0) * (mins / 60) }
      })
    const totalHours = rows.reduce((a, r) => a + r.hours, 0)
    const totalPay = rows.reduce((a, r) => a + r.pay, 0)
    const byDay = DAYS.map((d) => {
      const list = rows.filter((r) => r.day === d)
      return { day: d, hours: list.reduce((a, r) => a + r.hours, 0), pay: list.reduce((a, r) => a + r.pay, 0) }
    }).filter((d) => d.hours > 0)
    return { rows, totalHours, totalPay, byDay, maxDay: Math.max(...byDay.map((d) => d.hours), 1) }
  }, [shifts])

  return (
    <>
      <Seo title="Work Hours Calculator - vimz Tools" description="Total up weekly work hours and estimated earnings." />
      <ToolShell
        title="Work Hours Calculator"
        description="Total up weekly work hours and estimated earnings."
        icon={<Clock className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="Add shifts to total your hours and estimated pay."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary-700">Shifts</h3>
              <div className="space-y-3">
                {shifts.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="w-32">
                      <Select value={s.day} onChange={(e) => upd(s.id, 'day', e.target.value)}>
                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </Select>
                    </div>
                    <div className="w-28">
                      <TextInput type="time" value={s.start} onChange={(e) => upd(s.id, 'start', e.target.value)} />
                    </div>
                    <div className="w-28">
                      <TextInput type="time" value={s.end} onChange={(e) => upd(s.id, 'end', e.target.value)} />
                    </div>
                    <div className="w-24">
                      <TextInput type="number" min={0} value={s.rate} onChange={(e) => upd(s.id, 'rate', e.target.value)} placeholder="Rate" />
                    </div>
                    <button onClick={() => remove(s.id)} className="mb-1 rounded-md p-2 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" className="mt-3" onClick={add}>
                <Plus className="h-4 w-4" /> Add shift
              </Button>
            </section>

            {result.byDay.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="mb-4 text-sm font-bold text-slate-800">Hours by day</h4>
                <div className="space-y-2.5">
                  {result.byDay.map((d) => (
                    <div key={d.day}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-semibold text-slate-600">{d.day}</span>
                        <span className="text-slate-400">{d.hours.toFixed(1)}h · {money(d.pay)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-sky-400" style={{ width: `${(d.hours / result.maxDay) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 text-sky-500" />
              <p className="text-[11px] font-semibold uppercase text-slate-400">Total hours</p>
              <p className="mt-1 text-4xl font-extrabold text-slate-800">{fmtHours(result.totalHours * 60)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <Banknote className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
              <p className="text-[11px] font-semibold uppercase text-emerald-500">Estimated pay</p>
              <p className="mt-1 text-4xl font-extrabold text-emerald-700">{money(result.totalPay)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 text-sm font-bold text-slate-800">Weekly snapshot</h4>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Shifts logged</dt><dd className="font-bold text-slate-800">{result.rows.length}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Days worked</dt><dd className="font-bold text-slate-800">{result.byDay.length}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Hours</dt><dd className="font-bold text-slate-800">{result.totalHours.toFixed(1)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Est. pay</dt><dd className="font-bold text-emerald-600">{money(result.totalPay)}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}