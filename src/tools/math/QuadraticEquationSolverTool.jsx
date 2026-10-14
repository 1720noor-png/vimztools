import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'
import { solveQuadratic } from '@tool-core/math/quadraticSolver.js'

export default function QuadraticEquationSolverTool() {
  const [a, setA] = useState('1')
  const [b, setB] = useState('-5')
  const [c, setC] = useState('6')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      const va = parseFloat(a)
      if (isNaN(va) || va === 0) return setErr('Enter valid quadratic coefficients (a ≠ 0).')
      setErr('')
      const result = solveQuadratic({ a, b, c })
      setRes(result)
    } catch (e) {
      setErr(e.message || 'Calculation error.')
    }
  }

  const reset = () => { setA('1'); setB('-5'); setC('6'); setRes(null); setErr('') }

  return (
    <div>
      <div className="row">
        
        
        <Field label="Coefficient a">
          <input type="number"  value={a} onChange={(e) => setA(e.target.value)} placeholder="" />
        </Field>
        <Field label="Coefficient b">
          <input type="number"  value={b} onChange={(e) => setB(e.target.value)} placeholder="" />
        </Field>
        <Field label="Coefficient c">
          <input type="number"  value={c} onChange={(e) => setC(e.target.value)} placeholder="" />
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