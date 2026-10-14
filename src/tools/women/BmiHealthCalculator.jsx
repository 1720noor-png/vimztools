import { useState } from 'react'
import { calculateBmi } from '@tool-core/health/bmiCalculator.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams.js'

export default function BmiHealthCalculator() {
  const params = useAutoFillParams({
    unit: 'metric',
    height: '165',
    weight: '62',
    age: '28'
  })

  const [unitSystem, setUnitSystem] = useState(params.unit) // 'metric' | 'imperial'
  const [heightCm, setHeightCm] = useState(params.height)
  const [weightKg, setWeightKg] = useState(params.weight)
  const [heightFeet, setHeightFeet] = useState(5)
  const [heightInches, setHeightInches] = useState(5)
  const [weightLbs, setWeightLbs] = useState(136)
  const [age, setAge] = useState(params.age)

  let heightMeters = heightCm / 100
  let weightNum = parseFloat(weightKg) || 0

  if (unitSystem === 'imperial') {
    const totalInches = (parseFloat(heightFeet) || 0) * 12 + (parseFloat(heightInches) || 0)
    heightMeters = totalInches * 0.0254
    weightNum = (parseFloat(weightLbs) || 0) * 0.453592
  }

  let bmi = 0
  let idealWeightMin = 0
  let idealWeightMax = 0
  let catInfo = { category: 'Normal / Healthy Weight', color: 'var(--ok)' }

  if (weightNum > 0 && heightMeters > 0) {
    try {
      const res = calculateBmi({ weight: weightNum, height: heightMeters })
      bmi = res.bmiFormatted
      idealWeightMin = res.healthyWeightMinKg
      idealWeightMax = res.healthyWeightMaxKg
      if (res.bmi < 18.5) catInfo = { category: 'Underweight', color: 'var(--brand)' }
      else if (res.bmi <= 24.9) catInfo = { category: 'Normal / Healthy Weight', color: 'var(--ok)' }
      else if (res.bmi <= 29.9) catInfo = { category: 'Overweight', color: '#f59e0b' }
      else catInfo = { category: 'Obesity Range', color: 'var(--bad)' }
    } catch {}
  }

  // Female Mifflin-St Jeor BMR formula
  const bmr = Math.round(10 * weightNum + 6.25 * (heightMeters * 100) - 5 * (parseFloat(age) || 25) - 161)

  return (
    <div className="panel">
      <h2>BMI & Health Metrics Calculator</h2>
      <p className="hint">Calculate Body Mass Index (BMI), BMR, and healthy target weight ranges. (Designed for adults 18+).</p>

      <div className="actions" style={{ marginBottom: '1.2rem' }}>
        <button className={`btn ${unitSystem === 'metric' ? '' : 'ghost'}`} onClick={() => setUnitSystem('metric')}>Metric (cm / kg)</button>
        <button className={`btn ${unitSystem === 'imperial' ? '' : 'ghost'}`} onClick={() => setUnitSystem('imperial')}>Imperial (ft, in / lbs)</button>
      </div>

      <div className="row">
        <div className="field">
          <span>Age</span>
          <input type="number" min={18} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>

        {unitSystem === 'metric' ? (
          <>
            <div className="field">
              <span>Height (cm)</span>
              <input type="number" min={100} max={230} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div className="field">
              <span>Weight (kg)</span>
              <input type="number" min={30} max={250} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <span>Height (Feet & Inches)</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input type="number" min={3} max={7} value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} placeholder="ft" />
                <input type="number" min={0} max={11} value={heightInches} onChange={(e) => setHeightInches(e.target.value)} placeholder="in" />
              </div>
            </div>
            <div className="field">
              <span>Weight (lbs)</span>
              <input type="number" min={60} max={500} value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="out" style={{ marginTop: '1.5rem' }}>
        <h3>Your Health Metrics Summary</h3>
        <div className="row" style={{ marginBottom: '1rem' }}>
          <div>
            BMI Score: <strong style={{ fontSize: '1.6rem', color: catInfo.color }}>{bmi}</strong>
          </div>
          <div>
            Category: <strong style={{ color: catInfo.color }}>{catInfo.category}</strong>
          </div>
          <div>
            BMR (Base Caloric Rate): <strong>{bmr} kcal/day</strong>
          </div>
          <div>
            Healthy Weight Range:{' '}
            <strong>
              {idealWeightMin} - {idealWeightMax} {unitSystem === 'metric' ? 'kg' : 'kg'}
            </strong>
          </div>
        </div>

        <p className="hint" style={{ fontSize: '0.85rem' }}>
          Note: BMR calculation uses the Mifflin-St Jeor formula calibrated for adult females.
        </p>
      </div>
    </div>
  )
}
