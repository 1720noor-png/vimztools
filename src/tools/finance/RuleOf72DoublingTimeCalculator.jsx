import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateRuleOf72 } from '@tool-core/finance/ruleOf72.js'

export default function RuleOf72DoublingTimeCalculator() {
  const [rate, setRate] = useState('7.2')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateRuleOf72({ rate })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setRate('7.2'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Annual Interest Rate / Return (%)">
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="" />
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