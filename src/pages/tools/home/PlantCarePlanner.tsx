import { useMemo, useState } from 'react'
import { Sprout, Plus, Trash2, Droplets, Flower2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Plant = { id: string; name: string; waterDays: number; feedDays: number; lastWater: string; lastFeed: string }
const DAYS_OPTIONS = [1, 2, 3, 5, 7, 14]

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (date: string, days: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const isDue = (date: string) => date <= today()

export default function PlantCarePlanner() {
  const [plants, setPlants] = useState<Plant[]>([
    { id: uid(), name: 'Monstera', waterDays: 7, feedDays: 30, lastWater: addDays(today(), -7), lastFeed: addDays(today(), -10) },
    { id: uid(), name: 'Snake plant', waterDays: 14, feedDays: 60, lastWater: addDays(today(), -2), lastFeed: addDays(today(), -20) },
    { id: uid(), name: 'Peace lily', waterDays: 3, feedDays: 30, lastWater: addDays(today(), -3), lastFeed: addDays(today(), -5) },
  ])
  const [name, setName] = useState('')
  const [waterDays, setWaterDays] = useState<number>(7)
  const [feedDays, setFeedDays] = useState<number>(30)

  const addPlant = () => {
    if (!name.trim()) return
    setPlants((prev) => [...prev, { id: uid(), name: name.trim(), waterDays, feedDays, lastWater: today(), lastFeed: today() }])
    setName('')
  }

  const remove = (id: string) => setPlants((prev) => prev.filter((p) => p.id !== id))
  const waterNow = (id: string) => setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, lastWater: today() } : p)))
  const feedNow = (id: string) => setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, lastFeed: today() } : p)))

  const dueCount = useMemo(
    () => plants.filter((p) => isDue(addDays(p.lastWater, p.waterDays)) || isDue(addDays(p.lastFeed, p.feedDays))).length,
    [plants],
  )
  const totalPlants = plants.length
  const avgInterval = useMemo(() => (plants.length ? Math.round(plants.reduce((a, p) => a + p.waterDays, 0) / plants.length) : 0), [plants])

  return (
    <>
      <Seo
        title="Plant Care Planner - vimz Tools"
        description="Schedule watering, feeding and care for every houseplant."
      />
      <ToolShell
        title="Plant Care Planner"
        description="Schedule watering, feeding and care for every houseplant."
        icon={<Sprout className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Log watering and feeding dates for every houseplant."
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <Sprout className="mx-auto mb-1 h-5 w-5 text-emerald-600" />
            <p className="text-[11px] font-semibold uppercase text-emerald-500">Plants</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-800">{totalPlants}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <Droplets className="mx-auto mb-1 h-5 w-5 text-amber-600" />
            <p className="text-[11px] font-semibold uppercase text-amber-500">Due today</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-700">{dueCount}</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
            <Flower2 className="mx-auto mb-1 h-5 w-5 text-sky-600" />
            <p className="text-[11px] font-semibold uppercase text-sky-500">Avg water cycle</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-800">every {avgInterval}d</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add a plant</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Name">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fiddle leaf fig" />
              </Field>
              <Field label="Watering interval">
                <Select value={waterDays} onChange={(e) => setWaterDays(Number(e.target.value))}>
                  {DAYS_OPTIONS.map((d) => (
                    <option key={d} value={d}>every {d} days</option>
                  ))}
                </Select>
              </Field>
              <Field label="Feeding interval">
                <Select value={feedDays} onChange={(e) => setFeedDays(Number(e.target.value))}>
                  {[14, 30, 60, 90].map((d) => (
                    <option key={d} value={d}>every {d} days</option>
                  ))}
                </Select>
              </Field>
              <Button onClick={addPlant}>
                <Plus className="h-4 w-4" /> Add plant
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {plants.map((p) => {
              const waterDue = isDue(addDays(p.lastWater, p.waterDays))
              const feedDue = isDue(addDays(p.lastFeed, p.feedDays))
              return (
                <section key={p.id} className={`rounded-2xl border p-5 ${waterDue || feedDue ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-slate-800">{p.name}</h4>
                    <button onClick={() => remove(p.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                      <span className="text-slate-500">Water · {p.waterDays}d</span>
                      <span className={`font-bold ${waterDue ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {waterDue ? 'Due now' : `next ${addDays(p.lastWater, p.waterDays)}`}
                      </span>
                      <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => waterNow(p.id)}>
                        <Droplets className="h-3 w-3" /> Watered
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                      <span className="text-slate-500">Feed · {p.feedDays}d</span>
                      <span className={`font-bold ${feedDue ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {feedDue ? 'Due now' : `next ${addDays(p.lastFeed, p.feedDays)}`}
                      </span>
                      <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => feedNow(p.id)}>
                        <Flower2 className="h-3 w-3" /> Fed
                      </Button>
                    </div>
                  </div>
                </section>
              )
            })}
            {plants.length === 0 && (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-xs text-slate-400">
                No plants yet — add your first houseplant.
              </p>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}