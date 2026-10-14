import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateStandardDeviation } from '@tool-core/math/standardDeviation.js'

export default function StandardDeviationVarianceCalculator() {
  const [numbers, setNumbers] = useState('12, 15, 18, 22, 25, 30')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const result = calculateStandardDeviation({ numbers })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setNumbers('12, 15, 18, 22, 25, 30'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        
        
        <Field label="Data Set (Comma separated numbers)">
          <input type="text"  value={numbers} onChange={(e) => setNumbers(e.target.value)} placeholder="" />
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