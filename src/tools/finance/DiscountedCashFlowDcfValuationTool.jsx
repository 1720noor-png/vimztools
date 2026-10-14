import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculateDcfValuation } from '@tool-core/finance/dcfValuation.js'

export default function DiscountedCashFlowDcfValuationTool() {
  const [fcf, setFcf] = useState('500000')
  const [growthRate, setGrowthRate] = useState('10')
  const [termRate, setTermRate] = useState('2.5')
  const [wacc, setWacc] = useState('8.5')
  const [shares, setShares] = useState('100000')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const outcome = calculateDcfValuation({
        fcf,
        growthRate,
        termRate,
        wacc,
        shares
      })
      setRes({ val: outcome.summary, copyText: outcome.copyText })
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setFcf('500000'); setGrowthRate('10'); setTermRate('2.5'); setWacc('8.5'); setShares('100000'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        <Field label="Current Free Cash Flow ($)">
          <input type="number" value={fcf} onChange={(e) => setFcf(e.target.value)} placeholder="" />
        </Field>
        <Field label="Expected Growth Rate Yr 1-5 (%)">
          <input type="number" step="0.1" value={growthRate} onChange={(e) => setGrowthRate(e.target.value)} placeholder="" />
        </Field>
        <Field label="Terminal Growth Rate (%)">
          <input type="number" step="0.1" value={termRate} onChange={(e) => setTermRate(e.target.value)} placeholder="" />
        </Field>
        <Field label="Discount Rate / WACC (%)">
          <input type="number" step="0.1" value={wacc} onChange={(e) => setWacc(e.target.value)} placeholder="" />
        </Field>
        <Field label="Shares Outstanding">
          <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="" />
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