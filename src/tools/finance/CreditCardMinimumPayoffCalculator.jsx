import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateCreditCardPayoff } from '@tool-core/finance/creditCardPayoff.js'

export default function CreditCardMinimumPayoffCalculator() {
  const [balance, setBalance] = useState('5000')
  const [apr, setApr] = useState('21.9')
  const [fixedPayment, setFixedPayment] = useState('200')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateCreditCardPayoff({
        balance,
        apr,
        fixedPayment
      })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setBalance('5000'); setApr('21.9'); setFixedPayment('200'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Credit Card Balance ($)">
          <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="" />
        </Field>
        <Field label="Card APR (%)">
          <input type="number" step="0.1" value={apr} onChange={(e) => setApr(e.target.value)} placeholder="" />
        </Field>
        <Field label="Fixed Monthly Payment ($)">
          <input type="number" value={fixedPayment} onChange={(e) => setFixedPayment(e.target.value)} placeholder="" />
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