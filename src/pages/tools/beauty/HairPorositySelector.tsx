import { useState } from 'react'
import {
  Droplet,
  FlaskRound,
  Gauge,
  ListOrdered,
  Waves,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button } from '../../../components/ui/Fields'

interface Question {
  label: string
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    label: '1. Wet droplet test: place a drop of water on a clean strand.',
    options: ['Beads up / stays on top', 'Slowly absorbs after ~2 min', 'Absorbs quickly'],
  },
  {
    label: '2. Underwater strand test: drop a hair into a glass of water.',
    options: ['Floats on top', 'Sinks slowly', 'Sinks quickly'],
  },
  {
    label: '3. How fast does your hair dry after a wash?',
    options: ['Long time', 'Normal pace', 'Fast'],
  },
  {
    label: '4. How quickly do products absorb into your hair?',
    options: ['Sits on top', 'Normal absorption', 'Soaks up fast'],
  },
  {
    label: '5. How does a dry strand feel between your fingers?',
    options: ['Smooth and glassy', 'Slightly rough', 'Rough, dry, tangly'],
  },
]

const HAIR_TYPES = ['2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C']

type VerdictKey = 'low' | 'medium' | 'high'

interface VerdictData {
  title: string
  blurb: string
  washFrequency: string
  productTypes: string
  routineSteps: string[]
  card: string
  titleColor: string
  badge: string
}

const VERDICTS: Record<VerdictKey, VerdictData> = {
  low: {
    title: 'Low porosity',
    blurb: 'Cuticles lie flat and tight, so water and products can sit on the surface instead of sinking in.',
    washFrequency: 'Weekly: a gentle sulfate-free shampoo, a light conditioner, and lightweight oils such as jojoba or argan instead of heavy butters.',
    productTypes: 'Lightweight oils, humectant leave-in sprays, and water-based creams. Skip heavy butters and protein-heavy formulas.',
    routineSteps: [
      'Pre-rinse with warm water for a few minutes to lift the cuticle.',
      'Condition under a shower cap so gentle heat helps it penetrate.',
      'Keep heat styling low and seal with a few drops of oil.',
    ],
    card: 'border-sky-200 bg-sky-50',
    titleColor: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-700',
  },
  medium: {
    title: 'Medium porosity',
    blurb: 'Cuticles are balanced and take in moisture steadily without major extremes.',
    washFrequency: 'Every 3-4 days with a balanced moisturizing shampoo and conditioner; deep condition once or twice a month.',
    productTypes: 'Balanced moisturizing formulas, occasional light proteins, and water-based leave-ins that do not weigh hair down.',
    routineSteps: [
      'Alternate a hydrating mask with a light protein treatment every few weeks.',
      'Clarify monthly to clear buildup before deep conditioning.',
      'Seal the ends with oil after the final rinse.',
    ],
    card: 'border-emerald-200 bg-emerald-50',
    titleColor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  high: {
    title: 'High porosity',
    blurb: 'Cuticles are lifted, so moisture escapes fast and almost anything applied sinks in quickly.',
    washFrequency: 'Every 1-2 days with frequent moisture; pair protein or ceramide treatments with rich creams to lock hydration in.',
    productTypes: 'Protein or ceramide treatments, rich creams and butters to seal, and bond builders. Trim heat use and friction.',
    routineSteps: [
      'Finish every wash with a cool rinse so cuticles lay down.',
      'Apply leave-in on damp hair, then seal with oil or cream.',
      'Deep condition weekly and detangle with a wide-tooth comb while wet.',
    ],
    card: 'border-rose-200 bg-rose-50',
    titleColor: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
  },
}

export default function HairPorositySelector() {
  const [answers, setAnswers] = useState<number[]>([1, 1, 1, 1, 1])
  const [hairType, setHairType] = useState<string | null>(null)

  const raw = answers.reduce((acc, value) => acc + value + 1, 0)
  const verdict: VerdictKey = raw <= 8 ? 'low' : raw <= 12 ? 'medium' : 'high'
  const data = VERDICTS[verdict]

  const hairNote = hairType
    ? hairType.startsWith('2')
      ? 'Wavy hair usually follows the quiz result evenly from root to ends, so keep moisture balanced along the whole length.'
      : hairType.startsWith('3')
        ? 'Curly strands often run lower porosity at the roots and higher at the ends, so focus cream and sealing on the ends.'
        : 'Coily hair leans toward high porosity and stays fragile, so keep a steady weekly deep conditioning and low-friction routine.'
    : 'Pick a curl pattern above to add a type-specific note to your result.'

  const pick = (qi: number, oi: number) =>
    setAnswers((prev) => prev.map((value, i) => (i === qi ? oi : value)))

  return (
    <>
      <Seo
        title="Hair Porosity Selector - vimz Tools"
        description="Answer a short quiz to estimate your hair porosity and get a matching wash and moisture routine."
      />
      <ToolShell
        title="Hair Porosity Selector"
        description="Answer five micro-questions to estimate whether your hair sits low, medium, or high on the porosity scale, then get a care routine that matches."
        icon={<Droplet className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Answer the five micro-questions to estimate your hair porosity."
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Gauge className="h-4 w-4 text-primary-600" /> Porosity mini-quiz
            </h3>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {QUESTIONS.map((question, qi) => (
                <div key={question.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-sm font-medium text-slate-700">{question.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option, oi) => (
                      <Button
                        key={option}
                        type="button"
                        variant="secondary"
                        onClick={() => pick(qi, oi)}
                        className={
                          answers[qi] === oi
                            ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                            : 'border-slate-200'
                        }
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Waves className="h-4 w-4 text-primary-600" /> Curl pattern
            </h3>
            <div className="flex flex-wrap gap-2">
              {HAIR_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setHairType(type)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    hairType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
              {hairNote}
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`rounded-2xl border p-5 ${data.card}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Score {raw} of 15</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className={`text-lg font-extrabold ${data.titleColor}`}>{data.title}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${data.badge}`}>
                  {verdict}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{data.blurb}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Droplet className="h-4 w-4 text-sky-600" /> Wash frequency
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{data.washFrequency}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FlaskRound className="h-4 w-4 text-violet-600" /> Product types
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{data.productTypes}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <ListOrdered className="h-4 w-4 text-primary-600" /> Moisture routine
            </h3>
            <ol className="list-decimal space-y-2 pl-5">
              {data.routineSteps.map((step, i) => (
                <li key={i} className="text-sm leading-relaxed text-slate-600">
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </ToolShell>
    </>
  )
}