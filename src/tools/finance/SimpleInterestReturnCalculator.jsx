import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateSimpleInterest } from '@tool-core/finance/simpleInterest.js'

export default function SimpleInterestReturnCalculator() {
  const [principal, setPrincipal] = useState('5000')
  const [rate, setRate] = useState('5')
  const [years, setYears] = useState('3')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateSimpleInterest({ principal, rate, years })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setPrincipal('5000'); setRate('5'); setYears('3'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Principal Amount ($)">
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="" />
        </Field>
        <Field label="Annual Interest Rate (%)">
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="" />
        </Field>
        <Field label="Time Period (Years)">
          <input type="number" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} placeholder="" />
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