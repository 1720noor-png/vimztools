import { useMemo, useState } from 'react'
import { Sunrise, UtensilsCrossed, Layers } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const IDEAS = ['Oats', 'Eggs', 'Pancakes', 'Smoothie', 'Toast', 'Yogurt', 'Fruit bowl', 'Custom']

export default function BreakfastPlanner() {
  const [plans, setPlans] = useState<Record<string, string>>({})
  const [customs, setCustoms] = useState<Record<string, string>>({})

  const setChoice = (day: string, choice: string) => {
    const next = { ...plans, [day]: choice === 'Custom' ? '' : choice }
    setPlans(next)
    if (choice !== 'Custom') {
      const c = { ...customs }
      delete c[day]
      setCustoms(c)
    }
  }

  const setCustom = (day: string, value: string) => {
    setCustoms((c) => ({ ...c, [day]: value }))
  }

  const finalFor = (day: string) => customs[day] || plans[day] || ''

  const variety = useMemo(
    () =>
      new Set(
        DAYS.map((d) => customs[d] || plans[d] || '')
          .filter((v) => v && v !== 'Custom'),
      ).size,
    [plans, customs],
  )

  const plannedDays = useMemo(
    () => DAYS.filter((d) => customs[d] || plans[d]).length,
    [plans, customs],
  )

  const topPick = useMemo(() => {
    const counts = new Map<string, number>()
    DAYS.forEach((d) => {
      const v = customs[d] || plans[d] || ''
      if (v) counts.set(v, (counts.get(v) || 0) + 1)
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  }, [plans, customs])

  const spread = useMemo(() => {
    const counts = new Map<string, number>()
    DAYS.forEach((d) => {
      const v = customs[d] || plans[d] || ''
      if (v) counts.set(v, (counts.get(v) || 0) + 1)
    })
    const max = Math.max(0, ...counts.values())
    return plannedDays && max > Math.ceil(plannedDays / 2) ? 'A few ideas repeat — swap one or two for variety.' : 'Nice variety this week.'
  }, [plans, customs, plannedDays])

  return (
    <>
      <Seo
        title="Breakfast Planner - vimz Tools"
        description="Plan easy breakfast ideas for the whole week. Free weekly breakfast meal planner."
      />
      <ToolShell
        title="Breakfast Planner"
        description="Plan easy breakfast ideas for the whole week."
        icon={<Sunrise className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Plan a week of quick and easy breakfasts."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <Sunrise className="mx-auto mb-2 h-5 w-5 text-amber-600" />
            <p className="text-xs font-semibold uppercase text-amber-500">Planned days</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-700">{plannedDays}/7</p>
          </div>
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
            <UtensilsCrossed className="mx-auto mb-2 h-5 w-5 text-primary-600" />
            <p className="text-xs font-semibold uppercase text-primary-500">Variety</p>
            <p className="mt-1 text-3xl font-extrabold text-primary-700">{variety} ideas</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <Layers className="mx-auto mb-2 h-5 w-5 text-slate-600" />
            <p className="text-xs font-semibold uppercase text-slate-400">Top pick</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-800">{topPick}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {DAYS.map((day) => (
            <section key={day} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">{day}</p>
              <Field label="Breakfast">
                <Select value={plans[day] || ''} onChange={(e) => setChoice(day, e.target.value)}>
                  <option value="">— pick —</option>
                  {IDEAS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </Field>
              {plans[day] === 'Custom' && (
                <div className="mt-2">
                  <TextInput placeholder="e.g. Shakshuka" value={customs[day] || ''} onChange={(e) => setCustom(day, e.target.value)} />
                </div>
              )}
              {finalFor(day) ? (
                <p className="mt-3 truncate text-sm font-bold text-slate-800">{finalFor(day)}</p>
              ) : (
                <p className="mt-3 text-xs text-slate-300">Not planned yet</p>
              )}
            </section>
          ))}
        </div>

        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          {spread}
        </p>
      </ToolShell>
    </>
  )
}