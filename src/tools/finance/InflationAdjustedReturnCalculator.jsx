import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateInflationAdjustedReturn } from '@tool-core/finance/inflationAdjustedReturn.js'

export default function InflationAdjustedReturnCalculator() {
  const [nominalReturn, setNominalReturn] = useState('9.5')
  const [inflationRate, setInflationRate] = useState('3.2')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateInflationAdjustedReturn({
        nominalReturn,
        inflationRate
      })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setNominalReturn('9.5'); setInflationRate('3.2'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Nominal Investment Return (%)">
          <input type="number" step="0.1" value={nominalReturn} onChange={(e) => setNominalReturn(e.target.value)} placeholder="" />
        </Field>
        <Field label="Annual Inflation Rate (%)">
          <input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} placeholder="" />
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