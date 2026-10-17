import { useMemo, useState } from 'react'
import { UtensilsCrossed, Printer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEALS = ['Breakfast', 'Lunch', 'Dinner']
const INITIAL: Record<string, string> = {}

export default function MealPlanner() {
  const [items, setItems] = useState<Record<string, string>>(INITIAL)

  const setCell = (day: string, meal: string, value: string) =>
    setItems((prev) => ({ ...prev, [`${day}::${meal}`]: value }))

  const stats = useMemo(() => {
    const values = Object.values(items)
    const filled = values.filter((v) => v.trim()).length
    const distinct = new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean)).size
    return { total: values.length, filled, distinct }
  }, [items])

  const print = () => window.print()

  return (
    <>
      <Seo
        title="Meal Planner - vimz Tools"
        description="Plan a week of breakfasts, lunches and dinners."
      />
      <ToolShell
        title="Meal Planner"
        description="Plan a week of breakfasts, lunches and dinners."
        icon={<UtensilsCrossed className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Fill a weekly grid with breakfast, lunch and dinner."
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Meals planned</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">{stats.filled}/{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Unique dishes</p>
            <p className="mt-1 text-2xl font-extrabold text-primary-700">{stats.distinct}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Variety score</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-600">{stats.total ? Math.round((stats.distinct / stats.total) * 100) : 0}%</p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 print:p-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">This week's menu</h3>
            <Button variant="secondary" onClick={print} className="px-3 py-2 text-xs print:hidden">
              <Printer className="h-3.5 w-3.5" /> Print menu
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-3 text-[11px] uppercase tracking-wide text-slate-400">Day</th>
                  {MEALS.map((m) => (
                    <th key={m} className="px-2 py-2 text-[11px] uppercase tracking-wide text-slate-400">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3 font-bold text-slate-700">{day}</td>
                    {MEALS.map((meal) => (
                      <td key={meal} className="px-2 py-1.5">
                        <TextInput
                          value={items[`${day}::${meal}`] ?? ''}
                          onChange={(e) => setCell(day, meal, e.target.value)}
                          placeholder={meal === 'Breakfast' ? 'Oatmeal' : meal === 'Lunch' ? 'Salad' : 'Pasta'}
                          className="border-transparent bg-slate-50 px-2.5 py-1.5 text-xs focus:border-primary-500 focus:bg-white"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {stats.filled > 0 && (
          <section className="mt-6 hidden rounded-2xl border border-dashed border-slate-300 bg-white p-5 print:block">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Print version</h3>
            <ul className="space-y-1.5">
              {DAYS.map((day) => (
                <li key={day} className="text-xs text-slate-600">
                  <span className="font-bold">{day}:</span>{' '}
                  {MEALS.map((m) => items[`${day}::${m}`] ?? '').filter(Boolean).join(' · ') || '—'}
                </li>
              ))}
            </ul>
          </section>
        )}
      </ToolShell>
    </>
  )
}