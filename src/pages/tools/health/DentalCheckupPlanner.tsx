import { useMemo, useState } from 'react'
import { Smile } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

export default function DentalCheckupPlanner() {
  const [lastDate, setLastDate] = useState('')
  const [intervalMonths, setIntervalMonths] = useState('6')

  const result = useMemo(() => {
    if (!lastDate) return null
    const last = new Date(lastDate)
    if (Number.isNaN(last.getTime())) return null
    const due = new Date(last)
    due.setMonth(due.getMonth() + Number(intervalMonths))
    const today = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const fromToday = Math.ceil((due.getTime() - today.getTime()) / msPerDay)
    const status = fromToday > 0 ? 'Upcoming' : fromToday === 0 ? 'Due today' : 'Overdue'
    return { due, fromToday, status }
  }, [lastDate, intervalMonths])

  return (
    <>
      <Seo
        title="Dental Check-Up Planner - vimz Tools"
        description="Work out your next dental check-up due date from your last visit and interval."
      />
      <ToolShell
        title="Dental Check-Up Planner"
        description="Tells you when your next dental check-up is due based on your last visit and your preferred check-up interval."
        icon={<Smile className="h-6 w-6" />}
        breadcrumb="Health / Dental"
        instruction="Enter your last check-up date to see the next one."
        guideSteps={[
          { title: 'Enter your last check-up date', text: 'Pick the date of your most recent dental visit.' },
          { title: 'Choose an interval', text: '6, 12 or 24 months - most dentists suggest 6 months.' },
          { title: 'See your due date', text: 'The next visit date and how many days away it is appear instantly.' },
        ]}
        guideTips={[
          'Most adults are advised to see a dentist twice a year for a check-up and clean.',
          'If you have gum disease or a history of decay, your dentist may want more frequent visits.',
          'Regular check-ups catch problems early when treatment is simpler and cheaper.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your visit</h3>
            <div className="space-y-3">
              <Field label="Last check-up date">
                <TextInput type="date" value={lastDate} onChange={(e) => setLastDate(e.target.value)} />
              </Field>
              <Field label="Check-up interval">
                <Select value={intervalMonths} onChange={(e) => setIntervalMonths(e.target.value)}>
                  <option value="3">Every 3 months</option>
                  <option value="6">Every 6 months</option>
                  <option value="12">Every 12 months</option>
                  <option value="24">Every 24 months</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Next check-up due</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {result ? result.due.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result ? (result.fromToday > 0 ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-300'}`} />
                <span className={result ? (result.fromToday > 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}>
                  {result ? `${result.status} (${result.fromToday > 0 ? `${result.fromToday} days away` : `${Math.abs(result.fromToday)} days ago`})` : 'Enter a date to calculate'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Booking tip</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Book your next appointment before you leave the practice, or schedule a reminder on your calendar to arrange it.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}