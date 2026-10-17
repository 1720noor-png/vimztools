import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, FlaskConical, ShieldCheck, WifiOff } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  FALLBACK_ACTIVES,
  checkActiveConflicts,
  getActiveIngredients,
  type ActiveConflict,
  type ActiveIngredient,
} from '../../../lib/beautyApi'

const SEV_CARD: Record<string, string> = {
  avoid: 'border-rose-200 bg-rose-50',
  warning: 'border-amber-200 bg-amber-50',
  caution: 'border-sky-200 bg-sky-50',
}

const SEV_CHIP: Record<string, string> = {
  avoid: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-700',
  caution: 'bg-sky-100 text-sky-700',
}

const SEV_LABEL: Record<string, string> = {
  avoid: 'Avoid',
  warning: 'Warning',
  caution: 'Caution',
}

export default function ActiveIngredientConflictChecker() {
  const [actives, setActives] = useState<ActiveIngredient[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [conflicts, setConflicts] = useState<ActiveConflict[]>([])
  const [loading, setLoading] = useState(true)
  const [conflictLoading, setConflictLoading] = useState(false)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getActiveIngredients()
        if (!cancelled) setActives(rows)
      } catch {
        if (!cancelled) {
          setActives(FALLBACK_ACTIVES)
          setOffline(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (selected.length < 2) return
    let cancelled = false
    ;(async () => {
      setConflictLoading(true)
      try {
        const rows = await checkActiveConflicts(selected)
        if (!cancelled) setConflicts(rows)
      } catch {
        if (!cancelled) setConflicts([])
      } finally {
        if (!cancelled) setConflictLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selected])

  const toggle = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
    setSelected(next)
    if (next.length < 2) setConflicts([])
  }

  const activeCount = useMemo(() => actives.length, [actives])

  return (
    <>
      <Seo
        title="Active Ingredient Conflict Checker - vimz Tools"
        description="Check whether the active ingredients in your routine clash before you layer them."
      />
      <ToolShell
        title="Active Ingredient Conflict Checker"
        description="Pick the active ingredients from your routine and see which pairs clash before you layer them."
        icon={<FlaskConical className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Toggle two or more actives you plan to combine"
      >
        {offline && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">Offline - showing sample data</p>
          </div>
        )}

        {loading ? (
          <HybridLoader />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <h3 className="mb-1 text-sm font-bold text-slate-800">Your actives</h3>
              <p className="mb-4 flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {selected.length} of {activeCount} selected
              </p>
              <div className="flex flex-wrap gap-2">
                {actives.map((a) => {
                  const on = selected.includes(a.slug)
                  return (
                    <button
                      key={a.slug}
                      onClick={() => toggle(a.slug)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                        on
                          ? 'border-primary-500 bg-primary-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {a.name}
                    </button>
                  )
                })}
              </div>
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                This checker covers the most common 12 actives. Pick two or more to run the conflict check.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Conflict report</h3>
              {conflictLoading ? (
                <HybridLoader label="Checking pairs…" />
              ) : selected.length < 2 ? (
                <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-200">
                  <p className="max-w-xs text-center text-sm text-slate-400">
                    Select at least two actives to see whether they clash.
                  </p>
                </div>
              ) : conflicts.length === 0 ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <ShieldCheck className="h-8 w-8 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">No conflicts found</p>
                    <p className="text-xs text-emerald-700">These actives pair safely together.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {conflicts.map((c) => {
                    const card = SEV_CARD[c.severity] ?? SEV_CARD.avoid
                    const chip = SEV_CHIP[c.severity] ?? SEV_CHIP.avoid
                    const label = SEV_LABEL[c.severity] ?? SEV_LABEL.avoid
                    return (
                      <div key={c.id} className={`rounded-2xl border ${card} p-4`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-extrabold text-slate-800">
                            {c.a_name} + {c.b_name}
                          </p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${chip}`}>
                            {label}
                          </span>
                        </div>
                        {c.reason && (
                          <p className="mt-2 text-xs leading-relaxed text-slate-600">{c.reason}</p>
                        )}
                        {c.suggestion && (
                          <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            {c.suggestion}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}