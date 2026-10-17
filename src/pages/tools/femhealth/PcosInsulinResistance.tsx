import { useMemo, useState } from 'react'
import { Activity, Droplet, Gauge, Info, Zap } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, TextInput } from '../../../components/ui/Fields'
import { clamp, round } from '../../../lib/numbers'

type UnitPair = 'us' | 'si'

const PAIRS: { key: UnitPair; glucose: string; insulin: string }[] = [
  { key: 'us', glucose: 'mg/dL', insulin: 'µU/mL' },
  { key: 'si', glucose: 'mmol/L', insulin: 'pmol/L' },
]

function band(homa: number): { label: string; tone: string; note: string } {
  if (homa < 1) {
    return {
      label: 'Excellent',
      tone: 'border-emerald-200 bg-emerald-50',
      note: 'Very low IR estimate - insulin appears to act efficiently.',
    }
  }
  if (homa < 2) {
    return {
      label: 'Healthy range',
      tone: 'border-emerald-200 bg-emerald-50',
      note: 'Within the generally healthy reference band.',
    }
  }
  if (homa < 3) {
    return {
      label: 'Early insulin resistance',
      tone: 'border-amber-200 bg-amber-50',
      note: 'Borderline values often appear with early PCOS changes.',
    }
  }
  if (homa < 5) {
    return {
      label: 'Moderate insulin resistance',
      tone: 'border-orange-200 bg-orange-50',
      note: 'Elevated estimate - worth discussing with your clinician.',
    }
  }
  return {
    label: 'Significant insulin resistance',
    tone: 'border-rose-200 bg-rose-50',
    note: 'High estimate - medical review is strongly advised.',
  }
}

export default function PcosInsulinResistance() {
  const [pair, setPair] = useState<UnitPair>('us')
  const [glucose, setGlucose] = useState('')
  const [insulin, setInsulin] = useState('')

  const calc = useMemo(() => {
    const g = parseFloat(glucose)
    const i = parseFloat(insulin)
    if (!Number.isFinite(g) || !Number.isFinite(i) || g <= 0 || i <= 0) return null

    const gMg = pair === 'us' ? g : g * 18.016
    const iMic = pair === 'us' ? i : i / 6.945

    const homa = (gMg * iMic) / 405
    const quicki = 1 / (Math.log10(iMic) + Math.log10(gMg))

    return { homa, quicki }
  }, [glucose, insulin, pair])

  const activePair = PAIRS.find((p) => p.key === pair)!
  const result = calc ? band(calc.homa) : null
  const gaugeW = calc ? clamp(Math.round((calc.homa / 6) * 100), 2, 100) : 0

  return (
    <>
      <Seo
        title="PCOS Insulin Resistance Risk Checker - vimz Tools"
        description="Estimate insulin resistance risk with HOMA-IR and QUICKI indices from fasting glucose and insulin."
      />
      <ToolShell
        title="PCOS Insulin Resistance Risk Checker"
        description="Estimate insulin resistance risk using the HOMA-IR and QUICKI indices computed from your fasting lab values."
        icon={<Gauge className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Enter fasting glucose and fasting insulin to estimate insulin resistance risk"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Droplet className="h-4 w-4 text-fuchsia-600" /> Fasting lab values
            </h3>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {PAIRS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPair(p.key)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                    pair === p.key
                      ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-fuchsia-300'
                  }`}
                >
                  {p.insulin} / {p.glucose}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <Field label={`Fasting glucose (${activePair.glucose})`}>
                <TextInput
                  type="number"
                  min={0}
                  step="any"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  placeholder={pair === 'us' ? 'e.g. 92' : 'e.g. 5.1'}
                />
              </Field>
              <Field label={`Fasting insulin (${activePair.insulin})`}>
                <TextInput
                  type="number"
                  min={0}
                  step="any"
                  value={insulin}
                  onChange={(e) => setInsulin(e.target.value)}
                  placeholder={pair === 'us' ? 'e.g. 11' : 'e.g. 76'}
                />
              </Field>
            </div>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Use fasting results only. HOMA-IR = glucose x insulin ÷ 405, and QUICKI = 1 ÷ (log glucose + log insulin).
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
            {!calc ? (
              <div className="flex h-full min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">Enter both fasting values to compute HOMA-IR and QUICKI.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-5 text-center">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-fuchsia-500">HOMA-IR</p>
                    <p className="text-5xl font-black tabular-nums text-fuchsia-700">{round(calc.homa, 2)}</p>
                    <p className="mt-1 text-xs font-bold text-fuchsia-600">{result?.label}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">QUICKI</p>
                    <p className="text-4xl font-black tabular-nums text-slate-800">{round(calc.quicki, 3)}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">insulin sensitivity index</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <Activity className="h-4 w-4" /> Risk level
                  </p>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-3 rounded-full ${
                        calc.homa >= 5
                          ? 'bg-rose-500'
                          : calc.homa >= 3
                            ? 'bg-orange-500'
                            : calc.homa >= 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                      }`}
                      style={{ width: `${gaugeW}%` }}
                    />
                  </div>
                </div>

                {result && (
                  <div className={`rounded-xl border p-4 ${result.tone}`}>
                    <p className="text-sm font-extrabold text-slate-800">
                      {result.label} - HOMA-IR {round(calc.homa, 2)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.note}</p>
                  </div>
                )}

                <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-600" />
                  <p className="text-xs leading-relaxed text-slate-600">
                    In PCOS, insulin resistance is present in roughly half to two-thirds of people with the syndrome. Many
                    clinics use a HOMA-IR around 1.8-2.0 as a flag when symptoms overlap.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-4">
              {[
                { min: 0, max: '1.0', label: 'Excellent' },
                { min: 1, max: '1.9', label: 'Healthy' },
                { min: 2, max: '2.9', label: 'Early IR' },
                { min: 3, max: '5+', label: 'Elevated' },
              ].map((r) => (
                <div key={r.label} className="rounded-lg border border-slate-200 px-3 py-2 text-center">
                  <p className="text-[11px] font-bold text-slate-600">
                    {r.min}-{r.max}
                  </p>
                  <p className="text-[11px] text-slate-400">{r.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              Educational estimate only - it cannot replace an oral glucose tolerance test or a clinician diagnosis.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}