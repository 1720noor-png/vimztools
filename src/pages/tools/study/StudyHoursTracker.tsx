import { useMemo, useState } from 'react'
import { Clock, Target, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { avg, clamp, fmtHours, round, sum, toNumber } from '../../../lib/numbers'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StudyHoursTracker() {
  const [hours, setHours] = useState<Record<string, string>>({ Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' })
  const [aim, setAim] = useState('10')

  const values = useMemo(
    () =>
      DAYS.map((d) => {
        const v = toNumber(hours[d])
        return Number.isFinite(v) && v >= 0 ? v : 0
      }),
    [hours],
  )

  const total = sum(values)
  const dailyAvg = round(avg(values), 1)
  const maxVal = Math.max(1, ...values)
  const aimVal = toNumber(aim)
  const aimPct = Number.isFinite(aimVal) && aimVal > 0 ? clamp((total / aimVal) * 100, 0, 100) : 0
  const overTarget = Number.isFinite(aimVal) && dailyAvg > 0 && total >= aimVal

  const set = (d: string, v: string) => setHours((p) => ({ ...p, [d]: v }))

  return (
    <>
      <Seo title="Study Hours Tracker - vimz Tools" description="Log daily study hours and see your weekly total and average." />
      <ToolShell
        title="Study Hours Tracker"
        description="Log daily study hours and see weekly totals."
        icon={<Clock className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Log daily study hours to see your weekly total and average."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Daily hours</h3>
              <div className="w-24">
                <TextInput type="number" min={0} step={0.5} value={aim} onChange={(e) => setAim(e.target.value)} className="py-1 text-center" />
                <p className="mt-0.5 text-center text-[10px] text-slate-400">weekly aim</p>
              </div>
            </div>
            <div className="space-y-3">
              {DAYS.map((d, i) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-bold text-slate-600">{d}</span>
                  <TextInput type="number" min={0} step={0.5} value={hours[d]} onChange={(e) => set(d, e.target.value)} placeholder="0" className="py-1.5 text-center" />
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary-500" style={{ width: `${maxVal > 0 ? (values[i] / maxVal) * 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-slate-400">{values[i] || '—'}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
                <Clock className="mx-auto mb-2 h-5 w-5 text-primary-600" />
                <p className="text-[11px] font-semibold uppercase text-primary-500">Weekly total</p>
                <p className="mt-1 text-3xl font-extrabold text-primary-800">{fmtHours(total * 60)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <TrendingUp className="mx-auto mb-2 h-5 w-5 text-slate-500" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Daily average</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-700">{dailyAvg} h</p>
              </div>
              <div className={`rounded-2xl border p-5 text-center ${overTarget ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                <Target className={`mx-auto mb-2 h-5 w-5 ${overTarget ? 'text-emerald-600' : 'text-amber-600'}`} />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Aim progress</p>
                <p className={`mt-1 text-3xl font-extrabold ${overTarget ? 'text-emerald-700' : 'text-amber-700'}`}>{Math.round(aimPct)}%</p>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Weekly bar chart</h3>
              <div className="flex h-36 items-end gap-2">
                {DAYS.map((d, i) => (
                  <div key={d} className="flex h-full flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500">{values[i] > 0 ? values[i] : ''}</span>
                    <div className="w-full rounded-t-lg bg-primary-500" style={{ height: `${(values[i] / maxVal) * 80}px` }} />
                    <span className="text-[10px] font-semibold text-slate-400">{d}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Target className="h-3.5 w-3.5" />
                {Number.isFinite(aimVal) && aimVal > 0
                  ? overTarget
                    ? 'Weekly aim reached — nice work.'
                    : `${fmtHours((aimVal - total) * 60)} still to hit your weekly aim.`
                  : 'Set a weekly aim to track against.'}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}