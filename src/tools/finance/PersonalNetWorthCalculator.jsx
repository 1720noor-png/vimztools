import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculatePersonalNetWorth } from '@tool-core/finance/personalNetWorth.js'

export default function PersonalNetWorthCalculator() {
  const [cash, setCash] = useState('15000')
  const [investments, setInvestments] = useState('85000')
  const [property, setProperty] = useState('250000')
  const [debts, setDebts] = useState('190000')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculatePersonalNetWorth({
        cash,
        investments,
        property,
        debts
      })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setCash('15000'); setInvestments('85000'); setProperty('250000'); setDebts('190000'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Cash & Bank Accounts ($)">
          <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="" />
        </Field>
        <Field label="Investments & Retirement ($)">
          <input type="number" value={investments} onChange={(e) => setInvestments(e.target.value)} placeholder="" />
        </Field>
        <Field label="Real Estate & Car Value ($)">
          <input type="number" value={property} onChange={(e) => setProperty(e.target.value)} placeholder="" />
        </Field>
        <Field label="Mortgage, Loans & Credit Debt ($)">
          <input type="number" value={debts} onChange={(e) => setDebts(e.target.value)} placeholder="" />
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