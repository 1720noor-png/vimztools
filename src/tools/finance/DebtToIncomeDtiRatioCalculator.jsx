import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateDebtToIncome } from '@tool-core/finance/debtToIncome.js'

export default function DebtToIncomeDtiRatioCalculator() {
  const [income, setIncome] = useState('7500')
  const [housing, setHousing] = useState('1800')
  const [auto, setAuto] = useState('350')
  const [otherDebt, setOtherDebt] = useState('300')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateDebtToIncome({
        income,
        housing,
        auto,
        otherDebt
      })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setIncome('7500'); setHousing('1800'); setAuto('350'); setOtherDebt('300'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Gross Monthly Income ($)">
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="" />
        </Field>
        <Field label="Monthly Housing Debt / Rent ($)">
          <input type="number" value={housing} onChange={(e) => setHousing(e.target.value)} placeholder="" />
        </Field>
        <Field label="Monthly Car Payments ($)">
          <input type="number" value={auto} onChange={(e) => setAuto(e.target.value)} placeholder="" />
        </Field>
        <Field label="Student Loans & Credit Minimums ($)">
          <input type="number" value={otherDebt} onChange={(e) => setOtherDebt(e.target.value)} placeholder="" />
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