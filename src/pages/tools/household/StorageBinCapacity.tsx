import { useState } from 'react'
import { Boxes, Package, Ruler } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { toNumber } from '../../../lib/numbers'

type BinItem = { id: string; label: string; litres: number; hang?: number }

const ITEMS: BinItem[] = [
  { id: 'shirts', label: 'Shirts', litres: 2, hang: 3 },
  { id: 'tshirts', label: 'T-shirts', litres: 1.5, hang: 2 },
  { id: 'jeans', label: 'Jeans / pants', litres: 3, hang: 4 },
  { id: 'sweaters', label: 'Sweaters', litres: 5 },
  { id: 'dresses', label: 'Dresses', litres: 6, hang: 4 },
  { id: 'shoes', label: 'Shoe pairs', litres: 8 },
  { id: 'towels', label: 'Towels', litres: 3 },
  { id: 'blankets', label: 'Blankets', litres: 12 },
  { id: 'toys', label: 'Toys', litres: 3 },
  { id: 'linen', label: 'Linen sets', litres: 10 },
]

const BIN_SIZES = [40, 60, 90, 150]

export default function StorageBinCapacity() {
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(ITEMS.map((i) => [i.id, ''])),
  )
  const [binSize, setBinSize] = useState(60)

  const countOf = (id: string) => {
    const n = toNumber(counts[id])
    return Number.isFinite(n) && n > 0 ? n : 0
  }

  const totalNeeded = ITEMS.reduce((acc, i) => acc + countOf(i.id) * i.litres, 0)

  const hangingCm = ITEMS.reduce((acc, i) => acc + (i.hang ? countOf(i.id) * i.hang : 0), 0)

  const binsNeeded = Math.ceil((totalNeeded * 1.15) / binSize)

  const needsFor = (size: number) => Math.ceil((totalNeeded * 1.15) / size)

  const capacity = binsNeeded * binSize
  const gaugePct = capacity > 0 ? Math.min(100, (totalNeeded / capacity) * 100) : 0
  const shownBins = binsNeeded > 0 ? Math.min(binsNeeded, 12) : 0

  return (
    <>
      <Seo
        title="Storage Bin Capacity - vimz Tools"
        description="Work out how many storage bins you need for a collection of household items."
      />
      <ToolShell
        title="Storage Bin Capacity"
        description="Work out how many storage bins you need for a collection of household items."
        icon={<Boxes className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Pile in the item counts to size your bin and shelf plan."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">What goes in the bins</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ITEMS.map((i) => (
                <Field key={i.id} label={`${i.label} (${i.litres}L)`}>
                  <TextInput
                    type="number"
                    min={0}
                    value={counts[i.id]}
                    onChange={(e) => setCounts((prev) => ({ ...prev, [i.id]: e.target.value }))}
                    placeholder="0"
                  />
                </Field>
              ))}
            </div>
            <div className="mt-4">
              <Field label="Bin size">
                <Select value={binSize} onChange={(e) => setBinSize(Number(e.target.value))}>
                  {BIN_SIZES.map((s) => (
                    <option key={s} value={s}>{s}L bin</option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Total volume</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{Math.round(totalNeeded)} L</p>
                <p className="mt-1 text-[11px] text-slate-400">+15% headroom = {Math.round(totalNeeded * 1.15)} L</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-emerald-500">{binSize}L bins needed</p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-800">{binsNeeded}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-emerald-600">
                  <Ruler className="h-3 w-3" /> hanging rod ~ {Math.round(hangingCm)} cm
                </p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-sky-500">Litres gauge</p>
                <p className="mt-1 text-2xl font-extrabold text-sky-800">{Math.round(gaugePct)}%</p>
                <p className="mt-1 text-[11px] text-sky-600">of ordered capacity used</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Package className="h-4 w-4 text-emerald-500" /> Bin stack
                </h3>
                <div className="flex flex-col-reverse items-center gap-1.5">
                  {Array.from({ length: shownBins }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex h-7 w-28 items-center justify-center rounded-lg border ${
                        i === 0
                          ? 'border-emerald-500 bg-emerald-200'
                          : 'border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      <Package className={`h-3.5 w-3.5 ${i === 0 ? 'text-emerald-700' : 'text-emerald-400'}`} />
                    </div>
                  ))}
                  {binsNeeded === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-xs text-slate-400">
                      Nothing counted yet - add items to see the stack.
                    </p>
                  )}
                </div>
                {binsNeeded > shownBins && (
                  <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
                    + {binsNeeded - shownBins} more bins above
                  </p>
                )}
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>{Math.round(totalNeeded)} L packed</span>
                    <span>{capacity} L ordered</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${gaugePct}%` }} />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Needs by bin size</h3>
                <ul className="space-y-2">
                  {BIN_SIZES.map((s) => {
                    const active = s === binSize
                    return (
                      <li
                        key={s}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${
                          active ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className="text-sm font-bold text-slate-700">{s}L bins</span>
                        <span className={`rounded-full px-2.5 py-1 text-sm font-extrabold ${active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {needsFor(s)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </ToolShell>
    </>
  )
}