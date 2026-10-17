import { useMemo, useState } from 'react'
import { Clock3, ListChecks, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp, fmtHours, round, toNumber } from '../../../lib/numbers'

const ROOM_BASE: Record<string, number> = {
  Kitchen: 100,
  Bathroom: 70,
  Bedroom: 60,
  'Living room': 75,
  Garage: 90,
  'Kids room': 80,
  'Dining room': 55,
}

const ROOMS = Object.keys(ROOM_BASE)
const CLUTTER = [
  { label: 'Minimal', factor: 0.9 },
  { label: 'Moderate', factor: 1 },
  { label: 'Heavy', factor: 1.35 },
]
const HOUSEHOLD = [
  { label: '1-2 people', factor: 1 },
  { label: '3-4 people', factor: 1.1 },
]
const RECENCY = [
  { label: 'Recent', factor: 1 },
  { label: 'Months ago', factor: 1.15 },
  { label: 'A year+', factor: 1.35 },
]

const EXTRAS = [
  { id: 'windows', label: 'Windows both sides', minutes: 45 },
  { id: 'oven', label: 'Oven degrease', minutes: 40 },
  { id: 'fridge', label: 'Fridge defrost', minutes: 30 },
  { id: 'baseboards', label: 'Baseboards wipe', minutes: 30 },
  { id: 'fans', label: 'Ceiling fans', minutes: 20 },
  { id: 'curtains', label: 'Curtains wash', minutes: 35 },
  { id: 'grout', label: 'Grout scrub', minutes: 40 },
  { id: 'mattress', label: 'Mattress vacuum', minutes: 15 },
]

const ZONES = [
  { name: 'Dusting', pct: 0.25 },
  { name: 'Floors', pct: 0.25 },
  { name: 'Surfaces', pct: 0.2 },
  { name: 'Bins & windows', pct: 0.15 },
  { name: 'Details', pct: 0.15 },
]

const FACTORS = {
  clutter: Object.fromEntries(CLUTTER.map((c) => [c.label, c.factor])),
  household: Object.fromEntries(HOUSEHOLD.map((h) => [h.label, h.factor])),
  recency: Object.fromEntries(RECENCY.map((r) => [r.label, r.factor])),
} as Record<string, Record<string, number>>

export default function RoomDeepCleaningTime() {
  const [room, setRoom] = useState('Kitchen')
  const [area, setArea] = useState('')
  const [clutter, setClutter] = useState('Moderate')
  const [household, setHousehold] = useState('1-2 people')
  const [lastClean, setLastClean] = useState('Recent')
  const [extras, setExtras] = useState<Record<string, boolean>>(
    Object.fromEntries(EXTRAS.map((e) => [e.id, false])),
  )

  const checkedMinutes = useMemo(
    () => EXTRAS.filter((e) => extras[e.id]).reduce((acc, e) => acc + e.minutes, 0),
    [extras],
  )

  const result = useMemo(() => {
    const areaNum = toNumber(area)
    const areaFactor = Number.isFinite(areaNum) && areaNum > 0 ? clamp(areaNum / 20, 0.7, 2) : 1
    const core =
      ROOM_BASE[room] *
      areaFactor *
      (FACTORS.clutter[clutter] ?? 1) *
      (FACTORS.household[household] ?? 1) *
      (FACTORS.recency[lastClean] ?? 1)
    const total = core + checkedMinutes
    const zones = ZONES.map((z) => ({ name: z.name, minutes: round(core * z.pct) }))
    return { core, total, zones }
  }, [room, area, clutter, household, lastClean, checkedMinutes])

  const toggleExtra = (id: string) =>
    setExtras((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <>
      <Seo
        title="Room Deep Cleaning Time - vimz Tools"
        description="Estimate how long a full deep clean of any room takes before you start."
      />
      <ToolShell
        title="Room Deep Cleaning Time"
        description="Estimate how long a full deep clean of any room takes before you start."
        icon={<Sparkles className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Choose a room and optional extras to build a deep clean time plan."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Room settings</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Room">
                <Select value={room} onChange={(e) => setRoom(e.target.value)}>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Area (m²)">
                <TextInput type="number" min={0} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. 20" />
              </Field>
              <Field label="Clutter level">
                <Select value={clutter} onChange={(e) => setClutter(e.target.value)}>
                  {CLUTTER.map((c) => (
                    <option key={c.label} value={c.label}>{c.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="People at home">
                <Select value={household} onChange={(e) => setHousehold(e.target.value)}>
                  {HOUSEHOLD.map((h) => (
                    <option key={h.label} value={h.label}>{h.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Last deep clean">
                <Select value={lastClean} onChange={(e) => setLastClean(e.target.value)}>
                  {RECENCY.map((r) => (
                    <option key={r.label} value={r.label}>{r.label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ListChecks className="h-4 w-4 text-sky-500" /> Optional extras
              </h3>
              <div className="space-y-2">
                {EXTRAS.map((e) => (
                  <label
                    key={e.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${
                      extras[e.id] ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={extras[e.id]}
                      onChange={() => toggleExtra(e.id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-200"
                    />
                    <span className="flex-1 text-sm font-semibold text-slate-700">{e.label}</span>
                    <span className="text-xs font-bold text-slate-400">+{e.minutes} min</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-3">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                <Clock3 className="h-4 w-4" /> Total deep clean time
              </p>
              <p className="mt-2 text-6xl font-extrabold text-emerald-900">{fmtHours(result.total)}</p>
              <p className="mt-1 text-sm text-emerald-600">
                {Math.round(result.core)} min core cleaning + {checkedMinutes} min optional extras
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Zone breakdown</h3>
              <div className="space-y-3">
                {result.zones.map((z) => (
                  <div key={z.name}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                      <span>{z.name}</span>
                      <span>{z.minutes} min</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2.5 rounded-full bg-sky-500"
                        style={{ width: `${result.total > 0 ? Math.min(100, (z.minutes / result.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {checkedMinutes > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Optional extras added</h3>
                <div className="space-y-3">
                  {EXTRAS.filter((e) => extras[e.id]).map((e) => (
                    <div key={e.id}>
                      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                        <span>{e.label}</span>
                        <span>+{e.minutes} min</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2.5 rounded-full bg-rose-400"
                          style={{ width: `${Math.min(100, (e.minutes / result.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}