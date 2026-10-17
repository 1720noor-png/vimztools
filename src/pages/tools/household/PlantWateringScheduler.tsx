import { useMemo, useState } from 'react'
import { CalendarDays, Droplets, Leaf, Sprout, Sun } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

type Species = {
  name: string
  summer: number
  winter: number
  sunlight: string
  fertilizeEvery: number
  tip: string
}

const PLANTS: Species[] = [
  { name: 'Snake plant', summer: 14, winter: 30, sunlight: 'Low to bright indirect', fertilizeEvery: 8, tip: 'Likes to stay dry between waterings.' },
  { name: 'Pothos', summer: 7, winter: 14, sunlight: 'Bright indirect', fertilizeEvery: 4, tip: 'Yellow leaves usually mean overwatering.' },
  { name: 'Monstera', summer: 5, winter: 12, sunlight: 'Bright indirect', fertilizeEvery: 4, tip: 'Wipe leaves dust-free to lift light uptake.' },
  { name: 'Peace lily', summer: 3, winter: 7, sunlight: 'Medium indirect', fertilizeEvery: 6, tip: 'Drooping leaves bounce back fast after a drink.' },
  { name: 'Fiddle leaf fig', summer: 6, winter: 12, sunlight: 'Bright indirect', fertilizeEvery: 4, tip: 'Rotating the pot keeps the canopy even.' },
  { name: 'Spider plant', summer: 8, winter: 16, sunlight: 'Bright indirect', fertilizeEvery: 4, tip: 'Brown tips appear with too much direct light.' },
  { name: 'ZZ plant', summer: 20, winter: 40, sunlight: 'Low to bright indirect', fertilizeEvery: 6, tip: 'Its rhizomes store water; let soil dry fully.' },
  { name: 'Aloe vera', summer: 14, winter: 30, sunlight: 'Bright direct', fertilizeEvery: 0, tip: 'Always water at the base, never the crown.' },
  { name: 'Succulent', summer: 12, winter: 28, sunlight: 'Bright direct', fertilizeEvery: 0, tip: 'Wait until soil is bone dry before soaking.' },
  { name: 'Basil', summer: 2, winter: 5, sunlight: 'Bright direct', fertilizeEvery: 2, tip: 'Pinch flowers to keep leaves growing.' },
  { name: 'Mint', summer: 2, winter: 5, sunlight: 'Bright to part', fertilizeEvery: 3, tip: 'Keep soil evenly moist, never soggy.' },
  { name: 'Rose', summer: 3, winter: 8, sunlight: 'Bright direct', fertilizeEvery: 2, tip: 'Water at the base to protect the foliage.' },
  { name: 'Hibiscus', summer: 3, winter: 7, sunlight: 'Bright direct', fertilizeEvery: 2, tip: 'Feed regularly to keep blooms coming.' },
  { name: 'Money plant', summer: 6, winter: 14, sunlight: 'Low to bright indirect', fertilizeEvery: 4, tip: 'Trim leggy vines to encourage fullness.' },
]

const SEASONS = ['Summer', 'Winter', 'Monsoon']
const POTS = ['Clay', 'Plastic']
const LIGHTS = ['Low', 'Medium', 'Bright']

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export default function PlantWateringScheduler() {
  const [plantName, setPlantName] = useState(PLANTS[0].name)
  const [season, setSeason] = useState('Summer')
  const [pot, setPot] = useState('Clay')
  const [light, setLight] = useState('Medium')
  const [lastWatered, setLastWatered] = useState('')

  const plant = PLANTS.find((p) => p.name === plantName) ?? PLANTS[0]

  const intervalDays = useMemo(() => {
    let d: number
    if (season === 'Monsoon') d = plant.summer * 1.2
    else if (season === 'Winter') d = plant.winter * 1.5
    else d = plant.summer
    d *= pot === 'Clay' ? 0.8 : 1.1
    if (light === 'Low') d *= 1.2
    else if (light === 'Bright') d *= 0.9
    return Math.max(1, Math.round(d))
  }, [plant, season, pot, light])

  const nextWater = useMemo(() => {
    const base = lastWatered ? new Date(lastWatered) : new Date()
    if (Number.isNaN(base.getTime())) return new Date()
    base.setDate(base.getDate() + intervalDays)
    return base
  }, [lastWatered, intervalDays])

  const events = useMemo(() => {
    const list: Date[] = []
    const cursor = new Date(nextWater)
    for (let i = 0; i < 6; i++) {
      list.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + intervalDays)
    }
    return list
  }, [nextWater, intervalDays])

  const fertilizeLabel =
    plant.fertilizeEvery === 0 ? 'No fertilizing needed' : `Every ${plant.fertilizeEvery} weeks in the growing season`

  return (
    <>
      <Seo
        title="Plant Watering Scheduler - vimz Tools"
        description="Build a watering plan and upcoming water dates for common houseplants."
      />
      <ToolShell
        title="Plant Watering Scheduler"
        description="Build a watering plan and upcoming water dates for common houseplants."
        icon={<Sprout className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Pick a plant and its environment to see the next six watering dates."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Plant profile</h3>
            <div className="space-y-3">
              <Field label="Plant type">
                <Select value={plantName} onChange={(e) => setPlantName(e.target.value)}>
                  {PLANTS.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Season">
                <Select value={season} onChange={(e) => setSeason(e.target.value)}>
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pot type">
                  <Select value={pot} onChange={(e) => setPot(e.target.value)}>
                    {POTS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Light level">
                  <Select value={light} onChange={(e) => setLight(e.target.value)}>
                    {LIGHTS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Last watered (optional)">
                <TextInput type="date" value={lastWatered} onChange={(e) => setLastWatered(e.target.value)} />
              </Field>
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Watering every {intervalDays} days for the current selection.
            </p>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Next water</p>
              <div className="mt-2 flex items-end justify-center gap-2">
                <Droplets className="mb-1 h-6 w-6 text-emerald-500" />
                <p className="text-6xl font-extrabold leading-none text-emerald-900">{nextWater.getDate()}</p>
                <p className="pb-1 text-sm font-bold text-emerald-700">
                  {nextWater.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
                <Leaf className="h-3.5 w-3.5" /> {fmtDate(nextWater)} · every {intervalDays} days
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Sun className="h-4 w-4 text-amber-500" /> Care card for {plant.name}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Sunlight</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{plant.sunlight}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Fertilize</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{fertilizeLabel}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[11px] font-semibold uppercase text-emerald-500">Care tip</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-800">{plant.tip}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <CalendarDays className="h-4 w-4 text-sky-500" /> Six-event watering timeline
              </h3>
              <ol className="space-y-0">
                {events.map((e, i) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < events.length - 1 && <span className="absolute left-[11px] top-6 h-full w-px bg-slate-200" />}
                    <span className={`mt-0.5 h-[23px] w-[23px] shrink-0 rounded-full border-2 text-[10px] font-extrabold leading-none flex items-center justify-center ${i === 0 ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-500'}`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-1 items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <div>
                        <p className={`text-sm font-bold ${i === 0 ? 'text-emerald-700' : 'text-slate-700'}`}>{fmtDate(e)}</p>
                        <p className="text-[11px] text-slate-400">
                          {i === 0 ? 'Next watering' : `${i} watering${i > 1 ? 's' : ''} from now`}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                        +{i * intervalDays}d
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}