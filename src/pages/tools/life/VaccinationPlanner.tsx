import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Syringe, Printer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field } from '../../../components/ui/Fields'
import { useToast } from '../../../components/ui/Toast'
import Seo from '../../../components/ui/Seo'

const schedule = [
  { age: '0–2 months', vaccine: 'Hepatitis B (HepB)', dose: '1st dose', ageDays: 0 },
  { age: '1–2 months', vaccine: 'Rotavirus (RV)', dose: '1st dose', ageDays: 30 },
  { age: '2 months', vaccine: 'DTaP', dose: '1st dose', ageDays: 60 },
  { age: '2 months', vaccine: 'IPV (Polio)', dose: '1st dose', ageDays: 60 },
  { age: '2 months', vaccine: 'Hib', dose: '1st dose', ageDays: 60 },
  { age: '2 months', vaccine: 'PCV13', dose: '1st dose', ageDays: 60 },
  { age: '4 months', vaccine: 'DTaP', dose: '2nd dose', ageDays: 120 },
  { age: '4 months', vaccine: 'IPV (Polio)', dose: '2nd dose', ageDays: 120 },
  { age: '4 months', vaccine: 'Hib', dose: '2nd dose', ageDays: 120 },
  { age: '4 months', vaccine: 'PCV13', dose: '2nd dose', ageDays: 120 },
  { age: '4 months', vaccine: 'Rotavirus (RV)', dose: '2nd dose', ageDays: 120 },
  { age: '6 months', vaccine: 'DTaP', dose: '3rd dose', ageDays: 180 },
  { age: '6 months', vaccine: 'Hepatitis B (HepB)', dose: '2nd dose', ageDays: 180 },
  { age: '6–18 months', vaccine: 'IPV (Polio)', dose: '3rd dose', ageDays: 540 },
  { age: '12 months', vaccine: 'MMR', dose: '1st dose', ageDays: 365 },
  { age: '12 months', vaccine: 'Varicella (Chickenpox)', dose: '1st dose', ageDays: 365 },
  { age: '12–15 months', vaccine: 'Hib', dose: 'Booster', ageDays: 425 },
  { age: '12–15 months', vaccine: 'PCV13', dose: 'Booster', ageDays: 425 },
  { age: '12 months', vaccine: 'Hepatitis A (HepA)', dose: '1st dose', ageDays: 365 },
  { age: '15–18 months', vaccine: 'DTaP', dose: '4th dose', ageDays: 480 },
  { age: '15–18 months', vaccine: 'Hepatitis A (HepA)', dose: '2nd dose', ageDays: 540 },
  { age: '4 years', vaccine: 'DTaP', dose: '5th dose', ageDays: 1460 },
  { age: '4 years', vaccine: 'IPV (Polio)', dose: '4th dose', ageDays: 1460 },
  { age: '4 years', vaccine: 'MMR', dose: '2nd dose', ageDays: 1460 },
  { age: '4 years', vaccine: 'Varicella (Chickenpox)', dose: '2nd dose', ageDays: 1460 },
  { age: '11–12 years', vaccine: 'Tdap', dose: 'Booster', ageDays: 4015 },
  { age: '11–12 years', vaccine: 'HPV', dose: '1st dose', ageDays: 4015 },
]

export default function VaccinationPlanner() {
  const [birthDate, setBirthDate] = useState('')
  const { toast } = useToast()

  const result = useMemo(() => {
    if (!birthDate) return null
    const bd = dayjs(birthDate)
    if (!bd.isValid()) return null
    const today = dayjs()
    return schedule.map((entry) => {
      const due = bd.add(entry.ageDays, 'day')
      const overdue = today.isAfter(due, 'day')
      return { ...entry, dueDate: due, overdue }
    })
  }, [birthDate])

  const printSchedule = () => {
    window.print()
    toast('Print dialog opened.')
  }

  return (
    <>
      <Seo
        title="Child Vaccination Planner - vimz Tools"
        description="Generate a printable immunization schedule from a child's birth date, based on WHO common guidelines. Private and offline-ready."
      />
      <ToolShell
        title="Child Vaccination Planner"
        description="Enter the birth date to get a full printable immunization timeline with due dates, dose numbers and overdue alerts."
        icon={<Syringe className="h-6 w-6" />}
        breadcrumb="Health & Life"
      >
        <div className="mb-6">
          <Field label="Child's date of birth">
            <div className="flex gap-3 sm:max-w-sm">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              {result && (
                <Button variant="secondary" onClick={printSchedule}>
                  <Printer className="h-4 w-4" /> Print
                </Button>
              )}
            </div>
          </Field>
          {birthDate && (
            <p className="mt-2 text-xs text-slate-400">
              Schedule based on WHO standard childhood vaccines (may differ by region).
            </p>
          )}
        </div>

        {result ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {result.map((entry, i) => (
                <div
                  key={i}
                  className={`rounded-2xl border bg-white p-4 transition ${
                    entry.overdue
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {entry.age}
                    </span>
                    {entry.overdue ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Due</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Upcoming</span>
                    )}
                  </div>
                  <p className="mt-2 font-bold text-slate-900">{entry.vaccine}</p>
                  <p className="text-xs text-slate-500">{entry.dose}</p>
                  <p className={`mt-2 text-xs font-semibold ${entry.overdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                    Due: {entry.dueDate.format('MMM D, YYYY')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center">
            <div>
              <Syringe className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Enter a date of birth to generate a printable immunization schedule.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
          Guide only — always consult your child's pediatrician or local health authority.
        </div>
      </ToolShell>
    </>
  )
}