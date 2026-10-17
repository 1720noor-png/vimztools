import { useMemo, useState } from 'react'
import { Thermometer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

export default function FeverAssessment() {
  const [temp, setTemp] = useState('36.6')
  const [unit, setUnit] = useState('c')

  const result = useMemo(() => {
    const v = toNumber(temp)
    if (!Number.isFinite(v)) return null
    const celsius = unit === 'c' ? v : ((v - 32) * 5) / 9
    const band =
      celsius < 35
        ? { label: 'Low (hypothermia range) - seek advice', color: 'text-rose-600' }
        : celsius <= 37.2
          ? { label: 'Normal', color: 'text-emerald-600' }
          : celsius <= 37.9
            ? { label: 'Low-grade temperature', color: 'text-amber-600' }
            : celsius <= 39.4
              ? { label: 'Fever', color: 'text-orange-600' }
              : { label: 'High fever - seek advice', color: 'text-rose-600' }
    const fahrenheit = (celsius * 9) / 5 + 32
    return { celsius, fahrenheit, band }
  }, [temp, unit])

  return (
    <>
      <Seo
        title="Fever & Temperature Assessment - vimz Tools"
        description="Interpret temperature readings in °C or °F and see typical fever bands."
      />
      <ToolShell
        title="Fever & Temperature Assessment"
        description="Interprets a temperature reading in °C or °F against common adult oral fever bands. An educational guide, not a diagnosis."
        icon={<Thermometer className="h-6 w-6" />}
        breadcrumb="Health / Symptoms"
        instruction="Enter your temperature and the unit it was measured in."
        guideSteps={[
          { title: 'Enter your temperature', text: 'Type the reading exactly as your thermometer showed it.' },
          { title: 'Select the unit', text: 'Celsius or Fahrenheit - whichever your thermometer uses.' },
          { title: 'Read the band', text: 'See where the reading falls and what it usually suggests.' },
        ]}
        guideTips={[
          'In adults, a temperature of 38°C (100.4°F) or above is generally considered a fever.',
          'Children and babies can respond differently - trust your instincts and seek care early.',
          'If a high fever persists, or comes with a stiff neck, rash, confusion or breathing trouble, seek medical help promptly.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Your reading</h3>
            <div className="space-y-3">
              <Field label="Temperature">
                <TextInput type="number" min={30} max={45} step={0.1} value={temp} onChange={(e) => setTemp(e.target.value)} />
              </Field>
              <Field label="Unit">
                <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option value="c">Celsius (°C)</option>
                  <option value="f">Fahrenheit (°F)</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assessment</p>
              <p className="mt-2 text-5xl font-extrabold text-slate-900">
                {result ? `${round(unit === 'c' ? result.celsius : result.fahrenheit, 1)}°${unit.toUpperCase()}` : '—'}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {result ? `≈ ${round(result.celsius, 1)}°C / ${round(result.fahrenheit, 1)}°F` : ''}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${result ? (result.celsius < 35 || result.celsius >= 39.5 ? 'bg-rose-500' : result.celsius <= 37.2 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-300'}`} />
                <span className={result ? result.band.color : 'text-slate-400'}>
                  {result ? result.band.label : 'Enter a reading'}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Common adult oral bands</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><span className="font-semibold text-emerald-600">&lt; 35°C (95°F)</span> - Low range - seek advice</li>
                <li><span className="font-semibold text-emerald-600">35.0 - 37.2°C</span> - Normal</li>
                <li><span className="font-semibold text-amber-600">37.3 - 37.9°C</span> - Low-grade temperature</li>
                <li><span className="font-semibold text-orange-600">38.0 - 39.4°C</span> - Fever</li>
                <li><span className="font-semibold text-rose-600">39.5°C+</span> - High fever - seek advice</li>
              </ul>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}