import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, Info, PersonStanding, ShieldCheck } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Select } from '../../../components/ui/Fields'

type Tier = 'safe' | 'modify' | 'avoid'

interface Exercise {
  name: string
  tier: Tier
  note: string
}

const EXERCISES: Exercise[] = [
  { name: 'Deep core breathing', tier: 'safe', note: 'Diaphragmatic breathing is the doorway to everything else.' },
  { name: 'Pelvic floor contractions', tier: 'safe', note: 'Short holds with a full breath between each.' },
  { name: 'Bird dog', tier: 'safe', note: 'Start with the short lever and grow only as the core stays still.' },
  { name: 'Leg slides', tier: 'safe', note: 'Slow heel slides with no torso lift.' },
  { name: 'Side-lying clam', tier: 'safe', note: 'Hip work that leaves the midline alone.' },
  { name: 'Dead bug', tier: 'modify', note: 'Ease limbs out only as far as the core keeps you steady.' },
  { name: 'Side plank (knee down)', tier: 'modify', note: 'Use the knee-down variation until the gap narrows.' },
  { name: 'Heavy lifting unaided', tier: 'modify', note: 'Brace and breathe first, and scale the load early.' },
  { name: 'Full plank', tier: 'avoid', note: 'Diagonal loading can push the separation apart.' },
  { name: 'Russian twists', tier: 'avoid', note: 'Rotational loading stresses the midline.' },
  { name: 'Crunches and sit-ups', tier: 'avoid', note: 'Direct flexion presses hardest on the line of separation.' },
  { name: 'Hanging leg raises', tier: 'avoid', note: 'Very high intra-abdominal pressure at the midline.' },
]

const WIDTHS = [
  { value: 1, label: 'Less than 2 finger widths' },
  { value: 2, label: 'About 2 finger widths' },
  { value: 3, label: '3 or more finger widths' },
]

const STAGES = [
  { value: 0, label: '0-6 weeks postpartum' },
  { value: 1, label: '6-12 weeks postpartum' },
  { value: 2, label: '3-6 months postpartum' },
  { value: 3, label: '6+ months postpartum' },
]

const TIER_META: Record<Tier, { label: string; badge: string; Icon: typeof AlertTriangle }> = {
  safe: { label: 'Safe', badge: 'bg-emerald-100 text-emerald-700', Icon: ShieldCheck },
  modify: { label: 'Modify', badge: 'bg-amber-100 text-amber-700', Icon: Activity },
  avoid: { label: 'Avoid', badge: 'bg-rose-100 text-rose-700', Icon: AlertTriangle },
}

export default function DiastasisRectiSafety() {
  const [width, setWidth] = useState(1)
  const [stage, setStage] = useState(1)
  const [bulge, setBulge] = useState(false)
  const [diagnosed, setDiagnosed] = useState(false)

  const results = useMemo(
    () =>
      EXERCISES.map((ex) => {
        let tier: Tier = ex.tier
        if (ex.tier === 'modify' && (width >= 2 || bulge)) tier = 'avoid'
        if (ex.tier === 'modify' && stage < 1 && width >= 1) tier = 'avoid'
        if (ex.tier === 'avoid' && !diagnosed && width <= 1 && !bulge && stage >= 2) tier = 'modify'
        return { ...ex, tier }
      }),
    [width, stage, bulge, diagnosed],
  )

  const counts = useMemo(
    () => ({
      safe: results.filter((r) => r.tier === 'safe').length,
      modify: results.filter((r) => r.tier === 'modify').length,
      avoid: results.filter((r) => r.tier === 'avoid').length,
    }),
    [results],
  )

  return (
    <>
      <Seo
        title="Diastasis Recti Core Safety Advisor - vimz Tools"
        description="Check which core exercises are safe, modified or avoidable after diastasis recti."
      />
      <ToolShell
        title="Diastasis Recti Core Safety Advisor"
        description="Screen common core and abdominal movements against your current recovery stage to see which ones to keep, scale or skip."
        icon={<PersonStanding className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Set your gap width and recovery stage to rate twelve core movements"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Activity className="h-4 w-4 text-fuchsia-600" /> Your recovery context
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">Gap width (finger estimate)</p>
                  <Select value={width} onChange={(e) => setWidth(Number(e.target.value))}>
                    {WIDTHS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-slate-700">Recovery stage</p>
                  <Select value={stage} onChange={(e) => setStage(Number(e.target.value))}>
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">Bulging or doming on sit-ups</span>
                  <button
                    onClick={() => setBulge((v) => !v)}
                    className={`relative h-6 w-11 rounded-full transition ${bulge ? 'bg-fuchsia-600' : 'bg-slate-300'}`}
                    aria-label="Toggle bulge symptom"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${bulge ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </button>
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">Formally diagnosed</span>
                  <button
                    onClick={() => setDiagnosed((v) => !v)}
                    className={`relative h-6 w-11 rounded-full transition ${diagnosed ? 'bg-fuchsia-600' : 'bg-slate-300'}`}
                    aria-label="Toggle diagnosis"
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${diagnosed ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-xl font-black text-emerald-700">{counts.safe}</p>
                <p className="text-[10px] font-bold uppercase text-emerald-600">Safe</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xl font-black text-amber-700">{counts.modify}</p>
                <p className="text-[10px] font-bold uppercase text-amber-600">Modify</p>
              </div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-xl font-black text-rose-700">{counts.avoid}</p>
                <p className="text-[10px] font-bold uppercase text-rose-600">Avoid</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Golden rules</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>Never feel a dome or bulge - stop and shorten the exercise.</li>
                <li>Breathe out on effort, not hold your breath.</li>
                <li>Progress slowly; the gap usually closes over months, not weeks.</li>
                <li>Every recovery is individual, so a physio check-in is ideal.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Core movement ratings</h3>
            <ul className="space-y-2.5">
              {results.map((ex) => {
                const meta = TIER_META[ex.tier]
                return (
                  <li
                    key={ex.name}
                    className={`rounded-xl border p-4 ${
                      ex.tier === 'safe'
                        ? 'border-emerald-200 bg-emerald-50'
                        : ex.tier === 'modify'
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-rose-200 bg-rose-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">{ex.name}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{ex.note}</p>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badge}`}>
                        <meta.Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              This is general movement guidance, not medical or physiotherapy advice. Get an individual assessment for
              your exact situation.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}