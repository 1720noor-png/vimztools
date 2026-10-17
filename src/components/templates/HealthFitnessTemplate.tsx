import { useMemo, useState } from 'react'
import { Activity, HeartPulse, Ruler, Dumbbell } from 'lucide-react'
import { TemplateShell, inputCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

const ACTIVITY_FACTORS = [
  { value: '1.2', label: 'Sedentary (little or no exercise)' },
  { value: '1.375', label: 'Lightly active (1–3 days/week)' },
  { value: '1.55', label: 'Moderately active (3–5 days/week)' },
  { value: '1.725', label: 'Very active (6–7 days/week)' },
  { value: '1.9', label: 'Extremely active (hard training / physical job)' },
]

const CM_PER_INCH = 2.54
const LB_PER_KG = 2.2046226218

const fmt = (n: number, digits = 1) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'

function bodyFatCategories(): Array<{ label: string; male: [number, number]; female: [number, number] }> {
  return [
    { label: 'Essential fat', male: [3, 5], female: [10, 13] },
    { label: 'Athletes', male: [6, 13], female: [14, 20] },
    { label: 'Fitness', male: [14, 17], female: [21, 24] },
    { label: 'Average', male: [18, 24], female: [25, 31] },
    { label: 'Obese', male: [25, 100], female: [32, 100] },
  ]
}

function bodyFatCategory(sex: 'male' | 'female', pct: number): string {
  const range = bodyFatCategories().find((r) => pct >= (sex === 'male' ? r.male[0] : r.female[0]) && pct <= (sex === 'male' ? r.male[1] : r.female[1]))
  return (range?.label ?? 'Unavailable')
}

export function HealthFitnessTemplate({ tool }: { tool: RegistryTool }) {
  const [sex, setSex] = useState<'male' | 'female'>('male')
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [neck, setNeck] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [activity, setActivity] = useState('1.375')

  // All conversions keep internal metric (kg, cm).
  const hCm = useMemo(() => {
    const v = parseFloat(height)
    return Number.isFinite(v) && v > 0 ? (unitSystem === 'imperial' ? v * CM_PER_INCH : v) : NaN
  }, [height, unitSystem])

  const wKg = useMemo(() => {
    const v = parseFloat(weight)
    return Number.isFinite(v) && v > 0 ? (unitSystem === 'imperial' ? v / LB_PER_KG : v) : NaN
  }, [weight, unitSystem])

  const nCm = useMemo(() => {
    const v = parseFloat(neck)
    return Number.isFinite(v) && v > 0 ? (unitSystem === 'imperial' ? v * CM_PER_INCH : v) : NaN
  }, [neck, unitSystem])

  const waCm = useMemo(() => {
    const v = parseFloat(waist)
    return Number.isFinite(v) && v > 0 ? (unitSystem === 'imperial' ? v * CM_PER_INCH : v) : NaN
  }, [waist, unitSystem])

  const hCm2 = useMemo(() => {
    const v = parseFloat(hip)
    return Number.isFinite(v) && v > 0 ? (unitSystem === 'imperial' ? v * CM_PER_INCH : v) : NaN
  }, [hip, unitSystem])

  const metrics = useMemo(() => {
    const ageN = parseFloat(age)
    const ready = Number.isFinite(ageN) && ageN > 0 && Number.isFinite(hCm) && hCm > 0 && Number.isFinite(wKg) && wKg > 0
    if (!ready) return null

    const m = hCm / 100
    const bmi = wKg / (m * m)

    let bodyFat: number | null = null
    if (Number.isFinite(waCm) && waCm > 0 && (sex === 'male' ? Number.isFinite(nCm) && nCm > 0 : Number.isFinite(nCm) && nCm > 0 && Number.isFinite(hCm2) && hCm2 > 0)) {
      if (sex === 'male') {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waCm - nCm) + 0.15456 * Math.log10(hCm)) - 450
      } else {
        bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waCm + hCm2 - nCm) + 0.221 * Math.log10(hCm)) - 450
      }
    }

    const bmr = sex === 'male' ? 10 * wKg + 6.25 * hCm - 5 * ageN + 5 : 10 * wKg + 6.25 * hCm - 5 * ageN - 161
    const factor = parseFloat(activity) || 1.375
    const tdee = bmr * factor

    return {
      bmi,
      bmiCategory: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese',
      bodyFat,
      bodyFatLabel: bodyFat === null ? null : bodyFatCategory(sex, bodyFat),
      bmr,
      tdee,
      healthyLow: 18.5 * m * m,
      healthyHigh: 24.9 * m * m,
    }
  }, [age, activity, hCm, hCm2, nCm, sex, wKg, waCm])

  const metricInputs = [
    { key: 'height', label: 'Height', value: height, set: setHeight, suffix: unitSystem === 'imperial' ? 'in' : 'cm', hint: 'e.g. 170 / 67' },
    { key: 'weight', label: 'Weight', value: weight, set: setWeight, suffix: unitSystem === 'imperial' ? 'lb' : 'kg', hint: 'e.g. 70 / 154' },
    { key: 'neck', label: 'Neck measurement', value: neck, set: setNeck, suffix: unitSystem === 'imperial' ? 'in' : 'cm', hint: 'below the larynx' },
    { key: 'waist', label: 'Waist measurement', value: waist, set: setWaist, suffix: unitSystem === 'imperial' ? 'in' : 'cm', hint: 'at navel height' },
  ]

  const imgBase = 'grid grid-cols-1 gap-4 sm:grid-cols-2'

  return (
    <TemplateShell tool={tool} description={tool.description}>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSex('male')}
            className={`rounded-lg px-4 py-2 text-sm transition ${sex === 'male' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setSex('female')}
            className={`rounded-lg px-4 py-2 text-sm transition ${sex === 'female' ? 'bg-white font-bold text-slate-900 shadow-sm' : 'font-medium text-slate-500 hover:text-slate-800'}`}
          >
            Female
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          Units
          <select className={inputCls} value={unitSystem} onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')} style={{ width: '9rem' }}>
            <option value="metric">Metric (kg, cm)</option>
            <option value="imperial">Imperial (lb, in)</option>
          </select>
        </label>
      </div>

      <div className={imgBase}>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Age</label>
          <input type="number" className={inputCls} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 30" min={10} max={120} />
        </div>
        {metricInputs.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
              {f.label} <span className="normal-case text-slate-400">({f.suffix})</span>
            </label>
            <div className="relative">
              <input type="number" step="any" className={inputCls} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.hint} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{f.suffix}</span>
            </div>
          </div>
        ))}
        {sex === 'female' && (
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">
              Hip measurement <span className="normal-case text-slate-400">({unitSystem === 'imperial' ? 'in' : 'cm'})</span>
            </label>
            <div className="relative">
              <input type="number" step="any" className={inputCls} value={hip} onChange={(e) => setHip(e.target.value)} placeholder={unitSystem === 'imperial' ? 'e.g. 40' : 'e.g. 102'} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">{unitSystem === 'imperial' ? 'in' : 'cm'}</span>
            </div>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Activity level</label>
          <select className={inputCls} value={activity} onChange={(e) => setActivity(e.target.value)}>
            {ACTIVITY_FACTORS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {metrics ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-primary-600">
              <Ruler className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">BMI</p>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{fmt(metrics.bmi, 1)}</p>
            <p className="mt-1 text-sm font-semibold text-primary-700">{metrics.bmiCategory}</p>
            <p className="mt-2 text-xs text-slate-500">
              Healthy range: {fmt(metrics.healthyLow, 1)}–{fmt(metrics.healthyHigh, 1)} {unitSystem === 'imperial' ? 'lb' : 'kg'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-primary-600">
              <Activity className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Body fat (US Navy)</p>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {metrics.bodyFat === null ? '—' : `${fmt(metrics.bodyFat, 1)}%`}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary-700">{metrics.bodyFatLabel ?? 'Enter neck & waist to estimate'}</p>
            <p className="mt-2 text-xs text-slate-500">
              {metrics.bodyFat === null
                ? 'Neck + waist (and hip for women) measurements required.'
                : 'Estimate based on circumference measurements.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-primary-600">
              <Dumbbell className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wide">Calories (Mifflin-St Jeor)</p>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{fmt(metrics.bmr, 0)}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">BMR / day</p>
            <p className="mt-2 text-xs text-slate-500">Maintenance ({fmt(metrics.tdee, 0)} kcal/day). Surplus +{fmt(metrics.tdee * 0.15, 0)}kcal for gain, deficit −{fmt(metrics.tdee * 0.2, 0)}kcal for fat loss.</p>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
          <HeartPulse className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">Enter your age, height and weight to see BMI, body-fat, BMR and daily calorie estimates.</p>
        </div>
      )}
    </TemplateShell>
  )
}