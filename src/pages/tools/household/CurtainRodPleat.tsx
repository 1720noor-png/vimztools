import { useMemo, useState } from 'react'
import { Ruler } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, sum, toNumber } from '../../../lib/numbers'

const OVERAGES = [10, 15, 20]

const PLEATS = [
  { name: 'Grommet', fullness: 1.5 },
  { name: 'Tab top', fullness: 1.5 },
  { name: 'Pencil pleat', fullness: 2.25 },
  { name: 'Pinch pleat', fullness: 2.5 },
  { name: 'Eyelet', fullness: 1.8 },
]

const FABRICS = [140, 280]

export default function CurtainRodPleat() {
  const [windowWidth, setWindowWidth] = useState('150')
  const [windowDrop, setWindowDrop] = useState('240')
  const [mounting, setMounting] = useState('outside')
  const [overage, setOverage] = useState(1)
  const [pleat, setPleat] = useState(3)
  const [heading, setHeading] = useState('8')
  const [fabricWidth, setFabricWidth] = useState(0)
  const [twoPanels, setTwoPanels] = useState(true)

  const calc = useMemo(() => {
    const ww = toNumber(windowWidth)
    const wd = toNumber(windowDrop)
    const hd = toNumber(heading)
    if (![ww, wd, hd].every(Number.isFinite) || ww <= 0 || wd <= 0) return null
    const rod = ww * (1 + OVERAGES[overage] / 100) + (mounting === 'outside' ? 20 : 0)
    const full = PLEATS[pleat].fullness
    const fw = FABRICS[fabricWidth]
    const eachPanel = (twoPanels ? rod / 2 : rod) * full
    const panelsOfFabric = Math.ceil(eachPanel / fw)
    const drop = wd + hd + 15
    const metresPerPanel = (panelsOfFabric * drop) / 100
    const total = sum([metresPerPanel, ...(twoPanels ? [metresPerPanel] : [])])
    const rings = Math.ceil(eachPanel / 10)
    const rows = PLEATS.map((p) => {
      const panel = (twoPanels ? rod / 2 : rod) * p.fullness
      const pof = Math.ceil(panel / fw)
      const mpp = (pof * drop) / 100
      return { name: p.name, fullness: p.fullness, metres: round(twoPanels ? mpp * 2 : mpp) }
    })
    return { rod, eachPanel, panelsOfFabric, drop, metresPerPanel, total: round(total), rings, rows, fw }
  }, [windowWidth, windowDrop, heading, mounting, overage, pleat, fabricWidth, twoPanels])

  const steps = calc
    ? [
        { label: 'Window width', value: `${windowWidth} cm` },
        { label: 'Rod length', value: `${round(calc.rod)} cm` },
        { label: 'Panel width', value: `${round(calc.eachPanel)} cm` },
        { label: 'Fabric widths needed', value: `${calc.panelsOfFabric} × ${calc.fw} cm` },
        { label: 'Cut drop', value: `${calc.drop} cm` },
        { label: 'Metres per panel', value: `${round(calc.metresPerPanel, 1)} m` },
        { label: 'Total fabric', value: `${calc.total} m` },
      ]
    : []

  return (
    <>
      <Seo
        title="Curtain Rod & Pleat Calculator - vimz Tools"
        description="Work out rod length, panel width and metres of fabric needed for grommet, pinch, pencil and other curtain pleats."
      />
      <ToolShell
        title="Curtain Rod & Pleat"
        description="Work out rod length and fabric metres for any curtain heading style."
        icon={<Ruler className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Enter the window size and heading style to see the full fabric calculation."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Window details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Window width (cm)">
                  <TextInput type="number" min={0} value={windowWidth} onChange={(e) => setWindowWidth(e.target.value)} />
                </Field>
                <Field label="Window drop (cm)">
                  <TextInput type="number" min={0} value={windowDrop} onChange={(e) => setWindowDrop(e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mounting">
                  <Select value={mounting} onChange={(e) => setMounting(e.target.value)}>
                    <option value="inside">Inside mount</option>
                    <option value="outside">Outside mount</option>
                  </Select>
                </Field>
                <Field label="Overage">
                  <Select value={overage} onChange={(e) => setOverage(Number(e.target.value))}>
                    {OVERAGES.map((o, i) => (
                      <option key={o} value={i}>
                        {o}%
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pleat style">
                  <Select value={pleat} onChange={(e) => setPleat(Number(e.target.value))}>
                    {PLEATS.map((p, i) => (
                      <option key={p.name} value={i}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Heading allowance (cm)">
                  <TextInput type="number" min={0} value={heading} onChange={(e) => setHeading(e.target.value)} />
                </Field>
              </div>
              <Field label="Fabric width">
                <Select value={fabricWidth} onChange={(e) => setFabricWidth(Number(e.target.value))}>
                  {FABRICS.map((fw, i) => (
                    <option key={fw} value={i}>
                      {fw} cm
                    </option>
                  ))}
                </Select>
              </Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={twoPanels} onChange={(e) => setTwoPanels(e.target.checked)} className="h-4 w-4 accent-primary-600" />
                Two curtain panels
              </label>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Fabric needed</p>
              <p className="mt-2 text-6xl font-extrabold text-primary-700">{calc ? calc.total : '—'} m</p>
              <p className="mt-1 text-sm text-primary-400">
                {calc ? `${PLEATS[pleat].name} over a ${round(calc.rod)} cm rod` : 'Enter window size to calculate.'}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-600">
                  {calc ? `${calc.rings} rings` : '— rings'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary-600">
                  {calc ? `${twoPanels ? 2 : 1} panel${twoPanels ? 's' : ''}` : '—'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Calculator ladder</h3>
              {calc ? (
                <div className="space-y-0">
                  {steps.map((s, i) => (
                    <div key={s.label}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-primary-600">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-slate-600">{s.label}</span>
                        <span className="text-sm font-extrabold text-slate-800">{s.value}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="ml-3.5 h-4 w-px bg-primary-200" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Fill in the window size to walk the ladder.</p>
              )}
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Pleat styles compared</h3>
          {calc ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3 font-semibold">Pleat</th>
                    <th className="py-2 pr-3 font-semibold">Fullness</th>
                    <th className="py-2 font-semibold">Metres for this window</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map((r) => (
                    <tr key={r.name} className={r.name === PLEATS[pleat].name ? 'bg-primary-50 text-primary-700' : 'border-b border-slate-50'}>
                      <td className="py-2.5 pr-3 font-semibold">
                        {r.name}
                        {r.name === PLEATS[pleat].name && (
                          <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">chosen</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">x{r.fullness}</td>
                      <td className="py-2.5 font-extrabold">{r.metres} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Enter your window size to compare pleat styles.</p>
          )}
        </section>
      </ToolShell>
    </>
  )
}