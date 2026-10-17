import { useMemo, useState } from 'react'
import { TrendingDown } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'

const QUESTIONS = [
  { q: 'Do you weigh daily, with plenty of high-sodium or high-carb food recently?', bucket: 'Water retention', tip: 'Cut sodium for 2-3 days and keep your usual water intake up.' },
  { q: 'Are you using a different scale, or weighing at a different time of day?', bucket: 'Tracking error', tip: 'Weigh weekly, same time, same scale, after waking.' },
  { q: 'Have you eaten the same calorie target for 8+ weeks straight?', bucket: 'Metabolic adaptation', tip: 'Try a 1-2 week maintenance re-feed, then restart your deficit.' },
  { q: 'Do you sleep less than 6 hours most nights?', bucket: 'Sleep stress', tip: 'Target 7-8 hours. Poor sleep raises hunger hormones and stalls fat loss.' },
  { q: 'Do you drink alcohol on most weeks?', bucket: 'Tracking & water', tip: 'Alcohol adds hidden calories and water weight. Log it or cut it back.' },
  { q: 'Did you just start heavy strength training?', bucket: 'Water retention', tip: 'Muscle swelling can hold water for up to 3 weeks while fat still drops.' },
  { q: 'Are you weighing near your monthly cycle?', bucket: 'Water retention', tip: 'Hormonal water can add 1-3 kg. Judge by the monthly trend, not the number.' },
  { q: 'Has the stall lasted less than 3 weeks?', bucket: 'Patience', tip: 'Week-to-week noise is normal. Judge progress over 3-4 weeks.' },
]

export default function WeightLossPlateauDiagnoser() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({})

  const toggle = (i: number) => setAnswers((p) => ({ ...p, [i]: !p[i] }))

  const tallies = useMemo(() => {
    const map: Record<string, number> = {}
    QUESTIONS.forEach((qq, i) => {
      if (answers[i]) map[qq.bucket] = (map[qq.bucket] || 0) + 1
    })
    const rows = Object.entries(map).map(([bucket, count]) => ({
      bucket,
      count,
      tips: QUESTIONS.filter((qq, i) => answers[i] && qq.bucket === bucket).map((qq) => qq.tip),
    }))
    rows.sort((a, b) => b.count - a.count)
    return rows
  }, [answers])

  const totalYes = tallies.reduce((s, r) => s + r.count, 0)
  const topCount = tallies.length ? tallies[0].count : 0

  return (
    <>
      <Seo
        title="Weight Loss Plateau Diagnoser - vimz Tools"
        description="Analyzes potential causes (water retention, tracking error, metabolic adaptation) during weight loss stalls."
      />
      <ToolShell
        title="Weight Loss Plateau Diagnoser"
        description="Analyzes potential causes of a weight loss stall - water retention, tracking error, metabolic adaptation, and more."
        icon={<TrendingDown className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Answer a few questions to identify likely plateau causes."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            {QUESTIONS.map((qq, i) => (
              <div key={qq.q} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-700">{qq.q}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 pl-9">
                  {[
                    { v: true, label: 'Yes', on: 'border-rose-300 bg-rose-50 text-rose-700' },
                    { v: false, label: 'No', on: 'border-slate-300 bg-slate-50 text-slate-600' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => toggle(i)}
                      className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${answers[i] === opt.v ? `ring-1 ring-current ${opt.on}` : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}
                    >
                      {opt.label}
                      {answers[i] === opt.v ? ' ✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Ranked likely causes ({totalYes} of {QUESTIONS.length} flagged)</h3>
              {totalYes === 0 ? (
                <p className="text-sm text-slate-400">No causes flagged yet - answer a few questions to rank the likely culprits.</p>
              ) : (
                <div className="space-y-4">
                  {tallies.map((r) => (
                    <div key={r.bucket}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">{r.bucket}</span>
                        <span className="text-xs font-bold text-slate-400">{r.count} match{ r.count > 1 ? 'es' : ''}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div className="h-2.5 rounded-full bg-rose-500" style={{ width: `${(r.count / topCount) * 100}%` }} />
                      </div>
                      {r.tips.map((tip) => (
                        <p key={tip} className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                          {tip}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">The 3-week rule</p>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                Any stall under 3 weeks is usually normal fluctuation. Only worry when the trend is flat for 3+ weeks
                despite an accurate calorie deficit.
              </p>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}