import { useMemo, useState } from 'react'
import { AlertTriangle, Droplets, Gauge, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { clamp } from '../../../lib/numbers'

type Option = { value: string; label: string; points: number }
type Question = { id: string; label: string; options: Option[] }

const QUESTIONS: Question[] = [
  {
    id: 'environment',
    label: 'Your environment',
    options: [
      { value: 'humid', label: 'Humid climate', points: 18 },
      { value: 'neutral', label: 'Neutral climate', points: 22 },
      { value: 'dry', label: 'Dry climate', points: 14 },
      { value: 'harsh', label: 'Harsh re-circulated air', points: 8 },
    ],
  },
  {
    id: 'skinType',
    label: 'Skin type',
    options: [
      { value: 'normal', label: 'Normal', points: 24 },
      { value: 'oily', label: 'Oily', points: 20 },
      { value: 'dry', label: 'Dry', points: 16 },
      { value: 'sensitive', label: 'Sensitive', points: 14 },
    ],
  },
  {
    id: 'cleanser',
    label: 'Cleanser',
    options: [
      { value: 'gentle', label: 'Gentle non-foaming', points: 18 },
      { value: 'mild', label: 'Mild foaming', points: 14 },
      { value: 'stripping', label: 'Strong stripping', points: 6 },
    ],
  },
  {
    id: 'actives',
    label: 'Actives use',
    options: [
      { value: 'none', label: 'None', points: 16 },
      { value: 'gentle', label: 'Gentle strength', points: 14 },
      { value: 'strong', label: 'Strong daily', points: 8 },
      { value: 'heavy', label: 'Heavy layering', points: 5 },
    ],
  },
  {
    id: 'moisturizer',
    label: 'Moisturizer',
    options: [
      { value: 'always', label: 'Always', points: 14 },
      { value: 'sometimes', label: 'Sometimes', points: 8 },
      { value: 'never', label: 'Never', points: 3 },
    ],
  },
  {
    id: 'symptoms',
    label: 'Recent symptoms',
    options: [
      { value: 'none', label: 'None', points: 10 },
      { value: 'flaking', label: 'Flaking', points: 4 },
      { value: 'tightness', label: 'Tightness', points: 3 },
      { value: 'burning', label: 'Burning', points: 2 },
    ],
  },
]

type VerdictKey = 'healthy' | 'balancing' | 'compromised'

const VERDICTS: Record<
  VerdictKey,
  { title: string; note: string; chip: string; bar: string; tips: string[] }
> = {
  healthy: {
    title: 'Healthy barrier',
    note: 'Your moisture barrier looks strong - keep it that way.',
    chip: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
    tips: [
      'Keep cleansing gentle and non-stripping.',
      'Apply moisturizer while skin is still damp.',
      'Wear SPF every morning to protect the barrier.',
    ],
  },
  balancing: {
    title: 'Balancing',
    note: 'A few habits are pulling on your barrier - tighten them up.',
    chip: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
    tips: [
      'Add a hydrating essence or serum before moisturizer.',
      'Cut strong foaming cleansers on tight days.',
      'Seal moisture with a light facial oil at night.',
    ],
  },
  compromised: {
    title: 'Compromised - repair first',
    note: 'The barrier is stressed. Ease off and repair before adding anything.',
    chip: 'bg-rose-100 text-rose-700',
    bar: 'bg-rose-500',
    tips: [
      'Pause active acids and retinoids for 1-2 weeks.',
      'Cleanse once daily with lukewarm water and a gentle wash.',
      'Choose ceramide-rich moisturizers and skip alcohol toners.',
    ],
  },
}

function initialAnswers(): Record<string, string> {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, q.options[0].value]))
}

export default function HydrationBarrierScore() {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)

  const score = useMemo(
    () =>
      clamp(
        QUESTIONS.reduce(
          (acc, q) => acc + (q.options.find((o) => o.value === answers[q.id])?.points ?? 0),
          0,
        ),
        0,
        100,
      ),
    [answers],
  )

  const verdict: VerdictKey = score >= 75 ? 'healthy' : score >= 50 ? 'balancing' : 'compromised'
  const meta = VERDICTS[verdict]

  const pick = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <>
      <Seo
        title="Hydration Barrier Score - vimz Tools"
        description="Score the health of your skin moisture barrier from a short habit questionnaire."
      />
      <ToolShell
        title="Hydration Barrier Score"
        description="Answer a short questionnaire to score the health of your skin moisture barrier and get tailored repair tips."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Answer the six questions to get a 0-100 barrier score"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-bold text-slate-800">The questionnaire</h3>
            <div className="space-y-3">
              {QUESTIONS.map((q, qi) => (
                <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-extrabold text-sky-700">
                      {qi + 1}
                    </span>
                    {q.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => {
                      const on = answers[q.id] === o.value
                      return (
                        <button
                          key={o.value}
                          onClick={() => pick(q.id, o.value)}
                          className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                            on
                              ? 'border-sky-500 bg-sky-600 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {o.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Gauge className="h-4 w-4" /> Barrier score
              </p>
              <p className="text-6xl font-black tabular-nums text-slate-800">{score}</p>
              <p className="text-xs font-semibold text-slate-400">out of 100</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-3 rounded-full ${meta.bar}`} style={{ width: `${score}%` }} />
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${meta.chip}`}>
                  {meta.title}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{meta.note}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Sparkles className="h-4 w-4" /> Tailored tips
              </p>
              <ul className="space-y-2.5">
                {meta.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                    <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                {verdict === 'healthy' && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
                {verdict === 'balancing' && <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />}
                {verdict === 'compromised' && <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />}
                <p className="text-xs font-semibold text-slate-600">
                  Retake after two weeks of consistent habits to track progress.
                </p>
              </div>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}