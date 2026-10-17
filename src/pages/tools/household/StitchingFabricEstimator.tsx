import { useMemo, useState } from 'react'
import { Scissors } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { toNumber } from '../../../lib/numbers'

const GARMENTS = [
  { name: 'Kurta', layers: 1 },
  { name: 'Lehenga', layers: 3 },
  { name: 'Salwar Kameez', layers: 1 },
  { name: 'Anarkali', layers: 3 },
  { name: 'Formal shirt', layers: 1 },
  { name: 'Trousers', layers: 1 },
  { name: 'Evening gown', layers: 2 },
  { name: 'A-line dress', layers: 2 },
  { name: 'Skirt', layers: 1 },
  { name: 'Blouse', layers: 1 },
]

const FLARES = [
  { label: 'Fitted x1', factor: 1 },
  { label: 'Regular x2', factor: 2 },
  { label: 'Flared x2.5', factor: 2.5 },
  { label: 'Heavy flare x3', factor: 3 },
]

const WIDTHS = [
  { label: '36 in (91 cm)', cm: 91 },
  { label: '44 in (112 cm)', cm: 112 },
  { label: '58 in (147 cm)', cm: 147 },
]

const roundUp = (n: number) => Math.ceil(n * 2) / 2

export default function StitchingFabricEstimator() {
  const [garment, setGarment] = useState(0)
  const [bust, setBust] = useState('92')
  const [hip, setHip] = useState('98')
  const [length, setLength] = useState('110')
  const [sleeve, setSleeve] = useState('25')
  const [width, setWidth] = useState(0)
  const [flare, setFlare] = useState(0)

  const calc = useMemo(() => {
    const b = toNumber(bust)
    const h = toNumber(hip)
    const gl = toNumber(length)
    const sl = toNumber(sleeve)
    if (![b, h, gl, sl].every(Number.isFinite) || b <= 0 || h <= 0 || gl <= 0 || sl <= 0) return null
    const band = Math.max(b, h) + 10
    const layers = GARMENTS[garment].layers
    const fullness = FLARES[flare].factor
    const layerLength = gl + sl + 12
    const rows = WIDTHS.map((w) => {
      const widthUnits = Math.ceil((band * layers * fullness) / w.cm)
      const metres = roundUp((widthUnits * layerLength) / 100)
      return { label: w.label, widthUnits, metres }
    })
    return { band, layers, fullness, layerLength, rows, selected: rows[width] }
  }, [bust, hip, length, sleeve, garment, width, flare])

  const maxMetres = calc ? Math.max(...calc.rows.map((r) => r.metres)) : 0

  return (
    <>
      <Seo
        title="Stitching Fabric Estimator - vimz Tools"
        description="Estimate how many metres of fabric you need for dresses, kurtas, gowns and shirts across common fabric widths."
      />
      <ToolShell
        title="Stitching Fabric Estimator"
        description="Estimate fabric metres needed to stitch common garments."
        icon={<Scissors className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Pick a garment, enter measurements, then read the fabric needed for each width."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Garment details</h3>
            <div className="space-y-3">
              <Field label="Garment">
                <Select value={garment} onChange={(e) => setGarment(Number(e.target.value))}>
                  {GARMENTS.map((g, i) => (
                    <option key={g.name} value={i}>
                      {g.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bust (cm)">
                  <TextInput type="number" min={0} value={bust} onChange={(e) => setBust(e.target.value)} />
                </Field>
                <Field label="Hip (cm)">
                  <TextInput type="number" min={0} value={hip} onChange={(e) => setHip(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Garment length (cm)">
                  <TextInput type="number" min={0} value={length} onChange={(e) => setLength(e.target.value)} />
                </Field>
                <Field label="Sleeve length (cm)">
                  <TextInput type="number" min={0} value={sleeve} onChange={(e) => setSleeve(e.target.value)} />
                </Field>
              </div>
              <Field label="Fabric width">
                <Select value={width} onChange={(e) => setWidth(Number(e.target.value))}>
                  {WIDTHS.map((w, i) => (
                    <option key={w.cm} value={i}>
                      {w.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Flare and pleats">
                <Select value={flare} onChange={(e) => setFlare(Number(e.target.value))}>
                  {FLARES.map((f, i) => (
                    <option key={f.label} value={i}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-500">
                Fabric needed on {WIDTHS[width].label.split(' ')[0]} {WIDTHS[width].label.split(' ')[1]}
              </p>
              <p className="mt-2 text-6xl font-extrabold text-primary-700">{calc ? calc.selected.metres : '—'} m</p>
              <p className="mt-1 text-sm text-primary-400">rounds up to the nearest half metre</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white px-3 py-1 text-primary-600">Band {calc ? calc.band : '—'} cm</span>
                <span className="rounded-full bg-white px-3 py-1 text-primary-600">{calc ? GARMENTS[garment].layers : '—'} layers</span>
                <span className="rounded-full bg-white px-3 py-1 text-primary-600">Fullness x{calc ? calc.fullness : '—'}</span>
                <span className="rounded-full bg-white px-3 py-1 text-primary-600">Cut {calc ? calc.layerLength : '—'} cm</span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Compare fabric widths</h3>
              {calc ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                        <th className="py-2 pr-3 font-semibold">Fabric width</th>
                        <th className="py-2 pr-3 font-semibold">Width units</th>
                        <th className="py-2 font-semibold">Metres</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calc.rows.map((r, i) => (
                        <tr key={r.label} className={i === width ? 'bg-primary-50 text-primary-700' : 'border-b border-slate-50'}>
                          <td className="py-2.5 pr-3 font-medium">
                            {r.label}
                            {i === width && (
                              <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">chosen</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3">{r.widthUnits}</td>
                          <td className="py-2.5 font-extrabold">{r.metres} m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Enter body measurements to compare widths.</p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Fabric budget</h3>
              {calc ? (
                <div className="space-y-3">
                  {calc.rows.map((r, i) => (
                    <div key={r.label}>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>{r.label}</span>
                        <span className="text-slate-800">{r.metres} m</span>
                      </div>
                      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${i === width ? 'bg-gradient-to-r from-primary-500 to-primary-700' : 'bg-slate-400'}`}
                          style={{ width: `${Math.max(8, (r.metres / maxMetres) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="pt-2 text-xs text-slate-500">
                    Add about 15% extra fabric when matching prints, stripes or nap direction.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Fill the form to build the budget chart.</p>
              )}
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}