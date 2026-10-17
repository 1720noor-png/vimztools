import { useState } from 'react'
import { AlertTriangle, Gauge, ShieldCheck, Sun, Thermometer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Field, Select } from '../../../components/ui/Fields'
import { clamp, round } from '../../../lib/numbers'

interface BaseTemps {
  fine: number
  medium: number
  coarse: number
}

const IRON_BASE: BaseTemps = { fine: 150, medium: 180, coarse: 205 }

const CONDITION_PENALTY: Record<string, number> = {
  healthy: 0,
  damaged: 25,
  'color-treated': 15,
}

const CONDITION_LABEL: Record<string, string> = {
  healthy: 'healthy',
  damaged: 'damaged',
  'color-treated': 'color-treated',
}

const TEXTURE_LABEL: Record<string, string> = {
  fine: 'fine',
  medium: 'medium',
  coarse: 'coarse',
}

const TOOL_LABEL: Record<string, string> = {
  'flat-iron': 'Flat iron',
  'curling-iron': 'Curling iron',
  'blow-dryer': 'Blow dryer',
}

const ADVICE = [
  'Spray a heat protectant on damp-to-dry hair before styling',
  'Keep one smooth pass instead of repeated strokes',
  'Never clamp a section for more than a few seconds',
  'Use the low end of the dial for everyday touch-ups',
]

export default function HeatStylingTempAdvisor() {
  const [texture, setTexture] = useState('fine')
  const [condition, setCondition] = useState('healthy')
  const [tool, setTool] = useState('flat-iron')

  const base =
    tool === 'blow-dryer'
      ? 95
      : tool === 'curling-iron'
        ? IRON_BASE[texture as keyof BaseTemps] - 10
        : IRON_BASE[texture as keyof BaseTemps]
  const penalty = CONDITION_PENALTY[condition]
  const floor = tool === 'blow-dryer' ? 70 : 140
  const maxC = clamp(base - penalty, floor, 230)
  const maxF = round((maxC * 9) / 5 + 32)
  const percent = Math.max(0, Math.min(100, (maxC / 230) * 100))
  const detail = `${base}°C base minus ${penalty}°C for ${CONDITION_LABEL[condition]} hair, floored at ${floor}°C`

  return (
    <>
      <Seo
        title="Heat Styling Temperature Advisor - vimz Tools"
        description="Find the safest heat styling temperature for your hair type, condition, and tool."
      />
      <ToolShell
        title="Heat Styling Temperature Advisor"
        description="Pick your hair texture, condition, and styling tool to get a maximum safe heat ceiling in Celsius and Fahrenheit."
        icon={<Thermometer className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Choose your hair profile to get a safe heat ceiling."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Hair profile</h3>
            <div className="space-y-3">
              <Field label="Texture">
                <Select value={texture} onChange={(e) => setTexture(e.target.value)}>
                  <option value="fine">Fine</option>
                  <option value="medium">Medium</option>
                  <option value="coarse">Coarse</option>
                </Select>
              </Field>
              <Field label="Condition">
                <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="healthy">Healthy</option>
                  <option value="damaged">Damaged</option>
                  <option value="color-treated">Color-treated</option>
                </Select>
              </Field>
              <Field label="Tool">
                <Select value={tool} onChange={(e) => setTool(e.target.value)}>
                  <option value="flat-iron">Flat iron</option>
                  <option value="curling-iron">Curling iron</option>
                  <option value="blow-dryer">Blow dryer</option>
                </Select>
              </Field>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Damaged or color-treated hair always receives a lower ceiling — heat stress compounds existing weakness.
            </p>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-500">
                <Gauge className="h-4 w-4" /> Maximum styling temperature
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Celsius</p>
                  <p className="text-6xl font-extrabold text-primary-800">{maxC}°C</p>
                </div>
                <div className="h-16 w-px bg-primary-300" />
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Fahrenheit</p>
                  <p className="text-5xl font-extrabold text-slate-700">{maxF}°F</p>
                </div>
              </div>
              <div className="mx-auto mt-4 max-w-md space-y-1.5">
                <p className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600">
                  {TOOL_LABEL[tool]} on {TEXTURE_LABEL[texture]} hair
                </p>
                <p className="text-xs text-slate-400">{detail}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Sun className="h-4 w-4 text-amber-500" /> Safe heat zone
              </h3>
              <div className="relative h-5 w-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400">
                <div
                  className="absolute top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-full bg-slate-900"
                  style={{ left: `${percent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>0°C</span>
                <span>140°C floor</span>
                <span>230°C limit</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Your recommended ceiling sits in the {percent < 50 ? 'cooler' : 'warmer'} half of the safe zone at {maxC}°C.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Heat protection advice
              </h3>
              <div className="flex flex-wrap gap-2">
                {ADVICE.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm leading-relaxed text-amber-800">
                Use heat only when the hair is fully dry — heat on wet strands boils water inside the cuticle and causes
                severe damage.
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}