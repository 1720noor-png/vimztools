import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateCalorieDeficit } from '@tool-core/health/calorieDeficit.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams.js'

export default function CalorieDeficitWeightLossPlanner() {
  const params = useAutoFillParams({ current: '185', target: '165', tdee: '2400', weeks: '10' })
  const [currentWt, setCurrentWt] = useState(params.current)
  const [targetWt, setTargetWt] = useState(params.target)
  const [tdee, setTdee] = useState(params.tdee)
  const [weeks, setWeeks] = useState(params.weeks)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const result = calculateCalorieDeficit({
        currentWeight: currentWt,
        targetWeight: targetWt,
        maintenanceTdee: tdee,
        timelineWeeks: weeks,
        unit: 'lbs'
      })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setCurrentWt('185'); setTargetWt('165'); setTdee('2400'); setWeeks('10'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        
        
        <Field label="Current Weight (lbs)">
          <input type="number"  value={currentWt} onChange={(e) => setCurrentWt(e.target.value)} placeholder="" />
        </Field>
        <Field label="Target Goal Weight (lbs)">
          <input type="number"  value={targetWt} onChange={(e) => setTargetWt(e.target.value)} placeholder="" />
        </Field>
        <Field label="Daily Maintenance Calories (TDEE)">
          <input type="number"  value={tdee} onChange={(e) => setTdee(e.target.value)} placeholder="" />
        </Field>
        <Field label="Timeline (Weeks)">
          <input type="number"  value={weeks} onChange={(e) => setWeeks(e.target.value)} placeholder="" />
        </Field>
      </div>
      <div className="actions" style={{ marginTop: '1rem' }}>
        <button className="btn" onClick={calc}>Calculate / Process</button>
        <button className="btn ghost" onClick={reset}>Reset</button>
      </div>
      <Msg>{err}</Msg>
      {res && (
        <div className="out" role="status" style={{ marginTop: '1rem' }}>
          {typeof res === 'string' ? (
            <p>Result: <strong>{res}</strong></p>
          ) : (
            <div>
              <p>Result: <strong>{res.val}</strong></p>
            </div>
          )}
          <CopyBtn text={typeof res === 'string' ? res : (res.copyText || JSON.stringify(res))} />
        </div>
      )}
    </div>
  )
}