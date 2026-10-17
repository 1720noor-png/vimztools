import { useMemo, useState } from 'react'
import { GlassWater, Droplets, Flame } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const activityMultipliers = [
  { value: '1.2', label: 'Sedentary' },
  { value: '1.375', label: 'Light (1–3 days/week)' },
  { value: '1.55', label: 'Moderate (3–5 days/week)' },
  { value: '1.725', label: 'Active (6–7 days/week)' },
  { value: '1.9', label: 'Very Active (athlete)' },
]

export default function WaterCalorie() {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [activity, setActivity] = useState('1.55')
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg')
  const [unitH, setUnitH] = useState<'cm' | 'in'>('cm')
  const [showResult, setShowResult] = useState(false)

  const wKg = unit === 'kg' ? weight : weight * 0.453592
  const hCm = unitH === 'cm' ? height : height * 2.54

  const result = useMemo(() => {
    if (wKg <= 0 || hCm <= 0 || age <= 0) return null
    const bmr = gender === 'male'
      ? 10 * wKg + 6.25 * hCm - 5 * age + 5
      : 10 * wKg + 6.25 * hCm - 5 * age - 161
    const tdee = bmr * Number(activity)
    const waterLiters = Math.max(1.5, (wKg / 30) * 0.033 * 30)
    const bfp = gender === 'male'
      ? 1.2010839 * Math.log10(wKg + hCm * 0.467 - 47.241)
      : 1.20096 * Math.log10(wKg + hCm * 0.467 - 58.753)
    const bfPct = Math.max(3, Math.min(50, bfp))
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      water: waterLiters.toFixed(1),
      bodyFat: bfPct.toFixed(1),
      goalLoss: Math.round(tdee - 500),
      goalGain: Math.round(tdee + 300),
    }
  }, [gender, wKg, hCm, age, activity])

  return (
    <>
      <Seo
        title="Water & Calorie Calculator - vimz Tools"
        description="Calculate your BMR, TDEE and daily water intake targets. Uses Mifflin-St Jeor for accurate results. 100% private."
      />
      <ToolShell
        title="Water & Calorie Calculator"
        description="Evaluate your BMR, TDEE, recommended water intake and estimate body fat percentage using the Mifflin-St Jeor formula."
        icon={<GlassWater className="h-6 w-6" />}
        breadcrumb="Health & Life"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800">Your stats</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setGender('male')}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${gender === 'male' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600'}`}
              >
                Male
              </button>
              <button
                onClick={() => setGender('female')}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${gender === 'female' ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600'}`}
              >
                Female
              </button>
            </div>
            <Field label="Age">
              <TextInput type="number" min={1} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </Field>
            <Field label="Weight">
              <div className="flex gap-2">
                <TextInput type="number" min={10} max={300} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="flex-1" />
                <select value={unit} onChange={(e) => setUnit(e.target.value as 'kg' | 'lb')} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200">
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </Field>
            <Field label="Height">
              <div className="flex gap-2">
                <TextInput type="number" min={80} max={250} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="flex-1" />
                <select value={unitH} onChange={(e) => setUnitH(e.target.value as 'cm' | 'in')} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200">
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
            </Field>
            <Field label="Activity level">
              <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200">
                {activityMultipliers.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </Field>
            <Button onClick={() => setShowResult(true)} className="w-full">
              Calculate
            </Button>
          </div>

          {result && showResult && (
            <div className="space-y-5 lg:col-span-2">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5 text-center">
                  <Flame className="mx-auto mb-2 h-5 w-5 text-primary-600" />
                  <p className="text-xs font-semibold uppercase text-primary-500">BMR</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary-800">{result.bmr}</p>
                  <p className="text-[11px] text-primary-400">kcal / day</p>
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-center">
                  <Droplets className="mx-auto mb-2 h-5 w-5 text-sky-600" />
                  <p className="text-xs font-semibold uppercase text-sky-500">Water</p>
                  <p className="mt-1 text-2xl font-extrabold text-sky-700">{result.water}</p>
                  <p className="text-[11px] text-sky-400">liters / day</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                  <Flame className="mx-auto mb-2 h-5 w-5 text-amber-600" />
                  <p className="text-xs font-semibold uppercase text-amber-500">TDEE</p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-700">{result.tdee}</p>
                  <p className="text-[11px] text-amber-400">kcal / day</p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
                  <Droplets className="mx-auto mb-2 h-5 w-5 text-rose-600" />
                  <p className="text-xs font-semibold uppercase text-rose-500">Est. body fat</p>
                  <p className="mt-1 text-2xl font-extrabold text-rose-700">{result.bodyFat}%</p>
                  <p className="text-[11px] text-rose-400">Navy formula est.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="text-sm font-bold text-slate-800">🎯 Goal: lose weight</h4>
                  <p className="mt-2 text-sm text-slate-600">Eat ~ <span className="font-bold text-primary-700">{result.goalLoss}</span> kcal/day for ~0.5 kg loss/week</p>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-rose-400" style={{ width: `${(result.goalLoss / result.tdee) * 100}%` }} />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h4 className="text-sm font-bold text-slate-800">💪 Goal: gain muscle</h4>
                  <p className="mt-2 text-sm text-slate-600">Eat ~ <span className="font-bold text-primary-700">{result.goalGain}</span> kcal/day for controlled gain</p>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${Math.min(100, (result.goalGain / (result.tdee * 1.3)) * 100)}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-slate-400">
                Estimates only. Always verify with a medical professional.
              </p>
            </div>
          )}
        </div>
      </ToolShell>
    </>
  )
}