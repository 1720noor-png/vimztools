import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculatePermutationsCombinations } from '@tool-core/math/permutationsCombinations.js'

export default function CombinationCalculator() {
  const [n, setN] = useState('')
  const [r, setR] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const calculate = () => {
    setErr(''); setResult(null)
    try {
      const res = calculatePermutationsCombinations({ n, r })
      setResult({ comb: res.comb, n: res.n, r: res.r })
    } catch (e) {
      setErr(e.message)
    }
  }
  return (
    <div>
      <div className="row">
        <Field label="n (total)"><input type="number" value={n} onChange={e=>setN(e.target.value)} placeholder="10" /></Field>
        <Field label="r (choose)"><input type="number" value={r} onChange={e=>setR(e.target.value)} placeholder="3" /></Field>
      </div>
      <div className="actions"><button className="btn" onClick={calculate}>Calculate</button></div>
      <Msg>{err}</Msg>
      {result && <div className="out" role="status"><p><strong>C({result.n},{result.r}) = {result.comb}</strong></p></div>}
      <p className="hint">C(n,r) = n! / (r!(n-r)!)</p>
    </div>
  )
}
