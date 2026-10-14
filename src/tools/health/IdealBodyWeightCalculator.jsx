import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateIdealBodyWeight } from '@tool-core/health/idealBodyWeight.js'
import { useAutoFillParams } from '@/hooks/useAutoFillParams.js'

export default function IdealBodyWeightCalculator() {
  const params = useAutoFillParams({ height: '175', gender: 'male' })
  const [heightCm, setHeightCm] = useState(params.height)
  const [gender, setGender] = useState(params.gender)
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const result = calculateIdealBodyWeight({ heightCm, gender })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setHeightCm('175'); setGender('male'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        
        <Field label="Gender">
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        
        <Field label="Height (cm)">
          <input type="number"  value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="" />
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