import { useState } from 'react'
import { Field, CopyBtn, download } from '../../components/ui.jsx'
import { calculateBmrTdee } from '@tool-core/health/bmrTdeeCalculator.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams.js'

export default function BmrTdeeCalculator() {
  const params = useAutoFillParams({
    unit: 'metric',
    gender: 'male',
    age: '28',
    weight: '70',
    height: '175',
    activity: '1.375'
  })

  const [unit, setUnit] = useState(params.unit) // 'metric' or 'imperial'
  const [gender, setGender] = useState(params.gender)
  const [age, setAge] = useState(params.age)
  const [weight, setWeight] = useState(params.weight) // kg or lbs
  const [heightCm, setHeightCm] = useState(params.height)
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(9)
  const [activity, setActivity] = useState(params.activity) // light active

  const a = Number(age) || 0
  let wKg = Number(weight) || 0
  let hCm = Number(heightCm) || 0

  if (unit === 'imperial') {
    wKg = (Number(weight) || 0) * 0.453592
    hCm = ((Number(heightFt) || 0) * 12 + (Number(heightIn) || 0)) * 2.54
  }

  let bmr = 0
  let tdee = 0
  let cutCal = 0
  let bulkCal = 0

  if (wKg >= 20 && hCm >= 80 && a >= 10) {
    try {
      const res = calculateBmrTdee({
        weightKg: wKg,
        heightCm: hCm,
        age: a,
        gender,
        activity: Number(activity) || 1.375
      })
      bmr = res.bmr
      tdee = res.tdee
      cutCal = res.weightLossCalories
      bulkCal = res.muscleGainCalories
    } catch {}
  }

  const fmt = (num) => Math.round(num).toLocaleString('en-US') + ' kcal'

  const reportText = `BMR & TDEE Calorie Assessment
----------------------------------------------
Biological Sex: ${gender}
Age: ${age} years
Weight: ${weight} ${unit === 'metric' ? 'kg' : 'lbs'}
Height: ${unit === 'metric' ? `${heightCm} cm` : `${heightFt} ft ${heightIn} in`}

Basal Metabolic Rate (BMR): ${fmt(bmr)} / day
Total Daily Energy Expenditure (TDEE): ${fmt(tdee)} / day

Daily Calorie Targets:
• Weight Loss (-500 kcal): ${fmt(cutCal)} / day
• Maintenance: ${fmt(tdee)} / day
• Muscle Gain (+500 kcal): ${fmt(bulkCal)} / day`

  return (
    <div className="tool-body">
      <div className="actions" style={{ marginBottom: '1.2rem' }}>
        <button
          type="button"
          className={`btn ${unit === 'metric' ? '' : 'ghost'}`}
          onClick={() => setUnit('metric')}
        >
          Metric (kg / cm)
        </button>
        <button
          type="button"
          className={`btn ${unit === 'imperial' ? '' : 'ghost'}`}
          onClick={() => setUnit('imperial')}
        >
          Imperial (lbs / ft-in)
        </button>
      </div>

      <div className="row">
        <Field label="Sex">
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Age (years)">
          <input type="number" min="15" max="100" value={age} onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label={`Weight (${unit === 'metric' ? 'kg' : 'lbs'})`}>
          <input type="number" min="30" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>

        {unit === 'metric' ? (
          <Field label="Height (cm)">
            <input type="number" min="100" max="250" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </Field>
        ) : (
          <>
            <Field label="Height (Feet)">
              <input type="number" min="3" max="8" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
            </Field>
            <Field label="Height (Inches)">
              <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
            </Field>
          </>
        )}

        <Field label="Activity Level">
          <select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="1.2">Sedentary (Little or no exercise)</option>
            <option value="1.375">Lightly Active (1-3 days/week)</option>
            <option value="1.55">Moderately Active (3-5 days/week)</option>
            <option value="1.725">Very Active (6-7 days/week)</option>
            <option value="1.9">Extra Active (Hard physical job/sports)</option>
          </select>
        </Field>
      </div>

      <div className="out">
        <div>Maintenance TDEE: <strong>{fmt(tdee)}</strong> per day</div>
        <div className="hint" style={{ marginTop: '0.4rem' }}>
          Basal Metabolic Rate (BMR): {fmt(bmr)} (calories burned at total rest)
        </div>
      </div>

      <div className="scroll" style={{ marginTop: '1rem' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Daily Calories</th>
              <th>Weekly Pace</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fat Loss (Caloric Deficit)</td>
              <td className="good"><strong>{fmt(cutCal)}</strong></td>
              <td>Lose ~0.5 kg (1 lb) per week</td>
            </tr>
            <tr className="best">
              <td>Maintain Weight</td>
              <td><strong>{fmt(tdee)}</strong></td>
              <td>Stay constant</td>
            </tr>
            <tr>
              <td>Muscle Gain (Caloric Surplus)</td>
              <td><strong>{fmt(bulkCal)}</strong></td>
              <td>Gain ~0.5 kg (1 lb) per week</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="actions">
        <CopyBtn text={reportText} label="Copy Assessment" />
        <button type="button" className="btn ghost" onClick={() => download('bmr-tdee-report.txt', reportText)}>
          Download Report (.txt)
        </button>
      </div>
    </div>
  )
}
