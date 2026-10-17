import { useState } from 'react'
import { ArrowUpDown, Hash } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function parseBase(value: string, base: number): number {
  const clean = value.trim().replace(/\s+/g, '')
  return [...clean].reduce((acc, c) => acc * base + DIGITS.indexOf(c.toUpperCase()), 0)
}

function formatBase(num: number, base: number): string {
  if (!Number.isFinite(num)) return ''
  const neg = num < 0
  let n = Math.abs(Math.trunc(num))
  let out = ''
  do {
    out = DIGITS[n % base] + out
    n = Math.floor(n / base)
  } while (n > 0)
  return neg ? '-' + out : out
}

export default function BinaryDecimalHexConverter() {
  const [fromBase, setFromBase] = useState('10')
  const [value, setValue] = useState('255')
  const [toBase, setToBase] = useState('2')

  const source = parseInt(fromBase, 10)
  const target = parseInt(toBase, 10)
  const valid = value.trim() !== '' && [...value.trim()].every((c) =>
    DIGITS.slice(0, source).includes(c.toUpperCase()),
  )
  const num = valid ? parseBase(value, source) : NaN
  const rendered = valid && Number.isFinite(num) ? formatBase(num, target) : ''

  const rows = [
    { label: 'Binary (base 2)', value: valid && Number.isFinite(num) ? formatBase(num, 2) : '' },
    { label: 'Octal (base 8)', value: valid && Number.isFinite(num) ? formatBase(num, 8) : '' },
    { label: 'Decimal (base 10)', value: valid && Number.isFinite(num) ? formatBase(num, 10) : '' },
    { label: 'Hexadecimal (base 16)', value: valid && Number.isFinite(num) ? formatBase(num, 16) : '' },
  ]

  return (
    <>
      <Seo
        title="Binary Decimal Hex Converter - vimz Tools"
        description="Convert numbers between binary, decimal, hexadecimal and octal bases instantly."
      />
      <ToolShell
        title="Binary Decimal Hex Converter"
        description="Flip numbers between binary, octal, decimal and hexadecimal with a one-click conversion grid."
        icon={<Hash className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Type a number, choose the source base, and see every other base update live."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Source number">
              <TextInput value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 255" spellCheck={false} />
            </Field>
            <Field label="Source base">
              <Select value={fromBase} onChange={(e) => setFromBase(e.target.value)}>
                <option value="2">Binary (base 2)</option>
                <option value="8">Octal (base 8)</option>
                <option value="10">Decimal (base 10)</option>
                <option value="16">Hexadecimal (base 16)</option>
              </Select>
            </Field>
            <Field label="Target base">
              <Select value={toBase} onChange={(e) => setToBase(e.target.value)}>
                <option value="2">Binary (base 2)</option>
                <option value="8">Octal (base 8)</option>
                <option value="10">Decimal (base 10)</option>
                <option value="16">Hexadecimal (base 16)</option>
              </Select>
            </Field>
            {!valid && value !== '' && (
              <p className="text-sm font-medium text-rose-600">That digit is not valid in base {source}.</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <span className="text-sm text-slate-500">
                {valid ? `${value} in base ${source}` : 'Result'}
              </span>
              <span className="font-mono text-2xl font-extrabold text-primary-700">
                {rendered || '—'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-1">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-500">{r.label}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(r.value).catch(() => undefined)}
                    className="font-mono text-sm font-bold text-slate-800 transition hover:text-primary-700"
                    title="Click to copy"
                  >
                    {r.value || '—'}
                  </button>
                </div>
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpDown className="h-3.5 w-3.5" /> Click any value to copy it.
            </p>
          </div>
        </div>
      </ToolShell>
    </>
  )
}