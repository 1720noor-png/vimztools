import { useMemo, useState } from 'react'
import { ArrowLeftRight, Weight, Beaker } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

type Unit = 'floz' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb' | 'g' | 'kg'

const UNITS: Record<Unit, { label: string; short: string; kind: 'vol' | 'mass'; base: number }> = {
  floz: { label: 'Fluid ounce', short: 'fl oz', kind: 'vol', base: 29.5735 },
  ml: { label: 'Milliliter', short: 'ml', kind: 'vol', base: 1 },
  cup: { label: 'Cup', short: 'cup', kind: 'vol', base: 236.588 },
  tbsp: { label: 'Tablespoon', short: 'tbsp', kind: 'vol', base: 14.7868 },
  tsp: { label: 'Teaspoon', short: 'tsp', kind: 'vol', base: 4.92892 },
  oz: { label: 'Ounce (weight)', short: 'oz', kind: 'mass', base: 28.3495 },
  lb: { label: 'Pound', short: 'lb', kind: 'mass', base: 453.592 },
  g: { label: 'Gram', short: 'g', kind: 'mass', base: 1 },
  kg: { label: 'Kilogram', short: 'kg', kind: 'mass', base: 1000 },
}

const ORDER: Unit[] = ['floz', 'ml', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg']

export default function KitchenUnitConverter() {
  const [value, setValue] = useState('16')
  const [from, setFrom] = useState<Unit>('floz')
  const [to, setTo] = useState<Unit>('cup')

  const result = useMemo(() => {
    const v = toNumber(value)
    if (!Number.isFinite(v) || v < 0) return '—'
    return round((v * UNITS[from].base) / UNITS[to].base, 2)
  }, [value, from, to])

  const cross = UNITS[from].kind !== UNITS[to].kind

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <>
      <Seo
        title="Kitchen Unit Converter - vimz Tools"
        description="Convert kitchen units like oz, lb, cup, ml and grams. Free baking unit converter."
      />
      <ToolShell
        title="Kitchen Unit Converter"
        description="Convert kitchen units like oz, lb, cup, ml and grams."
        icon={<ArrowLeftRight className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Convert between ounces, pounds, cups and milliliters."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Convert a value</h3>
            <Field label="Amount">
              <TextInput inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
            <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <Field label="From">
                <Select value={from} onChange={(e) => setFrom(e.target.value as Unit)}>
                  {ORDER.map((u) => (
                    <option key={u} value={u}>
                      {UNITS[u].label} ({UNITS[u].short})
                    </option>
                  ))}
                </Select>
              </Field>
              <button
                onClick={swap}
                className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:border-primary-500 hover:text-primary-600"
                aria-label="Swap units"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
              <Field label="To">
                <Select value={to} onChange={(e) => setTo(e.target.value as Unit)}>
                  {ORDER.map((u) => (
                    <option key={u} value={u}>
                      {UNITS[u].label} ({UNITS[u].short})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {cross && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                Volume ↔ weight assumes water density (1 ml ≈ 1 g).
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
              {value || '0'} {UNITS[from].short} =
            </p>
            <p className="mt-2 text-5xl font-extrabold text-primary-800">
              {result === '—' ? '—' : result} {UNITS[to].short}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary-100 bg-white px-3 py-3">
                <Weight className="mx-auto mb-1 h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-400">family</p>
                <p className="text-sm font-bold capitalize text-slate-700">{UNITS[from].kind}</p>
              </div>
              <div className="rounded-xl border border-primary-100 bg-white px-3 py-3">
                <Beaker className="mx-auto mb-1 h-4 w-4 text-slate-400" />
                <p className="text-xs text-slate-400">family</p>
                <p className="text-sm font-bold capitalize text-slate-700">{UNITS[to].kind}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Reference</h3>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-slate-100 sm:grid-cols-3">
            {[
              ['1 cup', '8 fl oz · 240 ml'],
              ['3 tsp', '1 tbsp · 15 ml'],
              ['2 tbsp', '1 fl oz · 30 ml'],
              ['1 lb', '16 oz · 454 g'],
              ['1 oz water', '≈ 30 ml'],
              ['1 kg', '2.2 lb'],
            ].map(([a, b]) => (
              <div key={a} className="bg-white p-3 text-sm">
                <p className="font-bold text-slate-800">{a}</p>
                <p className="text-xs text-slate-500">{b}</p>
              </div>
            ))}
          </div>
        </section>
      </ToolShell>
    </>
  )
}