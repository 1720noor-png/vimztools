import { useState } from 'react'
import { Field, Msg } from '../../components/ui.jsx'
import { calculateGrade, GRADE_SCALE as SCALE } from '@tool-core/student/gradeCalculator.js'

let n = 0
const blank = () => ({ id: ++n, name: '', m: '', t: '' })
export default function GradeCalculator() {
  const [rows, setRows] = useState([blank(), blank()])
  const [out, setOut] = useState(null)
  const [err, setErr] = useState('')
  const upd = (id, k, v) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)))
  const calc = () => {
    try {
      const assessments = rows.map((r) => ({ name: r.name, marks: r.m, total: r.t }))
      const res = calculateGrade({ assessments })
      setErr('')
      setOut({ m: res.totalMarksObtained, t: res.totalMarksPossible, pct: res.formattedPercentage, grade: res.grade })
    } catch (e) {
      setOut(null)
      setErr(e.message)
    }
  }
  const reset = () => { setRows([blank(), blank()]); setOut(null); setErr('') }
  return (
    <div>
      {rows.map((r, i) => (
        <div className="row" key={r.id}>
          <Field label={`Assessment ${i + 1}`}><input value={r.name} onChange={(e) => upd(r.id, 'name', e.target.value)} placeholder="Optional" /></Field>
          <Field label="Marks obtained"><input type="number" min="0" step="any" value={r.m} onChange={(e) => upd(r.id, 'm', e.target.value)} /></Field>
          <Field label="Total marks"><input type="number" min="0" step="any" value={r.t} onChange={(e) => upd(r.id, 't', e.target.value)} /></Field>
          <button className="btn ghost" onClick={() => setRows((x) => (x.length > 1 ? x.filter((y) => y.id !== r.id) : x))}>Remove</button>
        </div>
      ))}
      <div className="actions"><button className="btn ghost" onClick={() => setRows((r) => [...r, blank()])}>Add assessment</button><button className="btn" onClick={calc}>Calculate</button><button className="btn ghost" onClick={reset}>Reset</button></div>
      <p className="hint">Grading scale: {SCALE.map(([min, g], i) => `${g} ${min}–${i ? SCALE[i - 1][0] - 1 : 100}%`).join(' · ')}</p>
      <Msg>{err}</Msg>
      {out && <p className="out" role="status">{out.m} / {out.t} = <strong>{out.pct}%</strong> · Grade <strong>{out.grade}</strong></p>}
    </div>
  )
}
