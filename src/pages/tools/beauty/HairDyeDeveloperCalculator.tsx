import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, FlaskRound, Palette } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select } from '../../../components/ui/Fields'

const LEVELS = [
  { value: '1', label: '1 — darkest (black)' },
  { value: '2', label: '2 (very dark brown)' },
  { value: '3', label: '3 (dark brown)' },
  { value: '4', label: '4 (medium brown)' },
  { value: '5', label: '5 (light brown)' },
  { value: '6', label: '6 (dark blonde)' },
  { value: '7', label: '7 (medium blonde)' },
  { value: '8', label: '8 (light blonde)' },
  { value: '9', label: '9 (very light blonde)' },
  { value: '10', label: '10 — lightest (platinum)' },
]

const TIME_RANGES: Record<number, [number, number]> = {
  10: [15, 20],
  20: [20, 30],
  30: [30, 40],
  40: [30, 45],
}

const DEVELOPER_NOTE: Record<number, string> = {
  10: 'Deposit or tone with zero to minimal lift.',
  20: 'Lifts 1-2 levels for natural dimension and root touch-ups.',
  30: 'Lifts 3-4 levels toward lighter blonde results.',
  40: 'Bleach-strength single-use lift of 5+ levels. Handle with care.',
}

export default function HairDyeDeveloperCalculator() {
  const [current, setCurrent] = useState('6')
  const [target, setTarget] = useState('7')
  const [thickness, setThickness] = useState('medium')

  const currentLevel = Number(current)
  const targetLevel = Number(target)
  const lift = targetLevel - currentLevel
  const absLift = Math.abs(lift)
  const developer = lift <= 0 ? 10 : lift <= 2 ? 20 : lift <= 4 ? 30 : 40
  const extra = thickness === 'thick' ? 5 : 0
  const [baseMin, baseMax] = TIME_RANGES[developer]
  const timeMin = baseMin + extra
  const timeMax = baseMax + extra

  const shiftNote =
    lift === 0
      ? 'No lifting needed - this is a deposit or toning job.'
      : lift < 0
        ? `Going ${absLift} level${absLift === 1 ? '' : 's'} deeper - deposit only, no lifting developer needed.`
        : `Needs ${lift} level${lift === 1 ? '' : 's'} of lift from level ${current} to level ${target}.`

  return (
    <>
      <Seo
        title="Hair Dye Developer Calculator - vimz Tools"
        description="Choose the right developer volume and processing time for your hair dye lift."
      />
      <ToolShell
        title="Hair Dye Developer Calculator"
        description="Compare your current and target shade to get the right developer volume, processing time, and safety notes."
        icon={<Palette className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Enter current and target levels to find your developer volume."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Color profile</h3>
            <div className="space-y-3">
              <Field label="Current level">
                <Select value={current} onChange={(e) => setCurrent(e.target.value)}>
                  {LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Target level">
                <Select value={target} onChange={(e) => setTarget(e.target.value)}>
                  {LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Hair thickness">
                <Select value={thickness} onChange={(e) => setThickness(e.target.value)}>
                  <option value="fine">Fine</option>
                  <option value="medium">Medium</option>
                  <option value="thick">Thick</option>
                </Select>
              </Field>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Levels run 1 (darkest) to 10 (lightest). A positive shift means lifting pigment.
            </p>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-500">
                <FlaskRound className="h-4 w-4" /> Recommended developer
              </p>
              <p className="mt-2 text-6xl font-extrabold text-primary-800">{developer} vol</p>
              <p className="mt-1 text-sm text-slate-500">{DEVELOPER_NOTE[developer]}</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Clock className="h-4 w-4 text-primary-600" /> Level shift and timing
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Level shift</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">
                    {lift > 0 ? `+${lift}` : lift}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Processing time</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">
                    {timeMin}-{timeMax} min
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Thickness</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">
                    {thickness === 'thick' ? '+5 min' : 'Standard'}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">{shiftNote}</p>
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Pro tip
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                Check a strand at around 15 minutes to watch lightening, and never walk away from the timer.
              </p>
            </section>

            {developer === 40 && (
              <section className="rounded-2xl border border-rose-300 bg-rose-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-rose-800">
                  <AlertTriangle className="h-4 w-4" /> 40 vol needs extra caution
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-rose-800">
                  This is bleach-strength: single use only, never pre-mixed and stored, and risky on fine, damaged, or
                  previously lightened hair. Book a professional consult first.
                </p>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}