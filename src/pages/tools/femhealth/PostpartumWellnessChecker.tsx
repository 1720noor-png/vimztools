import { useMemo, useState } from 'react'
import { AlertTriangle, HeartHandshake, Info, MoonStar, Users } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Select } from '../../../components/ui/Fields'
import { clamp } from '../../../lib/numbers'

const QUESTIONS = [
  'I have lost interest in things I used to enjoy',
  'I find it hard to laugh or see the funny side',
  'I blame myself unnecessarily when things go wrong',
  'I feel anxious or worried for no clear reason',
  'I feel scared or panicky for no clear reason',
  'Things feel on top of me',
  'I am so unhappy that sleep is difficult',
  'I feel sad or miserable',
  'I have been crying or tearful',
]

const FREQ = [
  { label: 'Rarely', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often', value: 2 },
  { label: 'Almost always', value: 3 },
]

const SLEEPS = [
  { label: 'Less than 5 hours', value: 1 },
  { label: '5-6 hours', value: 2 },
  { label: '6-7 hours', value: 3 },
  { label: '8 or more hours', value: 4 },
]

const SUPPORT = [
  { label: 'Strong support network', value: 3 },
  { label: 'Some support', value: 2 },
  { label: 'Very limited support', value: 1 },
  { label: 'No one to lean on', value: 0 },
]

function band(total: number): { label: string; tone: string; note: string } {
  if (total <= 8) {
    return {
      label: 'Low signals',
      tone: 'border-emerald-200 bg-emerald-50',
      note: 'Your answers are in a gentle range - keep rest and connection high.',
    }
  }
  if (total <= 12) {
    return {
      label: 'Worth checking in',
      tone: 'border-amber-200 bg-amber-50',
      note: 'Some signals are showing - a conversation with a trusted person helps.',
    }
  }
  if (total <= 19) {
    return {
      label: 'Reach for support',
      tone: 'border-orange-200 bg-orange-50',
      note: 'Several elevated signals - contact your clinician or maternal health team soon.',
    }
  }
  return {
    label: 'Urgent review needed',
    tone: 'border-rose-200 bg-rose-50',
    note: 'Strong signals - please speak to a professional as soon as possible.',
  }
}

export default function PostpartumWellnessChecker() {
  const [answers, setAnswers] = useState<number[]>(QUESTIONS.map(() => 0))
  const [sleep, setSleep] = useState(2)
  const [support, setSupport] = useState(2)

  const total = useMemo(() => answers.reduce((a, b) => a + b, 0), [answers])

  const result = useMemo(() => band(total), [total])

  const supportWord = SUPPORT.find((s) => s.value === support)!.label
  const sleepWord = SLEEPS.find((s) => s.value === sleep)!.label

  const gaugeW = clamp(Math.round((total / 27) * 100), 2, 100)

  return (
    <>
      <Seo
        title="Postpartum Wellness & Mental Health Checker - vimz Tools"
        description="A quick self-check on postpartum mood, sleep and energy with supportive next steps."
      />
      <ToolShell
        title="Postpartum Wellness & Mental Health Checker"
        description="Work through nine mood and well-being questions to get a gentle picture of where you are and supportive next steps."
        icon={<HeartHandshake className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Answer how you have felt over the last several days"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <MoonStar className="h-4 w-4 text-fuchsia-600" /> How long have you felt this way
            </h3>
            <ul className="space-y-2.5">
              {QUESTIONS.map((q, qi) => (
                <li key={q} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-bold text-slate-800">
                    {qi + 1}. {q}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FREQ.map((f) => (
                      <button
                        key={f.label}
                        onClick={() => setAnswers((prev) => prev.map((v, i) => (i === qi ? f.value : v)))}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition ${
                          answers[qi] === f.value
                            ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-fuchsia-300'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Well-being check</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-6xl font-black tabular-nums text-slate-900">{total}</span>
                <span className="pb-1.5 text-sm font-bold text-slate-400">/ 27</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${total >= 20 ? 'bg-rose-500' : total >= 13 ? 'bg-orange-500' : total >= 9 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${gaugeW}%` }}
                />
              </div>
              <div className={`mt-4 rounded-xl border p-4 ${result.tone}`}>
                <p className="text-sm font-extrabold text-slate-800">{result.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.note}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <MoonStar className="h-3.5 w-3.5" /> Sleep
                </p>
                <Select value={sleep} onChange={(e) => setSleep(Number(e.target.value))}>
                  {SLEEPS.map((s) => (
                    <option key={s.label} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <p className="mt-2 text-[11px] text-slate-400">{sleepWord} - context only</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  <Users className="h-3.5 w-3.5" /> Support
                </p>
                <Select value={support} onChange={(e) => setSupport(Number(e.target.value))}>
                  {SUPPORT.map((s) => (
                    <option key={s.label} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <p className="mt-2 text-[11px] text-slate-400">{supportWord} - context only</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Supportive steps</p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>Say the words out loud to a trusted person or your doctor.</li>
                <li>Let someone hold the baby so you can rest in another room.</li>
                <li>A walk outside with daylight helps regulate mood.</li>
                <li>Local maternal mental health teams can help within days.</li>
              </ul>
            </div>

            {total >= 13 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                <p className="text-xs leading-relaxed text-rose-900">
                  Your answers suggest it would help to reach out soon. A clinician can guide you far better than this
                  check alone.
                </p>
              </div>
            )}

            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
              <Info className="mr-1 inline h-3.5 w-3.5" />
              A screening-style conversation starter, not a diagnosis. Urgent thoughts of harm need emergency help - do not
              wait.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}