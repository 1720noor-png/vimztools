import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculateAttendance } from '@tool-core/student/attendanceCalculator.js'

export default function AttendanceCalculator() {
  const [a, setA] = useState('')
  const [t, setT] = useState('')
  const [g, setG] = useState('75')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const calc = () => {
    try {
      const res = calculateAttendance({
        attended: a,
        total: t,
        target: g
      })
      setErr('')
      setOut(res.message)
    } catch (e) {
      setOut('')
      setErr(e.message)
    }
  }
  const reset = () => { setA(''); setT(''); setG('75'); setOut(''); setErr('') }
  return (
    <div>
      <div className="row">
        <Field label="Classes attended"><input type="number" min="0" step="1" value={a} onChange={(e) => setA(e.target.value)} /></Field>
        <Field label="Total classes held"><input type="number" min="1" step="1" value={t} onChange={(e) => setT(e.target.value)} /></Field>
        <Field label="Target attendance %"><input type="number" min="1" max="100" value={g} onChange={(e) => setG(e.target.value)} /></Field>
      </div>
      <div className="actions"><button className="btn" onClick={calc}>Calculate</button><button className="btn ghost" onClick={reset}>Reset</button></div>
      <Msg>{err}</Msg>{out && <p className="out" role="status">{out}</p>}
    </div>
  )
}
