import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateEmergencySavingsFund } from '@tool-core/finance/emergencySavingsFund.js'

export default function EmergencySavingsFundCalculator() {
  const [housing, setHousing] = useState('1600')
  const [utilities, setUtilities] = useState('350')
  const [food, setFood] = useState('600')
  const [other, setOther] = useState('450')
  const [months, setMonths] = useState('6')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateEmergencySavingsFund({
        housing,
        utilities,
        food,
        other,
        months
      })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setHousing('1600'); setUtilities('350'); setFood('600'); setOther('450'); setMonths('6'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Monthly Rent / Mortgage ($)">
          <input type="number" value={housing} onChange={(e) => setHousing(e.target.value)} placeholder="" />
        </Field>
        <Field label="Monthly Utilities & Bills ($)">
          <input type="number" value={utilities} onChange={(e) => setUtilities(e.target.value)} placeholder="" />
        </Field>
        <Field label="Monthly Food & Groceries ($)">
          <input type="number" value={food} onChange={(e) => setFood(e.target.value)} placeholder="" />
        </Field>
        <Field label="Other Essential Expenses ($)">
          <input type="number" value={other} onChange={(e) => setOther(e.target.value)} placeholder="" />
        </Field>
        <Field label="Desired Safety Buffer (Months)">
          <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="" />
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