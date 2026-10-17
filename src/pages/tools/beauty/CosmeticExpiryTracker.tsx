import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  FlaskConical,
  Timer,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import { FALLBACK_PAO, getPaoRules, type PaoRule } from '../../../lib/beautyApi'
import { uid } from '../../../lib/numbers'

const STORAGE_KEY = 'vimz-beauty-cosmetic-expiry'
const DAY_MS = 86400000

type TrackedProduct = {
  id: string
  name: string
  productType: string
  openedAt: string
}

type RowStatus = {
  label: string
  Icon: typeof AlertTriangle
  badgeCls: string
  barCls: string
}

const dayStart = (): Date => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const daysBetween = (a: Date, b: Date): number =>
  Math.floor((b.getTime() - a.getTime()) / DAY_MS)

const expiryAfterMonths = (iso: string, months: number): Date => {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + months * 30)
  return d
}

const loadStored = (): TrackedProduct[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TrackedProduct[]) : []
  } catch {
    return []
  }
}

function useStoredProducts() {
  const [products, setProducts] = useState<TrackedProduct[]>(loadStored)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch {
      return
    }
  }, [products])
  return [products, setProducts] as const
}

export default function CosmeticExpiryTracker() {
  const [rules, setRules] = useState<PaoRule[]>([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [name, setName] = useState('')
  const [productType, setProductType] = useState('')
  const [openedAt, setOpenedAt] = useState('')
  const [products, setProducts] = useStoredProducts()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getPaoRules()
        if (!cancelled) {
          setRules(rows)
          if (rows.length) setProductType((prev) => prev || rows[0].product_type)
        }
      } catch {
        if (!cancelled) {
          setRules(FALLBACK_PAO)
          setOffline(true)
          setProductType((prev) => prev || (FALLBACK_PAO.length ? FALLBACK_PAO[0].product_type : ''))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const rows = useMemo(
    () =>
      products.flatMap((p) => {
        const rule = rules.find((r) => r.product_type === p.productType)
        const months = rule?.pao_months ?? 0
        const opened = new Date(`${p.openedAt}T00:00:00`)
        if (Number.isNaN(opened.getTime()) || months <= 0) return []
        const expiry = expiryAfterMonths(p.openedAt, months)
        const now = dayStart()
        const remaining = daysBetween(now, expiry)
        const elapsed = Math.max(0, daysBetween(opened, now))
        const usedPct = Math.min(100, Math.round((elapsed / (months * 30)) * 100))
        const freshness: RowStatus =
          remaining < 0
            ? { label: 'Expired', Icon: AlertTriangle, badgeCls: 'bg-rose-100 text-rose-700', barCls: 'bg-rose-500' }
            : remaining <= 30
              ? { label: 'Expires soon', Icon: Clock, badgeCls: 'bg-amber-100 text-amber-700', barCls: 'bg-amber-500' }
              : { label: 'OK', Icon: CheckCircle2, badgeCls: 'bg-emerald-100 text-emerald-700', barCls: 'bg-emerald-500' }
        return [
          {
            ...p,
            months,
            expiryIso: expiry.toISOString().slice(0, 10),
            remaining,
            usedPct,
            freshness,
          },
        ]
      }),
    [products, rules],
  )

  const stats = useMemo(
    () => ({
      total: rows.length,
      expired: rows.filter((r) => r.freshness.label === 'Expired').length,
      soon: rows.filter((r) => r.freshness.label === 'Expires soon').length,
    }),
    [rows],
  )

  const addProduct = () => {
    const trimmed = name.trim()
    if (!trimmed || !openedAt) return
    const type = productType || (rules.length ? rules[0].product_type : '')
    if (!type) return
    setProducts((prev) => [...prev, { id: uid(), name: trimmed, productType: type, openedAt }])
    setName('')
    setOpenedAt('')
  }

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <>
      <Seo
        title="Cosmetic Expiry Tracker - vimz Tools"
        description="Track when opened cosmetics expire using period-after-opening rules."
      />
      <ToolShell
        title="Cosmetic Expiry Tracker"
        description="Track when opened cosmetics expire using period-after-opening rules."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Log a product once to see its expiry date and freshness status."
      >
        {offline && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Offline mode: the live PAO database is unreachable, showing built-in sample rules.
            </p>
          </div>
        )}

        {loading ? (
          <HybridLoader />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <Timer className="mx-auto mb-1 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Tracked products</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-rose-600" />
                <p className="text-[11px] font-semibold uppercase text-rose-500">Expired</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-700">{stats.expired}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <Clock className="mx-auto mb-1 h-5 w-5 text-amber-600" />
                <p className="text-[11px] font-semibold uppercase text-amber-500">Expiring in 30 days</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-700">{stats.soon}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
                <h3 className="mb-4 text-sm font-bold text-slate-800">Add a product</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Product name">
                    <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Daily tinted moisturizer" />
                  </Field>
                  <Field label="Product type">
                    <Select value={productType} onChange={(e) => setProductType(e.target.value)}>
                      {rules.map((r) => (
                        <option key={r.id} value={r.product_type}>{r.product_type}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Date opened">
                    <TextInput type="date" value={openedAt} onChange={(e) => setOpenedAt(e.target.value)} />
                  </Field>
                  <Button onClick={addProduct}>Add product</Button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CalendarClock className="h-4 w-4 text-primary-600" /> Your products
                </h3>
                {rows.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                    No products logged yet. Add one with the form.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {rows.map((row) => (
                      <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-40">
                            <p className="text-sm font-bold text-slate-800">{row.name}</p>
                            <p className="text-[11px] text-slate-400">{row.productType} · {row.months} month PAO</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${row.freshness.badgeCls}`}>
                            <row.freshness.Icon className="h-3.5 w-3.5" />
                            {row.freshness.label}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="text-slate-400">Opened · </span>
                            <span className="font-semibold text-slate-600">{row.openedAt}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="text-slate-400">Expires · </span>
                            <span className="font-semibold text-slate-600">{row.expiryIso}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                            <span>{row.usedPct}% of life used</span>
                            <span>{row.remaining < 0 ? 'Expired' : `${row.remaining} days left`}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div className={`h-1.5 rounded-full ${row.freshness.barCls}`} style={{ width: `${row.usedPct}%` }} />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => removeProduct(row.id)}>
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <FlaskConical className="h-4 w-4 text-primary-600" /> PAO reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="pb-2 pr-3 font-semibold">Product type</th>
                      <th className="pb-2 pr-3 font-semibold">PAO (months)</th>
                      <th className="pb-2 pr-3 font-semibold">Shelf life (months)</th>
                      <th className="pb-2 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((r) => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-2 pr-3 font-semibold text-slate-700">{r.product_type}</td>
                        <td className="py-2 pr-3 text-slate-600">{r.pao_months}</td>
                        <td className="py-2 pr-3 text-slate-600">{r.shelf_life_months ?? '—'}</td>
                        <td className="py-2 text-slate-500">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}