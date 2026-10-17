import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Pipette,
  RotateCcw,
  ScanSearch,
  Search,
  WifiOff,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, TextArea } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  FALLBACK_COMEDOGENIC,
  getComedogenicIngredients,
  scanComedogenic,
  type ComedogenicIngredient,
} from '../../../lib/beautyApi'

const RISK: Record<string, string> = {
  high: 'bg-rose-100 text-rose-700',
  moderate: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
  non: 'bg-emerald-100 text-emerald-700',
}

const RISK_LABEL: Record<string, string> = {
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  non: 'Non',
}

function parseList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\n,]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

export default function ComedogenicScanner() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<ComedogenicIngredient[]>([])
  const [dbCount, setDbCount] = useState(0)
  const [scanned, setScanned] = useState<string[]>([])
  const [unmatched, setUnmatched] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [offline, setOffline] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getComedogenicIngredients()
        if (!cancelled) setDbCount(rows.length)
      } catch {
        if (!cancelled) {
          setDbCount(FALLBACK_COMEDOGENIC.length)
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

  const highRisk = useMemo(() => results.filter((r) => r.risk_level === 'high').length, [results])

  const scan = async () => {
    const parsed = parseList(input)
    setError('')
    if (parsed.length === 0) {
      setError('Paste an ingredient list (comma or line separated) first.')
      return
    }
    setScanned(parsed)
    setScanning(true)
    let rows: ComedogenicIngredient[] = []
    try {
      rows = await scanComedogenic(parsed)
    } catch {
      rows = FALLBACK_COMEDOGENIC.filter((item) => {
        const haystack = [item.name, ...(item.aliases ?? [])].map((n) => n.toLowerCase())
        return parsed.some((needle) => haystack.some((v) => needle.includes(v) || v.includes(needle)))
      })
    }
    setResults(rows)
    setUnmatched(parsed.length - rows.length)
    setScanning(false)
  }

  const reset = () => {
    setInput('')
    setResults([])
    setScanned([])
    setUnmatched(0)
    setError('')
  }

  return (
    <>
      <Seo
        title="Comedogenic Scanner - vimz Tools"
        description="Paste a cosmetics ingredient list to flag pore-clogging ingredients by comedogenic rating."
      />
      <ToolShell
        title="Comedogenic Scanner"
        description="Paste a full ingredient list from a product label and flag the pore-clogging culprits by comedogenic rating."
        icon={<ScanSearch className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Paste an ingredient list, then scan for pore-clogging ratings"
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
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Ingredient list</h3>
              <TextArea
                rows={6}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={'e.g. Coconut oil, dimethicone, shea butter\nIsopropyl myristate, hyaluronic acid'}
                className="h-auto"
              />
              {error && <p className="mt-2 text-xs font-semibold text-rose-600">{error}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button onClick={scan} disabled={scanning}>
                  <Search className="h-4 w-4" /> {scanning ? 'Scanning…' : 'Scan ingredients'}
                </Button>
                <Button variant="secondary" onClick={reset} disabled={scanning}>
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
                <span className="text-xs text-slate-400">
                  {input.split(/[\n,]+/).filter((s) => s.trim()).length} items pasted
                </span>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
                <AlertTriangle className="mx-auto mb-1.5 h-5 w-5 text-rose-600" />
                <p className="text-xs font-semibold uppercase text-rose-500">High risk</p>
                <p className="text-2xl font-extrabold text-rose-700">{highRisk}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-1.5 h-5 w-5 text-emerald-600" />
                <p className="text-xs font-semibold uppercase text-emerald-500">Matched</p>
                <p className="text-2xl font-extrabold text-emerald-700">{results.length}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <Search className="mx-auto mb-1.5 h-5 w-5 text-amber-600" />
                <p className="text-xs font-semibold uppercase text-amber-500">Not found</p>
                <p className="text-2xl font-extrabold text-amber-700">{unmatched}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <Pipette className="mx-auto mb-1.5 h-5 w-5 text-slate-500" />
                <p className="text-xs font-semibold uppercase text-slate-400">In database</p>
                <p className="text-2xl font-extrabold text-slate-800">{dbCount}</p>
              </div>
            </section>

            {unmatched > 0 && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                {unmatched} ingredient{unmatched === 1 ? '' : 's'} not found in the database.
              </p>
            )}

            {highRisk > 0 && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {highRisk} high risk ingredient{highRisk === 1 ? '' : 's'} flagged - most likely to clog pores.
              </p>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Scan results</h3>
              {scanned.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200">
                  <p className="max-w-xs text-center text-sm text-slate-400">
                    Paste an ingredient list and hit Scan to see matched ingredients with their ratings.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => {
                    const chip = RISK[r.risk_level] ?? RISK.low
                    const label = RISK_LABEL[r.risk_level] ?? 'Unknown'
                    const rating = Math.max(0, Math.min(5, Math.round(r.rating)))
                    return (
                      <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm font-extrabold text-slate-800">{r.name}</p>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`h-2.5 w-2.5 rounded-full ${i < rating ? 'bg-amber-500' : 'bg-slate-200'}`}
                              />
                            ))}
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${chip}`}>
                            {label}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{rating} / 5</span>
                        </div>
                        {r.explanation && (
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{r.explanation}</p>
                        )}
                        {r.aliases && r.aliases.length > 0 && (
                          <p className="mt-1.5 text-[11px] text-slate-400">
                            Also listed as: {r.aliases.join(', ')}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  {results.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
                      None of the scanned items matched the ingredient database.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}