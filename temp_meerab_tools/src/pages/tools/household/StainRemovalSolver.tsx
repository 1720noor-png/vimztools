import { useState } from 'react'
import { AlertTriangle, FlaskConical, Info, WifiOff } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  FALLBACK_STAIN_REMEDIES,
  getStainRemedies,
  type StainRemedy,
} from '../../../lib/householdApi'

const STAIN_LABELS: Record<string, string> = {
  coffee: 'Coffee',
  tea: 'Tea',
  'oil-grease': 'Oil / grease',
  'red-wine': 'Red wine',
  blood: 'Blood',
  ink: 'Ink',
  grass: 'Grass',
  sweat: 'Sweat',
  'tomato-sauce': 'Tomato sauce',
  chocolate: 'Chocolate',
}

const STAIN_OPTIONS = Object.keys(STAIN_LABELS)
const FABRICS = ['Cotton', 'Polyester', 'Silk', 'Wool', 'Linen', 'Viscose/Rayon']
const AGES = ['Fresh', 'Set-in']

export default function StainRemovalSolver() {
  const [stain, setStain] = useState('coffee')
  const [fabric, setFabric] = useState('Cotton')
  const [age, setAge] = useState('Fresh')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StainRemedy | null>(null)
  const [source, setSource] = useState<'LIVE' | 'OFFLINE'>('LIVE')

  const solve = async () => {
    setLoading(true)
    let rows: StainRemedy[]
    let src: 'LIVE' | 'OFFLINE' = 'LIVE'
    try {
      rows = await getStainRemedies({ stain_type: stain, fabric_type: fabric })
    } catch {
      rows = FALLBACK_STAIN_REMEDIES.filter((r) => r.stain_type === stain)
      src = 'OFFLINE'
    }
    setResult(rows.find((r) => r.fabric_type === fabric) ?? rows[0] ?? null)
    setSource(src)
    setLoading(false)
  }

  return (
    <>
      <Seo
        title="Stain Removal Solver - vimz Tools"
        description="Step-by-step remedy for common household stains matched to your fabric."
      />
      <ToolShell
        title="Stain Removal Solver"
        description="Step-by-step remedy for common household stains matched to your fabric."
        icon={<FlaskConical className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Pick a stain and fabric to get a matched removal recipe."
      >
        {source === 'OFFLINE' && result && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Offline mode: the live remedy database is unreachable, showing built-in sample remedies.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-slate-800">The spill</h3>
            <div className="space-y-3">
              <Field label="Stain type">
                <Select value={stain} onChange={(e) => setStain(e.target.value)}>
                  {STAIN_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STAIN_LABELS[s]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Fabric">
                <Select value={fabric} onChange={(e) => setFabric(e.target.value)}>
                  {FABRICS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </Field>
              <Field label="How old is the stain?">
                <Select value={age} onChange={(e) => setAge(e.target.value)}>
                  {AGES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </Field>
              <Button className="w-full" onClick={solve} disabled={loading}>
                <FlaskConical className="h-4 w-4" /> {loading ? 'Working…' : 'Get the remedy'}
              </Button>
              {age === 'Set-in' && (
                <p className="text-[11px] leading-relaxed text-amber-600">
                  Set-in stains are harder to lift. Repeat the main steps and give soaking steps more time.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-3">
            {loading ? (
              <HybridLoader />
            ) : result ? (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {STAIN_LABELS[result.stain_type]}
                  </span>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                    {result.fabric_type}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Best for {age.toLowerCase()} stains
                  </span>
                </div>

                <h3 className="mb-3 text-sm font-bold text-slate-800">Steps to lift the stain</h3>
                <ol className="space-y-2">
                  {result.remedy_steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-extrabold text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-600">{step}</p>
                    </li>
                  ))}
                </ol>

                {result.ingredients && result.ingredients.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">You will need</p>
                    <div className="flex flex-wrap gap-2">
                      {result.ingredients.map((ing) => (
                        <span key={ing} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.tips && (
                  <div className="mt-5 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                    <Info className="h-5 w-5 shrink-0 text-sky-600" />
                    <p className="text-sm font-medium text-sky-800">{result.tips}</p>
                  </div>
                )}

                {result.warning && (
                  <div className="mt-3 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
                    <p className="text-sm font-medium text-rose-800">{result.warning}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">Choose a stain and fabric, then run the solver to see the recipe.</p>
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}