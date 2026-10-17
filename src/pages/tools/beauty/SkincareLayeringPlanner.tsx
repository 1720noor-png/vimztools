import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  Clock,
  Layers,
  ListOrdered,
  Sparkles,
  Sun,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select } from '../../../components/ui/Fields'

type StepDef = {
  id: string
  label: string
  hint: string
  tag?: string
  amOnly?: boolean
  pmOnly?: boolean
  weight: number
}

const STEPS: StepDef[] = [
  { id: 'cleanser', label: 'Cleanser', hint: 'First layer on bare skin', weight: 0 },
  { id: 'toner', label: 'Toner', hint: 'Warm-up watery layer', weight: 1 },
  { id: 'essence', label: 'Essence', hint: 'Hydrating lightweight base', weight: 2 },
  { id: 'ha', label: 'Hyaluronic acid serum', hint: 'Apply to damp skin', weight: 3 },
  { id: 'vitc', label: 'Vitamin C serum', hint: 'Morning only, under SPF', tag: 'AM', weight: 4, amOnly: true },
  { id: 'bha', label: 'BHA acid', hint: 'Alternate evenings only', tag: 'PM alt', weight: 4, pmOnly: true },
  { id: 'retinol', label: 'Retinol', hint: 'Empty hands, let it dry', tag: 'PM', weight: 5, pmOnly: true },
  { id: 'eye', label: 'Eye cream', hint: 'Pat gently, never rub', weight: 6 },
  { id: 'moist', label: 'Moisturizer', hint: 'Seal in the watery layers', weight: 7 },
  { id: 'oil', label: 'Facial oil', hint: 'Oil is the last layer', weight: 8 },
  { id: 'spf', label: 'SPF', hint: 'Final AM step', tag: 'AM', weight: 9, amOnly: true },
]

const SLOTS = ['AM', 'PM'] as const
type Slot = (typeof SLOTS)[number]

export default function SkincareLayeringPlanner() {
  const [slot, setSlot] = useState<Slot>('AM')
  const [selected, setSelected] = useState<string[]>([])

  const visibleSteps = useMemo(
    () => STEPS.filter((s) => (slot === 'AM' ? !s.pmOnly : !s.amOnly)),
    [slot],
  )

  const ordered = useMemo(
    () => visibleSteps.filter((s) => selected.includes(s.id)).sort((a, b) => a.weight - b.weight),
    [visibleSteps, selected],
  )

  const caution = selected.includes('retinol') && selected.includes('bha')

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <>
      <Seo
        title="Skincare Layering Planner - vimz Tools"
        description="Build a step-by-step AM or PM skincare routine with correct layering order."
      />
      <ToolShell
        title="Skincare Layering Planner"
        description="Build a step-by-step AM or PM skincare routine with the correct layering order and rule hints."
        icon={<Layers className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Toggle the steps you own, then read your number order"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Routine setup</h3>
            <div className="mb-5 max-w-xs">
              <Field label="Routine slot">
                <Select value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s} routine
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="space-y-2.5">
              {visibleSteps.map((step) => {
                const on = selected.includes(step.id)
                return (
                  <label
                    key={step.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      on ? 'border-primary-400 bg-primary-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(step.id)}
                      className="h-4 w-4 rounded accent-primary-600"
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-slate-700">{step.label}</span>
                    {step.tag && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-500">
                        {step.tag}
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
            {visibleSteps.some((s) => s.amOnly || s.pmOnly) && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
                Only steps that fit the selected slot are listed here. Switch slots to see AM- or PM-only steps.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-3">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
              {slot === 'AM' ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Clock className="h-4 w-4 text-indigo-500" />
              )}
              Your ordered routine - {slot}
              <ListOrdered className="h-4 w-4 text-slate-400" />
            </h3>

            {ordered.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="max-w-xs text-center text-sm text-slate-400">
                  Tick the products you use and the planner will order them layer by layer.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {ordered.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-extrabold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">{step.label}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-500" />
                        {step.hint}
                      </p>
                    </div>
                    {step.tag && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-500">
                        {step.tag}
                      </span>
                    )}
                  </div>
                ))}

                {caution && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-sm font-bold text-amber-800">Use on alternating nights</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <ArrowDownWideNarrow className="h-4 w-4" /> Layering rules
              </p>
              <ul className="grid grid-cols-1 gap-1.5 text-xs leading-relaxed text-slate-600 sm:grid-cols-2">
                <li>{'Watery textures go before creamy ones.'}</li>
                <li>{'Retinol goes on empty, fully dry hands.'}</li>
                <li>{'Facial oil is always the last layer.'}</li>
                <li>{'SPF is the final step of the AM routine.'}</li>
              </ul>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}