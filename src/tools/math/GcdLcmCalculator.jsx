import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculateGcdLcm } from '@tool-core/math/gcdLcm.js'

export default function GcdLcmCalculator() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const calculate = () => {
    setErr(''); setResult(null)
    const x = parseInt(a), y = parseInt(b)
    if (!x || !y) { setErr('Enter two positive integers.'); return }
    try {
      const res = calculateGcdLcm({ a: x, b: y })
      setResult({ gcd: res.gcd, lcm: res.lcm })
    } catch (e) {
      setErr(e.message)
    }
  }
  return (
    <div>
      <div className="row">
        <Field label="Number A"><input type="number" value={a} onChange={e=>setA(e.target.value)} placeholder="12" /></Field>
        <Field label="Number B"><input type="number" value={b} onChange={e=>setB(e.target.value)} placeholder="18" /></Field>
      </div>
      <div className="actions"><button className="btn" onClick={calculate}>Calculate</button></div>
      <Msg>{err}</Msg>
      {result && <div className="out" role="status"><p><strong>GCD:</strong> {result.gcd}</p><p><strong>LCM:</strong> {result.lcm}</p></div>}
      <p className="hint">Enter two positive integers.</p>
    </div>
  )
}
