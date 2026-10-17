import { useMemo, useState } from 'react'
import { Activity, Info, Ruler, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'

const AREAS = [
  { id: 'upperLip', name: 'Upper lip', hint: 'coarse hair along the lip line' },
  { id: 'chin', name: 'Chin', hint: 'sparse to dense growth on the chin' },
  { id: 'chest', name: 'Chest', hint: 'hair on the chest or around the breasts' },
  { id: 'upperBack', name: 'Upper back', hint: 'shoulders down to the mid back' },
  { id: 'lowerBack', name: 'Lower back', hint: 'lumbar and sacral area' },
  { id: 'upperAbdomen', name: 'Upper abdomen', hint: 'above the navel line' },
  { id: 'lowerAbdomen', name: 'Lower abdomen', hint: 'below the navel, mon pubis area' },
  { id: 'upperArm', name: 'Upper arm', hint: 'shoulder to elbow surface' },
  { id: 'thigh', name: 'Thigh', hint: 'front and inner thigh' },
]

const SCORE_LABELS = ['None', 'A few', 'Some', 'Scattered', 'Extensive']

function classify(total: number): { label: string; tone: string; note: string } {
  if (total < 8) {
    return {
      label: 'No hirsutism',
      tone: 'border-emerald-200 bg-emerald-50',
      note: 'Scores below 8 fall within the typical range for most women.',
    }
  }
  if (total <= 15) {
    return {
      label: 'Mild hirsutism',
      tone: 'border-amber-200 bg-amber-50',
      note: 'Clinical cutoffs often flag a score of 8 or more as hirsutism.',
    }
  }
  if (total <= 25) {
    return {
      label: 'Moderate hirsutism',
      tone: 'border-orange-200 bg-orange-50',
      note: 'Moderate scores commonly appear in PCOS-linked excess androgen states.',
    }
  }
  return {
    label: 'Severe hirsutism',
    tone: 'border-rose-200 bg-rose-50',
    note: 'Severe scores strongly suggest androgen-related causes worth a medical review.',
  }
}

const INITIAL = AREAS.reduce<Record<string, number>>((acc, a) => {
  acc[a.id] = 0
  return acc
}, {})

export default function FerrimanGallweyScore() {
  const [scores, setScores] = useState<Record<string, number>>(INITIAL)

  const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores])

  const result = useMemo(() => classify(total), [total])

  const covered = useMemo(() => AREAS.filter((a) => scores[a.id] >= 2).length, [scores])

  const topArea = useMemo(() => {
    const best = [...AREAS].sort((a, b) => scores[b.id] - scores[a.id])[0]
    return scores[best.id] > 0 ? `${best.name} (${scores[best.id]})` : '—'
  }, [scores])

  const gaugeW = Math.min(100, Math.round((total / 34) * 100))

  return (
    <>
      <Seo
        title="Ferriman-Gallwey Hirsutism Score Calculator - vimz Tools"
        description="Score hair growth across nine body areas to estimate hirsutism severity and PCOS-linked hair pattern."
      />
      <ToolShell
        title="Ferriman-Gallwey Hirsutism Score Calculator"
        description="Rate hair growth in nine body regions (0-4 each) to compute a Ferriman-Gallwey total that estimates hirsutism severity."
        icon={<Ruler className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Score each of the nine areas based on visible hair growth"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Activity className="h-4 w-4 text-fuchsia-600" /> Nine body areas
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Rate each area from 0 (no terminal hair) to 4 (dense, extensive growth). Base the rating on coarse terminal
              hair rather than fine vellus fuzz.
            </p>
            <ul className="space-y-2.5">
              {AREAS.map((area, i) => (
                <li
                  key={area.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${
                    scores[area.id] >= 2 ? 'border-fuchsia-300 bg-fuchsia-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="min-w-36">
                    <p className="text-sm font-bold text-slate-800">{i + 1}. {area.name}</p>
                    <p className="text-[11px] text-slate-400">{area.hint}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {SCORE_LABELS.map((label, v) => (
                      <button
                        key={label}
                        onClick={() => setScores((prev) => ({ ...prev, [area.id]: v }))}
                        className={`flex h-11 w-11 flex-col items-center justify-center rounded-lg border text-xs font-bold transition ${
                          scores[area.id] === v
                            ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-fuchsia-300'
                        }`}
                        aria-label={`${area.name}: ${label}`}
                      >
                        <span>{v}</span>
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Ferriman-Gallwey total</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-6xl font-black tabular-nums text-slate-900">{total}</span>
                <span className="pb-1.5 text-sm font-bold text-slate-400">/ 36</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full transition-all ${total >= 16 ? 'bg-rose-500' : total >= 8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${gaugeW}%` }}
                />
              </div>
              <div className={`mt-4 rounded-xl border p-4 ${result.tone}`}>
                <p className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <Sparkles className="h-4 w-4" /> {result.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.note}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-fuchsia-500">Areas scored 2+</p>
                <p className="mt-1 text-2xl font-extrabold text-fuchsia-700">{covered}/9</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-slate-400">Densest area</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">{topArea}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Info className="h-4 w-4" /> PCOS context
              </p>
              <p className="text-xs leading-relaxed text-slate-500">
                Excess hair in a male-pattern distribution is one of the most common PCOS phenotypes. A score of 8 or
                more, plus irregular periods, can support a PCOS discussion with your clinician.
              </p>
            </div>

            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
              This is an educational self-assessment, not a diagnosis. Hormonal causes and treatment options should be
              reviewed with a doctor or dermatologist.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}