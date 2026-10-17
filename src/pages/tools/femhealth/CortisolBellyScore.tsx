import { useMemo, useState } from 'react'
import { Activity, Brain, Info, Ruler } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, TextInput } from '../../../components/ui/Fields'
import { clamp, round } from '../../../lib/numbers'

const QUESTIONS = [
  'Difficulty falling or staying asleep',
  'Waking up tired even after enough sleep',
  'Afternoon energy crashes',
  'Strong cravings for salty, sweet or fatty food',
  'Persistent anxiety or racing thoughts',
  'Tightness in the jaw, neck or shoulders',
  'Weight that keeps collecting around the belly',
  'Feeling rushed, on-edge or unable to switch off',
]

const FREQ = ['Rarely', 'Sometimes', 'Often', 'Very often']

function band(total: number): { label: string; tone: string; note: string } {
  if (total <= 5) {
    return {
      label: 'Low stress load',
      tone: 'border-emerald-200 bg-emerald-50',
      note: 'Signs of chronic stress load are minimal - keep the habits that got you here.',
    }
  }
  if (total <= 11) {
    return {
      label: 'Moderate stress load',
      tone: 'border-amber-200 bg-amber-50',
      note: 'Noticeable pattern risk - small daily resets can stop it from stacking.',
    }
  }
  if (total <= 17) {
    return {
      label: 'Elevated chronic stress',
      tone: 'border-orange-200 bg-orange-50',
      note: 'Stress signals are frequent - worth actively shaping sleep and recovery.',
    }
  }
  return {
    label: 'High stress burden',
    tone: 'border-rose-200 bg-rose-50',
    note: 'A high burden pattern - consider professional support alongside lifestyle changes.',
  }
}

export default function CortisolBellyScore() {
  const [answers, setAnswers] = useState<number[]>(QUESTIONS.map(() => 0))
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')

  const total = useMemo(() => answers.reduce((a, b) => a + b, 0), [answers])

  const result = useMemo(() => band(total), [total])

  const whr = useMemo(() => {
    const w = parseFloat(waist)
    const h = parseFloat(hip)
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
    return round(w / h, 2)
  }, [waist, hip])

  const gaugeW = clamp(Math.round((total / 24) * 100), 2, 100)

  return (
    <>
      <Seo
        title="Cortisol Belly & Stress Score Evaluator - vimz Tools"
        description="Evaluate stress-linked weight gain patterns with a quick cortisol and lifestyle score."
      />
      <ToolShell
        title="Cortisol Belly & Stress Score Evaluator"
        description="Rate eight everyday stress signals to estimate how strongly chronic stress may be shaping your symptoms and waistline."
        icon={<Brain className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Answer the eight questions honestly to score your stress load"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Activity className="h-4 w-4 text-fuchsia-600" /> Stress signals
            </h3>
            <ul className="space-y-2.5">
              {QUESTIONS.map((q, qi) => (
                <li key={q} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="mb-2 text-sm font-bold text-slate-800">
                    {qi + 1}. {q}
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {FREQ.map((freq, v) => (
                      <button
                        key={freq}
                        onClick={() => setAnswers((prev) => prev.map((val, i) => (i === qi ? v : val)))}
                        className={`rounded-lg border px-2 py-2 text-[11px] font-bold transition ${
                          answers[qi] === v
                            ? 'border-fuchsia-500 bg-fuchsia-600 text-white'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-fuchsia-300'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Stress score</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-6xl font-black tabular-nums text-slate-900">{total}</span>
                <span className="pb-1.5 text-sm font-bold text-slate-400">/ 24</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${total >= 18 ? 'bg-rose-500' : total >= 12 ? 'bg-orange-500' : total >= 6 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${gaugeW}%` }}
                />
              </div>
              <div className={`mt-4 rounded-xl border p-4 ${result.tone}`}>
                <p className="text-sm font-extrabold text-slate-800">{result.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{result.note}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Ruler className="h-4 w-4" /> Central pattern check (optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Waist (cm)">
                  <TextInput type="number" min={40} max={200} value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 88" />
                </Field>
                <Field label="Hip (cm)">
                  <TextInput type="number" min={40} max={200} value={hip} onChange={(e) => setHip(e.target.value)} placeholder="e.g. 104" />
                </Field>
              </div>
              {whr && (
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-400">Waist-hip ratio </span>
                  <span className="font-extrabold text-slate-700">{whr}</span>
                  <span className="ml-2 text-slate-500">{whr >= 0.85 ? 'central pattern' : 'typical pattern'}</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <Info className="h-4 w-4" /> Supportive habits
              </p>
              <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li>Aim for a consistent wind-down and similar sleep and wake times.</li>
                <li>Short walks after meals soften the afternoon cortisol bump.</li>
                <li>Keep caffeine out of the afternoons.</li>
                <li>Protein at breakfast plus slow carbs can steady the energy curve.</li>
              </ul>
            </div>

            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
              Educational check only - it does not measure cortisol directly and cannot diagnose a condition.
            </p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}