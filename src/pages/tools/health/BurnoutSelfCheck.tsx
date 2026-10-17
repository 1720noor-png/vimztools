import { useMemo, useState } from 'react'
import { Brain } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round } from '../../../lib/numbers'

const ITEMS = [
  { key: 'e1', text: 'Exhausted by the end of the working day', domain: 'Exhaustion' },
  { key: 'e2', text: 'Wake up tired even after sleeping', domain: 'Exhaustion' },
  { key: 'e3', text: 'Emotionally drained by work or care duties', domain: 'Exhaustion' },
  { key: 'c1', text: 'Feel more distant or cynical about what I do', domain: 'Cynicism' },
  { key: 'c2', text: 'Find less meaning in tasks I used to enjoy', domain: 'Cynicism' },
  { key: 'c3', text: 'Irritable with people around me', domain: 'Cynicism' },
  { key: 'a1', text: 'Struggle to feel I am accomplishing things', domain: 'Accomplishment' },
  { key: 'a2', text: 'Find it hard to concentrate and finish tasks', domain: 'Accomplishment' },
]

const OPTIONS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Almost always']

export default function BurnoutSelfCheck() {
  const [answers, setAnswers] = useState<number[]>(ITEMS.map(() => 0))

  const setAnswer = (idx: number, val: number) => {
    setAnswers((prev) => prev.map((v, i) => (i === idx ? val : v)))
  }

  const result = useMemo(() => {
    const mean = answers.reduce((s, v) => s + v, 0) / answers.length
    const byDomain = ITEMS.reduce<Record<string, number[]>>((acc, item, i) => {
      ;(acc[item.domain] ??= []).push(answers[i])
      return acc
    }, {})
    const domains = Object.entries(byDomain).map(([name, vals]) => ({ name, mean: vals.reduce((s, v) => s + v, 0) / vals.length }))
    const band =
      mean < 1
        ? { label: 'Low risk signals', color: 'text-emerald-600' }
        : mean < 2
          ? { label: 'Watchful', color: 'text-amber-600' }
          : { label: 'Elevated signals', color: 'text-rose-600' }
    return { mean, domains, band }
  }, [answers])

  return (
    <>
      <Seo
        title="Burnout Self-Check - vimz Tools"
        description="A quick, private self-reflection on exhaustion, cynicism and accomplishment."
      />
      <ToolShell
        title="Burnout Self-Check"
        description="Eight short statements help you reflect on exhaustion, cynicism and sense of accomplishment - a wellbeing awareness tool, not a clinical diagnosis."
        icon={<Brain className="h-6 w-6" />}
        breadcrumb="Health / Mental Wellness"
        instruction="Answer honestly - your answers stay on this device."
        guideSteps={[
          { title: 'Read each statement', text: 'Think about the last few weeks, not just today.' },
          { title: 'Pick the closest frequency', text: 'From Never to Almost always for each of the eight items.' },
          { title: 'Review your pattern', text: 'See overall and per-domain averages with gentle guidance.' },
        ]}
        guideTips={[
          'Burnout builds gradually - regular small check-ins catch it earlier than waiting for a crisis.',
          'If signals are elevated, talk to your manager, a counsellor or your doctor.',
          'Rest, boundaries and realistic workloads are part of recovery, not optional extras.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Eight quick statements</h3>
            <div className="space-y-3">
              {ITEMS.map((item, i) => (
                <Field key={item.key} label={`${i + 1}. ${item.text}`}>
                  <Select value={answers[i]} onChange={(e) => setAnswer(i, Number(e.target.value))}>
                    {OPTIONS.map((o, oi) => (
                      <option key={o} value={oi}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </Field>
              ))}
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average response</p>
              <p className="mt-2 text-6xl font-extrabold text-slate-900">{round(result.mean, 1)}</p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result.mean < 1 ? 'bg-emerald-500' : result.mean < 2 ? 'bg-amber-400' : 'bg-rose-500'}`} />
                <span className={result.band.color}>{result.band.label}</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Scored 0 = Never, 1 = Rarely, 2 = Sometimes, 3 = Often, 4 = Almost always.
              </p>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">By theme</h3>
              <div className="space-y-3">
                {result.domains.map((d) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <p className="w-32 shrink-0 text-sm font-semibold text-slate-700">{d.name}</p>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${d.mean < 1 ? 'bg-emerald-400' : d.mean < 2 ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${(d.mean / 4) * 100}%` }}
                      />
                    </div>
                    <p className="w-8 shrink-0 text-right text-sm font-bold text-slate-600">{round(d.mean, 1)}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}