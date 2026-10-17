import { useState } from 'react'
import { Ruler, ArrowRightLeft } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

interface AreaUnit {
  code: string
  label: string
  perSqm: number
}

const UNITS: AreaUnit[] = [
  { code: 'm2', label: 'Square meters (m²)', perSqm: 1 },
  { code: 'km2', label: 'Square kilometers (km²)', perSqm: 1000000 },
  { code: 'cm2', label: 'Square centimeters (cm²)', perSqm: 0.0001 },
  { code: 'ha', label: 'Hectares (ha)', perSqm: 10000 },
  { code: 'acre', label: 'Acres', perSqm: 4046.8564224 },
  { code: 'ft2', label: 'Square feet (ft²)', perSqm: 0.09290304 },
  { code: 'yd2', label: 'Square yards (yd²)', perSqm: 0.83612736 },
  { code: 'mi2', label: 'Square miles (mi²)', perSqm: 2589988.110336 },
]

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return ''
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(6)
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

export default function AreaUnitConverter() {
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState('m2')
  const [to, setTo] = useState('ft2')

  const input = parseFloat(value)
  const fromUnit = UNITS.find((u) => u.code === from)!
  const toUnit = UNITS.find((u) => u.code === to)!
  const sqm = input * fromUnit.perSqm
  const output = sqm / toUnit.perSqm

  const conversionTable = UNITS.map((u) => ({
    label: u.label,
    value: sqm / u.perSqm,
  }))

  return (
    <>
      <Seo
        title="Area Unit Converter - vimz Tools"
        description="Convert between square meters, kilometers, acres, hectares, square feet, yards and miles."
      />
      <ToolShell
        title="Area Unit Converter"
        description="Swap land, room and geometry areas between metric and imperial units."
        icon={<Ruler className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Enter an amount, pick two units, and read the answer with a full conversion table."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Amount">
              <TextInput type="number" min={0} step="any" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
            <Field label="From unit">
              <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u.code} value={u.code}>{u.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="To unit">
              <Select value={to} onChange={(e) => setTo(e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u.code} value={u.code}>{u.label}</option>
                ))}
              </Select>
            </Field>
            <Button variant="secondary" onClick={() => setFrom('m2')}>
              <ArrowRightLeft className="h-4 w-4" /> Reset to square meters
            </Button>
            <div className="rounded-2xl bg-slate-900 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Result</p>
              <p className="mt-1 font-mono text-3xl font-extrabold text-white">
                {Number.isFinite(output) ? fmt(output) : '—'}
              </p>
              <p className="text-sm text-slate-400">{toUnit.label}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Conversion table">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {conversionTable.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0"
                  >
                    <span className="text-sm text-slate-500">{r.label}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(fmt(r.value)).catch(() => undefined)}
                      className="font-mono text-sm font-bold text-slate-800 transition hover:text-primary-700"
                      title="Click to copy"
                    >
                      {fmt(r.value)}
                    </button>
                  </div>
                ))}
              </div>
            </Field>
            <CodeBlock title="Summary" code={`${fmt(sqm)} m² = ${fmt(output)} ${toUnit.code}`} lang="plain" />
          </div>
        </div>
      </ToolShell>
    </>
  )
}