import { useMemo, useState } from 'react'
import { TemplateShell, inputCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

interface Unit {
  label: string
  toBase: number
}

const GROUPS: Record<string, Unit[]> = {
  length: [
    { label: 'meter (m)', toBase: 1 },
    { label: 'kilometer (km)', toBase: 1000 },
    { label: 'centimeter (cm)', toBase: 0.01 },
    { label: 'millimeter (mm)', toBase: 0.001 },
    { label: 'mile (mi)', toBase: 1609.344 },
    { label: 'yard (yd)', toBase: 0.9144 },
    { label: 'foot (ft)', toBase: 0.3048 },
    { label: 'inch (in)', toBase: 0.0254 },
  ],
  weight: [
    { label: 'kilogram (kg)', toBase: 1 },
    { label: 'gram (g)', toBase: 0.001 },
    { label: 'milligram (mg)', toBase: 0.000001 },
    { label: 'pound (lb)', toBase: 0.45359237 },
    { label: 'ounce (oz)', toBase: 0.028349523 },
    { label: 'stone (st)', toBase: 6.35029318 },
    { label: 'tonne (t)', toBase: 1000 },
  ],
  volume: [
    { label: 'liter (L)', toBase: 1 },
    { label: 'milliliter (ml)', toBase: 0.001 },
    { label: 'cup (US)', toBase: 0.236588 },
    { label: 'tablespoon (tbsp)', toBase: 0.0147868 },
    { label: 'teaspoon (tsp)', toBase: 0.00492892 },
    { label: 'fluid ounce (fl oz)', toBase: 0.0295735 },
    { label: 'pint (pt)', toBase: 0.473176 },
    { label: 'quart (qt)', toBase: 0.946353 },
    { label: 'gallon (US)', toBase: 3.78541 },
  ],
  temperature: [
    { label: 'Celsius (°C)', toBase: 0 },
    { label: 'Fahrenheit (°F)', toBase: 1 },
    { label: 'Kelvin (K)', toBase: 2 },
  ],
  data: [
    { label: 'byte (B)', toBase: 1 },
    { label: 'kilobyte (KB)', toBase: 1024 },
    { label: 'megabyte (MB)', toBase: 1024 ** 2 },
    { label: 'gigabyte (GB)', toBase: 1024 ** 3 },
    { label: 'terabyte (TB)', toBase: 1024 ** 4 },
    { label: 'bit (b)', toBase: 1 / 8 },
  ],
  currency: [
    { label: 'US Dollar (USD)', toBase: 1 },
    { label: 'Euro (EUR)', toBase: 0.92 },
    { label: 'British Pound (GBP)', toBase: 0.79 },
    { label: 'Japanese Yen (JPY)', toBase: 149.7 },
    { label: 'Indian Rupee (INR)', toBase: 83.5 },
    { label: 'Pakistani Rupee (PKR)', toBase: 280 },
    { label: 'UAE Dirham (AED)', toBase: 3.6725 },
    { label: 'Canadian Dollar (CAD)', toBase: 1.36 },
    { label: 'Australian Dollar (AUD)', toBase: 1.51 },
    { label: 'Chinese Yuan (CNY)', toBase: 7.13 },
    { label: 'Saudi Riyal (SAR)', toBase: 3.75 },
  ],
}

export function UnitConverterTemplate({ tool }: { tool: RegistryTool }) {
  const text = `${tool.name} ${tool.description ?? ''}`.toLowerCase()

  const groupKey = useMemo(() => {
    if (/temp|celsius|fahrenheit/.test(text)) return 'temperature'
    if (/currency|exchange/.test(text)) return 'currency'
    if (/(cup|tbsp|tsp|gallon|liter|litre|volume|ml to|fl oz)/.test(text)) return 'volume'
    if (/(bit|byte|kb|mb|gb|tb|data)/.test(text)) return 'data'
    if (/(kg|pound|ounce|weight|gram|stone)/.test(text)) return 'weight'
    return 'length'
  }, [text])

  const group = GROUPS[groupKey]
  const [value, setValue] = useState('')
  const [src, setSrc] = useState(0)
  const [dst, setDst] = useState(1)

  const raw = parseFloat(value)
  let result = ''
  let unit = ''
  if (!Number.isNaN(raw)) {
    const a = group[src]
    const b = group[dst]
    if (groupKey === 'temperature') {
      const c = a.toBase === 0 ? raw : a.toBase === 1 ? (raw - 32) * (5 / 9) : raw - 273.15
      result = b.toBase === 0 ? `${c.toLocaleString(undefined, { maximumFractionDigits: 6 })} °C` : b.toBase === 1 ? `${(c * (9 / 5) + 32).toLocaleString(undefined, { maximumFractionDigits: 6 })} °F` : `${(c + 273.15).toLocaleString(undefined, { maximumFractionDigits: 6 })} K`
    } else {
      const out = (raw * a.toBase) / b.toBase
      result = out.toLocaleString(undefined, { maximumFractionDigits: 6 })
      unit = b.label
    }
  }

  return (
    <TemplateShell tool={tool}>
      <p className="mb-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
        {groupKey === 'currency'
          ? 'Reference conversion rates (approximate, no live feed). Verify before transactions.'
          : groupKey === 'volume'
            ? 'Kitchen-friendly volume measures including cups, tablespoons and teaspoons.'
            : `Converting ${groupKey} units.`}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Value</label>
          <input className={inputCls} type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">From</label>
          <select className={inputCls} value={src} onChange={(e) => setSrc(Number(e.target.value))}>
            {group.map((u, i) => (
              <option key={u.label} value={i}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">To</label>
          <select className={inputCls} value={dst} onChange={(e) => setDst(Number(e.target.value))}>
            {group.map((u, i) => (
              <option key={u.label} value={i}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-base font-bold text-emerald-900">
        {result ? `${raw} ${group[src].label} = ${result} ${unit}` : 'Enter a value to convert.'}
      </div>
    </TemplateShell>
  )
}