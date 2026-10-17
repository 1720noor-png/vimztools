import { useMemo, useState } from 'react'
import { Clock3, Info, Pill, ShieldCheck, Sun, UtensilsCrossed } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Select } from '../../../components/ui/Fields'

type Goal = 'all' | 'ovulation' | 'sugar' | 'inflammation' | 'mood' | 'hair'

interface Supplement {
  name: string
  forms: string
  dose: string
  timing: string
  with_food: boolean
  note: string
  caution: string
  goals: Goal[]
}

const SUPPLEMENTS: Supplement[] = [
  {
    name: 'Myo-inositol (with D-chiro)',
    forms: 'powder or capsules',
    dose: '2000-4000 mg myo-inositol daily',
    timing: 'Split into two doses, morning and evening',
    with_food: true,
    note: 'The best-studied supplement for ovulation support and insulin signaling in PCOS.',
    caution: 'Gentle for most; less common for mild stomach upset. Continue only if it suits you.',
    goals: ['ovulation', 'sugar'],
  },
  {
    name: 'Vitamin D3',
    forms: 'softgels with fat',
    dose: '1000-2000 IU daily (or per your blood level)',
    timing: 'Morning, with a meal containing fat',
    with_food: true,
    note: 'Deficiency is common in PCOS and links to worse metabolic readings.',
    caution: 'High doses need a blood test first - vitamin D is fat-soluble and can accumulate.',
    goals: ['ovulation', 'mood', 'inflammation'],
  },
  {
    name: 'Omega-3 (EPA/DHA)',
    forms: 'fish oil or algal oil',
    dose: '1000-2000 mg EPA+DHA daily',
    timing: 'With the day meals, ideally across two servings',
    with_food: true,
    note: 'Anti-inflammatory support for lipids and hormone-related inflammation.',
    caution: 'Blood-thinning effect; pause before surgery and if using anticoagulants.',
    goals: ['inflammation', 'mood'],
  },
  {
    name: 'Berberine',
    forms: 'capsules',
    dose: '500 mg two to three times per day',
    timing: 'Just before meals',
    with_food: true,
    note: 'Plant compound with meaningful glucose-lowering research behind it.',
    caution: 'Talk to your clinician first - especially with metformin or other glucose drugs.',
    goals: ['sugar'],
  },
  {
    name: 'N-Acetylcysteine (NAC)',
    forms: 'capsules',
    dose: '600-1200 mg daily',
    timing: 'With food, once daily',
    with_food: true,
    note: 'Antioxidant studied for cycle regularity and metabolic markers.',
    caution: 'Start low; occasional nausea is the main reported side effect.',
    goals: ['sugar', 'ovulation'],
  },
  {
    name: 'Magnesium (glycinate or citrate)',
    forms: 'tablets or powder',
    dose: '200-400 mg elemental daily',
    timing: 'Evening, with food',
    with_food: true,
    note: 'Supports sleep, stress and menstrual cramp comfort.',
    caution: 'Large doses loosen stools - dial back if that happens.',
    goals: ['mood'],
  },
  {
    name: 'Chromium',
    forms: 'capsules',
    dose: '200-1000 µg daily',
    timing: 'With your main meal',
    with_food: true,
    note: 'Often combined with lifestyle changes for glucose handling.',
    caution: 'Modest effect size; unlikely to be a standalone fix.',
    goals: ['sugar'],
  },
  {
    name: 'Zinc',
    forms: 'lozenges or capsules',
    dose: '15-30 mg daily',
    timing: 'With food, not with calcium or iron doses',
    with_food: true,
    note: 'Commonly low in PCOS and relevant to hair and immune health.',
    caution: 'Long-term high doses can deplete copper - use short cycles with guidance.',
    goals: ['hair'],
  },
  {
    name: 'Vitamin B12',
    forms: 'sublingual or tablets',
    dose: '500-1000 µg daily if low',
    timing: 'Morning, can be taken any time',
    with_food: false,
    note: 'Relevant if you take metformin or follow a low-animal diet.',
    caution: 'Best to confirm a deficiency before long-term high doses.',
    goals: ['mood'],
  },
  {
    name: 'CoQ10',
    forms: 'softgels with fat',
    dose: '100-200 mg daily',
    timing: 'With a meal containing fat',
    with_food: true,
    note: 'Powers the energy system of eggs and supports metabolic health.',
    caution: 'Mild effects on blood pressure; mention it with any heart medication.',
    goals: ['ovulation', 'mood'],
  },
  {
    name: 'Vitamin B6',
    forms: 'tablets',
    dose: '25-100 mg, short-term only',
    timing: 'With food',
    with_food: true,
    note: 'Studied for PMS mood changes - useful pre-menstrually.',
    caution: 'Stop high doses after a few months; nerve tingling means reassess.',
    goals: ['mood'],
  },
]

const GOALS: { key: Goal; label: string }[] = [
  { key: 'all', label: 'All goals' },
  { key: 'ovulation', label: 'Ovulation support' },
  { key: 'sugar', label: 'Blood sugar' },
  { key: 'inflammation', label: 'Inflammation' },
  { key: 'mood', label: 'Mood & energy' },
  { key: 'hair', label: 'Hair & skin' },
]

export default function PcosSupplementAdvisor() {
  const [goal, setGoal] = useState<Goal>('all')
  const [buildingId, setBuildingId] = useState(0)

  const list = useMemo(
    () =>
      SUPPLEMENTS.map((s, i) => ({ s, i })).filter(({ s }) => goal === 'all' || s.goals.includes(goal)),
    [goal],
  )

  const current = list.find(({ i }) => i === buildingId) ?? list[0]
  const selected = current?.s

  return (
    <>
      <Seo
        title="PCOS Supplement Dosage & Timing Advisor - vimz Tools"
        description="Look up PCOS-friendly supplement doses and the best time of day to take each one."
      />
      <ToolShell
        title="PCOS Supplement Dosage & Timing Advisor"
        description="Find research-backed supplement options for PCOS and check how to dose and time them safely."
        icon={<Pill className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Pick a goal and a supplement to see dosing and timing guidance"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Pill className="h-4 w-4 text-fuchsia-600" /> Choose a supplement
            </h3>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => {
                    setGoal(g.key)
                    setBuildingId(0)
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    goal === g.key
                      ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-fuchsia-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <Select value={buildingId} onChange={(e) => setBuildingId(Number(e.target.value))}>
              {list.map(({ s, i }) => (
                <option key={i} value={i}>
                  {s.name}
                </option>
              ))}
            </Select>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              One supplement at a time is easiest to evaluate. Add them slowly and note any GI or mood changes.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
            {selected && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
                    <Pill className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{selected.name}</h3>
                    <p className="text-xs font-semibold text-slate-400">{selected.forms}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-4">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-fuchsia-500">
                      <Sun className="h-3.5 w-3.5" /> Typical dose
                    </p>
                    <p className="text-sm font-extrabold text-fuchsia-800">{selected.dose}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" /> Timing
                    </p>
                    <p className="text-sm font-bold text-slate-700">{selected.timing}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <UtensilsCrossed className="h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-800">
                    {selected.with_food
                      ? 'Take with food to reduce stomach upset and improve absorption.'
                      : 'Can be taken on its own at any time of the day.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Why it is used</p>
                  <p className="text-sm leading-relaxed text-slate-600">{selected.note}</p>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-xs leading-relaxed text-amber-900">
                    <span className="font-bold">Caution: </span>
                    {selected.caution}
                  </p>
                </div>
              </div>
            )}

            <p className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              General guidance only - check everything with your pharmacist and clinician, especially prescription
              interactions.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}