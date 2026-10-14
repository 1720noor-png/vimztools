import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { calculatePermutationsCombinations } from '@tool-core/math/permutationsCombinations.js'

export default function PermutationsCombinationsCalculator() {
  const [nVal, setNVal] = useState('10')
  const [rVal, setRVal] = useState('3')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      setErr('')
      const result = calculatePermutationsCombinations({ n: nVal, r: rVal })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setNVal('10'); setRVal('3'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        
        
        <Field label="Total Items (n)">
          <input type="number"  value={nVal} onChange={(e) => setNVal(e.target.value)} placeholder="" />
        </Field>
        <Field label="Items Selected (r)">
          <input type="number"  value={rVal} onChange={(e) => setRVal(e.target.value)} placeholder="" />
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