import { useEffect, useState } from 'react'
import { CheckCircle2, SprayCan, TriangleAlert, WifiOff, XCircle } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  FALLBACK_CLEANERS,
  FALLBACK_SURFACES,
  getCleaningSurfaces,
  getSurfaceCleaners,
  type CleaningSurface,
  type SurfaceCleaner,
} from '../../../lib/householdApi'

export default function SurfaceSafeCleaner() {
  const [surfaces, setSurfaces] = useState<CleaningSurface[]>([])
  const [surfaceSlug, setSurfaceSlug] = useState('')
  const [cleaners, setCleaners] = useState<SurfaceCleaner[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCleaners, setLoadingCleaners] = useState(false)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getCleaningSurfaces()
        if (!cancelled) {
          setSurfaces(rows)
          if (rows.length) {
            setLoadingCleaners(true)
            setSurfaceSlug(rows[0].slug)
          }
        }
      } catch {
        if (!cancelled) {
          setSurfaces(FALLBACK_SURFACES)
          setOffline(true)
          setLoadingCleaners(true)
          setSurfaceSlug(FALLBACK_SURFACES[0].slug)
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
    if (!surfaceSlug) return
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getSurfaceCleaners(surfaceSlug)
        if (!cancelled) setCleaners(rows)
      } catch {
        if (!cancelled) setCleaners(FALLBACK_CLEANERS[surfaceSlug] ?? [])
      } finally {
        if (!cancelled) setLoadingCleaners(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [surfaceSlug])

  const handleSurfaceChange = (slug: string) => {
    setLoadingCleaners(true)
    setSurfaceSlug(slug)
  }

  const surface = surfaces.find((s) => s.slug === surfaceSlug)
  const safe = cleaners.filter((c) => c.is_safe)
  const avoid = cleaners.filter((c) => !c.is_safe)

  return (
    <>
      <Seo
        title="Surface Safe Cleaner - vimz Tools"
        description="Check which household cleaners are safe for each surface and which to avoid."
      />
      <ToolShell
        title="Surface Safe Cleaner"
        description="Check which household cleaners are safe for each surface and which to avoid."
        icon={<SprayCan className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Pick a surface to see the safe cleaners and the ones to steer clear of."
      >
        {offline && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Offline mode: the live cleaner database is unreachable, showing built-in sample data.
            </p>
          </div>
        )}

        {loading ? (
          <HybridLoader />
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                <Field label="Surface">
                  <Select value={surfaceSlug} onChange={(e) => handleSurfaceChange(e.target.value)}>
                    {surfaces.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                  </Select>
                </Field>
                <div className="md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Care notes</p>
                  <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                    {surface?.care_notes ?? 'No special notes for this surface.'}
                  </p>
                </div>
              </div>
            </section>

            {loadingCleaners ? (
              <HybridLoader />
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-emerald-200 bg-white p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Safe to use
                  </h3>
                  <div className="space-y-2.5">
                    {safe.map((c) => (
                      <div key={c.agent.slug} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800">{c.agent.name}</p>
                          <span className="shrink-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                            Safe
                          </span>
                        </div>
                        {c.agent.description && (
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">{c.agent.description}</p>
                        )}
                      </div>
                    ))}
                    {safe.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                        No safe cleaners recorded for this surface.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-rose-200 bg-white p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-rose-700">
                    <XCircle className="h-4 w-4" /> Avoid on this surface
                  </h3>
                  <div className="space-y-2.5">
                    {avoid.map((c) => (
                      <div key={c.agent.slug} className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-800">{c.agent.name}</p>
                          <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                            Avoid
                          </span>
                        </div>
                        <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500">
                          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                          {c.notes ?? c.agent.description}
                        </p>
                      </div>
                    ))}
                    {avoid.length === 0 && (
                      <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                        Nothing to avoid on this surface.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </ToolShell>
    </>
  )
}