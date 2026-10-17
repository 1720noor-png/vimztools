import { useMemo, useState } from 'react'
import { Droplets, Gauge, Palette, Ruler, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { toNumber } from '../../../lib/numbers'

const DEPTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

const LOOKUP: { levels: string; pct: number }[] = [
  { levels: '1 level', pct: 18 },
  { levels: '2 levels', pct: 32 },
  { levels: '3+ levels', pct: 45 },
]

export default function FoundationShadeMatcher() {
  const [currentDepth, setCurrentDepth] = useState('5')
  const [desiredDepth, setDesiredDepth] = useState('6')
  const [totalMl, setTotalMl] = useState('30')
  const [direction, setDirection] = useState<'lightener' | 'darkener'>('lightener')

  const levels = useMemo(
    () => toNumber(desiredDepth) - toNumber(currentDepth),
    [currentDepth, desiredDepth],
  )

  const correctorPct = useMemo(() => {
    const abs = Math.abs(levels)
    if (abs === 1) return 18
    if (abs === 2) return 32
    if (abs >= 3) return 45
    return 0
  }, [levels])

  const total = useMemo(() => toNumber(totalMl), [totalMl])
  const validTotal = Number.isFinite(total) && total > 0
  const correctorMl = validTotal ? (total * correctorPct) / 100 : 0
  const currentMl = validTotal ? total - correctorMl : 0
  const wanted = levels > 0 ? 'darkener' : levels < 0 ? 'lightener' : null
  const mismatch = wanted !== null && wanted !== direction

  return (
    <>
      <Seo
        title="Foundation Shade Matcher - vimz Tools"
        description="Mix your current foundation shade toward a lighter or deeper target with a corrector ratio."
      />
      <ToolShell
        title="Foundation Shade Matcher"
        description="Mix your current foundation shade toward a lighter or deeper target with a corrector ratio."
        icon={<Palette className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Choose a target depth and batch size to get a corrector mix ratio."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Palette className="h-4 w-4 text-primary-600" /> Shade settings
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Current shade depth">
                <Select value={currentDepth} onChange={(e) => setCurrentDepth(e.target.value)}>
                  {DEPTHS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Desired shade depth">
                <Select value={desiredDepth} onChange={(e) => setDesiredDepth(e.target.value)}>
                  {DEPTHS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Total mix in ml">
                <TextInput type="number" min={1} step={1} value={totalMl} onChange={(e) => setTotalMl(e.target.value)} placeholder="e.g. 30" />
              </Field>
              <Field label="Corrector on hand">
                <Select value={direction} onChange={(e) => setDirection(e.target.value as 'lightener' | 'darkener')}>
                  <option value="lightener">Lightener (white / lighter shade)</option>
                  <option value="darkener">Darkener (deeper shade)</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Gauge className="h-4 w-4 text-primary-600" /> Your custom mix
              </h3>
              {!validTotal ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  Enter a total batch size in ml to see the mix ratio and amounts.
                </p>
              ) : levels === 0 ? (
                <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
                  Your current shade depth already matches the target depth. No corrector needed.
                </p>
              ) : (
                <div className="space-y-4">
                  {mismatch && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                      Direction note: a {levels > 0 ? 'deeper' : 'lighter'} target pairs best with a
                      {levels > 0 ? ' darkener' : ' lightener'}.
                    </p>
                  )}
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-500">Depth gap</span>
                    <span className="font-extrabold text-slate-800">
                      {levels > 0 ? `+${levels}` : levels} level{Math.abs(levels) === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Droplets className="h-4 w-4 shrink-0 text-sky-600" />
                    <span className="font-extrabold text-slate-900">{currentMl.toFixed(1)} ml current</span>
                    <span>+</span>
                    <span className="font-extrabold text-sky-700">{correctorMl.toFixed(1)} ml {direction}</span>
                  </p>
                  <div className="flex h-6 overflow-hidden rounded-full border border-slate-200">
                    <div
                      className="flex items-center justify-center bg-slate-300 text-[10px] font-bold text-slate-700"
                      style={{ width: `${100 - correctorPct}%` }}
                    >
                      {currentMl.toFixed(1)} ml
                    </div>
                    <div
                      className="flex items-center justify-center bg-sky-500 text-[10px] font-bold text-white"
                      style={{ width: `${correctorPct}%` }}
                    >
                      {correctorMl.toFixed(1)} ml
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {correctorPct}% of the batch is {direction} to shift {Math.abs(levels)} level
                    {Math.abs(levels) === 1 ? '' : 's'}.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Ruler className="h-4 w-4 text-primary-600" /> Corrector lookup
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {LOOKUP.map((l) => (
                  <div key={l.levels} className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 text-sm last:border-0">
                    <span className="text-slate-500">{l.levels}</span>
                    <span className="font-bold text-slate-800">{l.pct}% corrector</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {validTotal && levels !== 0 && (
          <section className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-slate-800">Patch-test before committing</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Blend two small swatches on the hidden jawline seam, let them set for five minutes, then check in
                daylight.
              </p>
            </div>
          </section>
        )}
      </ToolShell>
    </>
  )
}