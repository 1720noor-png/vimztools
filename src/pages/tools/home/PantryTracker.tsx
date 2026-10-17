import { useMemo, useState } from 'react'
import { Box, AlertTriangle, ShoppingBasket } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/numbers'

type Staple = { id: string; name: string; qty: number; expiry: string }
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const seed = (): Staple[] => {
  const now = new Date()
  const m = now.getMonth()
  return [
    { id: uid(), name: 'Rice', qty: 4, expiry: MONTHS[(m + 6) % 12] },
    { id: uid(), name: 'Flour', qty: 2, expiry: MONTHS[(m + 3) % 12] },
    { id: uid(), name: 'Sugar', qty: 3, expiry: MONTHS[(m + 8) % 12] },
    { id: uid(), name: 'Pasta', qty: 1, expiry: MONTHS[(m + 2) % 12] },
    { id: uid(), name: 'Oats', qty: 5, expiry: MONTHS[(m + 5) % 12] },
    { id: uid(), name: 'Canned tomatoes', qty: 2, expiry: MONTHS[(m + 11) % 12] },
    { id: uid(), name: 'Coffee', qty: 1, expiry: MONTHS[(m + 1) % 12] },
    { id: uid(), name: 'Olive oil', qty: 4, expiry: MONTHS[(m + 7) % 12] },
  ]
}

const nextMonth = () => MONTHS[(new Date().getMonth() + 1) % 12]

export default function PantryTracker() {
  const [staples, setStaples] = useState<Staple[]>(seed)

  const setQty = (id: string, qty: number) => setStaples((prev) => prev.map((s) => (s.id === id ? { ...s, qty } : s)))
  const setExpiry = (id: string, expiry: string) => setStaples((prev) => prev.map((s) => (s.id === id ? { ...s, expiry } : s)))

  const restock = useMemo(() => staples.filter((s) => s.qty <= 2), [staples])
  const expiring = useMemo(() => {
    const target = nextMonth()
    return staples.filter((s) => s.expiry === MONTHS[(new Date().getMonth() + 4) % 12] || s.expiry === target)
  }, [staples])

  const total = useMemo(() => staples.reduce((a, s) => a + s.qty, 0), [staples])

  return (
    <>
      <Seo
        title="Pantry Tracker - vimz Tools"
        description="Monitor pantry staples, expiry dates and restock needs."
      />
      <ToolShell
        title="Pantry Tracker"
        description="Monitor pantry staples, expiry dates and restock needs."
        icon={<Box className="h-6 w-6" />}
        breadcrumb="Home & Household"
        instruction="Track staple quantities and restock before they run out."
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-[11px] font-semibold uppercase text-slate-400">Total stock</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-800">{total}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <ShoppingBasket className="mx-auto mb-1 h-5 w-5 text-rose-600" />
            <p className="text-[11px] font-semibold uppercase text-rose-500">Restock soon</p>
            <p className="mt-1 text-2xl font-extrabold text-rose-700">{restock.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
            <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-amber-600" />
            <p className="text-[11px] font-semibold uppercase text-amber-500">Expiring soon</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-700">{expiring.length}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Staples</h3>
          <ul className="space-y-3">
            {staples.map((s) => {
              const isLow = s.qty <= 2
              const isSoon = s.expiry === nextMonth()
              return (
                <li key={s.id} className={`rounded-xl border px-4 py-3 ${isLow ? 'border-rose-200 bg-rose-50/60' : 'border-slate-200 bg-white'}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-40 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                      <p className="text-[11px] text-slate-400">Quantity: {s.qty}</p>
                    </div>
                    <div className="w-40">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={s.qty}
                        onChange={(e) => setQty(s.id, Number(e.target.value))}
                        className="w-full accent-primary-600"
                        aria-label={`${s.name} quantity`}
                      />
                    </div>
                    <Select value={s.expiry} onChange={(e) => setExpiry(s.id, e.target.value)} className="w-28 py-1.5 text-xs">
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                    {isLow && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">Restock</span>}
                    {isSoon && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">Expiry soon</span>}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </ToolShell>
    </>
  )
}