import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Droplets, Leaf, RotateCcw, ShowerHead, Waves } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select } from '../../../components/ui/Fields'

const HARDNESS = [
  { value: 'soft', label: 'Soft water (0-60 ppm)', cadence: 'None needed' },
  { value: 'medium', label: 'Medium (60-120 ppm)', cadence: 'Every 6 weeks' },
  { value: 'hard', label: 'Hard (120-180 ppm)', cadence: 'Every 4 weeks' },
  { value: 'very-hard', label: 'Very hard (180+ ppm)', cadence: 'Every 2 weeks' },
]

const RESIDUE_SIGNS = [
  'Dull, sticky hair right after washing',
  'Stiff or straw-like texture products cannot fix',
  'Weak lather and a soapy film while shampooing',
  'A cloudy coating on combs, brushes, and tools',
]

export default function HardWaterHairAdvisor() {
  const [hardness, setHardness] = useState('medium')
  const [concern, setConcern] = useState('none')
  const [sensitivity, setSensitivity] = useState('no')

  const hardnessIndex = Math.max(0, HARDNESS.findIndex((h) => h.value === hardness))
  const row = HARDNESS[hardnessIndex]

  const concernNote =
    concern === 'build-up'
      ? 'Mineral buildup is the top suspect: add a shine-finish chelating wash once a week until hair feels clean again.'
      : concern === 'brittle'
        ? 'Brittle hair under hard water usually means buildup plus dehydration: chelate first, then follow with a deep moisture mask.'
        : 'With no specific concern, a light cadence is enough to keep mineral film from forming.'

  const clarifyingNote =
    concern === 'build-up'
      ? 'Between chelating washes, alternate a gentle clarifying shampoo every 2-3 washes, then resume normal rinsing.'
      : concern === 'brittle'
        ? 'Swap a clarifying shampoo into the rotation every 2-3 washes and always follow chelating with a hydrating mask.'
        : 'Between chelating washes, swap in a gentle clarifying shampoo every 2-3 washes to stop residue stacking up.'

  const skinNote =
    sensitivity === 'yes'
      ? 'Hard water leaves a mineral and soap residue that can dry the scalp and skin, causing an itchy, tight barrier. A chelating shampoo plus a zinc or piroctone rinse helps calm it.'
      : 'No sensitivity flagged here. If the scalp ever feels tight or itchy, ease the chelating cadence back a step and cool the rinse temperature.'

  const filterNote =
    hardness === 'soft'
      ? 'Soft water rarely needs new equipment; keep your current filter or none at all.'
      : hardness === 'medium'
        ? 'A shower-head filter can smooth things out if hair feels heavy or dull.'
        : 'A shower-head filter or whole-home water softener stops the mineral film at the source; replace filter cartridges seasonally.'

  return (
    <>
      <Seo
        title="Hard Water Hair Advisor - vimz Tools"
        description="Get a chelating shampoo cadence and care plan for hard water mineral buildup."
      />
      <ToolShell
        title="Hard Water Hair Advisor"
        description="Tell us your water hardness level to get a chelating shampoo cadence, clarifying plan, residue signs, and filter advice."
        icon={<Droplets className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Select your water hardness to see your chelating schedule."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Water profile</h3>
            <div className="space-y-3">
              <Field label="Hardness">
                <Select value={hardness} onChange={(e) => setHardness(e.target.value)}>
                  {HARDNESS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Hair concern">
                <Select value={concern} onChange={(e) => setConcern(e.target.value)}>
                  <option value="none">None specific</option>
                  <option value="build-up">Mineral build-up</option>
                  <option value="brittle">Brittle hair</option>
                </Select>
              </Field>
              <Field label="Sensitive skin or scalp">
                <Select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Hardness is usually listed on the annual water quality report from your utility.
            </p>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-500">
                <Waves className="h-4 w-4" /> Chelating shampoo cadence
              </p>
              <p className="mt-2 text-5xl font-extrabold text-primary-800">{row.cadence}</p>
              <p className="mt-1 text-sm text-slate-500">{row.label} — minerals build up fastest in this range</p>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-rose-500" /> Mineral residue signs
                </h3>
                <ul className="mt-3 space-y-2">
                  {RESIDUE_SIGNS.map((sign) => (
                    <li key={sign} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <RotateCcw className="h-4 w-4 text-sky-600" /> Clarifying swap
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{clarifyingNote}</p>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                  <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {concernNote}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> Skin effects
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">{skinNote}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <ShowerHead className="h-4 w-4 text-primary-600" /> Filter recommendation
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{filterNote}</p>
              </div>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}