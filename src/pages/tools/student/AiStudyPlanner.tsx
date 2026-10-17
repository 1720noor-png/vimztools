import { useMemo, useState } from 'react'
import { CalendarCheck2, Repeat } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface Subject {
  name: string
  weight: number
}

function parseSubjects(raw: string): Subject[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name, i) => ({ name, weight: Math.max(1, 5 - i) }))
}

function buildPlan(subjects: Subject[], hoursPerDay: number, days: number) {
  const totalWeight = subjects.reduce((a, s) => a + s.weight, 0)
  const dayPlans = []
  for (let d = 0; d < days; d++) {
    const day: Array<{ name: string; minutes: number }> = []
    let assigned = 0
    for (let i = 0; i < subjects.length; i++) {
      const minutes = Math.round((subjects[i].weight / totalWeight) * hoursPerDay * 60)
      day.push({ name: subjects[i].name, minutes })
      assigned += minutes
    }
    const drift = hoursPerDay * 60 - assigned
    if (day.length > 0) day[0].minutes += drift
    dayPlans.push(day)
  }
  return dayPlans
}

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`.trim() : `${m}m`)

export default function AiStudyPlanner() {
  const [subjects, setSubjects] = useState('Mathematics, Physics, Economics')
  const [hoursPerDay, setHoursPerDay] = useState('4')
  const [days, setDays] = useState('14')
  const [daily, setDaily] = useState('08:00')

  const parsed = useMemo(() => parseSubjects(subjects), [subjects])
  const plan = useMemo(() => {
    const h = parseFloat(hoursPerDay)
    const d = parseInt(days, 10)
    if (!Number.isFinite(h) || h <= 0 || !Number.isFinite(d) || d <= 0 || d > 90 || parsed.length === 0) return null
    return buildPlan(parsed, h, Math.min(d, 90))
  }, [parsed, hoursPerDay, days])

  const summary = useMemo(() => {
    if (!plan || parsed.length === 0) return ''
    const totals = parsed.map((s) => ({
      name: s.name,
      minutes: plan.reduce((acc, day) => acc + (day.find((b) => b.name === s.name)?.minutes ?? 0), 0),
    }))
    return totals.map((t) => `${t.name}: ${fmtMin(t.minutes)} over ${plan.length} days`).join('\n')
  }, [plan, parsed])

  return (
    <>
      <Seo
        title="AI Study Planner - vimz Tools"
        description="Generate a personalised study plan weighted by subject and planned to a target date."
      />
      <ToolShell
        title="AI Study Planner"
        description="Turn subjects and available time into a weighted, day-by-day revision plan."
        icon={<CalendarCheck2 className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="List your subjects in priority order, set your daily hours, and generate the plan."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Subjects (priority order, comma separated)">
              <TextArea rows={3} value={subjects} onChange={(e) => setSubjects(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hours per day">
                <TextInput type="number" min={0.5} max={12} step="0.5" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} />
              </Field>
              <Field label="Days to target">
                <TextInput type="number" min={1} max={90} value={days} onChange={(e) => setDays(e.target.value)} />
              </Field>
            </div>
            <Field label="Start at">
              <TextInput type="time" value={daily} onChange={(e) => setDaily(e.target.value)} />
            </Field>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setSubjects('Mathematics, Physics, Economics'); setHoursPerDay('4'); setDays('14'); setDaily('08:00') }}>
                <Repeat className="h-4 w-4" /> Reset
              </Button>
            </div>
            {parsed.length === 0 && <p className="text-sm font-medium text-rose-600">Add at least one subject.</p>}
          </div>

          <div className="space-y-4">
            {plan ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {plan.map((day, i) => (
                    <div key={i} className="border-b border-slate-100 px-4 py-3 last:border-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Day {i + 1} · {i === 0 ? 'start' : ''} from {daily}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {day.map((b) => (
                          <span key={b.name} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                            {b.name} · {fmtMin(b.minutes)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <CodeBlock title="Total time by subject" code={summary} lang="plain" />
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
                Your day-by-day plan will appear here.
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}