import { useMemo, useState } from 'react'
import { Scale, ArrowLeftRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

interface Cat {
  from: (v: number, u: string) => number
  to: (v: number, u: string) => number
  units: string[]
}

const LENGTH: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  ft: 0.3048,
  yd: 0.9144,
}

const CATS: Record<string, Cat> = {
  length: {
    units: Object.keys(LENGTH),
    from: (v, u) => v * LENGTH[u],
    to: (v, u) => v / LENGTH[u],
  },
  mass: {
    units: ['kg', 'g', 'mg', 'tonne', 'lb', 'oz'],
    from: (v, u) => (u === 'kg' ? v : u === 'g' ? v / 1000 : u === 'mg' ? v / 1e6 : u === 'tonne' ? v * 1000 : u === 'lb' ? v * 0.45359237 : v * 0.028349523),
    to: (v, u) => (u === 'kg' ? v : u === 'g' ? v * 1000 : u === 'mg' ? v * 1e6 : u === 'tonne' ? v / 1000 : u === 'lb' ? v / 0.45359237 : v / 0.028349523),
  },
  time: {
    units: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'years'],
    from: (v, u) => (u === 'seconds' ? v : u === 'minutes' ? v * 60 : u === 'hours' ? v * 3600 : u === 'days' ? v * 86400 : u === 'weeks' ? v * 604800 : v * 31536000),
    to: (v, u) => (u === 'seconds' ? v : u === 'minutes' ? v / 60 : u === 'hours' ? v / 3600 : u === 'days' ? v / 86400 : u === 'weeks' ? v / 604800 : v / 31536000),
  },
  volume: {
    units: ['litres', 'mL', 'm³', 'gallons', 'cups'],
    from: (v, u) => (u === 'litres' ? v : u === 'mL' ? v / 1000 : u === 'm³' ? v * 1000 : u === 'gallons' ? v * 3.785411784 : v * 0.2365882365),
    to: (v, u) => (u === 'litres' ? v : u === 'mL' ? v * 1000 : u === 'm³' ? v / 1000 : u === 'gallons' ? v / 3.785411784 : v / 0.2365882365),
  },
  speed: {
    units: ['m/s', 'km/h', 'mph', 'knots'],
    from: (v, u) => (u === 'm/s' ? v : u === 'km/h' ? v / 3.6 : u === 'mph' ? v * 0.44704 : v * 0.514444),
    to: (v, u) => (u === 'm/s' ? v : u === 'km/h' ? v * 3.6 : u === 'mph' ? v / 0.44704 : v / 0.514444),
  },
  data: {
    units: ['bytes', 'KB', 'MB', 'GB', 'TB'],
    from: (v, u) => (u === 'bytes' ? v : u === 'KB' ? v * 1000 : u === 'MB' ? v * 1e6 : u === 'GB' ? v * 1e9 : v * 1e12),
    to: (v, u) => (u === 'bytes' ? v : u === 'KB' ? v / 1000 : u === 'MB' ? v / 1e6 : u === 'GB' ? v / 1e9 : v / 1e12),
  },
}

const TEMP_FROM: Record<string, (v: number) => number> = {
  C: (v) => v,
  F: (v) => (v - 32) * 5 / 9,
  K: (v) => v - 273.15,
}
const TEMP_TO: Record<string, (v: number) => number> = {
  C: (v) => v,
  F: (v) => v * 9 / 5 + 32,
  K: (v) => v + 273.15,
}

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return ''
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(5)
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

export default function UnitConverter() {
  const [cat, setCat] = useState('length')
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState('km')
  const [to, setTo] = useState('miles')

  const temperature = cat === 'temperature'
  const input = parseFloat(value)
  const output = useMemo(() => {
    if (!Number.isFinite(input)) return NaN
    if (temperature) return TEMP_TO[to](TEMP_FROM[from](input))
    const base = CATS[cat].from(input, from)
    return CATS[cat].to(base, to)
  }, [cat, from, to, input, temperature])

  const table = useMemo(() => {
    if (!Number.isFinite(input)) return []
    const units = temperature ? Object.keys(TEMP_TO) : CATS[cat].units
    return units.map((u) => {
      const v = temperature ? TEMP_TO[u](TEMP_FROM[from](input)) : CATS[cat].to(CATS[cat].from(input, from), u)
      return { u, v }
    })
  }, [cat, from, input, temperature])

  return (
    <>
      <Seo
        title="Unit Converter - vimz Tools"
        description="Convert lengths, mass, time, volume, speed, data and temperature in one place."
      />
      <ToolShell
        title="Unit Converter"
        description="One converter for length, mass, time, temperature, volume, speed and data."
        icon={<Scale className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Pick a category, type a value, and flip between any two units instantly."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Category">
              <Select value={cat} onChange={(e) => { const c = e.target.value; setCat(c); const u = c === 'temperature' ? Object.keys(TEMP_TO) : CATS[c].units; setFrom(u[0]); setTo(u[1] ?? u[0]) }}>
                <option value="length">Length</option>
                <option value="mass">Mass / weight</option>
                <option value="temperature">Temperature</option>
                <option value="time">Time</option>
                <option value="volume">Volume</option>
                <option value="speed">Speed</option>
                <option value="data">Data size</option>
              </Select>
            </Field>
            <Field label="Value">
              <TextInput type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <Select value={from} onChange={(e) => setFrom(e.target.value)}>
                  {(temperature ? Object.keys(TEMP_TO) : CATS[cat].units).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Select>
              </Field>
              <Field label="To">
                <Select value={to} onChange={(e) => setTo(e.target.value)}>
                  {(temperature ? Object.keys(TEMP_TO) : CATS[cat].units).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <span className="text-sm text-slate-500">{from || ''} to {to || ''}</span>
              <span className="font-mono text-2xl font-extrabold text-primary-700">{fmt(output)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Full conversion table">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {table.map((r) => (
                  <div key={r.u} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 last:border-0">
                    <span className="flex items-center gap-2 text-sm text-slate-500">
                      <ArrowLeftRight className="h-3.5 w-3.5 text-slate-300" /> {r.u}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(fmt(r.v)).catch(() => undefined)}
                      className="cursor-copy font-mono text-sm font-bold text-slate-800 transition hover:text-primary-700"
                      title="Click to copy"
                    >
                      {fmt(r.v)}
                    </button>
                  </div>
                ))}
              </div>
            </Field>
            <p className="text-xs text-slate-400">Click any value in the table to copy it.</p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}