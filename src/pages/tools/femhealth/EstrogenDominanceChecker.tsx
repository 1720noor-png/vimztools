import { useMemo, useState } from 'react'
import { Activity, Info, ListChecks, ShieldAlert } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { clamp } from '../../../lib/numbers'

const ITEMS = [
  { label: 'Irregular or skipped periods', weight: 2 },
  { label: 'Heavy or prolonged menstrual bleeding', weight: 2 },
  { label: 'Premenstrual syndrome that disrupts daily life', weight: 2 },
  { label: 'Breast tenderness or swelling before periods', weight: 1 },
  { label: 'Fibroids, ovarian cysts or endometriosis diagnosis', weight: 2 },
  { label: 'Cyclic headaches or migraines', weight: 1 },
  { label: 'Bloating and water retention around periods', weight: 1 },
  { label: 'Fatigue or low mood in the lead-up to bleeding', weight: 1 },
  { label: 'Weight gain around the hips and thighs', weight: 1 },
  { label: 'Low sex drive or vaginal dryness', weight: 1 },
]

function band(total: number): { label: string; tone: string; note: string } {
  if (total <= 2) {
    return {
      label: 'Low suspicion',
      tone: 'border-emerald-200 bg-emerald-50',
      note: 'Few classic symptoms - hormone imbalance is less likely to be the main theme.',
    }
  }
  if (total <= 6) {
    return {
      label: 'Moderate suspicion',
      tone: 'border-amber-200 bg-amber-50',
      note: 'Several overlapping symptoms - worth describing to your clinician clearly.',
    }
  }
  return {
    label: 'High suspicion',
    tone: 'border-rose-200 bg-rose-50',
    note: 'Strong overlap with estrogen dominance patterns - a medical hormone review is useful.',
  }
}

export default function EstrogenDominanceChecker() {
  const [checked, setChecked] = useState<boolean[]>(ITEMS.map(() => false))

  const total = useMemo(
    () => ITEMS.reduce((sum, item, i) => sum + (checked[i] ? item.weight : 0), 0),
    [checked],
  )

  const result = useMemo(() => band(total), [total])

  const flagged = useMemo(() => ITEMS.filter((_, i) => checked[i]).map((it) => it.label), [checked])

  const gaugeW = clamp(Math.round((total / 14) * 100), 2, 100)

  return (
    <>
      <Seo
        title="Estrogen Dominance Risk Checker - vimz Tools"
        description="Assess typical estrogen dominance symptoms like heavy bleeding, PMS and fibroids with a weighted risk score."
      />
      <ToolShell
        title="Estrogen Dominance Risk Checker"
        description="Rate ten common signs that can point to higher estrogen relative to progesterone and get a weighted risk score."
        icon={<ShieldAlert className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Toggle the symptoms that apply to you for a weighted risk estimate"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <ListChecks className="h-4 w-4 text-fuchsia-600" /> Symptom checklist
            </h3>
            <ul className="space-y-2">
              {ITEMS.map((item, i) => (
                <li key={item.label}>
                  <button
                    onClick={() => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      checked[i]
                        ? 'border-fuchsia-400 bg-fuchsia-50'
                        : 'border-slate-200 bg-white hover:border-fuchsia-200'
                    }`}
                  >
                    <span className={`font-bold ${checked[i] ? 'text-fuchsia-800' : 'text-slate-700'}`}>
                      {item.label}
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[11px] font-black ${
                        checked[i]
                          ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                          : 'border-slate-300 bg-white text-slate-300'
                      }`}
                    >
                      {checked[i] ? '✓' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Weighted risk score</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-6xl font-black tabular-nums text-slate-900">{total}</span>
                <span className="pb-1.5 text-sm font-bold text-slate-400">/ 14</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${total >= 7 ? 'bg-rose-500' : total >= 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${gaugeW}%` }}
                />
              </div>
              <div className={`mt-4 rounded-xl border p-4 ${result.tone}`}>
                <p className="text-sm font-extrabold text-slate-800">{result.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.note}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Activity className="h-4 w-4" /> What you flagged
              </p>
              {flagged.length === 0 ? (
                <p className="text-xs text-slate-400">Nothing selected yet.</p>
              ) : (
                <ul className="space-y-1 text-xs text-slate-600">
                  {flagged.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lifestyle support</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>Fibre-rich meals help the liver clear circulating estrogen.</li>
                <li>Daily movement and seven to eight hours of sleep aid hormone balance.</li>
                <li>Limit alcohol - it slows estrogen metabolism.</li>
                <li>Track two to three cycles before a clinical conversation.</li>
              </ul>
            </div>

            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
              <Info className="mr-1 inline h-3.5 w-3.5" />
              Educational screening - not a blood test or a diagnosis. Hormone levels need a clinician to interpret.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}